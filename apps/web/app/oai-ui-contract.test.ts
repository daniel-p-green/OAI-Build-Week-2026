import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DOMAIN_UI_EXCEPTIONS, OAI_UI_COMPONENTS, OAI_UI_COMPOSITES, OAI_UI_SOURCE } from "@workshoplm/ui";

const root = resolve(process.cwd(), "../..");
const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const appCss = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const ui = readFileSync(resolve(root, "packages/ui/src/index.tsx"), "utf8");
const uiCss = readFileSync(resolve(root, "packages/ui/src/styles.css"), "utf8");
const inventory = readFileSync(resolve(root, OAI_UI_SOURCE.inventory), "utf8");
const design = readFileSync(resolve(root, "DESIGN.md"), "utf8");
const workshopRoute = readFileSync(resolve(process.cwd(), "app/api/workshop/route.ts"), "utf8");

describe("official Apps in ChatGPT UI implementation", () => {
  it("pins every reusable shell family to the inspected Figma inventory", () => {
    for (const id of Object.values(OAI_UI_COMPONENTS)) expect(inventory).toContain(`\`${id}\``);
    for (const component of ["FullScreenShell", "NavigationHeader", "Workbench", "WorkbenchRail", "ObjectSwitcher", "ConversationSurface", "Button", "ButtonLink", "IconButton", "Token", "Checkbox", "Input", "TextArea", "Card", "ListGroup", "ListRow", "ListRowAction", "EntityCard", "EntityCardAction", "Carousel", "CarouselRow", "SideSheet", "StateMessage"]) {
      expect(ui).toContain(`function ${component}`);
    }
    for (const ids of Object.values(OAI_UI_COMPOSITES)) for (const id of ids) expect(inventory).toContain(`\`${id}\``);
  });

  it("uses official primitives for ordinary controls and marks raw domain interactions", () => {
    const rawControls = [...page.matchAll(/<(button|input|textarea)\b[^>]*>/g)].map((match) => match[0]);
    expect(rawControls.length).toBeGreaterThan(0);
    for (const control of rawControls) expect(control).toContain("data-domain-ui=");
    expect(page).not.toMatch(/[>\s][‹×][<\s]/);
  });

  it("limits custom rendered surfaces to the reviewed exception manifest", () => {
    const used = [...page.matchAll(/data-domain-ui="([^"]+)"/g)].map((match) => match[1]);
    for (const name of used) expect(DOMAIN_UI_EXCEPTIONS).toContain(name as typeof DOMAIN_UI_EXCEPTIONS[number]);
  });

  it("removes retired shell tokens from the complete application cascade", () => {
    const cascade = `${uiCss}\n${appCss}`.toLowerCase();
    for (const retired of ["#10a37f", "#7356b8", "#9a650f", "#f7f7f8", "#ececf1"]) expect(cascade).not.toContain(retired);
    expect(uiCss).toContain("height: 42px");
    expect(uiCss).toContain("height: 36px");
    expect(uiCss).toContain("height: 30px");
    expect(uiCss).toContain("height: 38px");
    expect(uiCss).toContain("min-height: 76px");
    expect(uiCss).toContain("border-radius: 2.7px");
    expect(uiCss).toContain("border-radius: 24px");
    expect(uiCss).not.toContain("filter: brightness");
    expect(uiCss).not.toContain("scale(0.98)");
  });

  it("keeps internal product language out of visible copy", () => {
    for (const retired of ["Grounding this Workshop", "Evidence becomes structure", "Approve as brief", "Approve map as brief", "Production contract", "Visual contract", "Lock one coherent system", "Lock Style v1", "Update Style v1", "Coherent delivery package", "One system. Every format.", "Generate package", "Refresh package", "Open package", "Illuminate path on Map", "Highlight on Map", "Provider render pending", "Provider transcript evidence is incomplete", "Editable before the expensive step", "Prepare render", "FRAME.md", "DESIGN.md", "Visual DNA", "Verified claim", "verified claims", "Recorded fixture transcript", "Sanitized source excerpt", "Brief approved", "Style in use", "Storyboard approved", "Approval needed", "In use", "Became a connected Output set", "first rendered Output", "Editable semantic Map", "Make every Output feel like yours", "Use one visual system across every Output", "Create Output", "Sources in this output", "Demo video", 'aria-label="Production"', ' : "Plugin"']) {
      expect(page).not.toContain(retired);
    }
    for (const required of ["Approve brief", "Choose style", "Saved styles", "Use saved style", "Website", "Set manually", "Client pitch", "Board presentation", "Team workshop", "Add brand details", "Use this style", "Save new version", "How WorkshopLM works", "Create work", "Update work", "Review storyboard", "Sourced claim", "sourced claims", "Approved direction", "Evidence behind this brief", "Show source", "Sources in this work", "Select a claim to see the exact source text", "Show on map", "Presentation", "Your created work is ready", "Image set", "Audio Overview", "Save script", "Create audio", "Download audio", "AI-generated voice", "Voice transcript", "Source excerpt", "Ready for review", "Create video", "Video", "View video", "Download PowerPoint", "Open preview", "Open video", "Up to date", "Needs update", "Became professional knowledge work", "first created work", 'aria-label="Create"']) expect(page).toContain(required);
    expect(page).not.toMatch(/>\s*(Current|Stale|Trace)\s*</);
  });

  it("keeps Workshop collection controls outside the active canvas", () => {
    expect(page).toContain('aria-label="Switch Workshop"');
    expect(page).toContain('<SideSheet title="Workshops"');
    expect(page).toContain('label="New Workshop"');
    expect(page).toContain('action: "selectWorkshop"');
    expect(page).toContain('action: "createWorkshop"');
    expect(page).not.toMatch(/role="tab(list)?"/);
    expect(page).toContain('<nav className="workshop-spine" aria-label="Workshop progress">');
  });

  it("starts with material before asking for production Style", () => {
    expect(page).toContain('title: title.trim() || "New Workshop", outcome, onboardingStep: "sources"');
    expect(page).toContain("Start with what you know.");
    expect(page).toContain("WorkshopLM will organize it into a grounded Map.");
    expect(page.match(/origin: "Pasted notes", text: value, permission: "private"/g)).toHaveLength(2);
    expect(page).not.toContain('permission: "sanitized"');
    expect(page).not.toContain('title: title.trim(), outcome, onboardingStep: "style"');
    expect(page).toContain('action: "buildMap"');
    expect(page).toContain('state.sourceItems.length === 0 && !source.trim()');
    expect(page).toContain('const captured = await onPost({ action: "captureFallbackTranscript", text: transcript, capture });');
    expect(page).toContain('return Boolean(await onPost({ action: "buildMap", title: title.trim() || undefined, outcome }));');
    expect(page).toContain('aria-hidden="true" tabIndex={-1} scrolling="no" title={`${name} preview`}');
    expect(workshopRoute).toContain("generateGroundedMapWithGpt56(workshopDataRoot()");
    expect(workshopRoute).toContain('model: "gpt-5.6-terra", reasoningEffort: "medium"');
  });

  it("fits the complete first Map inside the visible workbench canvas", () => {
    const map = readFileSync(resolve(process.cwd(), "app/excalidraw-map.tsx"), "utf8");
    expect(map).toContain("api.scrollToContent(elements");
    expect(map).toContain("new ResizeObserver(() => fitScene())");
    expect(map).toContain("fitToViewport: true");
    expect(map).toContain("viewportZoomFactor: 0.94");
    expect(map).toContain("NODE_OFFSET_X = 0");
    expect(map).toContain("compactSourceTitle");
    expect(map).toContain("sourceCaptions");
    expect(map).not.toContain("sourceShapeId");
  });

  it("keeps one dominant desktop object and moves Sources and navigation into contextual sheets", () => {
    expect(page).toContain('<Workbench className="workbench">');
    expect(page).not.toContain('{loadState === "ready" && <SourcesRail');
    expect(page).not.toContain('{loadState === "ready" && <ProductionRail');
    expect(page).toContain('<Button className="header-source-trigger" variant="secondary" size="small" onClick={() => openSheet("sources")}');
    expect(page).toContain('<Button className="header-browse-trigger" aria-label="Open Workshop index" variant="secondary" size="small" onClick={() => openSheet("objects")}');
    expect(page).toContain('<SideSheet title="Workshop" onClose={onClose}>');
    expect(page).toContain('type WorkshopStage = "capture" | "map" | "brief" | "create"');
    expect(page).toContain('{ target: "conversation", title: "Conversation"');
    expect(page).toContain('{ target: "sources", title: "Sources"');
    expect(page).not.toContain('mobile-object-switcher');
    expect(page).toContain('<ConversationSurface className="conversation-view" aria-label="WorkshopLM Conversation"');
    expect(page).toContain('className="map-source-shelf" aria-label="Selected Sources"');
    expect(page).not.toContain('className="stage-progress"');
    expect(appCss).toContain(".workbench { min-width: 0; min-height: 0; height: 100%; overflow: hidden; padding: 0;");
    expect(appCss).toContain(".header-source-trigger, .header-browse-trigger, .workflow-action { display: flex; }");
  });

  it("keeps the primary Workshop spine compact while nesting supporting objects in the index", () => {
    const spine = page.slice(page.indexOf("function WorkshopSpine"), page.indexOf("function recommendedMapPath"));
    const index = page.slice(page.indexOf("function ObjectsSheet"), page.indexOf("function HowItWorksSheet"));

    expect(spine.match(/label: "(Capture|Map|Brief|Create)"/g)).toHaveLength(4);
    for (const stage of ["Capture", "Map", "Brief", "Create"]) expect(spine).toContain(`label: "${stage}"`);
    for (const nestedObject of ["Conversation", "Sources", "Style", "Created work", "Storyboard"]) expect(spine).not.toContain(`label: "${nestedObject}"`);

    expect(index).toContain('{ stage: "capture", title: "Capture", items: [');
    expect(index).toContain('{ target: "conversation", title: "Conversation"');
    expect(index).toContain('{ target: "sources", title: "Sources"');
    expect(index).toContain('{ stage: "create", title: "Create", items: [');
    expect(index).toContain('{ target: "style", title: "Style"');
    expect(index).toContain('{ target: "outputs", title: "Created work"');
  });

  it("lets the canvas own the screen without hiding source-scope consequences", () => {
    expect(page).toContain('aria-label="Source change impact"');
    expect(page).toContain('pending.affected.join(", ")');
    expect(page).toContain("will need an update. Your Style stays the same.");
    expect(page).toContain(">Update sources</Button>");
    expect(page).toContain("Keep at least one Source selected.");
    expect(page).toContain('action: "setActiveSourceScope", sourceIds: pendingSourceScope.sourceIds');
    expect(appCss).toContain(".map-source-shelf");
    expect(appCss).toContain("backdrop-filter: blur(18px)");
  });

  it("keeps partial and failed production recovery inside the focused workflow", () => {
    for (const copy of ["Some work is ready", "Incomplete", "Couldn't create", "Cancelled", "Try video again", "Cancel video", "Try again", "Creating replacement…", "Your approved Storyboard is safe.", "Some work needs attention. Your current work is still available."]) expect(page).toContain(copy);
    expect(page).toContain('action: "cancelVideoRender"');
    expect(page).toContain('onClick={() => onOpenOutput("images")}');
    expect(page).not.toContain("Job queue");
  });

  it("keeps reusable Styles inside the existing Style sheet", () => {
    expect(page).toContain('fetch("/api/workshop?view=styles")');
    expect(page).toContain('action: "applyStyleLibrary"');
    expect(page).toContain('<fieldset className="style-options"><legend>Saved styles</legend>');
    expect(page).toContain('style?.source ?? "website"');
    expect(page).toContain('intentProfile: defaultIntent ?? entry.intentProfile');
    expect(page).not.toContain('<legend>Use it for</legend>');
    expect(page).not.toContain('type Sheet = "styles"');
  });

  it("keeps the governing design document aligned with the simplified interface", () => {
    for (const retired of ["one current object at a time", "Sources sheet or claim inspector; both are closed by default", "one `Generate package` action", "`Approve storyboard & render`", "`Approve map as brief`", "brief sheet folds into Studio inputs", "small ink pulses enter from the host strip"]) {
      expect(design).not.toContain(retired);
    }
    for (const required of ["Capture → Map → Brief → Create", "one dominant current object", "Sources sheet", "Brief and Style", "Created work history", "constrained, auto-organized semantic canvas", "`Approve brief`", "`Create outputs`", "`Approve storyboard`", "`Create video`", "`Show source`", "`Show original`", "packages/ui/src/contract.ts"]) {
      expect(design).toContain(required);
    }
  });
});
