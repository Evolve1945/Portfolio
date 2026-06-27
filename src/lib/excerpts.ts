import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "content", "excerpts");

// Read a sanitised code excerpt (committed under content/excerpts/) at build time.
export function readExcerpt(file: string): string | null {
  const p = path.join(dir, file);
  if (!fs.existsSync(p)) return null;
  return fs.readFileSync(p, "utf8");
}
