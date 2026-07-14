import { resolve } from "node:path";
import { executeOne } from "../apps/worker/src/executor.ts";
import { applyWorkshopAction } from "../apps/worker/src/workshop-service.ts";

async function main() {
  const root = resolve(process.cwd(), ".workshoplm");
  applyWorkshopAction("approveBrief", root);
  applyWorkshopAction("approveStoryboard", root);
  applyWorkshopAction("renderVideo", root);
  console.log(JSON.stringify(await executeOne(root)));
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
