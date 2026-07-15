import { resolve } from "node:path";
import { applyWorkshopAction, createImageBatch, generateAssetPlan, generateOutput, generateStoryboard, lockManualStyle, readWorkshopState } from "../../../worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.argv[2] ?? "");
  let state = readWorkshopState(root);
  if (!state.briefApproved) state = applyWorkshopAction("approveBrief", root);
  if (!state.style || state.style.stale) state = lockManualStyle({}, root);
  await generateOutput("deck", root);
  await generateOutput("infographic", root);
  createImageBatch(root);
  generateAssetPlan(root);
  generateStoryboard(root);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
