import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { DOMAIN_UI_EXCEPTIONS, OAI_UI_COMPONENTS, OAI_UI_SOURCE } from "@workshoplm/ui";

const root = resolve(process.cwd(), "../..");
const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const appCss = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
const ui = readFileSync(resolve(root, "packages/ui/src/index.tsx"), "utf8");
const uiCss = readFileSync(resolve(root, "packages/ui/src/styles.css"), "utf8");
const inventory = readFileSync(resolve(root, OAI_UI_SOURCE.inventory), "utf8");
const design = readFileSync(resolve(root, "DESIGN.md"), "utf8");

describe("official Apps in ChatGPT UI implementation", () => {
  it("pins every reusable shell family to the inspected Figma inventory", () => {
    for (const id of Object.values(OAI_UI_COMPONENTS)) expect(inventory).toContain(`\`${id}\``);
    for (const component of ["FullScreenShell", "NavigationHeader", "Button", "ButtonLink", "IconButton", "Token", "Checkbox", "Input", "TextArea", "Card", "ListGroup", "ListRow", "ListRowAction", "EntityCard", "EntityCardAction", "Carousel", "CarouselRow", "SideSheet", "StateMessage"]) {
      expect(ui).toContain(`function ${component}`);
    }
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
    for (const retired of ["Grounding this Workshop", "Evidence becomes structure", "Approve as brief", "Approve map as brief", "Production contract", "Visual contract", "Lock one coherent system", "Lock Style v1", "Update Style v1", "Coherent delivery package", "One system. Every format.", "Generate package", "Refresh package", "Open package", "Illuminate path on Map", "Highlight on Map", "Provider render pending", "Editable before the expensive step", "Prepare render", "FRAME.md", "DESIGN.md", "Visual DNA", "Brief approved", "Style in use", "Storyboard approved", "Approval needed", "In use"]) {
      expect(page).not.toContain(retired);
    }
    for (const required of ["Approve brief", "Choose style", "Website", "Set manually", "Client pitch", "Board presentation", "Team workshop", "Add brand details", "Use this style", "Update style", "Create outputs", "Update outputs", "View outputs", "Show source", "Show on map", "Image set", "Ready for review", "Create video", "View video", "Open file", "Open video", "Up to date", "Needs update"]) expect(page).toContain(required);
    expect(page).not.toMatch(/>\s*(Current|Stale|Trace)\s*</);
  });

  it("keeps the governing design document aligned with the simplified interface", () => {
    for (const retired of ["### 3. Source rail", "### 4. Brief and Design review", "### 5. Coherent output package", "one `Generate package` action", "`Approve storyboard & render`", "`Approve map as brief`", "brief sheet folds into Studio inputs", "small ink pulses enter from the host strip", "Sources, Map, FRAME.md/DESIGN.md review, Studio"]) {
      expect(design).not.toContain(retired);
    }
    for (const required of ["one current object at a time", "Sources sheet", "Brief and Style", "Outputs history", "`Approve brief`", "`Create outputs`", "`Approve storyboard`", "`Create video`", "`Show source`", "`Show original`", "packages/ui/src/contract.ts"]) {
      expect(design).toContain(required);
    }
  });
});
