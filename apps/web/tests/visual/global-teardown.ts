import { rm } from "node:fs/promises";
import { resolve } from "node:path";

export default async function globalTeardown() {
  await rm(resolve(process.cwd(), "../..", ".workshoplm-visual-test"), { recursive: true, force: true });
}
