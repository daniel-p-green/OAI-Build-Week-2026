import { describe, expect, it } from "vitest";
import { formatElapsed, resolveFounderSubmissionSlots, validateFounderPromotion, type FounderPromotionEvidence } from "./final-submission.js";

const evidence = (): FounderPromotionEvidence => ({
  operatorStatus: "passed",
  captureEvidence: "founder-provided-recording-and-transcript",
  founderSourcePermission: "shareable",
  publicPackageEligible: true,
  submissionStatus: "ready",
  submissionLimitations: [],
  submissionVerified: true,
  submissionPathMatches: true,
  submissionFingerprintMatches: true,
  shareableFounderSource: true,
  captureStatus: "founder-final-candidate",
  captureFounderSource: true,
  captureLimitations: [],
  captureSubmissionHashMatches: true,
  filmStatus: "final-public-demo",
  filmLimitations: [],
  filmFounderEvidence: true,
  filmSubmissionHashMatches: true,
  filmVideoHashMatches: true,
  filmDurationSeconds: 140,
  filmHasAudio: true,
  filmHasVideo: true,
  editFinalReady: true,
  firstTranscriptAt: "2026-07-16T20:00:00.000Z",
  firstRenderedOutputAt: "2026-07-16T20:02:05.000Z",
});

describe("final founder submission promotion", () => {
  it("requires every authentic package, capture, film, and integrity gate", () => {
    expect(validateFounderPromotion(evidence())).toBe(125);
    expect(() => validateFounderPromotion({ ...evidence(), founderSourcePermission: "private" })).toThrow(/shareable founder Source/);
    expect(() => validateFounderPromotion({ ...evidence(), submissionLimitations: ["missing media"] })).toThrow(/without limitations/);
    expect(() => validateFounderPromotion({ ...evidence(), filmDurationSeconds: 180 })).toThrow(/shorter than three minutes/);
    expect(() => validateFounderPromotion({ ...evidence(), editFinalReady: false })).toThrow(/verification has not passed/);
  });

  it("resolves only the LIVE statements and records the measured elapsed time", () => {
    const draft = `Header\n\n\`[LIVE: Founder work is complete.]\`\n\`[FALLBACK: Founder work is not complete.]\`\n\n\`[LIVE: The run took {X minutes}.]\`\n\`[FALLBACK: omit the sentence.]\`\n`;
    expect(resolveFounderSubmissionSlots(draft, 125)).toBe("Header\n\nFounder work is complete.\n\nThe run took 2 minutes 5 seconds.\n");
    expect(() => resolveFounderSubmissionSlots(draft.replace("LIVE", "OTHER"), 125)).toThrow(/exactly four/);
  });

  it("formats precise human elapsed time", () => {
    expect(formatElapsed(1)).toBe("1 second");
    expect(formatElapsed(60)).toBe("1 minute");
    expect(formatElapsed(121)).toBe("2 minutes 1 second");
  });
});
