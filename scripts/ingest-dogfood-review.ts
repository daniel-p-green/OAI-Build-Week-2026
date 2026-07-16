import { createHash } from "node:crypto";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

type PacketManifest = {
  schemaVersion: number;
  reviewId?: string;
  files?: Record<string, string>;
};

type ParsedReview = {
  reviewId: string;
  decision: "Send" | "Revise";
  role: string;
  firstBlocker: string;
  reason: string;
};

const sha256 = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");

function field(text: string, name: string) {
  return text.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "mi"))?.[1]?.trim() ?? "";
}

function parseReview(text: string): ParsedReview {
  const reviewId = field(text, "Review ID");
  const decision = field(text, "Decision");
  const role = field(text, "Role");
  const firstBlocker = field(text, "First blocker");
  const reason = text.match(/(?:^|\n)Reason:\s*\n([\s\S]*?)\s*$/i)?.[1]?.trim() ?? "";

  if (!reviewId) throw new Error("Review is missing its Review ID. Ask the reviewer to use the current packet.");
  if (decision !== "Send" && decision !== "Revise") throw new Error("Decision must be exactly Send or Revise; the untouched template is not review evidence.");
  if (!role || /^not provided$/i.test(role)) throw new Error("Reviewer role is required before this response can support the intended-audience gate.");
  if (decision === "Revise" && (!firstBlocker || /^none$/i.test(firstBlocker)) && (!reason || /^no additional comment\.?$/i.test(reason))) {
    throw new Error("Revise must name the first blocking issue.");
  }

  return { reviewId, decision, role, firstBlocker: firstBlocker || "None", reason: reason || "No additional comment." };
}

async function exists(path: string) {
  try { await access(path); return true; } catch { return false; }
}

async function main() {
  const inputArgument = process.argv.slice(2).find((argument) => argument !== "--" && argument !== "--dry-run");
  const dryRun = process.argv.includes("--dry-run");
  if (!inputArgument) throw new Error("Usage: pnpm dogfood:review:ingest -- <returned-feedback.txt> [--dry-run]");

  const repository = resolve(process.cwd());
  const reviewRoot = join(repository, "outputs", "dogfood-ai-collective-chapter-brief");
  const packetRoot = join(reviewRoot, "review-packet");
  const manifest = JSON.parse(await readFile(join(packetRoot, "manifest.json"), "utf8")) as PacketManifest;
  if (manifest.schemaVersion !== 2 || !manifest.reviewId || !manifest.files) throw new Error("Rebuild the review packet before ingesting feedback; its version contract is stale.");

  const currentPdf = await readFile(join(packetRoot, "AI-Collective-chapter-launch.pdf"));
  if (sha256(currentPdf) !== manifest.files["AI-Collective-chapter-launch.pdf"]) throw new Error("Current review PDF does not match its packet manifest.");
  const currentPptx = await readFile(join(packetRoot, "AI-Collective-chapter-launch.pptx"));
  if (sha256(currentPptx) !== manifest.files["AI-Collective-chapter-launch.pptx"]) throw new Error("Current review PowerPoint does not match its packet manifest.");
  const sourcePdf = await readFile(join(reviewRoot, "chapter-launch-brief.pdf"));
  const sourcePptx = await readFile(join(reviewRoot, "chapter-launch-brief.pptx"));
  if (sha256(sourcePdf) !== manifest.files["AI-Collective-chapter-launch.pdf"] || sha256(sourcePptx) !== manifest.files["AI-Collective-chapter-launch.pptx"]) {
    throw new Error("The source deck changed after this packet was built. Rebuild the packet before crediting review feedback.");
  }

  const inputPath = resolve(inputArgument);
  const inputInfo = await stat(inputPath);
  if (!inputInfo.isFile() || inputInfo.size === 0) throw new Error("Returned feedback file is missing or empty.");
  const inputBytes = await readFile(inputPath);
  const review = parseReview(inputBytes.toString("utf8").replaceAll("\r\n", "\n"));
  if (review.reviewId !== manifest.reviewId) {
    throw new Error(`Review ${review.reviewId} targets a different deck. Current Review ID is ${manifest.reviewId}; do not credit stale feedback.`);
  }

  const inputSha256 = sha256(inputBytes);
  const evidence = {
    schemaVersion: 1,
    evidenceType: "returned-cold-review",
    reviewId: review.reviewId,
    decision: review.decision,
    reviewer: { role: review.role, identityIndependentlyVerified: false },
    firstBlocker: review.firstBlocker,
    reason: review.reason,
    reviewedFiles: {
      pdfSha256: manifest.files["AI-Collective-chapter-launch.pdf"],
      pptxSha256: manifest.files["AI-Collective-chapter-launch.pptx"],
    },
    returnedFile: { name: basename(inputPath), sha256: inputSha256 },
    evidenceBoundary: "The returned file preserves the reviewer response and exact deck version. Reviewer identity is not independently authenticated by this local tool.",
  };

  let evidencePath: string | undefined;
  if (!dryRun) {
    const evidenceRoot = join(repository, "artifacts", "dogfood", "reviews");
    evidencePath = join(evidenceRoot, `${review.reviewId}-${inputSha256.slice(0, 12)}.json`);
    await mkdir(evidenceRoot, { recursive: true });
    if (!(await exists(evidencePath))) await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
  }

  process.stdout.write(`${JSON.stringify({ valid: true, dryRun, evidencePath, ...evidence, nextAction: review.decision === "Revise" ? "Treat the first blocker as product work, rebuild the packet, and repeat review." : "Record the reviewer context before closing the professional Send gate." }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
