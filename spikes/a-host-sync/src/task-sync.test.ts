import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { assertNoCredentials, toSafeAccount } from "./account.js";
import { TurnRepository, type HostTurn } from "./task-sync.js";

const fixture = JSON.parse(await readFile(fileURLToPath(new URL("../fixtures/task-turns.json", import.meta.url)), "utf8")) as Omit<HostTurn, "workshopId">[];
const accountFixture = JSON.parse(await readFile(fileURLToPath(new URL("../fixtures/account-read.json", import.meta.url)), "utf8"));
const makeRepository = async () => new TurnRepository(join(await mkdtemp(join(tmpdir(), "workshoplm-host-")), "turns.json"));

describe("host turn persistence", () => {
  it("persists idempotently in stable task-turn-item order across restart", async () => {
    const repository = await makeRepository();
    const first = { ...fixture[1]!, workshopId: "workshop_1" };
    const second = { ...fixture[0]!, workshopId: "workshop_1" };
    expect((await repository.append(first)).inserted).toBe(true);
    expect((await repository.append(second)).inserted).toBe(true);
    expect((await repository.append(second)).inserted).toBe(false);
    const restarted = new TurnRepository((repository as unknown as { path: string }).path);
    expect((await restarted.list("workshop_1")).map((turn) => turn.turnId)).toEqual(["turn_001", "turn_002"]);
    expect((await restarted.list("workshop_1")).map((turn) => turn.role)).toEqual(["user", "assistant"]);
  });

  it("rejects a task linked to another workshop", async () => {
    const repository = await makeRepository();
    await repository.append({ ...fixture[0]!, workshopId: "workshop_1" });
    await expect(repository.append({ ...fixture[1]!, workshopId: "workshop_2" })).rejects.toThrow("another Workshop");
  });

  it("maps only safe account state and rejects token-shaped values", () => {
    expect(toSafeAccount(accountFixture)).toEqual({ accountType: "chatgpt", email: "fixture@example.test", planType: "plus" });
    expect(() => assertNoCredentials({ account: { accessToken: "eyJabc.def.ghi" } })).toThrow("forbidden field");
    expect(() => assertNoCredentials({ account: { label: "Bearer sk-private-secret" } })).toThrow("token-shaped");
  });
});
