type Value = number | string | boolean | object;

/** JS オブジェクトリテラルとして整形 */
export function formatObject(obj: Record<string, Value>, depth = 0): string {
  const entries = Object.entries(obj);
  if (!entries.length) return "{}";
  const parts = entries.map(([k, v]) => `${k}: ${formatValue(v, depth + 1)}`);
  const inline = `{ ${parts.join(", ")} }`;
  if (inline.length <= 60) return inline;
  const pad = "  ".repeat(depth + 1);
  return `{\n${parts.map((p) => `${pad}${p},`).join("\n")}\n${"  ".repeat(depth)}}`;
}

function formatValue(v: Value, depth: number): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "object") return formatObject(v as Record<string, Value>, depth);
  return String(v);
}

/** 各行にインデントを付与 */
export function indentBlock(code: string, depth: number): string {
  const pad = "  ".repeat(depth);
  return code
    .split("\n")
    .map((l) => (l ? pad + l : l))
    .join("\n");
}

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
