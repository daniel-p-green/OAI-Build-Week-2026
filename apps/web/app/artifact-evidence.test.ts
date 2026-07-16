import { describe, expect, it } from "vitest";
import { claimsForArtifact, type ArtifactClaim } from "./artifact-evidence";

const claims: ArtifactClaim[] = [
  { id: "claim-1", sourceId: "source-1", text: "First supported claim", locator: "Meeting notes · chunk 01" },
  { id: "claim-2", sourceId: "source-2", text: "Second supported claim", locator: "Strategy brief · page 4" },
];

describe("artifact evidence", () => {
  it("preserves artifact order, removes duplicate edges, and ignores missing claims", () => {
    expect(claimsForArtifact(["claim-2", "claim-1", "claim-2", "missing"], claims)).toEqual([claims[1], claims[0]]);
  });
});
