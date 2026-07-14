import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(process.cwd(), ".workshoplm");
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
await writeFile(resolve(root, "fixture.json"), JSON.stringify({ workshopId: "workshop-build-week", title: "WorkshopLM Build Week", sources: 3 }, null, 2));
console.log("Reset deterministic WorkshopLM fixture.");
