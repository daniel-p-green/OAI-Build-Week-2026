import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { OAI_UI_COMPONENTS, OAI_UI_SOURCE, OAI_UI_TOKENS } from "./oai-ui-contract";

const root = resolve(process.cwd(), "../..");
const page = readFileSync(resolve(process.cwd(), "app/page.tsx"), "utf8");
const css = readFileSync(resolve(process.cwd(), "app/official-ui.css"), "utf8");
const inventory = readFileSync(resolve(root, OAI_UI_SOURCE.inventory), "utf8");

describe("official Apps in ChatGPT UI contract", () => {
  it("pins the inspected Figma source and core component ids", () => {
    expect(OAI_UI_SOURCE.fileKey).toBe("jVilV9akIrMbbpl8sUqC6K");
    for (const id of Object.values(OAI_UI_COMPONENTS)) expect(inventory).toContain(`\`${id}\``);
  });

  it("uses only the verified light-mode foundation values in application chrome", () => {
    for (const token of Object.values(OAI_UI_TOKENS)) expect(css.toLowerCase()).toContain(token.toLowerCase());
    for (const retired of ["#10a37f", "#7356b8", "#9a650f", "#f7f7f8", "#ececf1"]) {
      expect(css.toLowerCase()).not.toContain(retired);
    }
  });

  it("maps every judge-visible shell family to an official component", () => {
    for (const name of [
      "Full screen",
      "Navigation/Header",
      "Button",
      "IconButton",
      "Token",
      "Checkbox",
      "Input",
      "TextArea",
      "Card",
      "ListGroup",
      "ListRow",
      "EntityCard / Media or map",
      "Carousel",
      "CarouselRow",
    ]) {
      expect(page).toContain(`data-oai-component=\"${name}\"`);
    }
  });
});

