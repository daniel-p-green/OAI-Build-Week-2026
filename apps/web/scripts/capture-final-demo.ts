import { createHash } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { copyFile, cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, type Browser, type Page } from "@playwright/test";
import { readWorkshopState } from "../../worker/src/workshop-service.ts";

const repository = resolve(process.cwd(), "../..");
const preview = process.argv.includes("--preview");
const film = process.argv.includes("--film");
const sourceRoot = resolve(repository, process.env.WORKSHOPLM_FINAL_CAPTURE_SOURCE_ROOT ?? (preview ? ".workshoplm/acceptance" : ".workshoplm/final-operator"));
const dataRoot = resolve(repository, ".workshoplm-final-recording-copy");
const outputRoot = resolve(repository, film ? "outputs/demo-recording-film" : preview ? "outputs/demo-recording-final-preview" : "outputs/demo-recording-final");
const workingRoot = resolve(repository, film ? "outputs/demo-recording-film.building" : preview ? "outputs/demo-recording-final-preview.building" : "outputs/demo-recording-final.building");
const temporaryVideoRoot = resolve(workingRoot, ".playwright-video");
const port = 3105;
const baseUrl = `http://127.0.0.1:${port}`;
const holdMultiplier = film ? 4 : 1;
const viewport = film ? { width: 1280, height: 720 } : { width: 1200, height: 800 };

type Beat = { id: string; label: string; startMs: number; endMs: number };

async function waitForServer(server: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next server exited before final capture with code ${server.exitCode}.`);
    try { if ((await fetch(baseUrl)).ok) return; } catch { /* still starting */ }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error("Timed out waiting for the final-capture server.");
}

async function hold(milliseconds: number): Promise<void> {
  await new Promise((resolveHold) => setTimeout(resolveHold, milliseconds));
}

async function failCapture(message: string): Promise<never> {
  await rm(dataRoot, { recursive: true, force: true });
  throw new Error(message);
}

async function openView(page: Page, view: "brief" | "outputs" | "storyboard"): Promise<void> {
  const name = view === "outputs" ? "Open Created work" : `Open ${view[0]!.toUpperCase()}${view.slice(1)}`;
  await page.getByRole("button", { name: "Open Workshop index", exact: true }).click();
  const views = page.getByRole("dialog", { name: "Workshop", exact: true });
  await views.getByRole("button", { name, exact: true }).click();
  await expect(views).toBeHidden();
}

async function main(): Promise<void> {
  await rm(dataRoot, { recursive: true, force: true });
  await rm(workingRoot, { recursive: true, force: true });
  await cp(sourceRoot, dataRoot, { recursive: true });
  await mkdir(temporaryVideoRoot, { recursive: true });

  let sourceState: ReturnType<typeof readWorkshopState>;
  try { sourceState = readWorkshopState(dataRoot); }
  catch { await failCapture("Final capture could not read the copied Workshop state."); }
  if (!sourceState.briefApproved || sourceState.frame?.stale || !sourceState.storyboardApproved || sourceState.storyboard.stale || sourceState.videoState !== "rendered") {
    await failCapture("Final capture requires a current approved Brief, approved Storyboard, and rendered Video.");
  }
  const founderSource = sourceState.sourceItems.find((source) => source.origin === "Founder-provided recording" || source.origin === "Founder-authorized script with AI narration");
  if (!preview && (!founderSource || founderSource.permission !== "shareable")) {
    await failCapture("Final capture requires an explicitly shareable founder-authorized Source.");
  }
  const submissionManifestPath = resolve(dataRoot, "generated/submission-output-set-v1/manifest.json");
  let submission: { status?: string; limitations?: unknown[] };
  let submissionBytes: Buffer;
  try { submissionBytes = await readFile(submissionManifestPath); submission = JSON.parse(submissionBytes.toString("utf8")) as typeof submission; }
  catch { await failCapture("Final capture could not read the copied submission package."); }
  if (!preview && (submission.status !== "ready" || !Array.isArray(submission.limitations) || submission.limitations.length)) {
    await failCapture("Final capture requires the verified ready founder submission package without limitations.");
  }
  const captureSourceLabel = new RegExp((founderSource?.title ?? sourceState.sourceItems[0]?.title ?? "Source").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  execFileSync("pnpm", ["exec", "next", "build"], { cwd: process.cwd(), stdio: "inherit" });
  const server = spawn("pnpm", ["exec", "next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_DATA_ROOT: dataRoot }, stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => { serverOutput += String(chunk); });
  server.stderr?.on("data", (chunk) => { serverOutput += String(chunk); });
  let browser: Browser | undefined;

  try {
    await waitForServer(server);
    browser = await chromium.launch(film ? { headless: true } : { channel: "chrome", headless: true });
    const context = await browser.newContext({
      viewport, colorScheme: "light", locale: "en-US", timezoneId: "America/Chicago", reducedMotion: "reduce",
      recordVideo: { dir: temporaryVideoRoot, size: viewport },
    });
    const page = await context.newPage();
    const video = page.video();
    const startedAt = performance.now();
    const beats: Beat[] = [];
    const beat = async (id: string, label: string, action: () => Promise<void>, holdMs = 1500) => {
      const startMs = Math.round(performance.now() - startedAt);
      await action();
      await hold(holdMs * holdMultiplier);
      beats.push({ id, label, startMs, endMs: Math.round(performance.now() - startedAt) });
    };

    await page.goto(baseUrl);
    await expect(page.getByRole("region", { name: "Map", exact: true })).toBeVisible();
    await expect(page.locator(".excalidraw-map canvas").first()).toBeVisible();
    await beat("map", "Source-derived grounded Map", async () => undefined, 2200);

    await beat("sources", "Authorized project brainstorm and selected Sources", async () => {
      await page.getByRole("button", { name: /^\d+ sources?$/ }).click();
      const sources = page.getByRole("dialog", { name: "Sources" });
      await expect(sources).toBeVisible();
      await expect(sources).toContainText(captureSourceLabel);
    }, 2200);

    await beat("source-trace", "Exact project Source excerpt", async () => {
      const sources = page.getByRole("dialog", { name: "Sources" });
      await sources.getByRole("button", { name: captureSourceLabel }).first().click();
      await sources.getByRole("button", { name: "Show on map" }).click();
      await expect(page.getByRole("button", { name: "Show source", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Show source", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Source" })).toBeVisible();
    }, 1800);
    await page.getByRole("button", { name: "Show on map" }).click();

    await beat("map-edit", "Semantic Map remains directly editable", async () => {
      const claim = page.getByRole("textbox", { name: "Claim" });
      await claim.fill(`${await claim.inputValue()} — editable`);
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    }, 1500);
    const closeClaim = page.getByRole("button", { name: "Close claim" });
    if (await closeClaim.isVisible()) await closeClaim.click();

    await beat("brief-approval", "Approved source-grounded Brief", async () => {
      await openView(page, "brief");
      await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible();
    }, 2000);

    await beat("style", "Reusable Style applied across the Workshop", async () => {
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Style" })).toBeVisible();
    }, 1700);
    await page.getByRole("button", { name: "Close Style" }).click();

    await beat("create-outputs", "Connected source-derived professional knowledge work", async () => {
      await openView(page, "outputs");
      await expect(page.getByRole("heading", { name: "Presentation" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Image set" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Audio Overview" })).toBeVisible();
    }, 2400);

    await beat("output-evidence", "Created work traces to its exact Source", async () => {
      await page.locator('.output-grid [data-output-role="hero"]').click();
      await page.getByRole("button", { name: /^Show source for / }).first().click();
      await expect(page.getByRole("dialog", { name: "Source" })).toBeVisible();
    }, 1700);
    await page.getByRole("button", { name: "Close Source" }).click();
    await page.getByRole("button", { name: "Back to Created work" }).click();

    await beat("storyboard-edit", "Editable Storyboard with bound images and narration", async () => {
      await openView(page, "storyboard");
      await page.getByRole("button", { name: "Edit panel", exact: true }).click();
      const title = page.getByRole("textbox", { name: "Panel title" });
      await title.fill(await title.inputValue());
      await expect(title).toBeVisible();
    }, 1900);

    await beat("storyboard-approval", "Approved Storyboard controls Video", async () => {
      await expect(page.getByText("Approved", { exact: true }).first()).toBeVisible();
    }, 1600);

    await beat("video-render", "Rendered founder Video and build trace", async () => {
      await page.getByRole("button", { name: "Back to Created work" }).click();
      await page.getByRole("button", { name: "View video" }).click();
      const renderedVideo = page.locator(".focused-output-preview video");
      await expect(renderedVideo).toBeVisible();
      await renderedVideo.evaluate(async (element: HTMLVideoElement) => { element.muted = true; await element.play(); });
      await expect.poll(() => renderedVideo.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
    }, 2600);

    await beat("original-reveal", "Project brainstorm beside the connected work", async () => {
      await page.getByRole("button", { name: "Show original" }).click();
      await expect(page.getByRole("dialog", { name: "Original brainstorm" })).toContainText("Became professional knowledge work");
    }, 3000);

    await context.close();
    await browser.close();
    if (!video) throw new Error("Playwright did not create the final recording video.");
    const temporaryVideo = await video.path();
    const destination = resolve(workingRoot, film ? "workshoplm-film-workflow.webm" : preview ? "workshoplm-final-preview.webm" : "workshoplm-founder-walkthrough.webm");
    await copyFile(temporaryVideo, destination);
    const bytes = await readFile(destination);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height", "-of", "json", destination], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: unknown[] };
    const durationSeconds = Number(probe.format?.duration ?? 0);
    const reviewRoot = resolve(workingRoot, "review");
    await mkdir(reviewRoot, { recursive: true });
    const beatReviewImages: Array<{ relativePath: string; sha256: string; beatId: string; atSeconds: number }> = [];
    for (const [index, capturedBeat] of beats.entries()) {
      const name = `${String(index + 1).padStart(2, "0")}.jpg`;
      const reviewPath = resolve(reviewRoot, name);
      const atSeconds = Number(((capturedBeat.startMs + capturedBeat.endMs) / 2000).toFixed(3));
      execFileSync("ffmpeg", ["-y", "-ss", String(atSeconds), "-i", destination, "-frames:v", "1", "-q:v", "2", reviewPath], { stdio: "ignore" });
      beatReviewImages.push({ relativePath: `review/${name}`, sha256: createHash("sha256").update(await readFile(reviewPath)).digest("hex"), beatId: capturedBeat.id, atSeconds });
    }
    const contactSheet = resolve(workingRoot, "contact-sheet.png");
    execFileSync("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=480:-1,tile=4x3", "-frames:v", "1", "-update", "1", contactSheet], { stdio: "ignore" });
    const contactSheetBytes = await readFile(contactSheet);
    const manifest = {
      schemaVersion: 1,
      status: preview ? "founder-capture-preview" : "founder-final-candidate",
      disclosure: preview ? "Acceptance fixture used only to verify final-capture mechanics." : founderSource?.origin === "Founder-authorized script with AI narration" ? "Hash-bound browser capture of the reviewed source-derived Workshop. The primary brainstorm media uses disclosed AI narration; no provider calls occur during capture." : "Hash-bound browser capture of the reviewed founder-derived Workshop. No provider calls occur during capture.",
      capturedAt: new Date().toISOString(), sourceRoot: preview ? "acceptance-preview" : ".workshoplm/final-operator", founderSource: !preview,
      founderSourceEvidence: founderSource ? { id: founderSource.id, origin: founderSource.origin, permission: founderSource.permission } : null,
      submission: { relativePath: preview ? ".workshoplm/acceptance/generated/submission-output-set-v1/manifest.json" : ".workshoplm/final-operator/generated/submission-output-set-v1/manifest.json", status: submission.status, sha256: createHash("sha256").update(submissionBytes).digest("hex") },
      viewport,
      video: { relativePath: film ? "workshoplm-film-workflow.webm" : preview ? "workshoplm-final-preview.webm" : "workshoplm-founder-walkthrough.webm", sha256: createHash("sha256").update(bytes).digest("hex"), durationSeconds, streams: probe.streams ?? [] },
      reviewImages: [{ relativePath: "contact-sheet.png", sha256: createHash("sha256").update(contactSheetBytes).digest("hex") }, ...beatReviewImages],
      beats,
      finalState: { briefApproved: sourceState.briefApproved, storyboardApproved: sourceState.storyboardApproved, videoState: sourceState.videoState, sources: sourceState.activeSourceIds.length, outputs: sourceState.outputs.length, imagePanels: sourceState.imageBatch?.panels.length ?? 0, storyboardPanels: sourceState.storyboard.panels.length },
      limitations: preview ? ["This preview is not founder evidence and cannot satisfy final film verification."] : [],
    };
    await writeFile(resolve(workingRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await rm(temporaryVideoRoot, { recursive: true, force: true });
    await rm(outputRoot, { recursive: true, force: true });
    await rename(workingRoot, outputRoot);
    process.stdout.write(`${JSON.stringify({ status: manifest.status, video: resolve(outputRoot, manifest.video.relativePath), durationSeconds, beats: beats.length, sha256: manifest.video.sha256 }, null, 2)}\n`);
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nFinal-capture server output:\n${serverOutput.slice(-4000)}`);
  } finally {
    if (browser?.isConnected()) await browser.close();
    if (server.exitCode === null) server.kill("SIGTERM");
    await rm(dataRoot, { recursive: true, force: true });
    await rm(workingRoot, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
