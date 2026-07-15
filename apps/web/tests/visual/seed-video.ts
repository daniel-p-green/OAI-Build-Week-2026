import { resolve } from "node:path";
import { executeOne } from "../../../worker/src/executor.ts";
import { applyWorkshopAction, readWorkshopState } from "../../../worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.argv[2] ?? "");
  const state = readWorkshopState(root);
  if (!state.briefApproved || !state.style || state.style.stale || state.storyboard.stale || !state.storyboard.panels.length) {
    throw new Error("A current completed visual fixture is required before rendering video.");
  }
  if (!state.storyboardApproved) applyWorkshopAction("approveStoryboard", root);
  applyWorkshopAction("renderVideo", root);
  const result = await executeOne(root);
  if (result.state !== "succeeded" || readWorkshopState(root).videoState !== "rendered") {
    throw new Error(result.error ?? "The local video fixture did not render.");
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
