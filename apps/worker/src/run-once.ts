import { resolve } from "node:path";
import { executeOne } from "./executor.js";
const root = resolve(process.env.WORKSHOPLM_DATA_ROOT ?? ".workshoplm");
executeOne(root).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error); process.exitCode = 1; });
