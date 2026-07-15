import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const root = new URL("../../../", import.meta.url);
const read = async (relative: string) => readFile(new URL(relative, root), "utf8");
describe("plugin contract", () => {
  it("keeps the plugin local and optional-adapter-safe", async () => {
    const manifest = JSON.parse(await read(".codex-plugin/plugin.json"));
    const mcp = JSON.parse(await read(".mcp.json"));
    const apps = JSON.parse(await read(".app.json"));
    const skill = await read("skills/workshoplm/SKILL.md");
    expect(manifest.version).toBe("0.1.3");
    expect(manifest.skills).toBe("./skills/");
    expect(manifest.interface.capabilities).toEqual(expect.arrayContaining(["Interactive", "Read", "Write"]));
    expect(mcp.mcpServers.workshoplm.command).toBe("node");
    expect(mcp.mcpServers.workshoplm.cwd).toBe(".");
    expect(mcp.mcpServers.workshoplm.env_vars).toEqual(["WORKSHOPLM_DATA_ROOT"]);
    expect(JSON.stringify(mcp)).not.toMatch(/token|authorization|https?:/i);
    expect(apps).toEqual({ apps: {
      granola: { id: "asdk_app_697761cab6f48191b5ed345919a3ce8b", optional: true, category: "Meeting notes" },
      google_drive: { id: "connector_5f3c8c41a1e54ad7a76272c89e2554fa", optional: true, category: "Company docs" },
    } });
    expect(apps).not.toHaveProperty("widgets");
    expect(apps).not.toHaveProperty("dependencies");
    expect(skill).toContain("visual Outputs");
    expect(skill).not.toMatch(/Studio|Sources rail/);
  });
});
