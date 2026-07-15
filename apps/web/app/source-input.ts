export type SourceInputKind = "text" | "url" | "pdf";

export function sourceInputKind(value: string): SourceInputKind {
  const input = value.trim();
  if (/^https?:\/\/\S+$/i.test(input)) return "url";
  if (!input.includes("\n") && input.startsWith("/") && /\.pdf$/i.test(input)) return "pdf";
  return "text";
}

export function sourceTitleFromText(value: string): string {
  const firstLine = value.split(/\r?\n/).map((line) => line.replace(/^\s*[#>*•-]+\s*/, "").replace(/\s+/g, " ").trim()).find(Boolean);
  if (!firstLine) return "Pasted notes";
  return firstLine.length > 64 ? `${firstLine.slice(0, 63).trimEnd()}…` : firstLine;
}
