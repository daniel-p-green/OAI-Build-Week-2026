import { describe, expect, it } from "vitest";
import { redact } from "./redact.js";

describe("redact", () => {
  it("removes supplied values and common credential shapes", () => {
    expect(redact({ apiKey: "top-secret", detail: "Bearer top-secret sk-secret-value" }, ["top-secret"])).toEqual({
      apiKey: "[REDACTED]",
      detail: "[REDACTED] [REDACTED]",
    });
  });
});
