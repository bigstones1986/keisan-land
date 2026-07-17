import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const netlify = await readFile(path.join(rootDir, "netlify.toml"), "utf8");

const buildSection = netlify.match(/\[build\]([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
if (!/^\s*publish\s*=\s*["']dist["']\s*$/mu.test(buildSection)) {
  errors.push("netlify.toml: 公開先はdistにしてください");
}
if (!/^\s*command\s*=\s*["']npm run qa["']\s*$/mu.test(buildSection)) {
  errors.push("netlify.toml: 品質検査を通してから公開してください");
}

const processingSection = netlify.match(/\[build\.processing\.html\]([\s\S]*?)(?=\r?\n\[|$)/)?.[1] ?? "";
if (!/^\s*pretty_urls\s*=\s*false\s*$/mu.test(processingSection)) {
  errors.push("netlify.toml: Pretty URLsをfalseにしてください");
}

const htmlFiles = (await readdir(rootDir)).filter((name) => name.endsWith(".html"));
const canonicalPaths = new Map();
const sources = new Map();

for (const file of htmlFiles) {
  const source = await readFile(path.join(rootDir, file), "utf8");
  sources.set(file, source);
  const canonical = source.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  if (canonical) canonicalPaths.set(file, new URL(canonical).pathname);
}

for (const [file, source] of sources) {
  for (const match of source.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const raw = match[1];
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) continue;
    const pathname = raw.split("#")[0].split("?")[0].replace(/^\/+/, "");
    if (!pathname || path.extname(pathname)) continue;

    const htmlTarget = `${pathname}.html`;
    if (!canonicalPaths.has(htmlTarget)) continue;
    const canonicalPath = canonicalPaths.get(htmlTarget);
    if (canonicalPath.endsWith(".html")) {
      errors.push(`${file}: canonicalが.htmlのページへ拡張子なしでリンクしています（${raw}）`);
    }
  }
}

console.log("けいさんランド Netlify SEO設定QA");
console.log(`対象: netlify.toml / HTML ${htmlFiles.length}ページ`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 公開先、Pretty URLs、canonicalと内部リンクのURL形式を確認しました。");
