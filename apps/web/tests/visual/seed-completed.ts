import { resolve } from "node:path";
import { applyWorkshopAction, createImageBatch, generateAssetPlan, generateOutput, generateStoryboard, lockManualStyle, readWorkshopState } from "../../../worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.argv[2] ?? "");
  let state = readWorkshopState(root);
  if (!state.briefApproved) state = applyWorkshopAction("approveBrief", root);
  if (!state.style || state.style.stale) state = lockManualStyle({}, root);
  if (!state.outputs.some((output) => output.type === "deck" && !output.stale)) state = await generateOutput("deck", root);
  if (!state.outputs.some((output) => output.type === "infographic" && !output.stale)) state = await generateOutput("infographic", root);
  if (!state.imageBatch || state.imageBatch.stale) state = createImageBatch(root);
  if (!state.assetPlan || state.assetPlan.stale) state = generateAssetPlan(root);
  if (!state.storyboard.panels.length || state.storyboard.stale || state.storyboard.panels.length !== state.assetPlan?.items.length || state.storyboard.panels.some((panel) => !panel.id.startsWith("storyboard-v"))) generateStoryboard(root);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
