import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const fixedMtime = new Date("2026-07-16T00:00:00.000Z");

async function sha256(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function requireFile(path: string) {
  const info = await stat(path);
  if (!info.isFile() || info.size === 0) throw new Error(`Required review artifact is missing or empty: ${path}`);
}

function reviewHtml(reviewId: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:,">
  <title>AI Collective chapter launch brief — cold review</title>
  <style>
    :root{color-scheme:light;--ink:#171717;--muted:#686868;--paper:#fff;--wash:#f4f4f1;--line:#deded8;--accent:#ff640d}*{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font:15px/1.5 Arial,sans-serif}.shell{width:min(1080px,calc(100% - 32px));margin:0 auto;padding:48px 0 80px}.eyebrow{color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}h1{max-width:780px;margin:14px 0 12px;font-size:clamp(36px,6vw,68px);font-weight:500;letter-spacing:-.045em;line-height:.98}.lede{max-width:680px;color:var(--muted);font-size:18px}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:28px 0 40px}a,button{border:1px solid var(--line);border-radius:999px;background:var(--paper);color:var(--ink);font:600 14px Arial,sans-serif;padding:11px 17px;text-decoration:none;cursor:pointer}.primary{background:var(--ink);border-color:var(--ink);color:#fff}.deck{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:18px;background:#fff}.review{margin-top:36px;padding:30px;border:1px solid var(--line);border-radius:18px;background:var(--paper)}.review h2{margin:0 0 8px;font-size:28px;letter-spacing:-.025em}.review>p{margin:0 0 24px;color:var(--muted)}.choice-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.choice{display:block;border:1px solid var(--line);border-radius:14px;padding:18px}.choice input{margin-right:8px}.choice strong{font-size:18px}.choice span{display:block;margin:7px 0 0 24px;color:var(--muted)}label.field{display:block;margin-top:18px;font-weight:600}input[type=text],textarea{display:block;width:100%;margin-top:7px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:12px;font:15px/1.4 Arial,sans-serif}textarea{min-height:120px;resize:vertical}.download{margin-top:20px}.status{min-height:24px;margin:12px 0 0;color:var(--muted)}footer{margin-top:22px;color:var(--muted);font-size:13px}@media(max-width:640px){.shell{width:min(100% - 20px,1080px);padding-top:28px}.choice-grid{grid-template-columns:1fr}.review{padding:20px}}
  </style>
</head>
<body>
  <main class="shell">
    <div class="eyebrow">Cold professional review</div>
    <h1>Would you send this under your own name?</h1>
    <p class="lede">Review the brief as finished client-facing work. Grade the artifact, not the effort behind it. Choose <strong>Send</strong>, or name the first thing that makes it <strong>Revise</strong>.</p>
    <div class="actions"><a class="primary" href="AI-Collective-chapter-launch.pdf" target="_blank">Open Presentation</a><a href="AI-Collective-chapter-launch.pptx">Download editable PowerPoint</a></div>
    <img class="deck" src="contact-sheet.png" alt="Nine-slide AI Collective chapter launch contact sheet">
    <section class="review" aria-labelledby="review-title">
      <h2 id="review-title">Your decision</h2>
      <p>Please make the decision before reading project notes or receiving an explanation.</p>
      <div class="choice-grid">
        <label class="choice"><input type="radio" name="decision" value="Send"><strong>Send</strong><span>I would present or share this without a blocking revision.</span></label>
        <label class="choice"><input type="radio" name="decision" value="Revise"><strong>Revise</strong><span>One issue prevents me from sending this as-is.</span></label>
      </div>
      <label class="field">Your role <input id="role" type="text" placeholder="Consultant, strategist, enablement lead…"></label>
      <label class="field">First blocking slide or sentence <input id="blocker" type="text" placeholder="Required for Revise; optional for Send"></label>
      <label class="field">Why? <textarea id="reason" placeholder="What would you change first? Keep this to the highest-leverage issue."></textarea></label>
      <button class="primary download" type="button" id="download">Download feedback</button>
      <p class="status" id="status" role="status" aria-live="polite"></p>
    </section>
    <footer>This packet contains no private Workshop data and sends no information automatically. The downloaded text file is yours to return to the project team.</footer>
  </main>
  <script>
    const clean = (value) => value.replaceAll('\\r', ' ').trim();
    document.querySelector('#download').addEventListener('click', () => {
      const decision = document.querySelector('input[name="decision"]:checked')?.value;
      const role = clean(document.querySelector('#role').value);
      const blocker = clean(document.querySelector('#blocker').value);
      const reason = clean(document.querySelector('#reason').value);
      const status = document.querySelector('#status');
      if (!decision) { status.textContent = 'Choose Send or Revise first.'; return; }
      if (decision === 'Revise' && !blocker && !reason) { status.textContent = 'Name the first blocking issue before downloading.'; return; }
      const text = ['WorkshopLM cold review', '', 'Review ID: ${reviewId}', 'Decision: ' + decision, 'Role: ' + (role || 'Not provided'), 'First blocker: ' + (blocker || 'None'), '', 'Reason:', reason || 'No additional comment.', ''].join('\\n');
      const href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      const link = document.createElement('a'); link.href = href; link.download = 'workshoplm-cold-review.txt'; link.click(); URL.revokeObjectURL(href);
      status.textContent = 'Feedback downloaded. Return that text file to the project team.';
    });
  </script>
</body>
</html>`;
}

async function main() {
  const repository = resolve(process.cwd());
  const source = join(repository, "outputs", "dogfood-ai-collective-chapter-brief");
  const packet = join(source, "review-packet");
  const zipPath = join(source, "workshoplm-ai-collective-cold-review.zip");
  const deckInput = JSON.parse(await readFile(join(source, "deck-input.json"), "utf8")) as { blocks?: unknown[] };
  if (deckInput.blocks?.length !== 8) throw new Error("Cold-review packet requires the current nine-slide Slides artifact.");

  const copies = [
    ["chapter-launch-brief.pdf", "AI-Collective-chapter-launch.pdf"],
    ["chapter-launch-brief.pptx", "AI-Collective-chapter-launch.pptx"],
    ["contact-sheet.png", "contact-sheet.png"],
  ] as const;
  for (const [input] of copies) await requireFile(join(source, input));

  const pages = execFileSync("pdfinfo", [join(source, "chapter-launch-brief.pdf")], { encoding: "utf8" }).match(/^Pages:\s+(\d+)$/m)?.[1];
  if (pages !== "9") throw new Error(`Cold-review PDF has ${pages ?? "an unknown number of"} pages, not 9.`);
  execFileSync("unzip", ["-t", join(source, "chapter-launch-brief.pptx")], { stdio: "ignore" });

  await rm(packet, { recursive: true, force: true });
  await rm(zipPath, { force: true });
  await mkdir(packet, { recursive: true });
  for (const [input, output] of copies) await copyFile(join(source, input), join(packet, output));
  const reviewId = `aic-${(await sha256(join(packet, "AI-Collective-chapter-launch.pdf"))).slice(0, 16)}`;
  await writeFile(join(packet, "START-HERE.html"), reviewHtml(reviewId), "utf8");
  await writeFile(join(packet, "FEEDBACK.txt"), `WorkshopLM cold review\n\nReview ID: ${reviewId}\nDecision: Send / Revise\nRole:\nFirst blocker:\n\nReason:\n`, "utf8");

  const packetFiles = ["START-HERE.html", "AI-Collective-chapter-launch.pdf", "AI-Collective-chapter-launch.pptx", "contact-sheet.png", "FEEDBACK.txt"];
  const hashes = Object.fromEntries(await Promise.all(packetFiles.map(async (file) => [file, await sha256(join(packet, file))])));
  const manifest = { schemaVersion: 2, reviewId, purpose: "Uncoached Send or Revise review of the external WorkshopLM Slides candidate.", privacy: "Contains only the shareable AI Collective brief, its editable handoff, and local feedback tools. No private Workshop data or network submission.", files: hashes };
  await writeFile(join(packet, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  packetFiles.push("manifest.json");
  for (const file of packetFiles) await utimes(join(packet, file), fixedMtime, fixedMtime);

  execFileSync("zip", ["-X", "-q", zipPath, ...packetFiles], { cwd: packet });
  execFileSync("unzip", ["-t", zipPath], { stdio: "ignore" });
  const archived = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  if (archived.join("\n") !== packetFiles.join("\n")) throw new Error("Cold-review ZIP contents do not match the declared packet.");

  process.stdout.write(`${JSON.stringify({ packet: zipPath, reviewId, files: archived, sha256: await sha256(zipPath) }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
