import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ORIGIN = "https://keisan-land.netlify.app";
const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(toolsDir, "..");
const htmlFiles = (await readdir(rootDir))
  .filter((name) => name.endsWith(".html"))
  .sort();

const errors = [];
const warnings = [];
const pages = [];

function addIssue(list, file, message) {
  list.push(`${file}: ${message}`);
}

function getMatches(source, pattern) {
  return Array.from(source.matchAll(pattern));
}

function getSingleContent(source, pattern, file, label) {
  const matches = getMatches(source, pattern);
  if (matches.length !== 1) {
    addIssue(errors, file, `${label} は1つ必要です（現在 ${matches.length}）`);
    return "";
  }
  return matches[0][1].trim();
}

function deploymentPath(file) {
  if (file === "index.html") return "/";
  if (file === "step-calculation.html") return "/step-calculation";
  return `/${file}`;
}

function localTargetExists(rawTarget) {
  const withoutHash = rawTarget.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  if (!withoutQuery) return true;

  let target = withoutQuery;
  if (target.startsWith(SITE_ORIGIN)) {
    target = new URL(target).pathname;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("//")) {
    return true;
  }

  const normalized = target.replace(/^\//, "");
  if (normalized === "" || normalized === "step-calculation") return true;
  return knownFiles.has(normalized);
}

const knownFiles = new Set(
  (await readdir(rootDir, { recursive: true })).map((name) => name.replaceAll("\\", "/"))
);

for (const file of htmlFiles) {
  const source = await readFile(path.join(rootDir, file), "utf8");
  const title = getSingleContent(source, /<title[^>]*>([\s\S]*?)<\/title>/gi, file, "title");
  const description = getSingleContent(
    source,
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/gi,
    file,
    "meta description"
  );
  const canonical = getSingleContent(
    source,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/gi,
    file,
    "canonical"
  );
  const h1Count = getMatches(source, /<h1\b[^>]*>/gi).length;
  const robotsCount = getMatches(source, /<meta\s+name=["']robots["'][^>]*>/gi).length;

  if (h1Count !== 1) addIssue(errors, file, `h1 は1つ必要です（現在 ${h1Count}）`);
  if (robotsCount !== 1) addIssue(errors, file, `robots meta は1つ必要です（現在 ${robotsCount}）`);
  if (title && (title.length < 12 || title.length > 70)) {
    addIssue(warnings, file, `title の長さは ${title.length} 文字です`);
  }
  if (description && (description.length < 45 || description.length > 160)) {
    addIssue(warnings, file, `meta description の長さは ${description.length} 文字です`);
  }

  const expectedCanonical = `${SITE_ORIGIN}${deploymentPath(file)}`;
  if (canonical && canonical !== expectedCanonical) {
    addIssue(errors, file, `canonical が公開URLと不一致です（${canonical}）`);
  }

  for (const match of getMatches(source, /<(a|link)\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    if (!localTargetExists(match[2])) addIssue(errors, file, `リンク先が見つかりません（${match[2]}）`);
  }
  for (const match of getMatches(source, /<(img|script)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    if (!localTargetExists(match[2])) addIssue(errors, file, `読み込み先が見つかりません（${match[2]}）`);
  }
  for (const match of getMatches(source, /<img\b([^>]*)>/gi)) {
    if (!/\balt=["'][^"']*["']/i.test(match[1])) {
      addIssue(errors, file, "画像に alt 属性がありません");
    }
  }
  for (const match of getMatches(source, /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(match[1]);
    } catch {
      addIssue(errors, file, "JSON-LD が正しいJSONではありません");
    }
  }

  pages.push({ file, title, description, canonical });
}

for (const field of ["title", "description", "canonical"]) {
  const seen = new Map();
  for (const page of pages) {
    if (!page[field]) continue;
    if (seen.has(page[field])) {
      addIssue(errors, page.file, `${field} が ${seen.get(page[field])} と重複しています`);
    } else {
      seen.set(page[field], page.file);
    }
  }
}

const sitemap = await readFile(path.join(rootDir, "sitemap.xml"), "utf8");
const sitemapUrls = new Set(getMatches(sitemap, /<loc>([^<]+)<\/loc>/gi).map((match) => match[1].trim()));
for (const page of pages) {
  if (page.canonical && !sitemapUrls.has(page.canonical)) {
    addIssue(errors, page.file, "canonical URL が sitemap.xml にありません");
  }
}
for (const url of sitemapUrls) {
  if (!pages.some((page) => page.canonical === url)) {
    addIssue(errors, "sitemap.xml", `HTML側に同じ canonical がないURLです（${url}）`);
  }
}

console.log(`けいさんランド サイト点検: ${pages.length}ページ`);
console.log(`エラー: ${errors.length} / 注意: ${warnings.length}`);

if (warnings.length) {
  console.log("\n注意:");
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
if (errors.length) {
  console.error("\nエラー:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("\nPASS: title・説明文・canonical・h1・リンク・画像・sitemap を確認しました。");
}
