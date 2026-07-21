import { createHash } from "node:crypto";
import { access, cp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { resolveFounderSubmissionSlots, validateFounderPromotion } from "../apps/worker/src/final-submission.js";
import { submissionInputFingerprint, verifySubmissionOutputSet } from "../apps/worker/src/submission-package.js";
import { readWorkshopState } from "../apps/worker/src/workshop-service.js";

const repository = resolve(import.meta.dirname, "..");
const root = resolve(repository, ".workshoplm/final-operator");
const runPath = resolve(repository, ".workshoplm/final-operator-run.json");
const submissionPath = resolve(root, "generated/submission-output-set-v1/manifest.json");
const capturePath = resolve(repository, "outputs/demo-recording-final/manifest.json");
const filmPath = resolve(repository, "outputs/demo-film-final/manifest.json");
const readinessPath = resolve(repository, "outputs/demo-film-plan/edit-readiness.json");
const draftPath = resolve(repository, "submission/DEVPOST-DRAFT.md");
const outputPath = resolve(repository, "submission/DEVPOST-FOUNDER-CANDIDATE.md");
const evidencePath = resolve(repository, "submission/DEVPOST-FOUNDER-CANDIDATE.json");
const publicPackagePath = resolve(repository, "outputs/final-submission-output-set");
const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
async function readRequired(path: string, label: string): Promise<Buffer> {
  try { return await readFile(path); }
  catch { throw new Error(`Founder submission promotion is not ready: ${label} is missing. Complete the authentic founder run, final capture, and final film verification first.`); }
}
async function requirePath(path: string, label: string): Promise<void> {
  try { await access(path); }
  catch { throw new Error(`Founder submission promotion is not ready: ${label} is missing. Complete the authentic founder run, final capture, and final film verification first.`); }
}
const readJson = async <T>(path: string, label: string): Promise<T> => JSON.parse((await readRequired(path, label)).toString("utf8")) as T;

type Run = { status?: string; captureEvidence?: string; founderSourcePermission?: string | null; publicPackageEligible?: boolean; submission?: { manifestPath?: string; status?: string; limitations?: unknown[]; verification?: { valid?: boolean } } };
type FounderCapture = { provenance?: string };
type Submission = { status?: string; limitations?: unknown[]; inputFingerprint?: string };
type Capture = { status?: string; founderSource?: boolean; limitations?: unknown[]; submission?: { relativePath?: string; sha256?: string } };
type Film = { status?: string; limitations?: unknown[]; video?: { relativePath?: string; sha256?: string; durationSeconds?: number; streams?: Array<{ codec_type?: string }> }; metaRevealEvidence?: { mode?: string; submissionManifest?: { relativePath?: string; sha256?: string }; transcript?: { relativePath?: string; sha256?: string } } };
type Readiness = { mode?: string; finalReady?: boolean };

async function main(): Promise<void> {
  await requirePath(join(root, "data/workshoplm.sqlite"), "founder Workshop state");
  const state = readWorkshopState(root);
  const [run, founderCapture, submission, capture, film, readiness, draft, submissionBytes] = await Promise.all([
    readJson<Run>(runPath, "passed founder operator record"),
    readJson<FounderCapture>(join(root, "evidence/founder-capture/manifest.json"), "founder-authorized source manifest"),
    readJson<Submission>(submissionPath, "ready founder submission manifest"),
    readJson<Capture>(capturePath, "founder browser-capture manifest"),
    readJson<Film>(filmPath, "final HyperFrames film manifest"),
    readJson<Readiness>(readinessPath, "final edit-readiness report"),
    readFile(draftPath, "utf8"),
    readRequired(submissionPath, "ready founder submission manifest"),
  ]);
  const verification = await verifySubmissionOutputSet(root, submissionPath);
  const submissionHash = sha256(submissionBytes);
  const captureSubmissionPath = resolve(repository, capture.submission?.relativePath ?? "missing");
  const filmSubmissionPath = resolve(repository, film.metaRevealEvidence?.submissionManifest?.relativePath ?? "missing");
  const filmVideoPath = resolve(dirname(filmPath), film.video?.relativePath ?? "missing");
  const filmVideoBytes = await readRequired(filmVideoPath, "final HyperFrames Video");
  const founderTranscriptPath = resolve(repository, film.metaRevealEvidence?.transcript?.relativePath ?? "missing");
  const founderTranscriptBytes = await readRequired(founderTranscriptPath, "founder-authorized transcript bound to the final film");
  const founderSource = state.sourceItems.find((source) => state.activeSourceIds.includes(source.id) && (source.origin === "Founder-provided recording" || source.origin === "Founder-authorized script with AI narration"));
  const publicPackageEligible = !state.sourceItems.some((source) => state.activeSourceIds.includes(source.id) && source.permission === "private");
  const elapsedSeconds = validateFounderPromotion({
    operatorStatus: run.status,
    captureEvidence: run.captureEvidence && run.captureEvidence !== "private-capture-placeholder" ? run.captureEvidence : founderCapture.provenance,
    founderSourcePermission: run.founderSourcePermission ?? founderSource?.permission,
    publicPackageEligible: run.publicPackageEligible ?? publicPackageEligible,
    submissionStatus: submission.status,
    submissionLimitations: submission.limitations,
    submissionVerified: verification.valid && run.submission?.verification?.valid === true,
    submissionPathMatches: resolve(run.submission?.manifestPath ?? "missing") === submissionPath,
    submissionFingerprintMatches: submission.inputFingerprint === submissionInputFingerprint(state),
    shareableFounderSource: founderSource?.permission === "shareable",
    captureStatus: capture.status,
    captureFounderSource: capture.founderSource,
    captureLimitations: capture.limitations,
    captureSubmissionHashMatches: captureSubmissionPath === submissionPath && capture.submission?.sha256 === submissionHash,
    filmStatus: film.status,
    filmLimitations: film.limitations,
    filmFounderEvidence: film.metaRevealEvidence?.mode === "founder" && film.metaRevealEvidence.transcript?.sha256 === sha256(founderTranscriptBytes),
    filmSubmissionHashMatches: [submissionPath, resolve(publicPackagePath, "manifest.json")].includes(filmSubmissionPath) && film.metaRevealEvidence?.submissionManifest?.sha256 === submissionHash,
    filmVideoHashMatches: film.video?.sha256 === sha256(filmVideoBytes),
    filmDurationSeconds: film.video?.durationSeconds,
    filmHasAudio: Boolean(film.video?.streams?.some((stream) => stream.codec_type === "audio")),
    filmHasVideo: Boolean(film.video?.streams?.some((stream) => stream.codec_type === "video")),
    editFinalReady: readiness.mode === "final" && readiness.finalReady,
    firstTranscriptAt: state.firstTranscriptAt,
    firstRenderedOutputAt: state.firstRenderedOutputAt,
  });
  const resolved = resolveFounderSubmissionSlots(draft, elapsedSeconds);
  await rm(publicPackagePath, { recursive: true, force: true });
  await cp(dirname(submissionPath), publicPackagePath, { recursive: true });
  const sessionIdResolved = !resolved.includes("[designated primary session ID; rationale logged in log.md]");
  const publicUrlResolved = /https:\/\/youtu\.be\/[A-Za-z0-9_-]+/.test(resolved);
  const remainingPublicationFields = [
    ...(!publicUrlResolved ? ["public YouTube URL"] : []),
    ...(!sessionIdResolved ? ["Codex /feedback Session ID"] : []),
  ];
  const candidate = `<!-- Generated by pnpm submission:promote-founder. Founder evidence is resolved; ${remainingPublicationFields.length === 0 ? "all repository-controlled publication fields are resolved" : `${remainingPublicationFields.join(" and ")} remain publication gates`}. -->\n\n${resolved}`;
  const candidateHash = sha256(candidate);
  const evidence = {
    schemaVersion: 1,
    status: "founder-resolved-candidate",
    createdAt: new Date().toISOString(),
    elapsedSeconds,
    sourceDraft: "submission/DEVPOST-DRAFT.md",
    submission: { relativePath: ".workshoplm/final-operator/generated/submission-output-set-v1/manifest.json", publicRelativePath: "outputs/final-submission-output-set/manifest.json", sha256: submissionHash },
    capture: { relativePath: "outputs/demo-recording-final/manifest.json", submissionSha256: capture.submission?.sha256 },
    film: { relativePath: "outputs/demo-film-final/manifest.json", videoSha256: film.video?.sha256, durationSeconds: film.video?.durationSeconds },
    candidate: { relativePath: "submission/DEVPOST-FOUNDER-CANDIDATE.md", sha256: candidateHash },
    remainingPublicationFields,
  };
  const outputBuilding = `${outputPath}.building`;
  const evidenceBuilding = `${evidencePath}.building`;
  try {
    await writeFile(outputBuilding, candidate, "utf8");
    await writeFile(evidenceBuilding, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
    await rename(outputBuilding, outputPath);
    await rename(evidenceBuilding, evidencePath);
  } catch (error) {
    await Promise.all([rm(outputBuilding, { force: true }), rm(evidenceBuilding, { force: true })]);
    throw error;
  }
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
