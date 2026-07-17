export type FounderPromotionEvidence = {
  operatorStatus: string | undefined;
  captureEvidence: string | undefined;
  founderSourcePermission: string | null | undefined;
  publicPackageEligible: boolean | undefined;
  submissionStatus: string | undefined;
  submissionLimitations: unknown[] | undefined;
  submissionVerified: boolean;
  submissionPathMatches: boolean;
  submissionFingerprintMatches: boolean;
  shareableFounderSource: boolean;
  captureStatus: string | undefined;
  captureFounderSource: boolean | undefined;
  captureLimitations: unknown[] | undefined;
  captureSubmissionHashMatches: boolean;
  filmStatus: string | undefined;
  filmLimitations: unknown[] | undefined;
  filmFounderEvidence: boolean;
  filmSubmissionHashMatches: boolean;
  filmVideoHashMatches: boolean;
  filmDurationSeconds: number | undefined;
  filmHasAudio: boolean;
  filmHasVideo: boolean;
  editFinalReady: boolean | undefined;
  firstTranscriptAt: string | undefined;
  firstRenderedOutputAt: string | undefined;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function founderElapsedSeconds(firstTranscriptAt: string | undefined, firstRenderedOutputAt: string | undefined): number {
  const start = Date.parse(firstTranscriptAt ?? "");
  const end = Date.parse(firstRenderedOutputAt ?? "");
  assert(Number.isFinite(start) && Number.isFinite(end), "Founder promotion requires recorded first-transcript and first-created-work timestamps.");
  assert(end >= start, "Founder promotion found created work before the first transcript timestamp.");
  return Math.round((end - start) / 1000);
}

export function formatElapsed(seconds: number): string {
  assert(Number.isSafeInteger(seconds) && seconds >= 0, "Elapsed time must be a non-negative whole number of seconds.");
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (!minutes) return `${remainder} ${remainder === 1 ? "second" : "seconds"}`;
  if (!remainder) return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${remainder} ${remainder === 1 ? "second" : "seconds"}`;
}

export function validateFounderPromotion(evidence: FounderPromotionEvidence): number {
  assert(evidence.operatorStatus === "passed", "Founder promotion requires a passed live operator run.");
  assert(evidence.captureEvidence === "founder-provided-recording-and-transcript" || evidence.captureEvidence === "provider-verified-realtime-and-founder-recording", "Founder promotion requires authentic founder recording evidence.");
  assert(evidence.founderSourcePermission === "shareable" && evidence.publicPackageEligible === true && evidence.shareableFounderSource, "Founder promotion requires an explicitly shareable founder Source and no private active Sources.");
  assert(evidence.submissionStatus === "ready" && Array.isArray(evidence.submissionLimitations) && evidence.submissionLimitations.length === 0, "Founder promotion requires a ready submission package without limitations.");
  assert(evidence.submissionVerified && evidence.submissionPathMatches && evidence.submissionFingerprintMatches, "Founder promotion requires the current verified submission package and exact operator manifest.");
  assert(evidence.captureStatus === "founder-final-candidate" && evidence.captureFounderSource === true && Array.isArray(evidence.captureLimitations) && evidence.captureLimitations.length === 0, "Founder promotion requires the limitation-free founder browser capture.");
  assert(evidence.captureSubmissionHashMatches, "Founder browser capture is not bound to the current submission package.");
  assert(evidence.filmStatus === "final-public-demo" && Array.isArray(evidence.filmLimitations) && evidence.filmLimitations.length === 0, "Founder promotion requires the final public-demo film without limitations.");
  assert(evidence.filmFounderEvidence && evidence.filmSubmissionHashMatches && evidence.filmVideoHashMatches, "Final film evidence is not bound to the founder transcript, current submission package, and recorded Video hash.");
  assert(Boolean(evidence.filmDurationSeconds && evidence.filmDurationSeconds > 0 && evidence.filmDurationSeconds < 180), "Final film must be shorter than three minutes.");
  assert(evidence.filmHasAudio && evidence.filmHasVideo, "Final film requires both audio and video streams.");
  assert(evidence.editFinalReady === true, "Final edit-readiness verification has not passed.");
  return founderElapsedSeconds(evidence.firstTranscriptAt, evidence.firstRenderedOutputAt);
}

const slotPattern = /^`\[(LIVE|FALLBACK): (.+)\]`$/gm;

export function resolveFounderSubmissionSlots(draft: string, elapsedSeconds: number): string {
  const slots = [...draft.matchAll(slotPattern)];
  assert(slots.length === 4, `Expected exactly four founder resolution slots, found ${slots.length}.`);
  assert(slots.map((slot) => slot[1]).join(",") === "LIVE,FALLBACK,LIVE,FALLBACK", "Founder resolution slots are not in the expected LIVE/FALLBACK pairs.");
  const firstLive = slots[0]![2]!;
  const elapsedLive = slots[2]![2]!.replace("{X minutes}", formatElapsed(elapsedSeconds));
  assert(!elapsedLive.includes("{X minutes}"), "Elapsed founder slot no longer contains the expected placeholder.");
  const resolved = draft
    .replace(slots[0]![0], firstLive)
    .replace(`${slots[1]![0]}\n`, "")
    .replace(slots[2]![0], elapsedLive)
    .replace(`${slots[3]![0]}\n`, "")
    .replace("Bracketed slots remain only where founder-derived final-package or publication evidence does not yet exist.", "Founder-derived package statements are resolved from verified local evidence. Publication fields remain pending until their public links are checked.")
    .replace("Resolve the remaining founder/final-package brackets from inspected artifacts; no bracket ships.", "Confirm the founder/final-package statements still match the promoted evidence; no unresolved marker ships.");
  assert(!/`\[(LIVE|FALLBACK):/.test(resolved), "Founder promotion left an unresolved LIVE/FALLBACK marker.");
  return resolved;
}
