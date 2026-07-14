import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);
const read = async (relative: string) => readFile(new URL(relative, root), "utf8");
describe("plugin contract", () => {
  it("keeps the plugin local and optional-adapter-safe", async () => {
    const manifest = JSON.parse(await read(".codex-plugin/plugin.json"));
    const mcp = JSON.parse(await read(".mcp.json"));
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.capabilities).toEqual(expect.arrayContaining(["Interactive", "Read", "Write"]));
    expect(mcp.workshoplm.command).toBe("node");
    expect(JSON.stringify(mcp)).not.toMatch(/token|authorization|https?:/i);
  });
});
