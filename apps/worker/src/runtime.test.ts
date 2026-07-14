import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { storeArtifact } from "./artifacts/local-artifact-store.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { enqueue, leaseNext } from "./queue.js";
describe("local runtime", () => {
  it("enables WAL and leases idempotent jobs", () => { const db = openLocalDatabase(":memory:"); migrate(db); db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run("w1", "Test", new Date().toISOString()); expect(enqueue(db, { id: "j1", workshopId: "w1", kind: "deck", inputKey: "same", payload: {} })).toBe("j1"); expect(enqueue(db, { id: "j2", workshopId: "w1", kind: "deck", inputKey: "same", payload: {} })).toBe("j1"); expect(leaseNext(db)?.id).toBe("j1"); });
  it("stores a hash-addressed artifact atomically", async () => { const root = await mkdtemp(join(tmpdir(), "workshoplm-")); const stored = await storeArtifact(root, "brief", Buffer.from("evidence"), "text/plain"); expect(await readFile(join(root, stored.relativePath), "utf8")).toBe("evidence"); expect(stored.sha256).toMatch(/^[a-f0-9]{64}$/); await rm(root, { recursive: true, force: true }); });
});
