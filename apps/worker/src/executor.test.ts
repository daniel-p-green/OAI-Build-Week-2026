import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { executeOne } from "./executor.js";
import { applyWorkshopAction, readWorkshopState } from "./workshop-service.js";
describe("worker executor", () => { it("requeues one failed render with retained error, then blocks after the retry budget", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-executor-")); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); applyWorkshopAction("approveStoryboard", root); applyWorkshopAction("renderVideo", root); const first = await executeOne(root, async () => { throw new Error("renderer unavailable"); }); expect(first.state).toBe("failed"); expect(readWorkshopState(root).videoState).toBe("queued"); const second = await executeOne(root, async () => { throw new Error("renderer unavailable"); }); expect(second.state).toBe("failed"); expect(readWorkshopState(root).videoState).toBe("blocked"); await rm(root, { recursive: true, force: true }); }); });
