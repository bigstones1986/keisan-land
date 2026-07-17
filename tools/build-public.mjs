import { cp, mkdir, readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "dist");
const errors = [];

if (path.dirname(outputDir) !== rootDir || path.basename(outputDir) !== "dist") {
  throw new Error(`公開先が想定外です: ${outputDir}`);
}

const rootEntries = await readdir(rootDir, { withFileTypes: true });
const publicRootFiles = rootEntries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) =>
    /\.(?:html|js|css|xml|txt|ico)$/i.test(name)
    || /^favicon.*\.png$/i.test(name)
    || /^ogp-.*\.png$/i.test(name),
  )
  .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }));

const publicDirectories = ["images", "media"];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const file of publicRootFiles) {
  await cp(path.join(rootDir, file), path.join(outputDir, file));
}

for (const directory of publicDirectories) {
  await cp(path.join(rootDir, directory), path.join(outputDir, directory), { recursive: true });
}

async function listFiles(directory, prefix = "") {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name);
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }
  return files;
}

function localTarget(raw) {
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(raw)) return null;
  const cleaned = raw.split("#")[0].split("?")[0];
  if (!cleaned || cleaned === "/") return "index.html";
  return cleaned.replace(/^\/+/, "");
}

const deployedFiles = (await listFiles(outputDir)).sort((a, b) =>
  a.localeCompare(b, "ja", { numeric: true }),
);
const deployedSet = new Set(deployedFiles);
const forbiddenExtensions = new Set([".md", ".mjs", ".json", ".toml", ".zip", ".log"]);
const forbiddenNames = [
  "AGENTS.md",
  "PROJECT_STATUS.md",
  "gsc-oauth-client.json",
  "gsc-token.json",
  "package.json",
];

for (const file of deployedFiles) {
  if (forbiddenExtensions.has(path.extname(file).toLowerCase())) {
    errors.push(`公開不要な形式が含まれています: ${file}`);
  }
}

for (const name of forbiddenNames) {
  if (deployedSet.has(name)) errors.push(`内部ファイルが含まれています: ${name}`);
}

for (const required of ["index.html", "style.css", "script.js", "sitemap.xml", "robots.txt"]) {
  if (!deployedSet.has(required)) errors.push(`必須ファイルがありません: ${required}`);
}

const htmlFiles = deployedFiles.filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const source = await readFile(path.join(outputDir, file), "utf8");
  for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const target = localTarget(match[1]);
    if (!target || target.endsWith("/")) continue;
    if (!path.posix.extname(target) && deployedSet.has(`${target}.html`)) continue;
    if (!deployedSet.has(target)) errors.push(`${file}: 公開先にないファイルを参照しています（${match[1]}）`);
  }
}

for (const directory of publicDirectories) {
  const directoryPath = path.join(outputDir, directory);
  try {
    const directoryStat = await stat(directoryPath);
    if (!directoryStat.isDirectory()) errors.push(`公開用ディレクトリではありません: ${directory}`);
  } catch {
    errors.push(`公開用ディレクトリがありません: ${directory}`);
  }
}

console.log("けいさんランド 公開ファイル作成");
console.log(`出力: dist / ${deployedFiles.length}ファイル / HTML ${htmlFiles.length}ページ`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log("PASS: 教材ページと必要な資産だけを公開用フォルダへ作成しました。");
}
