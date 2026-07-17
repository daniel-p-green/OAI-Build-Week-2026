import { resolve } from "node:path";
import { applyWorkshopAction, approveVisualDna, createImageBatch, createSketch, createVisualDna, generateAssetPlan, generateAudioOverview, generateOutput, generateStoryboard, lockManualStyle, readWorkshopState } from "../../../worker/src/workshop-service.ts";
import { seedJudgeProviderImages } from "../../../../scripts/seed-judge-images.ts";

async function main() {
  const root = resolve(process.argv[2] ?? "");
  let state = readWorkshopState(root);
  if (!state.briefApproved) state = applyWorkshopAction("approveBrief", root);
  if (!state.style || state.style.stale) state = lockManualStyle({}, root);
  if (!state.sketch || state.sketch.stale) state = createSketch(root);
  if (!state.visualDna || state.visualDna.stale) state = createVisualDna(root);
  if (!state.visualDna?.approved) state = approveVisualDna(root);
  if (!state.assetPlan || state.assetPlan.stale) state = generateAssetPlan(root);
  if (!state.imageBatch || state.imageBatch.stale) state = createImageBatch(root);
  if (state.imageBatch.panels.some((panel) => panel.state !== "generated")) {
    await seedJudgeProviderImages(root);
    state = readWorkshopState(root);
  }
  if (!state.outputs.some((output) => output.type === "deck" && !output.stale)) state = await generateOutput("deck", root);
  if (!state.outputs.some((output) => output.type === "infographic" && !output.stale)) state = await generateOutput("infographic", root);
  if (!state.audioOverviews.some((overview) => !overview.stale)) state = generateAudioOverview(root);
  if (!state.storyboard.panels.length || state.storyboard.stale || state.storyboard.panels.length !== state.assetPlan?.items.length || state.storyboard.panels.some((panel) => !panel.id.startsWith("storyboard-v") || !panel.imageRelativePath)) generateStoryboard(root);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
