import { rm } from "node:fs/promises";
import { resolve } from "node:path";

// Next writes route-type declarations to .next even when visual tests use a
// separate production dist directory. Remove only those generated declarations
// so a repeated visual run cannot typecheck stale duplicate files.
await rm(resolve(process.cwd(), ".next", "types"), { recursive: true, force: true });
