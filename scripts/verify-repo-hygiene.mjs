import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const tracked = git("ls-files").split("\n").filter(Boolean);

const requiredFiles = ["AGENTS.md", "GOAL.md", "DESIGN.md", "README.md", "log.md", "pnpm-lock.yaml", "pnpm-workspace.yaml", "docs/REPOSITORY-MAP.md"];
for (const file of requiredFiles) if (!existsSync(resolve(root, file))) failures.push(`required file is missing: ${file}`);

const transientPath = /(^|\/)(?:\.DS_Store|node_modules|\.next|\.turbo|test-results|playwright-report|\.workshoplm(?:-[^/]*)?|\.pet-runs)(?:\/|$)/;
for (const file of tracked) if (transientPath.test(file)) failures.push(`transient runtime path is tracked: ${file}`);

const generatedPublicPath = /^(?:artifacts|outputs|research\/screenshots|submission)\//;
for (const file of tracked) if (generatedPublicPath.test(file)) failures.push(`generated or publication-only path is tracked: ${file}`);

const maximumTrackedBytes = 10 * 1024 * 1024;
for (const file of tracked) {
  const absolute = resolve(root, file);
  if (existsSync(absolute) && statSync(absolute).size > maximumTrackedBytes) failures.push(`tracked file exceeds 10 MiB review threshold: ${file}`);
}

const ignoreProbes = [
  "node_modules/.hygiene-probe",
  ".turbo/.hygiene-probe",
  ".workshoplm/.hygiene-probe",
  ".workshoplm-visual-test/.hygiene-probe",
  "apps/web/.next-playwright/.hygiene-probe",
  "apps/web/test-results/.hygiene-probe",
  ".env.local",
  ".DS_Store",
  "outputs/.hygiene-probe",
  "artifacts/.hygiene-probe",
  "research/screenshots/.hygiene-probe",
  "submission/.hygiene-probe",
];
for (const probe of ignoreProbes) {
  const result = spawnSync("git", ["check-ignore", "--no-index", "-q", probe], { cwd: root });
  if (result.status !== 0) failures.push(`required ignore boundary is missing: ${probe}`);
}

const activeDocuments = ["README.md", "GOAL.md", "DESIGN.md", "AGENTS.md", "docs/REPOSITORY-MAP.md"];
const markdownLink = /!?(?:\[[^\]]*\])\(([^)]+)\)/g;
for (const document of activeDocuments) {
  const text = readFileSync(resolve(root, document), "utf8");
  for (const match of text.matchAll(markdownLink)) {
    let target = match[1].trim().replace(/^<|>$/g, "");
    if (!target || /^(?:https?:|mailto:|plugin:|#)/.test(target)) continue;
    target = decodeURIComponent(target.split("#")[0].split("?")[0]);
    if (!target) continue;
    const absolute = resolve(root, dirname(document), target);
    if (!existsSync(absolute)) failures.push(`broken local link in ${document}: ${match[1]}`);
  }
}

const readme = readFileSync(resolve(root, "README.md"), "utf8");
if (!readme.includes("GOAL.md") || !readme.includes("not the active checklist")) failures.push("README authority chain no longer identifies GOAL.md and the dated plan boundary");

if (failures.length) {
  console.error("Repository hygiene failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log(JSON.stringify({
  status: "passed",
  trackedFiles: tracked.length,
  activeDocumentsChecked: activeDocuments.length,
  transientPathsTracked: 0,
  maximumTrackedFileMiB: Math.round(Math.max(...tracked.map((file) => {
    const absolute = resolve(root, file);
    return existsSync(absolute) ? statSync(absolute).size : 0;
  })) / 1024 / 1024 * 10) / 10,
}, null, 2));
