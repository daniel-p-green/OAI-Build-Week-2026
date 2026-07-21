import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v5");
const inputName = "final-mix-mono.flac";
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
const bytes = await readFile(resolve(outputRoot, inputName));
const form = new FormData();
form.set("model", "gpt-4o-mini-transcribe");
form.set("response_format", "json");
form.set("language", "en");
form.set("prompt", "This is a WorkshopLM demo with a Cedar voiceover over the original song Different Window. Preserve WorkshopLM, Codex, GPT-5.6 Terra, HyperFrames, Brief, Storyboard, Video, Map, and Source when they are spoken.");
form.set("file", new Blob([bytes]), basename(inputName));
const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
  method: "POST",
  headers: { Authorization: `Bearer ${apiKey}` },
  body: form
});
if (!response.ok) throw new Error(`Transcription failed: HTTP ${response.status} ${(await response.text()).slice(0, 800)}`);
const result = await response.json();
const record = { model: "gpt-4o-mini-transcribe", requestId: response.headers.get("x-request-id"), input: inputName, text: result.text ?? "" };
await writeFile(resolve(outputRoot, "transcription-final-mix.json"), `${JSON.stringify(record, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
