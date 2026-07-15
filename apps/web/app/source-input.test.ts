import { describe, expect, it } from "vitest";
import { sourceInputKind, sourceTitleFromText } from "./source-input.js";

describe("first-session source input", () => {
  it("routes public websites, absolute PDF paths, and pasted notes without a mode picker", () => {
    expect(sourceInputKind("https://example.com/brief")).toBe("url");
    expect(sourceInputKind("/Users/example/Client brief.pdf")).toBe("pdf");
    expect(sourceInputKind("Meetings should become source-defensible decks.")).toBe("text");
  });

  it("derives a readable title when pasted notes have no explicit title", () => {
    expect(sourceTitleFromText("# Weekly client meeting\nThe pilot is approved.")).toBe("Weekly client meeting");
    expect(sourceTitleFromText(" ")).toBe("Pasted notes");
  });
});
