import { resolve } from "node:path";
import { buildSubmissionOutputSet, verifySubmissionOutputSet } from "../apps/worker/src/submission-package.ts";

function valueAfter(flag: string) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const mode = process.argv[2] ?? "build";
  const root = resolve(valueAfter("--root") ?? ".workshoplm/acceptance");
  if (mode === "build") {
    const outputDirectory = valueAfter("--output");
    const built = await buildSubmissionOutputSet(root, { outputDirectory: outputDirectory ? resolve(outputDirectory) : undefined });
    const verification = await verifySubmissionOutputSet(root, built.manifestPath);
    if (!verification.valid) throw new Error(`Generated submission Output set failed verification: ${verification.issues.join("; ")}`);
    console.log(JSON.stringify({ mode, root, manifestPath: built.manifestPath, status: built.outputSet.status, assets: built.outputSet.assets.length, limitations: built.outputSet.limitations, verification }, null, 2));
    return;
  }
  if (mode === "verify") {
    const manifestPath = resolve(valueAfter("--manifest") ?? resolve(root, "generated", "submission-output-set-v1", "manifest.json"));
    const verification = await verifySubmissionOutputSet(root, manifestPath);
    console.log(JSON.stringify({ mode, root, manifestPath, ...verification }, null, 2));
    if (!verification.valid) process.exitCode = 1;
    return;
  }
  throw new Error(`Unknown mode: ${mode}. Use build or verify.`);
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
