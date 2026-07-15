import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);
const read = async (relative: string) => readFile(new URL(relative, root), "utf8");
describe("plugin contract", () => {
  it("keeps the plugin local and optional-adapter-safe", async () => {
    const manifest = JSON.parse(await read(".codex-plugin/plugin.json"));
    const mcp = JSON.parse(await read(".mcp.json"));
    const skill = await read("skills/workshoplm/SKILL.md");
    expect(manifest.version).toBe("0.1.2");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.capabilities).toEqual(expect.arrayContaining(["Interactive", "Read", "Write"]));
    expect(mcp.mcpServers.workshoplm.command).toBe("node");
    expect(mcp.mcpServers.workshoplm.cwd).toBe(".");
    expect(mcp.mcpServers.workshoplm.env_vars).toEqual(["WORKSHOPLM_DATA_ROOT"]);
    expect(JSON.stringify(mcp)).not.toMatch(/token|authorization|https?:/i);
    expect(skill).toContain("visual Outputs");
    expect(skill).not.toMatch(/Studio|Sources rail/);
  });
});
