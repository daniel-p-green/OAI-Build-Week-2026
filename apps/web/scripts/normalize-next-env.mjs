import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const path = resolve(process.cwd(), "next-env.d.ts");
const source = await readFile(path, "utf8");
await writeFile(path, source.replace("./.next-playwright/types/routes.d.ts", "./.next/types/routes.d.ts"));
