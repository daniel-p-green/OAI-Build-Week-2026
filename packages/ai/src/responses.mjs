export function responsesOutputText(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (typeof payload.output_text === "string" && payload.output_text.trim()) return payload.output_text;
  if (!Array.isArray(payload.output)) return null;

  const parts = payload.output.flatMap((item) => {
    if (!item || typeof item !== "object" || !Array.isArray(item.content)) return [];
    return item.content.flatMap((content) => {
      if (!content || typeof content !== "object" || content.type !== "output_text") return [];
      return typeof content.text === "string" && content.text.trim() ? [content.text] : [];
    });
  });
  return parts.length ? parts.join("") : null;
}
