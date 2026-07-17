import { expect, test, type Locator, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const viewports = [
  { name: "desktop", width: 1200, height: 800 },
  { name: "compact", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function expectScreen(page: Page, name: string) {
  const previewRatio = name === "mobile-outputs" || name === "mobile-output-viewer" ? 0.015 : name.startsWith("mobile-") ? 0.006 : 0.003;
  await expect(page).toHaveScreenshot(`${name}.png`, { animations: "disabled", caret: "hide", maxDiffPixelRatio: previewRatio });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
}

async function closeDialog(page: Page, name: string) {
  await page.getByRole("button", { name: `Close ${name}` }).click();
  await expect(page.getByRole("dialog", { name })).toBeHidden();
}

async function openWorkshopIndex(page: Page) {
  const explicit = page.getByRole("button", { name: "Open Workshop index", exact: true });
  const trigger = await explicit.isVisible() ? explicit : page.locator(".spine-stage[aria-current='step']");
  await trigger.click();
  await expect(page.getByRole("dialog", { name: "Workshop" })).toBeVisible();
  return trigger;
}

async function openWorkshopView(page: Page, view: "chat" | "brief" | "outputs" | "storyboard") {
  await openWorkshopIndex(page);
  const sheet = page.getByRole("dialog", { name: "Workshop" });
  const label = view === "chat" ? "Conversation" : view === "outputs" ? "Created work" : view[0]!.toUpperCase() + view.slice(1);
  await sheet.getByRole("button", { name: `Open ${label}`, exact: true }).click();
  await expect(sheet).toBeHidden();
}

async function openSources(page: Page) {
  await page.getByRole("button", { name: /^\d+ sources?$/ }).click();
  const sheet = page.getByRole("dialog", { name: "Sources" });
  await expect(sheet).toBeVisible();
  return sheet;
}

async function expectPrimaryActions(page: Page, count: 0 | 1) {
  await expect(page.locator('.oai-button--primary:not(:disabled):visible')).toHaveCount(count);
}

async function expectPreviewFramesReady(page: Page) {
  const frames = page.locator('iframe[title$="preview"]');
  if (await frames.count() === 0) return;
  await expect.poll(() => frames.evaluateAll((items) => items.every((item) => {
    const document = (item as HTMLIFrameElement).contentDocument;
    return document?.readyState === "complete" && document.fonts.status === "loaded" && Boolean(document.body?.scrollHeight);
  }))).toBe(true);
}

async function seekVideoFrame(video: Locator, seconds = 0.1) {
  await expect.poll(() => video.evaluate((node) => (node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(1);
  await video.evaluate(async (node, requestedSeconds) => {
    const element = node as HTMLVideoElement;
    const target = Number.isFinite(element.duration) && element.duration > 0
      ? Math.min(requestedSeconds, element.duration / 2)
      : requestedSeconds;
    if (element.readyState >= 2 && Math.abs(element.currentTime - target) < 0.001) return;

    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timer);
        element.removeEventListener("seeked", onSeeked);
        element.removeEventListener("error", onError);
        if (error) reject(error);
        else resolve();
      };
      const onSeeked = () => finish();
      const onError = () => finish(new Error(element.error?.message ?? "Video failed while selecting a review frame."));
      const timer = window.setTimeout(() => finish(new Error(`Video did not decode the ${target.toFixed(3)}s review frame within 3 seconds.`)), 3_000);
      element.addEventListener("seeked", onSeeked, { once: true });
      element.addEventListener("error", onError, { once: true });
      element.currentTime = target;
    });
  }, seconds);
}

async function expectMapReady(page: Page, viewport: typeof viewports[number]) {
  if (viewport.name === "mobile") return;
  await expect(page.locator(".excalidraw-map .excalidraw")).toBeVisible();
  await expect(page.locator(".excalidraw-map canvas").first()).toBeVisible();
  await page.waitForTimeout(1_000);
}

async function selectProductPromise(page: Page, viewport: typeof viewports[number]) {
  const outlineNode = page.locator(".map-mobile-outline button", { hasText: "The product promise" });
  if (viewport.name === "mobile") {
    await outlineNode.click();
    return;
  }
  if (await outlineNode.count() === 0) await page.getByRole("button", { name: /^Show \d+ more$/ }).click();
  await outlineNode.evaluate((button: HTMLButtonElement) => button.click());
}

async function pressTabUntil(page: Page, label: string, limit = 40) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => ({
      label: document.activeElement?.getAttribute("aria-label") ?? "",
      text: document.activeElement?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    }));
    if (active.label === label || active.text === label) return;
  }
  throw new Error(`Keyboard focus did not reach ${label}`);
}

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ request }) => {
  const response = await request.post("/api/workshop", { data: { action: "resetTestFixture" } });
  expect(response.ok(), await response.text()).toBe(true);
});

test("reset fixture is calm and responsive", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Approve brief" }).first()).toBeVisible();
    await expectMapReady(page, viewport);
    await expectScreen(page, `${viewport.name}-reset-map`);
    if (viewport.width <= 900) {
      const views = page.getByRole("button", { name: "Open Workshop index, Map", exact: true });
      await views.click();
      const viewSheet = page.getByRole("dialog", { name: "Workshop" });
      await expect(viewSheet.getByRole("button", { name: "Open Map" })).toBeDisabled();
      await expect(viewSheet.getByRole("button", { name: "Open Brief" })).toBeDisabled();
      if (viewport.name === "mobile") await expectScreen(page, "mobile-workshop-index");
      await closeDialog(page, "Workshop");
      await expect(views).toBeFocused();
    }
    const sourceSheet = await openSources(page);
    await expectScreen(page, `${viewport.name}-reset-sources`);
    await sourceSheet.getByRole("button", { name: "Add source" }).click();
    await expect(page.getByRole("dialog", { name: "Add source" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Record voice" })).toBeVisible();
    await expectScreen(page, `${viewport.name}-add-source`);
    await closeDialog(page, "Add source");
    await closeDialog(page, "Sources");
  }

  await expect(page.getByRole("button", { name: /^\d+ sources?$/ })).toBeFocused();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expectMapReady(page, viewports[0]);
  await expect(page.getByRole("region", { name: "Map overview" })).toContainText("1 key evidence");
  await expect(page.getByRole("region", { name: "Map overview" })).toContainText("1 Synthesis");
  await expect(page.getByRole("region", { name: "Map overview" })).toContainText("1 Direction");
  const mapOverview = page.getByRole("region", { name: "Map overview" });
  await expect(mapOverview).toContainText("Recommended direction");
  await expect(mapOverview).toContainText("Visual behavior");
  await expect(mapOverview).not.toContainText("The product promise");
  await expect(mapOverview).not.toContainText("Judge proof");
  await selectProductPromise(page, viewports[0]);
  const claimEditor = page.getByRole("textbox", { name: "Claim" });
  await expect(claimEditor).toBeVisible();
  await claimEditor.fill("The product promise revised");
  await page.getByRole("button", { name: "Save" }).click();
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.title).toBe("The product promise revised");
  await page.getByRole("button", { name: "Close claim" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".map-insight-bar")).toBeVisible();
  await expect(page.locator(".map-insight-bar .map-path")).toBeHidden();
  await expect(page.getByRole("button", { name: "Undo" })).toBeVisible();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.title).toBe("The product promise");

  // Begin at the control immediately before the contextual next action. The Map
  // canvas intentionally owns many keyboard stops, so starting in Sources would
  // test Excalidraw's internal tab order rather than WorkshopLM's workflow.
  await page.getByRole("button", { name: "Open Workshop index", exact: true }).focus();
  await pressTabUntil(page, "Approve brief");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Turn raw thinking into finished work without losing the trail back to source material");
  await pressTabUntil(page, "Choose style");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Style" })).toBeVisible();
  await pressTabUntil(page, "Set manuallyEnter exact brand rules yourself");
  await page.keyboard.press("Enter");
  await pressTabUntil(page, "Use this style");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Style" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Create work" })).toBeVisible();

});

test("voice capture is bounded inside Add source and fails closed without live opt-in", async ({ page }) => {
  const state = await (await page.request.get("/api/workshop")).json();
  let posted: Record<string, unknown> | undefined;
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const sourceSheet = await openSources(page);
  await sourceSheet.getByRole("button", { name: "Add source" }).click();
  await page.getByRole("button", { name: "Record voice" }).click();
  await expect(page.locator(".capture-error")).toContainText("Live OpenAI capture is disabled");
  await expect(page.getByRole("dialog", { name: "Add source" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Notes or website" })).toBeVisible();
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    posted = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({ json: state });
  });
  await page.getByRole("textbox", { name: "Notes or website" }).fill("Private client meeting notes should never be relabeled as demo-safe material.");
  await page.getByRole("button", { name: "Add source", exact: true }).click();
  expect(posted).toMatchObject({ action: "ingestSource", source: { origin: "Pasted notes", permission: "private" } });
});

test("local PDFs can be chosen without exposing filesystem paths", async ({ page }) => {
  const state = await (await page.request.get("/api/workshop")).json();
  let uploadBody = "";
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const sourceSheet = await openSources(page);
  await sourceSheet.getByRole("button", { name: "Add source" }).click();
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    uploadBody = route.request().postDataBuffer()?.toString("utf8") ?? "";
    return route.fulfill({ json: state });
  });
  await page.getByLabel("Choose PDF file").setInputFiles({
    name: "client-brief.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n%%EOF"),
  });
  await expect(page.getByRole("dialog", { name: "Add source" })).toBeHidden();
  expect(uploadBody).toContain("ingestPdfUpload");
  expect(uploadBody).toContain("client-brief.pdf");
  expect(uploadBody).toContain("private");
});

test("grounded Conversation preserves source scope, citations, and responsive workbench context", async ({ page }) => {
  const ready = await (await page.request.get("/api/workshop")).json();
  const claim = ready.claims.find((item: { sourceId: string }) => item.sourceId === "source-design") ?? ready.claims[0];
  const source = ready.sourceItems.find((item: { id: string }) => item.id === claim.sourceId);
  const conversation = { ...ready, conversationTurns: [
    { id: "turn-user-review", role: "user", text: "What should lead the presentation?", input: "text", createdAt: "2026-07-15T20:20:00.000Z", evidence: [] },
    { id: "turn-assistant-review", role: "assistant", text: `Your selected Sources support this: ${claim.text}.`, input: "system", createdAt: "2026-07-15T20:20:00.000Z", evidence: [{ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator }], operation: { name: "search", status: "completed" } },
  ] };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET" ? route.fulfill({ json: conversation }) : route.fulfill({ json: conversation }));

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "chat");
    const surface = page.getByRole("region", { name: "WorkshopLM Conversation" });
    await expect(surface).toBeVisible();
    await expect(surface.getByText("What should lead the presentation?")).toBeVisible();
    await expect(surface.getByRole("button", { name: source.title })).toBeVisible();
    await expect(surface.getByRole("textbox", { name: "Message WorkshopLM" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^\d+ sources?$/ })).toBeVisible();
    await expect(page.locator(".spine-stage[aria-current='step']")).toBeVisible();
    await expect(surface).toHaveScreenshot(`${viewport.name}-conversation.png`, { animations: "disabled", caret: "hide", maxDiffPixelRatio: viewport.name === "mobile" ? 0.004 : 0.001 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await surface.getByRole("button", { name: source.title }).click();
    await expect(page.getByRole("dialog", { name: "Source" })).toContainText(claim.locator);
    await closeDialog(page, "Source");
    await surface.getByRole("button", { name: "Voice" }).click();
    await expect(surface.getByRole("button", { name: "Start talking" })).toBeVisible();
    await expect(surface.getByText("Speak naturally. Answers use only your selected Sources, and your transcript stays private.")).toBeVisible();
    await surface.getByRole("button", { name: "Close voice" }).click();
  }
});

test("dismissed guidance remains quietly available from the Workshop sheet", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    const browse = await openWorkshopIndex(page);
    await page.getByRole("button", { name: "All Workshops" }).click();
    await page.getByRole("button", { name: "How WorkshopLM works" }).click();
    const help = page.getByRole("dialog", { name: "How WorkshopLM works" });
    await expect(help).toBeVisible();
    await expect(help.getByText("Capture", { exact: true })).toBeVisible();
    await expect(help.getByText("Map", { exact: true })).toBeVisible();
    await expect(help.getByText("Brief", { exact: true })).toBeVisible();
    await expect(help.getByText("Create", { exact: true })).toBeVisible();
    await expect(help.getByText(/Brief and Storyboard are the only two sign-offs/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await closeDialog(page, "How WorkshopLM works");
    await expect(browse).toBeFocused();
  }
});

test("transient sheets contain keyboard focus, close with Escape, and restore the trigger", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 800 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: /^\d+ sources?$/ });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const sheet = page.getByRole("dialog", { name: "Sources" });
  await expect(sheet).toBeVisible();
  await expect(page.getByRole("button", { name: "Close Sources" })).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(sheet.getByRole("button", { name: "Show on map" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close Sources" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("failed actions announce an error without removing the current work", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "POST") return route.fulfill({ status: 409, json: { error: "The source could not be added. Try again." } });
    return route.continue();
  });
  await page.goto("/");
  const sources = await openSources(page);
  await sources.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "Update sources" }).click();
  await expect(page.locator(".notice[role='alert']")).toContainText("The source could not be added. Try again.");
  await expect(page.getByRole("dialog", { name: "Sources" })).toBeVisible();
  await expect(page.locator(".object-canvas[aria-label='Map']")).toBeVisible();
});

test("an empty Workshop reaches an editable Presentation through one obvious path", async ({ page }) => {
  const original = await (await page.request.get("/api/workshop")).json() as { id: string };
  const styleLibrary = await (await page.request.get("/api/workshop?view=styles")).json() as { styles: Array<{ id: string; name: string }> };
  const startedAt = Date.now();
  const created = await page.request.post("/api/workshop", { data: { action: "createWorkshop", title: "First client brief" } });
  expect(created.ok()).toBeTruthy();

  try {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto("/");
    await page.getByRole("textbox", { name: "Notes or website" }).fill([
      "Weekly client meeting",
      "The client approved a two-week pilot for the enablement team.",
      "Leadership needs a grounded Presentation that explains the decision, timeline, and success measure.",
    ].join("\n"));
    await page.getByRole("button", { name: "Build my Map" }).click();

    await expect(page.getByRole("button", { name: "Approve brief" })).toBeVisible();
    await page.getByRole("button", { name: "Approve brief" }).click();
    await page.getByRole("button", { name: "Choose style" }).click();
    const savedStyle = styleLibrary.styles[0];
    if (savedStyle) await page.getByRole("button", { name: new RegExp(savedStyle.name) }).click();
    else {
      await page.getByRole("button", { name: "Set manually" }).click();
      await page.getByRole("button", { name: "Use this style" }).click();
    }
    await expect(page.getByRole("button", { name: "Create work" })).toBeVisible();
    await page.getByRole("button", { name: "Create work" }).click();

    await expect(page.getByText("Your created work is ready.")).toBeVisible();
    await page.waitForTimeout(200);
    await expect.poll(() => page.locator(".outputs-view").evaluate((element) => element.scrollTop)).toBe(0);
    await page.getByRole("button", { name: "Got it" }).click();
    await expect(page.getByRole("heading", { name: "Presentation" })).toBeVisible();
    await page.getByRole("button", { name: /^Open Presentation/ }).click();
    await expect(page.getByRole("link", { name: "Download PowerPoint" })).toBeVisible();
    await page.waitForTimeout(200);
    await expect.poll(() => page.locator(".focused-output").evaluate((element) => element.scrollTop)).toBe(0);
    const state = await (await page.request.get("/api/workshop")).json() as { sourceItems: Array<{ title: string }>; outputs: Array<{ type: string; editableRelativePath?: string }> };
    expect(state.sourceItems[0]?.title).toBe("Weekly client meeting");
    expect(state.outputs.find((output) => output.type === "deck")?.editableRelativePath).toMatch(/\.pptx$/);
    expect(Date.now() - startedAt).toBeLessThan(15 * 60 * 1000);
  } finally {
    const restored = await page.request.post("/api/workshop", { data: { action: "selectWorkshop", workshopId: original.id } });
    expect(restored.ok()).toBeTruthy();
  }
});

test("Create opens immediately and reports progress at every responsive width", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const current = await (await page.request.get("/api/workshop")).json();
  const readyStyle = current.style ?? { name: "Clean professional", accent: "#2D5BDB", ink: "#0D0D0D", paper: "#FFFFFF", version: 1 };
  const readyState = {
    ...current,
    briefApproved: true,
    frame: current.frame ? { ...current.frame, stale: false } : current.frame,
    style: { ...readyStyle, stale: false },
    outputs: [],
    audioOverviews: [],
    sketch: undefined,
    sketchHistory: [],
    assetPlan: undefined,
    imageBatch: undefined,
    storyboard: { ...current.storyboard, panels: [], stale: false },
    storyboardApproved: false,
    videos: [],
    videoState: "not_started",
    outputRecovery: {},
  };
  const outputFixtures = current.outputs as Array<{ id: string; type: string }>;
  expect(outputFixtures.some((output) => output.type === "deck")).toBeTruthy();
  let createdOutputs: Array<{ id: string; type: string }> = [];
  let holdInfographic = false;
  let releaseInfographic: (() => void) | null = null;
  await page.route("**/api/workshop*", async (route) => {
    if (route.request().method() === "GET" && route.request().url().includes("view=styles")) return route.fulfill({ json: { styles: [] } });
    if (route.request().method() === "GET") {
      if (!route.request().url().includes("view=")) createdOutputs = [];
      return route.fulfill({ json: readyState });
    }
    const body = route.request().postDataJSON() as { action?: string; outputType?: string };
    if (body.action === "generateOutput" && body.outputType === "infographic" && holdInfographic) {
      await new Promise<void>((resolve) => { releaseInfographic = resolve; });
      holdInfographic = false;
    }
    await new Promise((resolve) => setTimeout(resolve, 60));
    if (body.action === "generateOutput") {
      const output = outputFixtures.find((candidate) => candidate.type === body.outputType);
      if (output && !createdOutputs.some((candidate) => candidate.id === output.id)) createdOutputs = [...createdOutputs, output];
    }
    return route.fulfill({ json: { ...readyState, outputs: createdOutputs } });
  });

  for (const viewport of viewports) {
    createdOutputs = [];
    holdInfographic = true;
    releaseInfographic = null;
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Create work" })).toBeVisible();
    await page.getByRole("button", { name: "Create work" }).click();
    await expect(page.getByRole("heading", { name: "Created work" })).toBeVisible();
    const progress = page.getByRole("status").filter({ hasText: "Creating your work" });
    await expect(progress).toContainText("Presentation");
    await expect(page.getByRole("button", { name: /Creating Presentation/ })).toBeDisabled();
    await expect(progress).toContainText("Infographic");
    await expect(page.getByRole("heading", { name: "Presentation" })).toBeVisible();
    await expectScreen(page, `${viewport.name}-creating-work`);
    releaseInfographic?.();
    await expect(progress).toHaveCount(0, { timeout: 5000 });
  }
});

test("the approved Map becomes a focused hand-drawn Sketch without another navigation mode", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  for (const viewport of [viewports[0], viewports[2]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await openWorkshopView(page, "outputs");
    await page.getByRole("button", { name: /Open Sketch/ }).click();
    await expect(page.getByRole("heading", { name: "Sketch", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download SVG" })).toHaveAttribute("href", "/api/workshop/artifacts/sketch?format=editable");
    await expect(page.getByRole("region", { name: "Sources in this Sketch" })).toBeVisible();
    await expect.poll(() => page.locator(".sketch-focused-preview img").evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBe(1600);
    await expect.poll(() => page.locator(".focused-output").evaluate((element) => element.scrollTop)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await expectScreen(page, `${viewport.name}-sketch-viewer`);
  }
  const regenerated = await page.request.post("/api/workshop", { data: { action: "createSketch" } });
  expect(regenerated.ok()).toBeTruthy();
  await page.setViewportSize({ width: viewports[0].width, height: viewports[0].height });
  await page.reload();
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await page.getByRole("button", { name: /Open Sketch/ }).click();
  await expect(page.getByText(/Hand-drawn view · Version 2/)).toBeVisible();
  const versionHistory = page.getByRole("heading", { name: "Version history" });
  await expect(versionHistory).toBeVisible();
  await versionHistory.scrollIntoViewIfNeeded();
  await expectScreen(page, "desktop-sketch-history");
  await page.getByRole("button", { name: "Open Sketch, version 1" }).click();
  await expect(page.getByText(/Hand-drawn view · Version 1/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Download SVG" })).toHaveAttribute("href", "/api/workshop/artifacts/sketch-v1?format=editable");
  const priorArtifact = await page.request.get("/api/workshop/artifacts/sketch-v1");
  expect(priorArtifact.ok()).toBeTruthy();
  expect(priorArtifact.headers()["content-type"]).toContain("image/svg+xml");
});

test("Style starts from a website and preserves the Workshop outcome", async ({ page }) => {
  await page.request.post("/api/workshop", { data: { action: "approveBrief" } });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const stylelessState = { ...readyState, style: undefined, onboarding: { ...readyState.onboarding, outcome: "board_deck" } };
  const posted: Record<string, unknown>[] = [];
  const suggestion = { referenceUrl: "https://example.com/brand", name: "Example Studio foundation", accent: "#2457D6", ink: "#102030", paper: "#FAF8F4", paletteRoles: { accent: { value: "#2457D6", source: "website" }, text: { value: "#102030", source: "website" }, background: { value: "#FAF8F4", source: "website" } }, logos: ["https://example.com/logo.svg"], assetCandidates: [{ url: "https://example.com/logo.svg", kind: "logo" }], fontCandidates: ["Studio Sans"], typographyCandidates: [{ family: "Studio Sans", availability: "unverified", source: "website" }], references: ["https://example.com/brand"], negativeRules: [], findings: { colors: 3, fontCandidates: 1, assets: 1, stylesheets: 1 } };
  await page.route("**/api/workshop/brand-preview**", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><rect width="64" height="32" rx="5" fill="#2457D6"/><circle cx="48" cy="16" r="8" fill="#FAF8F4"/></svg>' }));
  await page.route("**/api/workshop*", async (route) => {
    if (route.request().method() === "GET" && route.request().url().includes("view=styles")) return route.fulfill({ json: { styles: [] } });
    if (route.request().method() === "GET") return route.fulfill({ json: stylelessState });
    const body = route.request().postDataJSON() as Record<string, unknown>;
    posted.push(body);
    if (body.action === "analyzeWebsiteStyle") return route.fulfill({ json: suggestion });
    return route.fulfill({ json: readyState });
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await page.getByRole("button", { name: "Choose style" }).click();
    const sheet = page.getByRole("dialog", { name: "Style" });
    const createAnother = sheet.getByRole("button", { name: "Create another style" });
    if (await createAnother.isVisible()) await createAnother.click();
    await expect(sheet.getByRole("button", { name: /Website/ })).toHaveAttribute("aria-pressed", "true");
    await sheet.getByRole("textbox", { name: "Website" }).fill("https://example.com/brand");
    await expect(sheet.getByText("For Board presentation")).toBeVisible();
    await expect(sheet.getByText("Use it for")).toHaveCount(0);
    await sheet.getByRole("button", { name: "Review style" }).click();
    await expect(sheet.getByText("3 colors, 1 font candidate, and 1 brand asset")).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "Example Studio foundation" })).toBeVisible();
    await expect(sheet.getByText("From example.com")).toBeVisible();
    await expect(sheet.getByText("Ready to use")).toBeVisible();
    await expect(sheet.getByText("Studio Sans found · system fallback until confirmed")).toBeVisible();
    await expect(sheet.getByRole("textbox", { name: "Name" })).toHaveCount(0);
    await expectScreen(page, `${viewport.name}-website-style`);
    await sheet.getByRole("button", { name: "Edit details" }).click();
    await expect(sheet.getByRole("textbox", { name: "Name" })).toHaveValue("Example Studio foundation");
    await expect(sheet.getByRole("textbox", { name: "Heading" })).toHaveValue("Studio Sans");
    await expect(sheet.getByText("Found on the website · usage not verified")).toBeVisible();
    const fontConfirmation = sheet.getByRole("checkbox", { name: "I can use these fonts in generated work" });
    await expect(fontConfirmation).not.toBeChecked();
    const logoSelection = sheet.getByRole("checkbox", { name: "Use logo from example.com" });
    await expect(logoSelection).not.toBeChecked();
    await logoSelection.check();
    await sheet.getByRole("textbox", { name: "Accent" }).fill("#335577");
    await fontConfirmation.check();
    await sheet.getByRole("button", { name: "Use this style" }).click();
    await expect.poll(() => posted.at(-1)).toEqual({ action: "lockWebsiteStyle", url: "https://example.com/brand", intentProfile: "board_deck", manualStyle: { name: "Example Studio foundation", accent: "#335577", ink: "#102030", paper: "#FAF8F4", headingFont: "Studio Sans", bodyFont: "Studio Sans", fontsConfirmed: true, selectedAssetUrls: ["https://example.com/logo.svg"], logos: [], licensedFonts: ["Studio Sans"], references: ["https://example.com/brand"], negativeRules: [], intentProfile: "board_deck" } });
  }
});

test("a completed website review hands off from the editable Map without blocking it", async ({ page }) => {
  const current = await (await page.request.get("/api/workshop")).json();
  const suggestion = { referenceUrl: "https://example.com/brand", name: "Example Studio foundation", accent: "#2457D6", ink: "#102030", paper: "#FAF8F4", paletteRoles: { accent: { value: "#2457D6", source: "website" }, text: { value: "#102030", source: "website" }, background: { value: "#FAF8F4", source: "website" } }, logos: ["https://example.com/logo.svg"], assetCandidates: [{ url: "https://example.com/logo.svg", kind: "logo" }], fontCandidates: ["Studio Sans"], typographyCandidates: [{ family: "Studio Sans", availability: "unverified", source: "website" }], references: ["https://example.com/brand"], negativeRules: [], findings: { colors: 3, fontCandidates: 1, assets: 1, stylesheets: 1 } };
  const stylelessState = { ...current, briefApproved: false, frame: current.frame ? { ...current.frame, stale: true } : undefined, style: undefined, onboarding: { ...current.onboarding, step: "complete", outcome: "board_deck", mapOrientationDismissed: true, styleAnalysis: { status: "ready", url: suggestion.referenceUrl, startedAt: "2026-07-15T14:00:00.000Z", completedAt: "2026-07-15T14:00:01.000Z", suggestion } } };
  const posted: Record<string, unknown>[] = [];
  await page.route("**/api/workshop/brand-preview**", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><rect width="64" height="32" rx="5" fill="#2457D6"/><circle cx="48" cy="16" r="8" fill="#FAF8F4"/></svg>' }));
  await page.route("**/api/workshop*", async (route) => {
    if (route.request().method() === "GET" && route.request().url().includes("view=styles")) return route.fulfill({ json: { styles: [] } });
    if (route.request().method() === "GET") return route.fulfill({ json: stylelessState });
    posted.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ json: current });
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expect(page.getByText("Company style ready to review")).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toBeVisible();
  await expectMapReady(page, viewports[0]);
  await expectScreen(page, "desktop-map-style-ready");
  await page.getByRole("button", { name: "Review style" }).click();
  const sheet = page.getByRole("dialog", { name: "Style" });
  await expect(sheet).toContainText("We found this on example.com. Keep what is right.");
  await expect(sheet.getByRole("heading", { name: "Example Studio foundation" })).toBeVisible();
  await expect(sheet.getByText("From example.com")).toBeVisible();
  await expect(sheet.getByText("Ready to use")).toBeVisible();
  await expect(sheet.getByText("Studio Sans found · system fallback until confirmed")).toBeVisible();
  await expect(sheet.getByRole("textbox", { name: "Accent" })).toHaveCount(0);
  await expect(sheet.getByText("For Board presentation", { exact: true })).toBeVisible();
  await sheet.getByRole("button", { name: "Use this style" }).click();
  await expect.poll(() => posted.at(-1)?.action).toBe("lockWebsiteStyle");
  await expect.poll(() => (posted.at(-1)?.manualStyle as Record<string, unknown>)?.fontsConfirmed).toBe(false);
  await expect.poll(() => (posted.at(-1)?.manualStyle as Record<string, unknown>)?.licensedFonts).toEqual([]);
  await expect.poll(() => (posted.at(-1)?.manualStyle as Record<string, unknown>)?.selectedAssetUrls).toEqual([]);
});

test("a failed website review keeps the Map usable and offers all safe Style fallbacks", async ({ page }) => {
  const current = await (await page.request.get("/api/workshop")).json();
  const failedState = { ...current, briefApproved: false, frame: current.frame ? { ...current.frame, stale: true } : undefined, style: undefined, onboarding: { ...current.onboarding, step: "complete", outcome: "board_deck", mapOrientationDismissed: true, styleAnalysis: { status: "error", url: "https://example.com/app", startedAt: "2026-07-15T14:00:00.000Z", completedAt: "2026-07-15T14:00:01.000Z", errorCode: "dynamic_site", error: "This website loads its visual system with JavaScript, so WorkshopLM could not review it safely. Set the Style manually or use a clean default." } } };
  const defaultStyle = { ...current.style, name: "Clean professional", source: "manual", intentProfile: "board_deck", stale: false };
  let state = failedState;
  const posted: Record<string, unknown>[] = [];
  await page.route("**/api/workshop*", async (route) => {
    if (route.request().method() === "GET" && route.request().url().includes("view=styles")) return route.fulfill({ json: { styles: [] } });
    if (route.request().method() === "GET") return route.fulfill({ json: state });
    const body = route.request().postDataJSON() as Record<string, unknown>;
    posted.push(body);
    if (body.action === "beginWebsiteStyleAnalysis") state = { ...state, onboarding: { ...state.onboarding, styleAnalysis: { ...state.onboarding.styleAnalysis, status: "reviewing" } } };
    if (body.action === "lockManualStyle") state = { ...state, style: defaultStyle };
    return route.fulfill({ json: state });
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expect(page.getByText("Couldn't review this website")).toBeVisible();
  await expect(page.getByText(/loads its visual system with JavaScript/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toBeVisible();
  await expectMapReady(page, viewports[0]);

  await page.getByRole("button", { name: "Set manually" }).click();
  const sheet = page.getByRole("dialog", { name: "Style" });
  await sheet.getByRole("button", { name: "Set manually" }).click();
  await expect(sheet.getByRole("textbox", { name: "Accent" })).toHaveValue("#0285FF");
  await expect(sheet.getByRole("button", { name: "Use this style" })).toBeVisible();
  await closeDialog(page, "Style");

  await page.getByRole("button", { name: "Try again" }).click();
  await expect.poll(() => posted.at(-1)).toMatchObject({ action: "beginWebsiteStyleAnalysis", url: "https://example.com/app" });
  state = failedState;
  await page.reload();
  await page.getByRole("button", { name: "Use a clean default" }).click();
  await expect.poll(() => posted.at(-1)).toMatchObject({ action: "lockManualStyle", manualStyle: { name: "Clean professional", intentProfile: "board_deck" } });
  await expect(page.getByText("Couldn't review this website")).toHaveCount(0);
});

test("editing a saved Company Style is presented and submitted as a new version", async ({ page }) => {
  await page.request.post("/api/workshop", { data: { action: "approveBrief" } });
  let current = await (await page.request.get("/api/workshop")).json();
  if (!current.style) {
    await page.request.post("/api/workshop", { data: { action: "lockManualStyle", manualStyle: { name: "WorkshopLM editorial", accent: "#0285FF", ink: "#0D0D0D", paper: "#FFFFFF", intentProfile: "client_facing_pitch" } } });
    current = await (await page.request.get("/api/workshop")).json();
  }
  const posted: Record<string, unknown>[] = [];
  const libraryEntry = { ...current.style, id: current.style.libraryId, familyId: current.style.libraryFamilyId, revision: current.style.libraryRevision ?? 1, createdAt: "2026-07-15T14:00:00.000Z", updatedAt: "2026-07-15T14:00:00.000Z" };
  delete libraryEntry.version;
  delete libraryEntry.libraryId;
  delete libraryEntry.libraryFamilyId;
  delete libraryEntry.libraryRevision;
  delete libraryEntry.lockedAt;
  delete libraryEntry.stale;
  await page.route("**/api/workshop*", async (route) => {
    if (route.request().method() === "GET" && route.request().url().includes("view=styles")) return route.fulfill({ json: { styles: [libraryEntry] } });
    if (route.request().method() === "GET") return route.fulfill({ json: current });
    posted.push(route.request().postDataJSON() as Record<string, unknown>);
    return route.fulfill({ json: { ...current, style: { ...current.style, libraryRevision: (current.style.libraryRevision ?? 1) + 1 } } });
  });

  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await expect(page.getByLabel("Style").getByText(current.style.name, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const sheet = page.getByRole("dialog", { name: "Style" });
  await expect(sheet.getByText(`Company style · Version ${current.style.libraryRevision ?? 1}`, { exact: true })).toBeVisible();
  await sheet.getByRole("textbox", { name: "Accent" }).fill("#6644AA");
  await sheet.getByRole("button", { name: "Save new version" }).click();
  await expect.poll(() => posted.at(-1)?.action).toBe(current.style.source === "website" ? "lockWebsiteStyle" : "lockManualStyle");
  await expect.poll(() => (posted.at(-1)?.manualStyle as Record<string, unknown>)?.accent).toBe("#6644AA");
});

test.describe("completed Workshop judge path", () => {
  test.beforeEach(() => {
    const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
    execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  });

  for (const viewport of viewports) {
    test(`${viewport.name} visual path`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Map", exact: true })).toBeVisible();
      await expectMapReady(page, viewport);
      if (viewport.name === "mobile") {
        await expect(page.locator(".map-insight-bar")).toBeHidden();
        await expect(page.locator(".map-mobile-outline > button").first()).toContainText("Direction");
      } else {
        await expect(page.getByRole("region", { name: "Map overview" })).toContainText("Approved direction");
        await expect(page.getByRole("region", { name: "Map overview" })).not.toContainText("Turn this evidence into an approved Brief");
      }
      await expectPrimaryActions(page, 1);
      await expectScreen(page, `${viewport.name}-map`);

      const sourceTrigger = page.getByRole("button", { name: /^\d+ sources?$/ });
      await sourceTrigger.click();
      await expectPrimaryActions(page, 0);
      await expectScreen(page, `${viewport.name}-sources`);
      await closeDialog(page, "Sources");
      await expect(sourceTrigger).toBeFocused();

      await selectProductPromise(page, viewport);
      await expect(page.getByRole("button", { name: "Show source" })).toBeVisible();
      await page.getByRole("button", { name: "Show source" }).click();
      await expectPrimaryActions(page, 1);
      await expectScreen(page, `${viewport.name}-evidence`);
      await closeDialog(page, "Source");
      await page.getByRole("button", { name: "Close claim" }).click();

      await openWorkshopView(page, "brief");
      await expectPrimaryActions(page, 1);
      await expect(page.getByText("# FRAME.md", { exact: false })).toHaveCount(0);
      if (viewport.width > 900 && viewport.width <= 1100) {
        const styleName = page.getByLabel("Style").getByText("Clean professional", { exact: true });
        await expect(styleName).toBeVisible();
        expect(await styleName.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBeTruthy();
      }
      await expectScreen(page, `${viewport.name}-brief`);
      await page.getByRole("button", { name: "Edit", exact: true }).click();
      await expect(page.getByRole("dialog", { name: "Style" })).toBeVisible();
      await expectScreen(page, `${viewport.name}-style`);
      await closeDialog(page, "Style");

      await openWorkshopView(page, "outputs");
      await expectPrimaryActions(page, 1);
      await expect(page.getByRole("heading", { name: "Presentation" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Infographic" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Sketch" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Image set" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Storyboard" })).toHaveCount(1);
      const outputCards = page.locator(".output-grid .output-card");
      await expect(outputCards.first().getByRole("heading", { name: "Presentation" })).toBeVisible();
      await expect(page.locator(".output-grid .output-card--hero")).toHaveCount(0);
      if (viewport.name === "desktop") {
        const [presentationBox, infographicBox] = await Promise.all([
          page.getByRole("button", { name: /^Open Presentation/ }).boundingBox(),
          page.getByRole("button", { name: /^Open Infographic/ }).boundingBox(),
        ]);
        expect(presentationBox?.width).toBe(infographicBox?.width);
      }
      await expect(page.getByRole("button", { name: "Show source" })).toHaveCount(0);
      await expect(page.locator(".output-grid")).not.toContainText("Version");
      if (viewport.width > 900) await expect(page.locator(".object-page-header")).toContainText(/\d+ current/);
      await expectPreviewFramesReady(page);
      await expect(page.locator('.output-card iframe[aria-hidden="true"][scrolling="no"]')).toHaveCount(2);
      await expect(page.locator(".output-card--images img")).toHaveCount(6);
      const discoverableCards = await outputCards.evaluateAll((cards) => cards.slice(0, 4).map((card) => {
        const bounds = card.getBoundingClientRect();
        return { top: bounds.top, width: bounds.width };
      }));
      expect(discoverableCards).toHaveLength(4);
      expect(discoverableCards.every((card) => card.top < viewport.height)).toBeTruthy();
      expect(discoverableCards.every((card) => card.width >= 160)).toBeTruthy();
      await expectScreen(page, `${viewport.name}-outputs`);

      await page.getByRole("button", { name: "Open Presentation" }).click();
      await expect(page.getByRole("heading", { name: "Presentation" })).toBeVisible();
      await expect(page.getByText("Presentation · Version 1 · 3 sources · 4 source links", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "3 sources" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Show source", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Download PowerPoint" })).toHaveClass(/oai-button--primary/);
      await expect(page.getByRole("region", { name: "Sources in this work" })).toBeVisible();
      await expect(page.getByRole("button", { name: /^Show source for / })).toHaveCount(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      await expect(page.getByRole("link", { name: "Open preview" })).toBeVisible();
      await expectPreviewFramesReady(page);
      expect(await page.locator(".focused-output-preview iframe").evaluate((iframe: HTMLIFrameElement) => {
        const slide = iframe.contentDocument?.querySelector(".slide")?.getBoundingClientRect();
        const title = iframe.contentDocument?.querySelector(".cover .title")?.getBoundingClientRect();
        return {
          slideFits: Boolean(slide && slide.bottom <= iframe.clientHeight),
          titleFits: Boolean(title && title.bottom <= iframe.clientHeight),
        };
      })).toEqual({ slideFits: true, titleFits: true });
      await expectScreen(page, `${viewport.name}-output-viewer`);
      await page.getByRole("button", { name: "View source links" }).click();
      await expect.poll(() => page.locator(".focused-output").evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await page.getByRole("button", { name: "Back to Created work" }).click();

      await page.getByRole("button", { name: "Open Infographic" }).click();
      await expect(page.getByRole("heading", { name: "Infographic" })).toBeVisible();
      await expectPreviewFramesReady(page);
      expect(await page.locator(".focused-output-preview iframe").evaluate((iframe: HTMLIFrameElement) => {
        const cards = [...(iframe.contentDocument?.querySelectorAll<HTMLElement>(".infographic-card") ?? [])];
        return cards.length > 0 && cards.every((card) => {
          const citation = card.querySelector<HTMLElement>(".cite")?.getBoundingClientRect();
          const content = (card.querySelector<HTMLElement>(".infographic-sequence") ?? card.querySelector<HTMLElement>("p:not(.cite)") ?? card.querySelector<HTMLElement>("h2"))?.getBoundingClientRect();
          const boundary = card.getBoundingClientRect();
          return card.scrollHeight <= card.clientHeight + 1
            && Boolean(citation && content && citation.top >= content.bottom - 1 && citation.bottom <= boundary.bottom - 8);
        });
      })).toBe(true);
      await expectScreen(page, `${viewport.name}-infographic`);
      await page.getByRole("button", { name: "Back to Created work" }).click();

      await page.getByRole("button", { name: "Open Image set" }).click();
      await expect(page.getByRole("heading", { name: "Image set" })).toBeVisible();
      await expect(page.locator('[data-domain-ui="image-review-grid"] [data-domain-ui="image-tile"]')).toHaveCount(6);
      await expect(page.locator('[data-domain-ui="image-review-grid"] img')).toHaveCount(6);
      await expect(page.getByText("6 images · 3 sources · One shared Style", { exact: true })).toBeVisible();
      await expect(page.getByText("Hero concept", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Show source" })).toHaveCount(6);
      if (viewport.name === "mobile") expect(await page.locator(".focused-image-card").evaluateAll((cards) => cards.every((card) => {
        const boundary = card.getBoundingClientRect();
        return [...card.querySelectorAll(".focused-image-caption, .focused-image-actions .oai-button")].every((element) => {
          const content = element.getBoundingClientRect();
          return content.left >= boundary.left && content.right <= boundary.right + 1;
        });
      }))).toBe(true);
      await expectScreen(page, `${viewport.name}-image-set`);
      await page.getByRole("button", { name: "Back to Created work" }).click();

      await page.getByRole("button", { name: "Open Storyboard" }).click();
      await expectPrimaryActions(page, 1);
      await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
      await expect(page.locator(".panel-visual img")).toBeVisible();
      await expectScreen(page, `${viewport.name}-storyboard`);
      await page.locator(".storyboard-strip button").nth(2).click();
      await page.getByRole("button", { name: "Show source" }).click();
      const storyboardSource = page.getByRole("dialog", { name: "Source" });
      await expect(storyboardSource).toContainText("WorkshopLM direction");
      await expect(storyboardSource).toContainText("Design · Map");
      await closeDialog(page, "Source");
      const titleField = page.getByRole("textbox", { name: "Panel title" });
      const originalTitle = await titleField.inputValue();
      await titleField.fill(`${originalTitle} revised`);
      await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
      await titleField.fill(originalTitle);
      await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
      if (viewport.name === "mobile") {
        const updateOutputs = page.getByRole("button", { name: "Update work" });
        if (await updateOutputs.isVisible()) {
          await updateOutputs.click();
          await openWorkshopView(page, "storyboard");
        }
        await pressTabUntil(page, "Approve storyboard");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("button", { name: "Create video" })).toBeVisible();
      }
    });
  }
});

test("empty, loading, partial, error, and needs-update states stay calm and actionable", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    let releaseLoading!: () => void;
    const loadingGate = new Promise<void>((resolveLoading) => { releaseLoading = resolveLoading; });
    await page.route("**/api/workshop", async (route) => {
      if (route.request().method() !== "GET") return route.continue();
      await loadingGate;
      return route.fulfill({ json: readyState });
    });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Opening Workshop" })).toBeVisible();
    await expectPrimaryActions(page, 0);
    await expectScreen(page, `${viewport.name}-state-loading`);
    const loadedResponse = page.waitForResponse("**/api/workshop");
    releaseLoading();
    await loadedResponse;
    await page.unroute("**/api/workshop");

    await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
      ? route.fulfill({ status: 500, json: { error: "unavailable" } })
      : route.continue());
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Couldn't open Workshop" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-error`);
    await page.unroute("**/api/workshop");

    const emptyState = { ...readyState, briefApproved: false, storyboardApproved: false, frame: undefined, style: undefined, assetPlan: undefined, sourceItems: [], activeSourceIds: [], claims: [], mapNodes: [], outputs: [], audioOverviews: [], videos: [], sketch: undefined, imageBatch: undefined, storyboard: { ...readyState.storyboard, panels: [] } };
    await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
      ? route.fulfill({ json: emptyState })
      : route.continue());
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Start with a source" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add source" })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-empty`);
    await page.unroute("**/api/workshop");

    const failedPanels = readyState.imageBatch.panels.map((panel: Record<string, unknown>, index: number) => ({ ...panel, state: index === 0 ? "failed" : "planned" }));
    const partialState = { ...readyState, outputs: readyState.outputs.slice(0, 1), imageBatch: { ...readyState.imageBatch, stale: false, panels: failedPanels }, storyboard: { ...readyState.storyboard, stale: false, panels: [] } };
    const postedActions: string[] = [];
    await page.route("**/api/workshop", async (route) => {
      if (route.request().method() === "GET") return route.fulfill({ json: partialState });
      const body = route.request().postDataJSON() as { action?: string };
      if (body.action) postedActions.push(body.action);
      return route.fulfill({ json: readyState });
    });
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await openWorkshopView(page, "outputs");
    await expect(page.getByRole("heading", { name: "Some work is ready" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Review image", exact: true })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-partial`);
    await page.getByRole("button", { name: "Review image", exact: true }).click();
    await page.getByRole("region", { name: "Hero concept" }).getByRole("button", { name: "Request replacement" }).click();
    const replacementSheet = page.getByRole("dialog", { name: "Replace image" });
    await replacementSheet.getByRole("textbox", { name: "What should change?" }).fill("Use fewer objects and leave more headline space.");
    await replacementSheet.getByRole("button", { name: "Create replacement" }).click();
    await expect(page.getByRole("status")).toContainText("Creating one replacement");
    expect(postedActions).toContain("regenerateImagePanel");
    await page.unroute("**/api/workshop");

    const needsUpdateState = { ...readyState, outputs: readyState.outputs.map((output: Record<string, unknown>) => ({ ...output, stale: true })), assetPlan: { ...readyState.assetPlan, stale: true }, imageBatch: { ...readyState.imageBatch, stale: true }, storyboard: { ...readyState.storyboard, stale: true } };
    await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
      ? route.fulfill({ json: needsUpdateState })
      : route.fulfill({ json: readyState }));
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await openWorkshopView(page, "outputs");
    await expect(page.getByRole("heading", { name: "Created work needs an update" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update work" })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-needs-update`);
    await page.unroute("**/api/workshop");
  }
});

test("a changed Source set requires a refreshed Map before Brief approval", async ({ page }) => {
  const readyState = await (await page.request.get("/api/workshop")).json();
  const addedSource = { ...readyState.sourceItems[0], id: "source-new-meeting", title: "New meeting", claimCount: 1 };
  const addedClaim = { ...readyState.claims[0], id: "claim-new-meeting", sourceId: addedSource.id, text: "Leadership approved the pilot." };
  const staleMapState = {
    ...readyState,
    sourceItems: [...readyState.sourceItems, addedSource],
    activeSourceIds: [...readyState.activeSourceIds, addedSource.id],
    claims: [...readyState.claims, addedClaim],
    briefApproved: false,
    frame: { ...readyState.frame, stale: true },
  };
  const postedActions: string[] = [];
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: staleMapState });
    const body = route.request().postDataJSON() as { action?: string };
    if (body.action) postedActions.push(body.action);
    return route.fulfill({ json: readyState });
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Update Map" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Workshop index, Map, needs update" })).toBeVisible();
  await page.getByRole("button", { name: "Update Map" }).click();
  expect(postedActions).toContain("buildMap");
});

test("Outputs preserve recognizable version history and source coverage", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const firstDeck = readyState.outputs.find((output: { type: string }) => output.type === "deck");
  const historyState = {
    ...readyState,
    outputs: [
      { ...firstDeck, id: "deck-v0", stale: true, createdAt: "2026-07-14T12:00:00.000Z", claimIds: firstDeck.claimIds.slice(0, 1) },
      ...readyState.outputs,
    ],
  };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
    ? route.fulfill({ json: historyState })
    : route.continue());
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");

  await expect(page.getByRole("button", { name: "Open Presentation, version 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Presentation, version 1" })).toHaveCount(0);
  await expect(page.locator(".output-grid")).not.toContainText("Version");
  await expect(page.locator(".output-card").first()).toContainText(/\d+ sources?/);
  await expect(page.locator('.output-card iframe[title$="preview"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Open Presentation, version 2" }).click();
  await expect(page.getByText(/Presentation · Version 2 · 3 sources · \d+ source links/, { exact: true })).toBeVisible();
  const history = page.getByRole("region", { name: "Version history" });
  await expect(history.getByRole("button", { name: "Open Presentation, version 2" })).toContainText("Current view");
  await expect(history.getByRole("button", { name: "Open Presentation, version 1" })).toContainText("Needs update");
});

test("Storyboard previews the exact image versions bound for video", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const panels = readyState.imageBatch.panels.map((panel: Record<string, unknown>) => ({ ...panel, state: "generated", relativePath: `generated/images/${panel.id}.png` }));
  const storyboardPanels = [
    ["Presentation", "A clear presentation built from the approved Brief. Evidence: Meeting · 12:41.", 4],
    ["Infographic", "Distill the strongest evidence into one source-traceable visual.", 4],
    ["Image set", "Show one coherent art direction across the complete image set.", 4],
    ["Storyboard", "Review the exact sequence and visuals before creating Video.", 4],
    ["Video", "Render only the Storyboard and image versions approved here.", 6],
  ].map(([title, narration, durationSeconds], index) => ({
    id: `storyboard-bound-panel-${index + 1}`,
    title,
    narration,
    durationSeconds,
    claimIds: readyState.storyboard.panels[index]?.claimIds ?? [],
    evidence: readyState.storyboard.panels[index]?.evidence ?? [{ sourceId: readyState.sourceItems[index % readyState.sourceItems.length].id, locator: readyState.sourceItems[index % readyState.sourceItems.length].locator }],
    imagePanelId: panels[index].id,
    imagePanelVersion: panels[index].version,
    approved: true,
    stale: false,
  }));
  const historicalPanels = storyboardPanels.map((panel: Record<string, unknown>, index: number) => ({ ...panel, title: index === 0 ? "Original presentation" : panel.title, narration: index === 0 ? "This is the reviewed narration from the approved Storyboard." : panel.narration, imageRelativePath: `generated/images/${panel.imagePanelId}-v1.png`, imageSha256: "a".repeat(64) }));
  const boundState = { ...readyState, storyboardApproved: false, videoState: "blocked", imageBatch: { ...readyState.imageBatch, panels }, storyboard: { ...readyState.storyboard, version: 3, approved: false, stale: false, panels: storyboardPanels }, storyboardHistory: [{ version: 2, approved: true, stale: true, panels: historicalPanels }] };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET" ? route.fulfill({ json: boundState }) : route.continue());
  await page.route("**/api/workshop/artifacts/image-panel-*", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#0d0d0d"/><rect x="90" y="90" width="410" height="620" rx="32" fill="#0285ff"/><circle cx="900" cy="280" r="190" fill="#ffffff" opacity=".9"/><rect x="660" y="560" width="390" height="36" rx="18" fill="#ffffff" opacity=".72"/></svg>' }));
  await page.route("**/api/workshop/artifacts/storyboard-v2-panel-*-image", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#f4f2ec"/><circle cx="310" cy="400" r="210" fill="#0285ff"/><rect x="610" y="170" width="430" height="460" rx="32" fill="#0d0d0d"/></svg>' }));
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await page.getByRole("button", { name: "Open Storyboard" }).click();
  const preview = page.locator(".panel-visual");
  const timing = page.getByRole("spinbutton", { name: "Seconds" });
  await expect(timing).toHaveValue("4");
  await timing.fill("9");
  await expect(page.getByText("Saving will require Storyboard approval and a new Video.", { exact: true })).toBeVisible();
  await expectScreen(page, "desktop-storyboard-timing");
  await timing.fill("4");
  await expect(preview.locator("img")).toHaveAttribute("src", "/api/workshop/artifacts/image-panel-1");
  await expect(preview.getByText("Image", { exact: true })).toBeVisible();
  await expectScreen(page, "desktop-storyboard-bound-image");
  await page.locator(".storyboard-strip button").nth(1).click();
  await expect(preview.locator("img")).toHaveAttribute("src", "/api/workshop/artifacts/image-panel-2");
  const history = page.getByRole("region", { name: "Version history" });
  await history.getByRole("button", { name: /Version 2 Approved/ }).click();
  const historySheet = page.getByRole("dialog", { name: "Storyboard · Version 2" });
  await expect(historySheet.getByText("Approved version", { exact: true })).toBeVisible();
  await expect(historySheet.locator(".panel-fields h3")).toHaveText("Original presentation");
  await expect(historySheet.locator(".panel-fields p")).toHaveText("This is the reviewed narration from the approved Storyboard.");
  await expect(historySheet.locator(".panel-visual img")).toHaveAttribute("src", "/api/workshop/artifacts/storyboard-v2-panel-1-image");
  await expect(historySheet.getByRole("button", { name: "Save changes" })).toHaveCount(0);
  await expectScreen(page, "desktop-storyboard-history");
  await closeDialog(page, "Storyboard · Version 2");
  await page.setViewportSize({ width: 1024, height: 768 });
  await timing.scrollIntoViewIfNeeded();
  await expectScreen(page, "compact-storyboard-timing");
});

test("Image set review exposes each visual job, exact source, and selective replacement", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const panels = readyState.imageBatch.panels.map((panel: Record<string, unknown>, index: number) => ({ ...panel, version: index === 0 ? 2 : panel.version, state: "generated", relativePath: `generated/images/${panel.id}-v${index === 0 ? 2 : panel.version}.png`, sha256: "b".repeat(64), history: index === 0 ? [{ version: 1, prompt: panel.prompt, evidence: panel.evidence, relativePath: `generated/images/${panel.id}-v1.png`, sha256: "a".repeat(64) }] : [] }));
  let current = { ...readyState, imageBatch: { ...readyState.imageBatch, panels } };
  const posted: Array<Record<string, unknown>> = [];
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: current });
    const body = route.request().postDataJSON() as Record<string, unknown>;
    posted.push(body);
    if (body.action === "regenerateImagePanel") current = { ...current, storyboardApproved: false, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel: Record<string, unknown>) => panel.id === body.panelId ? { ...panel, version: Number(panel.version) + 1, state: "selected_for_regeneration", revisionRequest: body.revisionRequest } : panel) } };
    return route.fulfill({ json: current });
  });
  await page.route("**/api/workshop/artifacts/image-panel-*", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#f4f2ec"/><path d="M90 810L450 120L710 810Z" fill="#0285ff"/><circle cx="760" cy="320" r="150" fill="#0d0d0d"/></svg>' }));
  await page.route("**/api/workshop/artifacts/image-panel-1-v1", async (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><rect width="1000" height="1000" fill="#0d0d0d"/><circle cx="360" cy="500" r="250" fill="#0285ff"/><rect x="650" y="160" width="180" height="680" rx="90" fill="#ffffff"/></svg>' }));
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await page.getByRole("button", { name: "Open Image set" }).click();

  const hero = page.getByRole("region", { name: "Hero concept" });
  await expect(hero).toContainText("Ready");
  await expect(hero).toContainText(/professional|WorkshopLM|source|meeting/i);
  await hero.getByRole("button", { name: "Show source" }).click();
  const evidence = panels[0].evidence[0];
  const source = readyState.sourceItems.find((item: Record<string, unknown>) => item.id === evidence.sourceId);
  await expect(page.getByRole("dialog", { name: "Source" })).toContainText(source.title === "Raw voice brainstorm" ? "Voice brainstorm" : String(source.title));
  await expect(page.getByRole("dialog", { name: "Source" })).toContainText(source.title === "Raw voice brainstorm" ? "Voice brainstorm · chunk 04" : String(evidence.locator));
  await closeDialog(page, "Source");

  await hero.getByRole("button", { name: "Request replacement" }).click();
  const replacementSheet = page.getByRole("dialog", { name: "Replace image" });
  await expect(replacementSheet.getByText("Keep the approved idea and Style.")).toBeVisible();
  await expect(replacementSheet.getByText("Version 2 · Latest", { exact: true })).toBeVisible();
  const imageHistory = replacementSheet.getByRole("region", { name: "Version history" });
  await imageHistory.getByRole("button", { name: /Version 1 Earlier/ }).click();
  await expect(replacementSheet.getByText("Version 1 · Earlier", { exact: true })).toBeVisible();
  await expect(replacementSheet.locator(".replacement-image-preview img")).toHaveAttribute("src", "/api/workshop/artifacts/image-panel-1-v1");
  await expectScreen(page, "desktop-image-history");
  await imageHistory.getByRole("button", { name: /Version 2 Latest/ }).click();
  await expectScreen(page, "desktop-image-replacement");
  await page.setViewportSize({ width: 390, height: 844 });
  await expectScreen(page, "mobile-image-replacement");
  await page.setViewportSize({ width: 1200, height: 800 });
  await replacementSheet.getByRole("textbox", { name: "What should change?" }).fill("Use fewer objects and leave more headline space.");
  await replacementSheet.getByRole("button", { name: "Create replacement" }).click();
  await expect.poll(() => posted.at(-1)).toMatchObject({ action: "regenerateImagePanel", panelId: panels[0].id, revisionRequest: "Use fewer objects and leave more headline space." });
  await expect(hero.getByText("Replacement requested", { exact: true })).toBeVisible();
  await expect(hero.locator("img")).toBeVisible();
  await expect(hero).toContainText("Change requested: Use fewer objects and leave more headline space.");
  await expect(page.getByText("Creating one replacement. Review it in Storyboard before approving Video.")).toBeVisible();
});

test("finished Video reveals the original brainstorm without adding navigation", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const videoSourceLinkCount = new Set(readyState.storyboard.panels.flatMap((panel: { claimIds: string[] }) => panel.claimIds)).size;
  const revealState = {
    ...readyState,
    videoState: "rendered",
    videos: [{ id: "video-v1", version: 1, storyboardVersion: readyState.storyboard.version, styleVersion: readyState.style.version, relativePath: "generated/videos/workshoplm-demo-v1.mp4", provenancePath: "generated/videos/workshoplm-demo-v1.provenance.json", artifactPath: "artifacts/video-v1", claimIds: readyState.storyboard.panels.flatMap((panel: { claimIds: string[] }) => panel.claimIds), buildTrace: { htmlPath: "generated/videos/workshoplm-demo-v1.build-trace.html", dataPath: "generated/videos/workshoplm-demo-v1.build-trace.json", htmlSha256: "a".repeat(64), dataSha256: "b".repeat(64), milestoneCount: 12, commitCount: 286, taskIds: [] }, stale: false, createdAt: "2026-07-15T06:31:42.000Z" }],
    transcriptSegments: [{ id: "fixture-brainstorm", origin: "realtime_fallback", transport: "fixture", text: "Okay, this is rough, but I want the judge to see a messy idea turn into the actual finished submission without losing where anything came from.", capturedAt: "2026-07-15T06:30:00.000Z" }],
    firstTranscriptAt: "2026-07-15T06:30:00.000Z",
    firstRenderedOutputAt: "2026-07-15T06:31:42.000Z",
  };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
    ? route.fulfill({ json: revealState })
    : route.continue());

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await openWorkshopView(page, "outputs");
    await page.getByRole("button", { name: "Open Video, version 1" }).click();
    await expect(page.getByRole("button", { name: "Show source", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Edit storyboard" })).toHaveClass(/oai-button--primary/);
    await expect(page.getByRole("button", { name: /^Show source for / })).toHaveCount(videoSourceLinkCount);
    await page.locator(".focused-output").evaluate((element) => { element.scrollTop = 0; });
    const reveal = page.getByRole("button", { name: "Show original" });
    await reveal.click();
    const sheet = page.getByRole("dialog", { name: "Original brainstorm" });
    await expect(sheet).toContainText("Before · Voice transcript");
    await expect(sheet).not.toContainText("fixture");
    await expect(sheet).toContainText("Became professional knowledge work");
    await expect(sheet).toContainText("102 seconds from first transcript to first created work");
    await expect(sheet.getByText("Presentation", { exact: true })).toBeVisible();
    await expect(sheet.getByText("Video", { exact: true })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "How this was built" })).toHaveAttribute("href", "/api/workshop/artifacts/build-trace-v1");
    await expectScreen(page, `${viewport.name}-original-reveal`);
    await closeDialog(page, "Original brainstorm");
    await expect(reveal).toBeFocused();
  }
});

test("finished Audio Overview keeps playback visible at desktop and mobile widths", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  const fixtureEnvironment = { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" };
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: fixtureEnvironment, stdio: "pipe" });
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-audio-player.ts", root], { cwd: process.cwd(), env: fixtureEnvironment, stdio: "pipe" });

  for (const viewport of [viewports[0], viewports[2]]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "outputs");
    await page.getByRole("button", { name: /^Open Audio Overview/ }).click();
    await expect(page.getByText("Audio ready", { exact: true })).toBeVisible();
    await expect(page.getByText("Cedar", { exact: true })).toBeVisible();
    await expect(page.getByText("AI-generated voice", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chapters" })).toBeVisible();
    await expect(page.getByLabel("Audio Overview script").locator("textarea")).toHaveCount(0);
    await page.getByRole("button", { name: "Edit script" }).click();
    await expect(page.getByLabel("Audio Overview script").locator("textarea")).toHaveCount(3);
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByLabel("Audio Overview script").locator("textarea")).toHaveCount(0);
    const player = page.locator(".audio-player audio[controls]");
    await expect(player).toBeVisible();
    await expect.poll(async () => (await player.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(40);
    const audio = await page.request.get(await player.getAttribute("src") ?? "");
    expect(audio.ok()).toBeTruthy();
    expect(audio.headers()["content-type"]).toContain("audio/wav");
    await expectScreen(page, `${viewport.name}-audio-overview`);
  }
});

test("Video history preserves prior versions without adding another navigation surface", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const video = { storyboardVersion: readyState.storyboard.version, styleVersion: readyState.style.version, provenancePath: "generated/videos/video.provenance.json", artifactPath: "artifacts/video", claimIds: readyState.storyboard.panels.flatMap((panel: { claimIds: string[] }) => panel.claimIds) };
  const historyState = { ...readyState, videoState: "rendered", videos: [
    { ...video, id: "video-v1", version: 1, relativePath: "generated/videos/workshoplm-demo-v1.mp4", stale: true, createdAt: "2026-07-15T06:31:42.000Z" },
    { ...video, id: "video-v2", version: 2, relativePath: "generated/videos/workshoplm-demo-v2.mp4", stale: false, createdAt: "2026-07-15T06:41:42.000Z" },
  ] };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET" ? route.fulfill({ json: historyState }) : route.continue());
  await page.route("**/api/workshop/artifacts/video-v*", async (route) => route.fulfill({ contentType: "video/mp4", body: "video" }));
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await expect(page.getByRole("button", { name: "Open Video, version 2" })).toContainText("Up to date");
  await expect(page.getByRole("button", { name: "Open Video, version 1" })).toHaveCount(0);
  await page.getByRole("button", { name: "Open Video, version 2" }).click();
  const history = page.getByRole("region", { name: "Version history" });
  await expect(history.getByRole("button", { name: "Open Video, version 1" })).toContainText("Needs update");
  await history.getByRole("button", { name: "Open Video, version 1" }).click();
  await expect(page.getByText("Video · Version 1")).toBeVisible();
  await expect(page.getByText("Needs update", { exact: true })).toBeVisible();
  await expect(page.locator(".focused-output-preview video")).toHaveAttribute("src", "/api/workshop/artifacts/video-v1");
});

test("core primitive computed styles and states match the official reference", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const button = page.locator(".workflow-action .oai-button");

  await expect(button).toHaveCSS("height", "36px");
  await expect(button).toHaveCSS("padding", "8px 16px");
  await expect(button).toHaveCSS("border-radius", "999px");
  await expect(button).toHaveCSS("font-size", "14px");
  await expect(button).toHaveCSS("line-height", "20px");

  await page.keyboard.press("Tab");
  await button.focus();
  await expect(button).toHaveCSS("outline-width", "2px");
  await expect(button).toHaveCSS("outline-color", "rgb(2, 133, 255)");

  const sourceSheet = await openSources(page);
  const checkbox = sourceSheet.getByRole("checkbox").first();
  await expect(checkbox).toHaveCSS("appearance", "none");
  await expect(checkbox).toHaveCSS("width", "18px");
  await expect(checkbox).toHaveCSS("height", "18px");
  await expect(checkbox).toHaveCSS("border-radius", "2.7px");
  await expect(checkbox).toHaveCSS("background-color", "rgb(13, 13, 13)");
});

test("every official control variant and interaction state matches the Figma contract", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "ui-state-proof";
    host.style.cssText = "position:fixed;z-index:999;top:60px;left:8px;display:flex;gap:8px;padding:8px;background:white";
    host.innerHTML = [
      '<button data-proof="primary" class="oai-button oai-button--primary oai-button--large">Primary</button>',
      '<button data-proof="secondary" class="oai-button oai-button--secondary oai-button--large">Secondary</button>',
      '<button data-proof="destructive" class="oai-button oai-button--destructive oai-button--large">Delete</button>',
      '<button data-proof="secondary-destructive" class="oai-button oai-button--secondary-destructive oai-button--large">Remove</button>',
      '<button data-proof="small" class="oai-button oai-button--primary oai-button--small">Small</button>',
      '<button data-proof="inactive" class="oai-button oai-button--primary oai-button--large" disabled>Inactive</button>',
      '<button data-proof="secondary-inactive" class="oai-button oai-button--secondary oai-button--large" disabled>Inactive secondary</button>',
      '<button data-proof="destructive-inactive" class="oai-button oai-button--destructive oai-button--large" disabled>Inactive destructive</button>',
      '<button data-proof="secondary-destructive-inactive" class="oai-button oai-button--secondary-destructive oai-button--large" disabled>Inactive remove</button>',
      '<a data-proof="button-link" class="oai-button oai-button--secondary oai-button--small" href="#proof">Open</a>',
      '<button data-proof="icon" class="oai-icon-button" aria-label="Proof icon"><svg class="oai-icon" viewBox="0 0 24 24"><path d="M4 12h16" /></svg><span class="oai-tooltip" role="tooltip">Proof icon</span></button>',
      '<button data-proof="icon-inactive" class="oai-icon-button" disabled aria-label="Inactive icon"></button>',
      '<button data-proof="token" class="oai-token">Source</button>',
      '<button data-proof="token-inactive" class="oai-token" disabled>Inactive source</button>',
      '<input data-proof="checkbox" class="oai-checkbox" type="checkbox">',
      '<input data-proof="indeterminate" class="oai-checkbox" type="checkbox" data-indeterminate aria-checked="mixed">',
      '<input data-proof="checkbox-inactive" class="oai-checkbox" type="checkbox" disabled>',
      '<input data-proof="input" class="oai-input is-error" aria-invalid="true">',
      '<input data-proof="input-inactive" class="oai-input" disabled>',
      '<textarea data-proof="textarea" class="oai-textarea is-error" aria-invalid="true"></textarea>',
      '<textarea data-proof="textarea-inactive" class="oai-textarea" disabled></textarea>',
      '<button data-proof="list-row-action" class="oai-list-row-action">Source row</button>',
    ].join("");
    document.body.append(host);
  });

  const primary = page.locator('[data-proof="primary"]');
  const secondary = page.locator('[data-proof="secondary"]');
  const destructive = page.locator('[data-proof="destructive"]');
  const secondaryDestructive = page.locator('[data-proof="secondary-destructive"]');
  const small = page.locator('[data-proof="small"]');
  const inactive = page.locator('[data-proof="inactive"]');
  const secondaryInactive = page.locator('[data-proof="secondary-inactive"]');
  const destructiveInactive = page.locator('[data-proof="destructive-inactive"]');
  const secondaryDestructiveInactive = page.locator('[data-proof="secondary-destructive-inactive"]');
  const buttonLink = page.locator('[data-proof="button-link"]');
  const icon = page.locator('[data-proof="icon"]');
  const iconInactive = page.locator('[data-proof="icon-inactive"]');
  const proofToken = page.locator('[data-proof="token"]');
  const tokenInactive = page.locator('[data-proof="token-inactive"]');
  const proofCheckbox = page.locator('[data-proof="checkbox"]');
  const indeterminate = page.locator('[data-proof="indeterminate"]');
  const checkboxInactive = page.locator('[data-proof="checkbox-inactive"]');
  const input = page.locator('[data-proof="input"]');
  const inputInactive = page.locator('[data-proof="input-inactive"]');
  const textarea = page.locator('[data-proof="textarea"]');
  const textareaInactive = page.locator('[data-proof="textarea-inactive"]');
  const listRowAction = page.locator('[data-proof="list-row-action"]');

  await expect(primary).toHaveCSS("background-color", "rgb(13, 13, 13)");
  await primary.hover();
  await expect(primary).toHaveCSS("background-color", "rgba(13, 13, 13, 0.8)");
  await page.mouse.down();
  await expect(primary).toHaveCSS("background-color", "rgba(13, 13, 13, 0.9)");
  await page.mouse.up();

  await expect(secondary).toHaveCSS("border-color", "rgba(13, 13, 13, 0.1)");
  await secondary.hover();
  await expect(secondary).toHaveCSS("background-color", "rgba(13, 13, 13, 0.02)");
  await page.mouse.down();
  await expect(secondary).toHaveCSS("background-color", "rgba(13, 13, 13, 0.05)");
  await expect(secondary).toHaveCSS("opacity", "0.8");
  await page.mouse.up();

  await expect(destructive).toHaveCSS("background-color", "rgb(224, 46, 42)");
  await destructive.hover();
  await expect(destructive).toHaveCSS("background-color", "rgb(250, 66, 62)");
  await page.mouse.down();
  await expect(destructive).toHaveCSS("background-color", "rgb(186, 38, 35)");
  await page.mouse.up();

  await expect(secondaryDestructive).toHaveCSS("border-color", "rgb(224, 46, 42)");
  await secondaryDestructive.hover();
  await expect(secondaryDestructive).toHaveCSS("border-color", "rgb(250, 66, 62)");
  await page.mouse.down();
  await expect(secondaryDestructive).toHaveCSS("border-color", "rgb(186, 38, 35)");
  await page.mouse.up();

  await expect(small).toHaveCSS("height", "30px");
  await expect(small).toHaveCSS("padding", "6px 16px");
  await expect(inactive).toHaveCSS("opacity", "0.4");
  await expect(secondaryInactive).toHaveCSS("opacity", "0.8");
  await expect(destructiveInactive).toHaveCSS("opacity", "0.4");
  await expect(secondaryDestructiveInactive).toHaveCSS("opacity", "0.4");
  await expect(buttonLink).toHaveCSS("height", "30px");
  await buttonLink.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(buttonLink).toHaveCSS("outline-color", "rgb(2, 133, 255)");

  await expect(icon).toHaveCSS("width", "36px");
  await expect(icon).toHaveCSS("height", "36px");
  await icon.hover();
  await expect(icon).toHaveCSS("background-color", "rgb(243, 243, 243)");
  await icon.focus();
  await expect(icon.locator(".oai-tooltip")).toHaveCSS("opacity", "1");
  await expect(iconInactive).toHaveCSS("opacity", "0.4");

  await expect(proofToken).toHaveCSS("height", "42px");
  await expect(proofToken).toHaveCSS("padding", "12px 16px");
  await expect(proofToken).toHaveCSS("border-radius", "25px");
  await proofToken.hover();
  await expect(proofToken).toHaveCSS("background-color", "rgba(13, 13, 13, 0.02)");
  await page.mouse.down();
  await expect(proofToken).toHaveCSS("background-color", "rgba(13, 13, 13, 0.05)");
  await page.mouse.up();
  await expect(tokenInactive).toHaveCSS("border-color", "rgba(13, 13, 13, 0.05)");

  await expect(proofCheckbox).toHaveCSS("border-radius", "2.7px");
  await expect(proofCheckbox).toHaveCSS("border-width", "1px");
  await proofCheckbox.hover();
  await expect(proofCheckbox).toHaveCSS("background-color", "rgba(13, 13, 13, 0.02)");
  await page.mouse.down();
  await expect(proofCheckbox).toHaveCSS("background-color", "rgba(13, 13, 13, 0.05)");
  await page.mouse.up();
  await expect(indeterminate).toHaveCSS("width", "18px");
  expect(await indeterminate.evaluate((element) => ({
    width: getComputedStyle(element, "::before").width,
    height: getComputedStyle(element, "::before").height,
    opacity: getComputedStyle(element, "::before").opacity,
  }))).toEqual({ width: "10px", height: "1.5px", opacity: "1" });
  await expect(checkboxInactive).toHaveCSS("opacity", "0.4");

  await expect(input).toHaveCSS("height", "38px");
  await expect(input).toHaveCSS("border-radius", "8px");
  await expect(input).toHaveCSS("border-color", "rgb(224, 46, 42)");
  await input.focus();
  await expect(input).toHaveCSS("outline-color", "rgb(2, 133, 255)");
  await expect(inputInactive).toHaveCSS("opacity", "0.4");
  await expect(textarea).toHaveCSS("min-height", "76px");
  await expect(textarea).toHaveCSS("border-radius", "8px");
  await expect(textarea).toHaveCSS("border-color", "rgb(224, 46, 42)");
  await textarea.focus();
  await expect(textarea).toHaveCSS("outline-color", "rgb(2, 133, 255)");
  await expect(textareaInactive).toHaveCSS("opacity", "0.4");
  await listRowAction.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(listRowAction).toHaveCSS("outline-color", "rgb(2, 133, 255)");

  await page.locator("#ui-state-proof").evaluate((element) => element.remove());
});

test("visible copy stays plain and stable", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: /^\d+ sources?$/ })).toBeVisible();
  const labels = new Set<string>();
  for (const next of ["Map", "Brief", "Created work", "Storyboard"]) {
    if (next === "Brief") await openWorkshopView(page, "brief");
    if (next === "Created work") await openWorkshopView(page, "outputs");
    if (next === "Storyboard") await openWorkshopView(page, "storyboard");
    for (const value of await page.getByRole("button").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
    for (const value of await page.getByRole("heading").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
  }
  const visibleCopy = `${[...labels].sort().join("\n")}\n`;
  expect(visibleCopy).not.toMatch(/\bDeck\b/);
  expect(visibleCopy).toMatchSnapshot("visible-labels.txt");
});

test("voice Sources keep provider transport language out of the professional surface", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const voiceSource = { ...readyState.sourceItems[0], title: "Voice capture-only fallback transcript 2026-07-16T05:48:00Z", origin: "gpt-realtime-2.1 capture-only fallback", locator: "gpt-realtime-2.1 capture-only fallback · normalized:21960f8a7bf7", permission: "private" as const };
  const normalizedDocument = { ...readyState.sourceItems[1], locator: "Local · normalized:729dbff1a620" };
  const state = { ...readyState, sourceItems: [voiceSource, normalizedDocument, ...readyState.sourceItems.slice(2)] };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET" ? route.fulfill({ json: state }) : route.continue());
  await page.goto("/");
  await page.getByRole("button", { name: "3 sources" }).click();
  const sources = page.getByRole("dialog", { name: "Sources" });
  await expect(sources.getByText("Voice brainstorm", { exact: true }).first()).toBeVisible();
  await expect(sources).toContainText("Private · Voice · 5 claims");
  await expect(sources).toContainText("Private · Voice brainstorm · Source material");
  await expect(sources).not.toContainText("gpt-realtime-2.1");
  await expect(sources).not.toContainText("capture-only fallback");
  await expect(sources).not.toContainText("normalized:");
  await sources.getByRole("button", { name: new RegExp(normalizedDocument.title) }).click();
  await expect(sources).toContainText(`${normalizedDocument.title} · Source material`);
  await expect(sources).not.toContainText("normalized:");
  await sources.getByRole("button", { name: /Voice brainstorm/ }).click();
  await sources.getByRole("button", { name: "Show on map" }).click();
  await page.locator(".claim-inspector").getByRole("button", { name: "Show source" }).click();
  const evidence = page.getByRole("dialog", { name: "Source" });
  await expect(evidence).toContainText("Voice brainstorm · chunk 04");
  await expect(evidence).toContainText("OriginVoice");
  await expect(evidence).toContainText("AccessPrivate");
  await expect(evidence).not.toContainText("gpt-realtime-2.1");
  await expect(evidence).not.toContainText("capture-only fallback");
});

test("queued local video work refreshes into the finished next action", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const approvedState = { ...readyState, storyboardApproved: true, videoState: "blocked" };
  const queuedState = { ...approvedState, videoState: "queued" };
  const renderedState = { ...approvedState, videoState: "rendered", videos: [{ id: "video-v1", version: 1, storyboardVersion: readyState.storyboard.version, styleVersion: readyState.style.version, relativePath: "generated/videos/workshoplm-demo-v1.mp4", provenancePath: "generated/videos/workshoplm-demo-v1.provenance.json", artifactPath: "artifacts/video-v1", claimIds: [], stale: false, createdAt: "2026-07-15T06:31:42.000Z" }] };
  let queued = false;
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: queued ? renderedState : approvedState });
    queued = true;
    return route.fulfill({ json: queuedState });
  });

  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await openWorkshopView(page, "storyboard");
  await page.getByRole("button", { name: "Create video" }).click();
  await expect(page.getByRole("button", { name: "View video" })).toBeVisible({ timeout: 3500 });
});

test("reduced motion, contrast, and 200 percent logical zoom remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 400 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(600);
  await expect(page.getByRole("region", { name: "Map", exact: true })).toBeVisible();
  await expect(page.locator(".spine-stage[aria-current='step']")).toBeVisible();
  await expect(page.getByRole("button", { name: /^\d+ sources?$/ })).toBeVisible();
  await expect(page.locator(".oai-button").first()).toHaveCSS("transition-duration", "0s");

  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f\d]{2}/gi)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
    const corrected = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return corrected[0] * 0.2126 + corrected[1] * 0.7152 + corrected[2] * 0.0722;
  };
  const contrast = (foreground: string, background: string) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  expect(contrast("0D0D0D", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
  expect(contrast("5D5D5D", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
  expect(contrast("008635", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
});

test("the local render becomes a real Video preview and the next action", async ({ page }) => {
  // HyperFrames renders the real 25-second fixture before the browser review.
  // Keep media decoding tightly bounded, but budget separately for local render time.
  test.setTimeout(240_000);
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  const repository = resolve(process.cwd(), "../..");
  const fixtureEnvironment = { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" };
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: fixtureEnvironment, stdio: "pipe" });
  execFileSync("pnpm", ["exec", "tsx", "apps/web/tests/visual/seed-video.ts", root], { cwd: repository, env: fixtureEnvironment, stdio: "pipe" });
  const renderedState = await (await page.request.get("/api/workshop")).json();
  const renderedSourceLinkCount = new Set(renderedState.storyboard.panels.flatMap((panel: { claimIds: string[] }) => panel.claimIds)).size;

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await openWorkshopView(page, "brief");
    await openWorkshopView(page, "outputs");
    const videoCard = page.getByRole("button", { name: "Open Video, version 1" });
    await expect(videoCard).toBeVisible();
    const previewVideo = videoCard.locator("video");
    await expect(previewVideo).toHaveAttribute("src", "/api/workshop/artifacts/video-v1");
    await expect(previewVideo).toHaveAttribute("poster", `/api/workshop/artifacts/storyboard-v${renderedState.storyboard.version}-panel-1-image`);
    await seekVideoFrame(previewVideo);
    await expectScreen(page, `${viewport.name}-video-output`);

    await openWorkshopView(page, "storyboard");
    const viewVideo = page.getByRole("button", { name: "View video" });
    await expect(viewVideo).toBeVisible();
    await expect(page.getByRole("button", { name: "Create video" })).toHaveCount(0);
    await viewVideo.click();
    const player = page.locator(".focused-output-preview video[controls]");
    await expect(player).toBeVisible();
    await expect(player).toHaveAttribute("poster", `/api/workshop/artifacts/storyboard-v${renderedState.storyboard.version}-panel-1-image`);
    await expect(page.getByRole("button", { name: "Show source", exact: true })).toHaveCount(0);
    const editStoryboard = page.getByRole("button", { name: "Edit storyboard" });
    await expect(editStoryboard).toHaveClass(/oai-button--primary/);
    await editStoryboard.click();
    await expect(page.getByRole("textbox", { name: "Panel title" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Approve storyboard" })).toHaveCount(0);
    await page.getByRole("button", { name: "View video" }).click();
    await expect(player).toBeVisible();
    await expect(page.getByRole("region", { name: "Sources in this work" })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Show source for / })).toHaveCount(renderedSourceLinkCount);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await seekVideoFrame(player);
    await page.locator(".focused-output").evaluate((node) => { node.scrollTop = 0; });
    await expect.poll(() => page.locator(".focused-output").evaluate((node) => node.scrollTop)).toBe(0);
    const scrollBeforeOriginal = await page.locator(".focused-output").evaluate((node) => node.scrollTop);
    await page.getByRole("button", { name: "Show original" }).click();
    const buildTrace = page.getByRole("link", { name: "How this was built" });
    await expect(buildTrace).toHaveAttribute("href", "/api/workshop/artifacts/build-trace-v1");
    const traceResponse = await page.request.get("/api/workshop/artifacts/build-trace-v1");
    expect(traceResponse.ok()).toBeTruthy();
    expect(await traceResponse.text()).toContain("One thought became the Build Week submission.");
    await closeDialog(page, "Original brainstorm");
    await expect(page.locator(".workshop-identity")).toContainText("WorkshopLM Build Week/Video");
    await expect.poll(async () => Math.abs(await page.locator(".focused-output").evaluate((node) => node.scrollTop) - scrollBeforeOriginal) <= 32).toBe(true);
    await expect(page.locator(".focused-output-heading h1")).toBeInViewport();
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.locator(".focused-output").evaluate((node) => { node.scrollTop = 0; });
    await page.evaluate(() => { if (document.scrollingElement) document.scrollingElement.scrollTop = 0; });
    await page.waitForTimeout(100);
    await expect.poll(() => page.locator(".focused-output").evaluate((node) => node.scrollTop)).toBe(0);
    await expectScreen(page, `${viewport.name}-video-viewer`);
  }

  await page.getByRole("button", { name: "Edit storyboard" }).click();
  const narration = page.getByRole("textbox", { name: "Narration" });
  const seconds = page.getByRole("spinbutton", { name: "Seconds" });
  await narration.fill(`${await narration.inputValue()} Tighten the close.`);
  await seconds.fill("0");
  await expect(page.getByText("Use a whole number from 1 to 120.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await seconds.fill("7");
  await expect(page.getByText("Saving will require Storyboard approval and a new Video.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("button", { name: "Approve storyboard" })).toBeVisible();
  await expect(page.locator(".storyboard-strip .film-frame.selected")).toContainText("7s");
  await openWorkshopView(page, "outputs");
  await expect(page.getByRole("button", { name: /Open Video/ })).toContainText("Needs update");
});

test("a new professional reaches the real Map through the durable first-use path", async ({ page }) => {
  const seededStyle = await page.request.post("/api/workshop", { data: { action: "lockManualStyle", manualStyle: { name: "WorkshopLM editorial", accent: "#0285FF", ink: "#0D0D0D", paper: "#FFFFFF", intentProfile: "client_facing_pitch" } } });
  expect(seededStyle.ok()).toBeTruthy();
  const created = await page.request.post("/api/workshop", { data: { action: "createWorkshop", title: "Onboarding acceptance" } });
  expect(created.ok()).toBeTruthy();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Start with what you know." })).toBeVisible();
  await expect(page.getByText("WorkshopLM will organize it into a grounded Map.")).toBeVisible();
  await expectScreen(page, "desktop-onboarding-welcome");
  await page.getByLabel("Workshop name (optional)").fill("Acme leadership update");
  await expect(page.getByRole("button", { name: "Build my Map" })).toBeDisabled();
  await expectScreen(page, "desktop-onboarding-sources");
  await page.getByLabel("Notes or website").fill("Professional teams lose hours turning meeting notes into client-ready work. WorkshopLM organizes messy thinking into a grounded Map, then creates an editable Presentation with every factual claim linked to its exact source.\n\nThe recommended workflow is Capture, Map, Brief, Create. The professional reviews the Brief before output creation and reviews the Storyboard before video rendering.\n\nCompany Style keeps colors, typography, and layout rules consistent across Presentations, diagrams, images, audio, and video. The goal is professional knowledge work a consultant can refine and present without rebuilding it in another tool.");
  await expect(page.getByRole("button", { name: "Build my Map" })).toBeEnabled();
  await expectScreen(page, "desktop-onboarding-source-ready");
  await page.getByRole("button", { name: "Build my Map" }).click();

  await expect(page.getByRole("region", { name: "Map overview" })).toContainText("key evidence");
  await expect(page.getByRole("region", { name: "Map overview" })).toContainText("Recommended direction");
  await expect(page.getByRole("button", { name: /Recommended direction: Create work a consultant can refine and present without/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Approve brief" })).toBeVisible();
  await expect(page.locator(".map-source-shelf")).toContainText("1 selected");
  await expectMapReady(page, viewports[0]);
  await expectScreen(page, "desktop-onboarding-map");
  await page.reload();
  await expect(page.getByRole("button", { name: "Approve brief" })).toBeVisible();
  await page.getByRole("button", { name: "Approve brief" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "WorkshopLM organizes messy thinking into a grounded Map" })).toBeVisible();
  await expect(page.getByText("The goal is professional knowledge work a consultant can refine and present without rebuilding it in another tool", { exact: true })).toBeVisible();
  await expect(page.locator(".brief-evidence-item")).toHaveCount(3);
  const problemEvidence = page.locator(".brief-evidence-item").filter({ hasText: "Professional teams lose hours turning meeting notes into client-ready work" });
  await problemEvidence.getByRole("button", { name: "Pasted notes · chunk 01" }).click();
  await expect(page.getByRole("dialog", { name: "Source" })).toContainText("Professional teams lose hours turning meeting notes into client-ready work");
  await closeDialog(page, "Source");
  await page.getByRole("button", { name: "Choose style" }).click();
  await expect(page.getByRole("dialog", { name: "Style" })).toContainText("For Client pitch");
  await expectScreen(page, "desktop-onboarding-style");
  await page.getByRole("button", { name: /Use saved style WorkshopLM editorial/ }).click();
  await expect(page.getByRole("button", { name: "Create work" })).toBeVisible();

  const state = await (await page.request.get("/api/workshop")).json();
  expect(state).toMatchObject({ title: "Acme leadership update", onboarding: { step: "complete", outcome: "client_facing_pitch" }, style: { name: "WorkshopLM editorial", intentProfile: "client_facing_pitch" }, sourceItems: [expect.objectContaining({ title: expect.stringMatching(/^Professional teams lose hours turning meeting notes into client/) })], sources: 1, groundedClaims: 6, mapNodes: expect.arrayContaining([expect.objectContaining({ id: expect.stringMatching(/^claim-/), sourceId: expect.stringMatching(/^source-/) })]) });
});

test("first-use Capture keeps the one-action Map handoff visible at compact and mobile widths", async ({ page }) => {
  for (const viewport of [viewports[1], viewports[2]]) {
    const created = await page.request.post("/api/workshop", { data: { action: "createWorkshop", title: `${viewport.name} capture review` } });
    expect(created.ok()).toBeTruthy();
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.getByLabel("Notes or website").fill("Professionals need one clear path from meeting notes to grounded work.\n\nEvery claim should stay attached to its exact source.\n\nThe Map should recommend what to do next.");
    await expect(page.getByRole("button", { name: "Record voice" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Choose PDF" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add source" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build my Map" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Build my Map" })).toBeEnabled();
    await expectScreen(page, `${viewport.name}-onboarding-source-ready`);
  }
});

test("fresh Outputs keep the primary source trace clear and reveal the exact claim", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  const selected = await page.request.post("/api/workshop", { data: { action: "selectWorkshop", workshopId: "workshop-build-week" } });
  expect(selected.ok()).toBeTruthy();
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), env: { ...process.env, WORKSHOPLM_SEEDED_FIXTURE: "1" }, stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const partialState = { ...readyState, outputs: readyState.outputs.slice(0, 1), imageBatch: undefined, assetPlan: undefined, storyboard: { ...readyState.storyboard, panels: [] } };
  await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
    ? route.fulfill({ json: partialState })
    : route.fulfill({ json: readyState }));
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await openWorkshopView(page, "brief");
  await openWorkshopView(page, "outputs");
  await page.getByRole("button", { name: "Update work" }).click();
  await expect(page.getByRole("status")).toContainText("Created work is ready");
  const presentation = page.getByRole("button", { name: /^Open Presentation/ });
  await expect(presentation).toHaveCount(1);
  await presentation.click();

  const notice = page.getByRole("status");
  const download = page.getByRole("link", { name: "Download PowerPoint" });
  const [noticeBox, downloadBox] = await Promise.all([notice.boundingBox(), download.boundingBox()]);
  expect(noticeBox).not.toBeNull();
  expect(downloadBox).not.toBeNull();
  expect(noticeBox!.y + noticeBox!.height <= downloadBox!.y || downloadBox!.y + downloadBox!.height <= noticeBox!.y).toBeTruthy();
  await expect(notice).toBeHidden({ timeout: 6_000 });

  const deck = readyState.outputs.filter((output: { type: string }) => output.type === "deck").at(-1);
  const claim = readyState.claims.find((item: { id: string }) => item.id === deck.claimIds[0]);
  await page.getByRole("button", { name: new RegExp(`^Show source for ${claim.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) }).click();
  const source = page.getByRole("dialog", { name: "Source" });
  await expect(source).toContainText(claim.text);
  const claimSource = readyState.sourceItems.find((item: { id: string }) => item.id === claim.sourceId);
  if (claimSource?.origin === "ChatGPT task") {
    await expect(source).toContainText(`Voice brainstorm · ${claim.locator.split(" · ").at(-1)}`);
    await expect(source).not.toContainText("ChatGPT task");
  } else {
    await expect(source).toContainText(claim.locator);
  }
});
