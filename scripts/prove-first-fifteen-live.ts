import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

import { generateGroundedMapWithGpt56 } from "../apps/worker/src/openai-reasoning.ts";
import { createProviderRequestBudget } from "../apps/worker/src/provider-budget.ts";
import {
  applyWorkshopAction,
  approveVisualDna,
  createVisualDna,
  createWorkshop,
  dismissWorkshopOrientation,
  extractWorkshopCandidates,
  generateAssetPlan,
  generateOutput,
  ingestSource,
  lockManualStyle,
  readWorkshopState,
  updateWorkshopOnboarding,
} from "../apps/worker/src/workshop-service.ts";

type SourceBlock = {
  id: string;
  heading: string;
  body: string;
  citations: string[];
};

type DeckInput = {
  workshopTitle: string;
  blocks: SourceBlock[];
};

const repository = resolve(process.cwd());
const localRoot = resolve(repository, ".workshoplm");
const root = resolve(repository, ".workshoplm", "first-fifteen-external");
const rootRelative = relative(localRoot, root);
if (!rootRelative || rootRelative.startsWith("..") || isAbsolute(rootRelative)) throw new Error("Proof root must remain inside .workshoplm.");
const resume = process.argv.includes("--resume");
if (!resume && process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Set WORKSHOPLM_LIVE_OPENAI=1 to authorize the measured provider run.");
if (!resume && process.env.WORKSHOPLM_MAX_PAID_REQUESTS !== "1") throw new Error("Set WORKSHOPLM_MAX_PAID_REQUESTS=1. This proof permits exactly one provider request.");
if (!resume && !process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the measured provider run.");

async function exists(path: string): Promise<boolean> {
  try { await access(path); return true; } catch { return false; }
}

function elapsedSeconds(startedAt: number): number {
  return Math.round((performance.now() - startedAt) * 100) / 100_000;
}

async function main() {
  if (!resume && await exists(root)) {
    if (!process.argv.includes("--reset")) throw new Error("Proof root already exists. Inspect it or rerun with --reset.");
    await rm(root, { recursive: true, force: true });
  }
  if (!resume) await mkdir(root, { recursive: true });
  else if (!await exists(root)) throw new Error("Cannot resume: proof root does not exist.");

  const inputPath = join(repository, "outputs", "dogfood-ai-collective-chapter-brief", "deck-input.json");
  const input = JSON.parse(await readFile(inputPath, "utf8")) as DeckInput;
  const factualBlocks = input.blocks.filter((block) => !block.id.startsWith("derived-"));
  if (factualBlocks.length < 4) throw new Error("External proof corpus needs at least four factual source blocks.");
  const sourceText = factualBlocks.map((block) => `${block.heading}\n${block.body}\nSource locator: ${block.citations.join(" | ")}`).join("\n\n");
  const sourceSha256 = createHash("sha256").update(sourceText).digest("hex");

  const persistProof = async (timing: { startedAt: string; mapReadySeconds: number; mapProviderSeconds: number | null; deckReadySeconds: number; requestsUsed: number }) => {
    const final = readWorkshopState(root);
    const run = final.aiRuns.at(-1);
    const deck = final.outputs.find((output) => output.type === "deck");
    if (!run || run.operation !== "grounded_graph" || run.model !== "gpt-5.6-terra" || !run.requestId) throw new Error("Measured Map lacks current provider provenance.");
    if (!deck || deck.type !== "deck" || !deck.editableRelativePath) throw new Error("Measured path did not produce an editable first Presentation.");
    const pptx = await readFile(join(root, deck.editableRelativePath));
    if (pptx.subarray(0, 2).toString() !== "PK") throw new Error("Measured Presentation is not a valid PowerPoint archive.");
    const proof = {
      schemaVersion: 1,
      status: "controlled-provider-proof",
      startedAt: timing.startedAt,
      completedAt: deck.createdAt,
      root: relative(repository, root),
      source: {
        label: "AI Collective external-use chapter corpus",
        factualBlocks: factualBlocks.length,
        sha256: sourceSha256,
        permission: "shareable",
      },
      timing: {
        sourceToProviderMapSeconds: timing.mapReadySeconds,
        providerRequestSeconds: timing.mapProviderSeconds,
        sourceToEditablePresentationSeconds: timing.deckReadySeconds,
        reconstructedFromNormalizedSourceMtime: timing.mapProviderSeconds === null,
        mapUnderTwoMinutes: timing.mapReadySeconds < 120,
        presentationUnderFifteenMinutes: timing.deckReadySeconds < 900,
      },
      provider: {
        model: run.model,
        requestId: run.requestId,
        outputSha256: run.outputSha256,
        requestsUsed: timing.requestsUsed,
        requestCeiling: 1,
      },
      result: {
        activeSources: final.activeSourceIds.length,
        groundedClaims: final.claims.filter((claim) => final.activeSourceIds.includes(claim.sourceId)).length,
        mapNodes: final.mapNodes.length,
        mapEdges: final.mapEdges.length,
        briefVersion: final.frame?.version,
        styleVersion: final.style?.version,
        firstPresentationId: deck.id,
        firstPresentationRelativePath: deck.relativePath,
        firstEditablePresentationRelativePath: deck.editableRelativePath,
        firstEditablePresentationSha256: createHash("sha256").update(pptx).digest("hex"),
        manualRepairsBeforeFirstPresentation: 0,
      },
      limitations: [
        "This is controlled automation over reviewable external-use material, not an uncoached professional using their own files.",
        ...(timing.mapProviderSeconds === null ? ["The harness initially rejected the correct provider record after generation; recovered timing starts at the normalized Source file timestamp and does not claim the earlier ingestion interval or provider-only duration."] : []),
        "The run proves provider and product latency, not external Send approval or the founder meta-demo path."
      ]
    };
    const evidencePath = resolve(repository, ".workshoplm", "first-fifteen-external-proof.json");
    await writeFile(evidencePath, `${JSON.stringify(proof, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ ...proof, root: relative(repository, root), evidencePath: relative(repository, evidencePath) }, null, 2)}\n`);
  };

  if (resume) {
    const final = readWorkshopState(root);
    const run = final.aiRuns.at(-1);
    const deck = final.outputs.find((output) => output.type === "deck");
    if (!run || !deck) throw new Error("Cannot resume: provider Map or Presentation is missing.");
    const sourceFiles = (await readdir(join(root, "sources"))).filter((name) => name.endsWith(".txt"));
    if (sourceFiles.length !== 1) throw new Error("Cannot reconstruct timing: expected exactly one normalized Source file.");
    const sourceReadyAt = (await stat(join(root, "sources", sourceFiles[0]!))).mtimeMs;
    await persistProof({
      startedAt: new Date(sourceReadyAt).toISOString(),
      mapReadySeconds: Math.round((Date.parse(run.createdAt) - sourceReadyAt) * 1000) / 1_000_000,
      mapProviderSeconds: null,
      deckReadySeconds: Math.round((Date.parse(deck.createdAt) - sourceReadyAt) * 1000) / 1_000_000,
      requestsUsed: 1,
    });
    return;
  }

  const startedAt = performance.now();
  const startedAtIso = new Date().toISOString();
  createWorkshop(input.workshopTitle, root);
  await ingestSource({
    title: "AI Collective chapter evidence",
    origin: "External-use chapter corpus",
    permission: "shareable",
    text: sourceText,
  }, root);
  updateWorkshopOnboarding({ outcome: "client_facing_pitch", step: "complete" }, root);
  dismissWorkshopOrientation("map", root);
  dismissWorkshopOrientation("outputs", root);
  extractWorkshopCandidates(root);

  const budget = createProviderRequestBudget(1);
  const mapRequestStartedAt = performance.now();
  await generateGroundedMapWithGpt56(root, {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-5.6-terra",
    reasoningEffort: "medium",
  }, budget.fetch);
  const mapProviderSeconds = Math.round((performance.now() - mapRequestStartedAt) * 100) / 100_000;
  const mapReadySeconds = elapsedSeconds(startedAt);

  applyWorkshopAction("approveBrief", root);
  lockManualStyle({
    name: "AI Collective",
    accent: "#FF640D",
    ink: "#171717",
    paper: "#FAF8F3",
    headingFont: "Arial",
    bodyFont: "Arial",
    fontsConfirmed: true,
    references: ["clear evidence hierarchy", "generous white space", "professional community brief"],
    negativeRules: ["no stock-photo cliches", "no gradients", "no invented quantities"],
    intentProfile: "client_facing_pitch",
  }, root);
  createVisualDna(root);
  approveVisualDna(root);
  generateAssetPlan(root);
  await generateOutput("deck", root);
  const deckReadySeconds = elapsedSeconds(startedAt);
  await persistProof({ startedAt: startedAtIso, mapReadySeconds, mapProviderSeconds, deckReadySeconds, requestsUsed: budget.usedRequests() });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
