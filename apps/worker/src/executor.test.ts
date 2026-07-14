import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { executeOne } from "./executor.js";
import { applyWorkshopAction, readWorkshopState } from "./workshop-service.js";
describe("worker executor", () => { it("fails queued video honestly when its local renderer fails", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-executor-")); applyWorkshopAction("approveBrief", root); applyWorkshopAction("approveStoryboard", root); applyWorkshopAction("renderVideo", root); const result = await executeOne(root, async () => { throw new Error("renderer unavailable"); }); expect(result.state).toBe("failed"); expect(readWorkshopState(root).videoState).toBe("queued"); await rm(root, { recursive: true, force: true }); }); });
