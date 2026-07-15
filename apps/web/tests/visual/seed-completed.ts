import { resolve } from "node:path";
import { createImageBatch, generateAssetPlan, generateOutput, generateStoryboard, readWorkshopState } from "../../../worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.argv[2] ?? "");
  const state = readWorkshopState(root);
  if (!state.briefApproved || !state.style || state.style.stale) throw new Error("Keyboard approval and style selection did not persist.");
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
