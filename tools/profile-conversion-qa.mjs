import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditName = "PROFILE_CONVERSION_AUDIT_2026-07-15.md";
const agentsName = "AGENTS.md";
const growthName = "GROWTH_OPERATING_SYSTEM.md";
const errors = [];

async function load(name) {
  return readFile(path.join(rootDir, name), "utf8");
}

function requireText(file, source, text, message) {
  if (!source.includes(text)) errors.push(`${file}: ${message}`);
}

const [audit, agents, growth] = await Promise.all([
  load(auditName),
  load(agentsName),
  load(growthName),
]);

for (const url of [
  "https://x.com/TakaAirdropblo1",
  "https://stone1986.substack.com/",
  "https://note.com/tkbigstone1986",
]) {
  requireText(auditName, audit, url, `公開プロフィールURLがありません（${url}）`);
}

const firstTimeUrl = "https://keisan-land.netlify.app/first-time.html";
const targetUrl = "https://keisan-land.netlify.app/grade1-addition-word-problems.html";
if ((audit.match(new RegExp(firstTimeUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length < 5) {
  errors.push(`${auditName}: はじめての方への固定URLが3媒体と固定投稿に揃っていません`);
}
requireText(auditName, audit, targetUrl, "重点教材への直接URLがありません");
requireText(auditName, audit, "プロフィールはサイト全体の入口、個別投稿は内容が一致する教材への直接入口", "プロフィールと投稿の役割分担がありません");
requireText(auditName, audit, "外部プロフィールは変更していない", "外部変更の未実施記録がありません");
requireText(auditName, audit, "実行直前に人間が確認", "外部変更前の確認ルールがありません");

const xBio = audit.match(/### X[\s\S]*?- 自己紹介:\r?\n\r?\n> ([^\r\n]+)/)?.[1] ?? "";
if (!xBio) errors.push(`${auditName}: Xの自己紹介案がありません`);
if (Array.from(xBio).length > 140) errors.push(`${auditName}: Xの自己紹介案が運用基準の140文字を超えています`);
for (const value of ["小学生向け無料計算ドリル", "登録不要", "印刷OK"]) {
  if (!xBio.includes(value)) errors.push(`${auditName}: Xの自己紹介案に「${value}」がありません`);
}

for (const source of [audit, growth]) {
  if (/成績が上がる|苦手がなくなる|必ずできる|検索1位/u.test(source)) {
    errors.push("プロフィール運用文書に保証表現があります");
    break;
  }
}

requireText(agentsName, agents, "表示名、自己紹介、固定URL", "発信戦略責任者にプロフィール点検がありません");
requireText(agentsName, agents, "人間の直前確認なしに、外部サービスのプロフィール", "無確認変更の禁止がありません");
requireText(growthName, growth, "### プロフィール導線", "検索成長OSにプロフィール導線がありません");
requireText(growthName, growth, firstTimeUrl, "プロフィールの固定URL方針がありません");

console.log("けいさんランド プロフィール導線QA");
console.log(`対象: ${agentsName} / ${growthName} / ${auditName}`);
console.log(`X自己紹介: ${Array.from(xBio).length}文字`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 3媒体の役割、プロフィール文、URL、保証表現、人間確認を確認しました。");
