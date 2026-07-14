import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export type HostTurn = {
  workshopId: string;
  taskId: string;
  turnId: string;
  itemId: string;
  role: "user" | "assistant";
  origin: "typed" | "native_voice" | "realtime_fallback";
  content: string;
  createdAt: string;
};

type RepositoryData = { taskLinks: Record<string, string>; turns: HostTurn[] };
const emptyData = (): RepositoryData => ({ taskLinks: {}, turns: [] });
const identity = (turn: Pick<HostTurn, "taskId" | "turnId" | "itemId">) => `${turn.taskId}:${turn.turnId}:${turn.itemId}`;

/** Small durable fixture repository; production storage will use the same identity rule in SQLite. */
export class TurnRepository {
  constructor(private readonly path: string) {}

  async append(turn: HostTurn): Promise<{ inserted: boolean; turn: HostTurn }> {
    const data = await this.read();
    const linkedWorkshop = data.taskLinks[turn.taskId];
    if (linkedWorkshop && linkedWorkshop !== turn.workshopId) throw new Error(`Task ${turn.taskId} is already linked to another Workshop`);
    data.taskLinks[turn.taskId] = turn.workshopId;
    const existing = data.turns.find((candidate) => identity(candidate) === identity(turn));
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(turn)) throw new Error(`Conflicting duplicate host turn: ${identity(turn)}`);
      return { inserted: false, turn: existing };
    }
    data.turns.push(turn);
    await this.write(data);
    return { inserted: true, turn };
  }

  async list(workshopId: string): Promise<HostTurn[]> {
    const data = await this.read();
    return data.turns.filter((turn) => turn.workshopId === workshopId).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || identity(a).localeCompare(identity(b)));
  }

  private async read(): Promise<RepositoryData> {
    try { return JSON.parse(await readFile(this.path, "utf8")) as RepositoryData; }
    catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyData();
      throw error;
    }
  }

  private async write(data: RepositoryData): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    const temporary = `${this.path}.tmp`;
    await writeFile(temporary, `${JSON.stringify(data)}\n`, "utf8");
    await rename(temporary, this.path);
  }
}
