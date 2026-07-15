import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const viewports = [
  { name: "desktop", width: 1200, height: 800 },
  { name: "compact", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function expectScreen(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.001 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
}

async function closeDialog(page: Page, name: string) {
  await page.getByRole("button", { name: `Close ${name}` }).click();
  await expect(page.getByRole("dialog", { name })).toBeHidden();
}

async function expectPrimaryActions(page: Page, count: 0 | 1) {
  await expect(page.locator('.oai-button--primary:not(:disabled):visible')).toHaveCount(count);
}

async function expectMapReady(page: Page, viewport: typeof viewports[number]) {
  if (viewport.name === "mobile") return;
  await expect(page.locator(".excalidraw-map .excalidraw")).toBeVisible();
  await expect(page.locator(".excalidraw-map canvas").first()).toBeVisible();
  await page.waitForTimeout(250);
}

async function selectProductPromise(page: Page, viewport: typeof viewports[number]) {
  if (viewport.name === "mobile") {
    await page.getByRole("button", { name: /The product promise/ }).click();
    return;
  }
  const map = await page.locator(".excalidraw-map").boundingBox();
  if (!map) throw new Error("Editable Map did not expose a canvas boundary");
  await page.mouse.click(map.x + 407, map.y + 136);
}

async function pressTabUntil(page: Page, label: string, limit = 30) {
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

test("reset fixture is calm and responsive", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Approve brief" }).first()).toBeVisible();
    await expectMapReady(page, viewport);
    await expectScreen(page, `${viewport.name}-reset-map`);
    await page.getByRole("button", { name: /sources$/ }).click();
    await expectScreen(page, `${viewport.name}-reset-sources`);
    await page.getByRole("button", { name: "Add source" }).click();
    await expect(page.getByRole("dialog", { name: "Add source" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Record voice" })).toBeVisible();
    await expectScreen(page, `${viewport.name}-add-source`);
    await closeDialog(page, "Add source");
    await closeDialog(page, "Sources");
  }

  await expect(page.getByRole("button", { name: /sources$/ })).toBeFocused();
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await expectMapReady(page, viewports[0]);
  const map = await page.locator(".excalidraw-map").boundingBox();
  if (!map) throw new Error("Editable Map did not expose a canvas boundary");
  await page.mouse.dblclick(map.x + 407, map.y + 136);
  const mapTextEditor = page.locator('[data-type="wysiwyg"]');
  await expect(mapTextEditor).toBeVisible();
  await mapTextEditor.fill("The product promise revised");
  await page.keyboard.press("Escape");
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.title).toBe("The product promise revised");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.title).toBe("The product promise");
  await page.waitForTimeout(500);
  await page.mouse.move(map.x + 407, map.y + 136);
  await page.mouse.down();
  await page.mouse.move(map.x + 457, map.y + 166, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.x).toBeGreaterThan(11);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(async () => (await (await page.request.get("/api/workshop")).json()).mapNodes.find((node: { id: string }) => node.id === "promise")?.x).toBe(11);

  await page.getByRole("button", { name: /sources$/ }).focus();
  await pressTabUntil(page, "Approve brief");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Turn raw thinking into finished work");
  await pressTabUntil(page, "Choose style");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Style" })).toBeVisible();
  await pressTabUntil(page, "Use this style");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Style" })).toBeHidden();
  await expect(page.getByRole("button", { name: "View outputs" })).toBeVisible();

});

test("voice capture is bounded inside Add source and fails closed without live opt-in", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: /sources$/ }).click();
  await page.getByRole("button", { name: "Add source" }).click();
  await page.getByRole("button", { name: "Record voice" }).click();
  await expect(page.locator(".capture-error")).toContainText("Live OpenAI capture is disabled");
  await expect(page.getByRole("dialog", { name: "Add source" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Title" })).toBeVisible();
});

test("Style can start from a website and apply a professional intent", async ({ page }) => {
  await page.request.post("/api/workshop", { data: { action: "approveBrief" } });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const stylelessState = { ...readyState, style: undefined };
  const posted: Record<string, unknown>[] = [];
  const suggestion = { referenceUrl: "https://example.com/brand", name: "Example Studio foundation", accent: "#2457D6", ink: "#102030", paper: "#FAF8F4", logos: ["https://example.com/logo.svg"], fontCandidates: ["Studio Sans"], references: ["https://example.com/brand"], negativeRules: [], findings: { colors: 3, fontCandidates: 1, assets: 1, stylesheets: 1 } };
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: stylelessState });
    const body = route.request().postDataJSON() as Record<string, unknown>;
    posted.push(body);
    if (body.action === "analyzeWebsiteStyle") return route.fulfill({ json: suggestion });
    return route.fulfill({ json: readyState });
  });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.getByRole("button", { name: "View brief" }).click();
    await page.getByRole("button", { name: "Choose style" }).click();
    const sheet = page.getByRole("dialog", { name: "Style" });
    await sheet.getByRole("button", { name: /Website/ }).click();
    await sheet.getByRole("textbox", { name: "Website" }).fill("https://example.com/brand");
    await sheet.getByRole("button", { name: /Board presentation/ }).click();
    await expect(sheet.getByRole("button", { name: /Website/ })).toHaveAttribute("aria-pressed", "true");
    await expect(sheet.getByRole("button", { name: /Board presentation/ })).toHaveAttribute("aria-pressed", "true");
    await sheet.getByRole("button", { name: "Review style" }).click();
    await expect(sheet.getByRole("status")).toContainText("Found 3 colors, 1 font candidate, and 1 brand asset");
    await expect(sheet.getByRole("textbox", { name: "Name" })).toHaveValue("Example Studio foundation");
    await sheet.getByRole("textbox", { name: "Accent" }).fill("#335577");
    await expectScreen(page, `${viewport.name}-website-style`);
    await sheet.getByRole("button", { name: "Use this style" }).click();
    await expect.poll(() => posted.at(-1)).toEqual({ action: "lockWebsiteStyle", url: "https://example.com/brand", intentProfile: "board_deck", manualStyle: { name: "Example Studio foundation", accent: "#335577", ink: "#102030", paper: "#FAF8F4", logos: ["https://example.com/logo.svg"], licensedFonts: ["Studio Sans"], references: ["https://example.com/brand"], negativeRules: [], intentProfile: "board_deck" } });
  }
});

test.describe("completed Workshop judge path", () => {
  test.beforeAll(() => {
    const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
    execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), stdio: "pipe" });
  });

  for (const viewport of viewports) {
    test(`${viewport.name} visual path`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Map" })).toBeVisible();
      await expectMapReady(page, viewport);
      await expectPrimaryActions(page, 1);
      await expectScreen(page, `${viewport.name}-map`);

      const sourceTrigger = page.getByRole("button", { name: /sources$/ });
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

      await page.getByRole("button", { name: "View brief" }).click();
      await expectPrimaryActions(page, 1);
      await expect(page.getByText("# FRAME.md", { exact: false })).toHaveCount(0);
      await expectScreen(page, `${viewport.name}-brief`);
      await page.getByRole("button", { name: "Edit" }).click();
      await expect(page.getByRole("dialog", { name: "Style" })).toBeVisible();
      await expectScreen(page, `${viewport.name}-style`);
      await closeDialog(page, "Style");

      await page.getByRole("button", { name: "View outputs" }).click();
      await expectPrimaryActions(page, 1);
      await expect(page.getByRole("heading", { name: "Build Week presentation" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Evidence infographic" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Image set" })).toHaveCount(1);
      await expect(page.getByRole("heading", { name: "Storyboard" })).toHaveCount(1);
      await expect(page.getByRole("button", { name: "Show source" })).toHaveCount(0);
      await expectScreen(page, `${viewport.name}-outputs`);

      await page.getByRole("button", { name: "Open Build Week presentation" }).click();
      await expect(page.getByRole("heading", { name: "Build Week presentation" })).toBeVisible();
      await expect(page.getByText("Presentation · Version 1 · 2 sources", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "2 sources" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Show source" })).toHaveClass(/oai-button--primary/);
      await expect(page.getByRole("link", { name: "Open file" })).toBeVisible();
      await expectScreen(page, `${viewport.name}-output-viewer`);
      await page.getByRole("button", { name: "Back to Outputs" }).click();

      await page.getByRole("button", { name: "View storyboard" }).click();
      await expectPrimaryActions(page, 1);
      await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
      await expectScreen(page, `${viewport.name}-storyboard`);
      const titleField = page.getByRole("textbox", { name: "Panel title" });
      const originalTitle = await titleField.inputValue();
      await titleField.fill(`${originalTitle} revised`);
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
      await titleField.fill(originalTitle);
      await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
      if (viewport.name === "mobile") {
        await pressTabUntil(page, "Approve storyboard");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("button", { name: "Create video" })).toBeVisible();
      }
    });
  }
});

test("empty, loading, partial, error, and needs-update states stay calm and actionable", async ({ page }) => {
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

    const emptyState = { ...readyState, briefApproved: false, storyboardApproved: false, frame: undefined, style: undefined, assetPlan: undefined, sourceItems: [], activeSourceIds: [], claims: [], mapNodes: [], outputs: [], imageBatch: undefined, storyboard: { ...readyState.storyboard, panels: [] } };
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
    await page.getByRole("button", { name: "View brief" }).click();
    await page.getByRole("button", { name: "View outputs" }).click();
    await expect(page.getByRole("heading", { name: "Some Outputs are ready" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update outputs" })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-partial`);
    await page.getByRole("button", { name: "Update outputs" }).click();
    await expect(page.getByRole("status")).toContainText("Outputs created");
    expect(postedActions).toContain("createImageBatch");
    await page.unroute("**/api/workshop");

    const needsUpdateState = { ...readyState, outputs: readyState.outputs.map((output: Record<string, unknown>) => ({ ...output, stale: true })), assetPlan: { ...readyState.assetPlan, stale: true }, imageBatch: { ...readyState.imageBatch, stale: true }, storyboard: { ...readyState.storyboard, stale: true } };
    await page.route("**/api/workshop", async (route) => route.request().method() === "GET"
      ? route.fulfill({ json: needsUpdateState })
      : route.fulfill({ json: readyState }));
    await page.goto("/");
    await page.getByRole("button", { name: "View brief" }).click();
    await page.getByRole("button", { name: "View outputs" }).click();
    await expect(page.getByRole("heading", { name: "Outputs need an update" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update outputs" })).toBeVisible();
    await expectPrimaryActions(page, 1);
    await expectScreen(page, `${viewport.name}-state-needs-update`);
    await page.unroute("**/api/workshop");
  }
});

test("Outputs preserve recognizable version history and source coverage", async ({ page }) => {
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
  await page.getByRole("button", { name: "View brief" }).click();
  await page.getByRole("button", { name: "View outputs" }).click();

  await expect(page.getByRole("button", { name: "Open Build Week presentation, version 2" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Build Week presentation, version 1" })).toBeVisible();
  await expect(page.getByText("Presentation · Version 2")).toBeVisible();
  await expect(page.getByText("Presentation · Version 1")).toBeVisible();
  await expect(page.getByText("Up to date", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Needs update", { exact: true }).first()).toBeVisible();
  await expect(page.locator(".output-card").first()).toContainText(/\d+ sources?/);
  await expect(page.locator('.output-card iframe[title$="preview"]')).toHaveCount(3);
});

test("finished Video reveals the original brainstorm without adding navigation", async ({ page }) => {
  const readyState = await (await page.request.get("/api/workshop")).json();
  const revealState = {
    ...readyState,
    videoState: "rendered",
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
    await page.getByRole("button", { name: "View brief" }).click();
    await page.getByRole("button", { name: "View outputs" }).click();
    await page.getByRole("button", { name: "Open Demo video" }).click();
    await expect(page.getByRole("button", { name: "Show source" })).toHaveCount(0);
    const reveal = page.getByRole("button", { name: "Show original" });
    await reveal.click();
    const sheet = page.getByRole("dialog", { name: "Original brainstorm" });
    await expect(sheet).toContainText("Before · Recorded fixture transcript");
    await expect(sheet).toContainText("Became five connected Outputs");
    await expect(sheet).toContainText("102 seconds from first transcript to first rendered Output");
    await expect(sheet.getByText("Presentation", { exact: true })).toBeVisible();
    await expect(sheet.getByText("Demo video", { exact: true })).toBeVisible();
    await expectScreen(page, `${viewport.name}-original-reveal`);
    await closeDialog(page, "Original brainstorm");
    await expect(reveal).toBeFocused();
  }
});

test("core primitive computed styles and states match the official reference", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "View brief" });

  await expect(button).toHaveCSS("height", "36px");
  await expect(button).toHaveCSS("padding", "8px 16px");
  await expect(button).toHaveCSS("border-radius", "999px");
  await expect(button).toHaveCSS("font-size", "14px");
  await expect(button).toHaveCSS("line-height", "20px");

  await button.focus();
  await expect(button).toHaveCSS("outline-width", "2px");
  await expect(button).toHaveCSS("outline-color", "rgb(2, 133, 255)");

  await page.getByRole("button", { name: "3 sources" }).click();
  const checkbox = page.getByRole("checkbox").first();
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
  await page.goto("/");
  const labels = new Set<string>();
  for (const next of ["Map", "Brief", "Outputs", "Storyboard"]) {
    if (next === "Brief") await page.getByRole("button", { name: "View brief" }).click();
    if (next === "Outputs") await page.getByRole("button", { name: "View outputs" }).click();
    if (next === "Storyboard") await page.getByRole("button", { name: "View storyboard" }).click();
    for (const value of await page.getByRole("button").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
    for (const value of await page.getByRole("heading").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
  }
  expect([...labels].sort().join("\n")).toMatchSnapshot("visible-labels.txt");
});

test("queued local video work refreshes into the finished next action", async ({ page }) => {
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), stdio: "pipe" });
  const readyState = await (await page.request.get("/api/workshop")).json();
  const approvedState = { ...readyState, storyboardApproved: true, videoState: "blocked" };
  const queuedState = { ...approvedState, videoState: "queued" };
  const renderedState = { ...approvedState, videoState: "rendered" };
  let queued = false;
  await page.route("**/api/workshop", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: queued ? renderedState : approvedState });
    queued = true;
    return route.fulfill({ json: queuedState });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "View brief" }).click();
  await page.getByRole("button", { name: "View outputs" }).click();
  await page.getByRole("button", { name: "View storyboard" }).click();
  await page.getByRole("button", { name: "Create video" }).click();
  await expect(page.getByRole("button", { name: "Creating…" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "View video" })).toBeVisible({ timeout: 3500 });
});

test("reduced motion, contrast, and 200 percent logical zoom remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 400 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(600);
  await expect(page.getByText("Map", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /sources$/ })).toBeVisible();
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
  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  const repository = resolve(process.cwd(), "../..");
  execFileSync("pnpm", ["exec", "tsx", "apps/web/tests/visual/seed-video.ts", root], { cwd: repository, stdio: "pipe" });

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await page.getByRole("button", { name: "View brief" }).click();
    await page.getByRole("button", { name: "View outputs" }).click();
    const videoCard = page.getByRole("button", { name: "Open Demo video" });
    await expect(videoCard).toBeVisible();
    const previewVideo = videoCard.locator("video");
    await expect(previewVideo).toHaveAttribute("src", "/api/workshop/artifacts/video");
    await expect.poll(() => previewVideo.evaluate((node) => (node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(1);
    await previewVideo.evaluate(async (node) => {
      const video = node as HTMLVideoElement;
      const seeked = new Promise<void>((resolveSeek) => video.addEventListener("seeked", () => resolveSeek(), { once: true }));
      video.currentTime = 0.1;
      await seeked;
    });
    await expectScreen(page, `${viewport.name}-video-output`);

    await page.getByRole("button", { name: "View storyboard" }).click();
    const viewVideo = page.getByRole("button", { name: "View video" });
    await expect(viewVideo).toBeVisible();
    await expect(page.getByRole("button", { name: "Create video" })).toHaveCount(0);
    await viewVideo.click();
    const player = page.locator(".focused-output-preview video[controls]");
    await expect(player).toBeVisible();
    await expect.poll(() => player.evaluate((node) => (node as HTMLVideoElement).readyState)).toBeGreaterThanOrEqual(1);
    await player.evaluate(async (node) => {
      const video = node as HTMLVideoElement;
      const seeked = new Promise<void>((resolveSeek) => video.addEventListener("seeked", () => resolveSeek(), { once: true }));
      video.currentTime = 0.1;
      await seeked;
    });
    await expectScreen(page, `${viewport.name}-video-viewer`);
  }
});
