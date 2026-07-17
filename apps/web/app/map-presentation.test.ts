import { describe, expect, it } from "vitest";
import { prioritizeMapEvidence } from "./map-presentation";

describe("Map presentation", () => {
  it("shows the evidence that supports synthesis and removes a duplicated direction claim", () => {
    const nodes = [
      { id: "proof-a", body: "First proof", kind: "grounded" as const, locator: "Notes · 01", sourceId: "notes" },
      { id: "direction-claim", body: "The team should expand", kind: "grounded" as const, locator: "Notes · 02", sourceId: "notes" },
      { id: "proof-b", body: "Second proof", kind: "grounded" as const, locator: "Notes · 03", sourceId: "notes" },
      { id: "context", body: "Background context", kind: "grounded" as const, locator: "Notes · 04", sourceId: "notes" },
      { id: "synthesis", body: "Combined finding", kind: "derived" as const, locator: "Derived" },
      { id: "direction", body: "The team should expand", kind: "creative" as const, locator: "Notes · 02", sourceId: "notes" },
    ];
    const result = prioritizeMapEvidence(nodes, [
      { from: "proof-b", to: "synthesis" },
      { from: "proof-a", to: "synthesis" },
      { from: "synthesis", to: "direction" },
    ], 3);

    expect(result.nodes.map((node) => node.id)).toEqual(["proof-a", "proof-b", "synthesis", "direction"]);
    expect(result.hiddenEvidenceCount).toBe(2);
  });

  it("leaves a small Map unchanged", () => {
    const nodes = [
      { id: "proof", body: "Proof", kind: "grounded" as const, locator: "Notes · 01" },
      { id: "direction", body: "Act", kind: "creative" as const, locator: "Notes · 01" },
    ];
    expect(prioritizeMapEvidence(nodes, [], 3)).toEqual({ nodes, hiddenEvidenceCount: 0 });
  });

  it("can expand the focused Map without restoring a duplicated direction claim", () => {
    const nodes = [
      { id: "proof", body: "Proof", kind: "grounded" as const, locator: "Notes · 01", sourceId: "notes" },
      { id: "context", body: "Context", kind: "grounded" as const, locator: "Notes · 02", sourceId: "notes" },
      { id: "direction-claim", body: "Act now", kind: "grounded" as const, locator: "Notes · 03", sourceId: "notes" },
      { id: "synthesis", body: "Finding", kind: "derived" as const, locator: "Derived" },
      { id: "direction", body: "Act now", kind: "creative" as const, locator: "Notes · 03", sourceId: "notes" },
    ];
    const result = prioritizeMapEvidence(nodes, [{ from: "proof", to: "synthesis" }], Number.MAX_SAFE_INTEGER, false);
    expect(result.nodes.map((node) => node.id)).toEqual(["proof", "context", "synthesis", "direction"]);
  });
});
