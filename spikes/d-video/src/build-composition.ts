import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type StoryboardPanel = {
  id: string;
  durationSeconds: number;
  caption: string;
  narration: string;
  audioPath: string;
  claimIds: string[];
};

export type ApprovedStoryboard = {
  id: string;
  version: number;
  status: "approved" | "draft";
  stale: boolean;
  designVersion: string;
  panels: StoryboardPanel[];
};

export type RenderScene = StoryboardPanel & {
  startSeconds: number;
  endSeconds: number;
  storyboardVersion: number;
  designVersion: string;
  voiceDisclosure: "AI-generated voice";
};

export type RenderComposition = {
  id: string;
  durationSeconds: number;
  scenes: RenderScene[];
};

export function buildComposition(storyboard: ApprovedStoryboard): RenderComposition {
  if (storyboard.status !== "approved") throw new Error("Storyboard must be approved before rendering");
  if (storyboard.stale) throw new Error("Storyboard is stale and must be refreshed before rendering");
  if (storyboard.panels.length !== 3) throw new Error("Spike D requires exactly three storyboard panels");

  let startSeconds = 0;
  const scenes = storyboard.panels.map((panel) => {
    if (!Number.isFinite(panel.durationSeconds) || panel.durationSeconds <= 0) {
      throw new Error(`Panel ${panel.id} needs a positive duration`);
    }
    if (!panel.caption || !panel.audioPath || !panel.narration) {
      throw new Error(`Panel ${panel.id} is missing caption, narration, or audio`);
    }
    const scene: RenderScene = {
      ...panel,
      startSeconds,
      endSeconds: startSeconds + panel.durationSeconds,
      storyboardVersion: storyboard.version,
      designVersion: storyboard.designVersion,
      voiceDisclosure: "AI-generated voice",
    };
    startSeconds = scene.endSeconds;
    return scene;
  });
  return { id: `${storyboard.id}-v${storyboard.version}`, durationSeconds: startSeconds, scenes };
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function buildIndexHtml(composition: RenderComposition): string {
  const panels = composition.scenes.map((scene, index) => `
      <section id="${escapeHtml(scene.id)}" class="clip panel panel-${index + 1}" data-start="${scene.startSeconds}" data-duration="${scene.durationSeconds}" data-track-index="1">
        <div class="eyebrow">WORKSHOPLM · APPROVED STORYBOARD V${scene.storyboardVersion}</div>
        <h1>${escapeHtml(scene.caption)}</h1>
        <p class="narration">${escapeHtml(scene.narration)}</p>
        <div class="trace">${scene.claimIds.map(escapeHtml).join(" · ")} → ${escapeHtml(scene.designVersion)}</div>
        <div class="disclosure">Narration: ${scene.voiceDisclosure}</div>
      </section>
      <audio id="${escapeHtml(scene.id)}-audio" class="clip" src="${escapeHtml(scene.audioPath)}" data-start="${scene.startSeconds}" data-duration="${scene.durationSeconds}" data-track-index="2" data-volume="0.12"></audio>`).join("\n");

  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
*{box-sizing:border-box}html,body,#root{margin:0;width:1920px;height:1080px;overflow:hidden;background:#1b2028;color:#f6f3eb;font-family:Arial,sans-serif}.panel{position:absolute;inset:0;padding:104px 150px;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 80% 10%,#5f8376 0%,transparent 32%),#1b2028}.panel-2{background:radial-gradient(circle at 16% 80%,#e87544 0%,transparent 32%),#1b2028}.panel-3{background:radial-gradient(circle at 82% 80%,#f6f3eb55 0%,transparent 28%),#1b2028}.eyebrow,.trace{font-size:25px;letter-spacing:.12em;color:#f6f3ebbb}.eyebrow{color:#e87544;font-weight:700}.panel h1{font-size:78px;line-height:1.06;max-width:1370px;margin:38px 0 28px}.narration{font-size:34px;max-width:1160px;line-height:1.35}.trace{margin-top:60px}.disclosure{position:absolute;right:150px;bottom:105px;border:1px solid #f6f3eb88;border-radius:99px;padding:14px 20px;font-size:23px}
</style></head><body>
<main id="root" data-composition-id="workshoplm-spike-d" data-start="0" data-duration="${composition.durationSeconds}" data-width="1920" data-height="1080" data-fps="30">${panels}
</main><script>window.__timelines=window.__timelines||{};window.__timelines["workshoplm-spike-d"]=gsap.timeline({paused:true});</script></body></html>`;
}

const directory = resolve(fileURLToPath(new URL("..", import.meta.url)));

export async function writeComposition(): Promise<RenderComposition> {
  const storyboard = JSON.parse(await readFile(resolve(directory, "storyboard.json"), "utf8")) as ApprovedStoryboard;
  const composition = buildComposition(storyboard);
  await writeFile(resolve(directory, "index.html"), `${buildIndexHtml(composition)}\n`);
  return composition;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const composition = await writeComposition();
  console.log(JSON.stringify(composition, null, 2));
}
