import { resolve } from "node:path";
import { executeOne } from "../apps/worker/src/executor.ts";
import { applyWorkshopAction, readWorkshopState } from "../apps/worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.env.WORKSHOPLM_DATA_ROOT ?? resolve(process.cwd(), ".workshoplm", "acceptance"));
  let state = readWorkshopState(root);
  if (!state.briefApproved) state = applyWorkshopAction("approveBrief", root);
  if (!state.style || state.style.stale) state = applyWorkshopAction("lockManualStyle", root);
  if (!state.storyboardApproved) applyWorkshopAction("approveStoryboard", root);
  applyWorkshopAction("renderVideo", root);
  const result = await executeOne(root);
  console.log(JSON.stringify(result));
  if (result.state !== "succeeded") throw new Error(result.error ?? `Video worker ended in ${result.state} state.`);
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
