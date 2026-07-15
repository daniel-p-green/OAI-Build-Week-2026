import { describe, expect, it } from "vitest";
import { DOMAIN_UI_EXCEPTIONS, OAI_UI_COMPONENTS, OAI_UI_TOKENS } from "./contract.js";

describe("official UI contract", () => {
  it("pins every reusable component to an inspected source node", () => {
    expect(Object.values(OAI_UI_COMPONENTS)).not.toContain("");
  });

  it("keeps official geometry and light foundations exact", () => {
    expect(OAI_UI_TOKENS).toMatchObject({
      backgroundPrimary: "#FFFFFF",
      textPrimary: "#0D0D0D",
      buttonHeight: "36px",
      tokenHeight: "42px",
      radiusCard: "24px",
    });
  });

  it("keeps custom rendering exceptions narrow and explicit", () => {
    expect(DOMAIN_UI_EXCEPTIONS).toEqual([...DOMAIN_UI_EXCEPTIONS].sort());
    expect(DOMAIN_UI_EXCEPTIONS).not.toContain("button");
    expect(DOMAIN_UI_EXCEPTIONS).not.toContain("input");
  });
});
