import { createHash } from "node:crypto";
import { basename, extname } from "node:path";

export type NativeLocator = { kind: "page" | "time" | "section"; value: string };

export type NormalizedChunk = {
  sourceId: string;
  chunkId: string;
  sourceName: string;
  text: string;
  nativeLocator?: NativeLocator;
};

export type NormalizedSource = {
  sourceId: string;
  sourceName: string;
  mimeType: string;
  chunks: NormalizedChunk[];
};

export type SourceInput = { name: string; content: string };

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const normalizeText = (value: string) => value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
const mimeFor = (name: string) => ({ ".md": "text/markdown", ".txt": "text/plain", ".csv": "text/csv" })[extname(name).toLowerCase()] ?? "text/plain";

function markdownParts(content: string): Array<{ text: string; locator?: NativeLocator }> {
  const sections = content.split(/(?=^#{1,6}\s+)/m);
  return sections.map((section) => {
    const heading = section.match(/^#{1,6}\s+(.+)$/m)?.[1];
    return { text: normalizeText(section), locator: heading ? ({ kind: "section", value: heading.trim() } satisfies NativeLocator) : undefined };
  }).filter((part) => part.text.length > 0);
}

function textParts(content: string): Array<{ text: string; locator?: NativeLocator }> {
  return content.split(/\n(?=\[\d{2}:\d{2}\])/).map((line) => {
    const text = normalizeText(line);
    const timestamp = text.match(/^\[(\d{2}:\d{2})\]/)?.[1];
    return { text, locator: timestamp ? ({ kind: "time", value: timestamp } satisfies NativeLocator) : undefined };
  }).filter((part) => part.text.length > 0);
}

function csvParts(content: string): Array<{ text: string; locator?: NativeLocator }> {
  const rows = content.trim().split(/\r?\n/);
  const [header, ...data] = rows;
  return data.map((row, index) => ({ text: normalizeText(`${header}\n${row}`), locator: { kind: "section", value: `row ${index + 2}` } }));
}

/** Normalizes only source-proven locators; missing locators remain absent by design. */
export function normalizeSource(input: SourceInput): NormalizedSource {
  const sourceName = basename(input.name);
  const sourceId = `src_${digest(`${sourceName}\n${input.content.replace(/\r\n/g, "\n")}`).slice(0, 16)}`;
  const ext = extname(sourceName).toLowerCase();
  const parts = ext === ".md" ? markdownParts(input.content) : ext === ".csv" ? csvParts(input.content) : textParts(input.content);
  return {
    sourceId,
    sourceName,
    mimeType: mimeFor(sourceName),
    chunks: parts.map((part, index) => ({
      sourceId,
      sourceName,
      text: part.text,
      ...(part.locator ? { nativeLocator: part.locator } : {}),
      chunkId: `chk_${digest(`${sourceId}\n${index}\n${part.text}`).slice(0, 20)}`,
    })),
  };
}

export const snippetHash = (snippet: string) => digest(snippet);
