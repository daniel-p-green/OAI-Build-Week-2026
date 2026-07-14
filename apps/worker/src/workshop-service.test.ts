import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { applyWorkshopAction, readWorkshopState } from "./workshop-service.js";
describe("Workshop service", () => { it("persists two approval gates and blocks video until the storyboard is approved", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-service-")); expect(() => applyWorkshopAction("renderVideo", root)).toThrow(/storyboard/); applyWorkshopAction("approveBrief", root); expect(applyWorkshopAction("approveStoryboard", root).storyboardApproved).toBe(true); expect(applyWorkshopAction("renderVideo", root).videoState).toBe("queued"); expect(readWorkshopState(root).briefApproved).toBe(true); await rm(root, { recursive: true, force: true }); }); });
