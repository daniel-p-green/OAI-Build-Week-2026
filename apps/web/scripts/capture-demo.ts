import { createHash } from "node:crypto";
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, type Page } from "@playwright/test";
import { executeOne } from "../../worker/src/executor.ts";
import { approveVisualDna, captureFallbackTranscript, createVisualDna, generateOutput, readWorkshopState } from "../../worker/src/workshop-service.ts";
import { seedJudgeProviderImages } from "../../../scripts/seed-judge-images.ts";

const repository = resolve(process.cwd(), "../..");
const dataRoot = resolve(repository, ".workshoplm-recording-draft");
const outputRoot = resolve(repository, "outputs/demo-recording-draft");
const temporaryVideoRoot = resolve(outputRoot, ".playwright-video");
const port = 3104;
const baseUrl = `http://127.0.0.1:${port}`;

type Beat = { id: string; label: string; startMs: number; endMs: number };

async function waitForServer(server: ChildProcess): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next server exited before capture with code ${server.exitCode}.`);
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error("Timed out waiting for the recording server.");
}

async function hold(milliseconds: number): Promise<void> {
  await new Promise((resolveHold) => setTimeout(resolveHold, milliseconds));
}

async function main(): Promise<void> {
  await rm(dataRoot, { recursive: true, force: true });
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(temporaryVideoRoot, { recursive: true });
  captureFallbackTranscript(
    "Okay, this is rough, but I want the judge to see a messy professional idea become the actual finished submission without losing where anything came from.",
    dataRoot,
  );

  execFileSync("pnpm", ["exec", "next", "build"], { cwd: process.cwd(), stdio: "inherit" });
  const server = spawn("pnpm", ["exec", "next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: process.cwd(),
    env: { ...process.env, WORKSHOPLM_DATA_ROOT: dataRoot },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverOutput = "";
  server.stdout?.on("data", (chunk) => { serverOutput += String(chunk); });
  server.stderr?.on("data", (chunk) => { serverOutput += String(chunk); });

  try {
    await waitForServer(server);
    const browser = await chromium.launch({ channel: "chrome", headless: true });
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
      colorScheme: "light",
      locale: "en-US",
      timezoneId: "America/Chicago",
      reducedMotion: "reduce",
      recordVideo: { dir: temporaryVideoRoot, size: { width: 1200, height: 800 } },
    });
    const page = await context.newPage();
    const video = page.video();
    const startedAt = performance.now();
    const beats: Beat[] = [];
    const beat = async (id: string, label: string, action: () => Promise<void>, holdMs = 1400) => {
      const startMs = Math.round(performance.now() - startedAt);
      await action();
      await hold(holdMs);
      beats.push({ id, label, startMs, endMs: Math.round(performance.now() - startedAt) });
    };

    await page.goto(baseUrl);
    await page.getByRole("radio", { name: /Client pitch/ }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Build my Map" }).click();
    await expect(page.getByRole("region", { name: "Map" })).toBeVisible();
    await expect(page.locator(".excalidraw-map canvas").first()).toBeVisible();
    await beat("map", "Grounded editable Map", async () => undefined, 2200);

    await beat("sources", "Contemporaneous fixture brainstorm and source scope", async () => {
      await expect(page.locator('[aria-label="Sources"]')).toContainText("Voice brainstorm");
    }, 2200);

    await beat("source-trace", "Map claim to exact source excerpt", async () => {
      await page.getByRole("button", { name: /Voice brainstorm/ }).click();
      await expect(page.getByRole("dialog", { name: "Source" })).toBeVisible();
    }, 1800);
    await page.getByRole("button", { name: "Show on map" }).click();
    await expect(page.getByRole("button", { name: "Show source", exact: true })).toBeVisible();

    await beat("map-edit", "Edit a semantic claim before approval", async () => {
      const claim = page.getByRole("textbox", { name: "Claim" });
      await claim.fill("The product promise, grounded");
      await page.getByRole("button", { name: "Save" }).click();
      await expect.poll(async () => {
        const state = await (await page.request.get(`${baseUrl}/api/workshop`)).json() as { mapNodes: Array<{ id: string; title: string }> };
        return state.mapNodes.find((node) => node.title === "The product promise, grounded")?.title;
      }).toBe("The product promise, grounded");
    }, 1500);
    const closeClaim = page.getByRole("button", { name: "Close claim" });
    if (await closeClaim.isVisible()) await closeClaim.click();

    await beat("brief-approval", "First gate: approve the Brief", async () => {
      await page.getByRole("button", { name: "Approve brief" }).click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText("The product promise, grounded");
    }, 2200);

    await beat("style", "Apply exact professional Style and intent", async () => {
      await page.getByRole("button", { name: "Choose style" }).click();
      const sheet = page.getByRole("dialog", { name: "Style" });
      await sheet.getByRole("button", { name: "Set manually" }).click();
      await sheet.getByRole("textbox", { name: "Accent" }).fill("#1668E3");
      await sheet.getByRole("textbox", { name: "Text" }).fill("#171816");
      await sheet.getByRole("textbox", { name: "Background" }).fill("#F4F2EC");
      await sheet.getByRole("button", { name: "Use this style" }).click();
      await expect(sheet).toBeHidden();
      createVisualDna(dataRoot);
      approveVisualDna(dataRoot);
    }, 1800);

    await page.getByRole("button", { name: "View outputs" }).click();
    await beat("create-outputs", "Create the traced Output set", async () => {
      await page.getByRole("button", { name: "Create outputs" }).click();
      await expect(page.getByRole("heading", { name: "Slides" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Image set" })).toBeVisible();
      await seedJudgeProviderImages(dataRoot);
      await generateOutput("deck", dataRoot);
      await page.reload();
      await page.getByRole("button", { name: "View outputs" }).click();
      await expect(page.locator('img[src*="image-panel-"]').first()).toBeVisible();
    }, 2600);

    await beat("output-evidence", "Follow Slides back to their source", async () => {
      await page.getByRole("button", { name: /^Open Sketch/ }).click();
      await expect(page.getByRole("heading", { name: "Sketch", exact: true })).toBeVisible();
      await page.waitForTimeout(900);
      await page.getByRole("button", { name: "Back to Outputs" }).click();
      await page.getByRole("button", { name: /^Open Slides/ }).click();
      await page.getByRole("button", { name: /^Show source for / }).first().click();
      await expect(page.getByRole("dialog", { name: "Source" })).toBeVisible();
    }, 1800);
    await page.getByRole("button", { name: "Close Source" }).click();
    await page.getByRole("button", { name: "Back to Outputs" }).click();

    await beat("storyboard-edit", "Edit the Storyboard before rendering", async () => {
      await page.getByRole("button", { name: "Review storyboard", exact: true }).click();
      const title = page.getByRole("textbox", { name: "Panel title" });
      await title.fill("Slides proof");
      await page.getByRole("button", { name: "Save" }).click();
      await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    }, 2000);

    await beat("storyboard-approval", "Second gate: approve the Storyboard", async () => {
      await page.getByRole("button", { name: "Approve storyboard" }).click();
      await expect(page.getByRole("button", { name: "Create video" })).toBeVisible();
    }, 1600);

    await beat("video-render", "Render the approved Storyboard locally", async () => {
      await page.getByRole("button", { name: "Create video" }).click();
      await expect(page.getByRole("button", { name: "Cancel video" })).toBeVisible();
      const result = await executeOne(dataRoot);
      if (result.state !== "succeeded") throw new Error(result.error ?? "The recording draft video did not render.");
      await expect(page.getByRole("button", { name: "View video" })).toBeVisible({ timeout: 5000 });
    }, 2200);

    await beat("original-reveal", "Reveal the original thought beside the finished work", async () => {
      await page.getByRole("button", { name: "View video" }).click();
      await expect(page.locator(".focused-output-preview video")).toBeVisible();
      await page.getByRole("button", { name: "Show original" }).click();
      await expect(page.getByRole("dialog", { name: "Original brainstorm" })).toContainText("Became finished work");
    }, 3000);

    const finalState = readWorkshopState(dataRoot);
    await context.close();
    await browser.close();
    if (!video) throw new Error("Playwright did not create a recording video.");
    const temporaryVideo = await video.path();
    const destination = resolve(outputRoot, "workshoplm-fixture-walkthrough.webm");
    await copyFile(temporaryVideo, destination);
    const bytes = await readFile(destination);
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height", "-of", "json", destination], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: unknown[] };
    const durationSeconds = Number(probe.format?.duration ?? 0);
    const contactSheet = resolve(outputRoot, "contact-sheet.png");
    const revealFrame = resolve(outputRoot, "original-reveal.png");
    execFileSync("ffmpeg", ["-y", "-i", destination, "-vf", "fps=1/4,scale=480:-1,tile=4x3", "-frames:v", "1", "-update", "1", contactSheet], { stdio: "ignore" });
    execFileSync("ffmpeg", ["-y", "-ss", String(Math.max(0, durationSeconds - 0.75)), "-i", destination, "-frames:v", "1", "-update", "1", revealFrame], { stdio: "ignore" });
    const contactSheetBytes = await readFile(contactSheet);
    const revealFrameBytes = await readFile(revealFrame);
    const manifest = {
      schemaVersion: 1,
      status: "fixture-draft",
      disclosure: "Sanitized recorded fixture with hash-bound GPT Image 2 media. No paid provider calls occur during replay. Placeholder narration remains disclosed in the product state.",
      capturedAt: new Date().toISOString(),
      viewport: { width: 1200, height: 800 },
      video: { relativePath: "workshoplm-fixture-walkthrough.webm", sha256: createHash("sha256").update(bytes).digest("hex"), durationSeconds, streams: probe.streams ?? [] },
      reviewImages: [
        { relativePath: "contact-sheet.png", sha256: createHash("sha256").update(contactSheetBytes).digest("hex") },
        { relativePath: "original-reveal.png", sha256: createHash("sha256").update(revealFrameBytes).digest("hex") },
      ],
      beats,
      finalState: { briefApproved: finalState.briefApproved, storyboardApproved: finalState.storyboardApproved, videoState: finalState.videoState, sources: finalState.activeSourceIds.length, outputs: finalState.outputs.length, imagePanels: finalState.imageBatch?.panels.length ?? 0, storyboardPanels: finalState.storyboard.panels.length },
      limitations: ["This is automated browser footage for editorial review, not the final public demo.", "The six GPT Image 2 files are checked-in sanitized provider outputs, not fresh generations during replay.", "The local video uses disclosed deterministic fallback narration, not provider TTS.", "The required Codex plugin-doorway shot must be recorded separately from the real host surface."],
    };
    await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    await rm(temporaryVideoRoot, { recursive: true, force: true });
    process.stdout.write(`${JSON.stringify({ status: manifest.status, video: destination, durationSeconds: manifest.video.durationSeconds, beats: beats.length, sha256: manifest.video.sha256 }, null, 2)}\n`);
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nRecording server output:\n${serverOutput.slice(-4000)}`);
  } finally {
    if (server.exitCode === null) server.kill("SIGTERM");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
