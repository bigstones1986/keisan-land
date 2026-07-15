import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const planName = "TRUST_AND_OUTREACH_PLAN_2026-07-16_TO_07-31.md";
const reportName = "COMPETITOR_TRUST_REPORT_2026-07-15.md";
const agentsName = "AGENTS.md";
const growthName = "GROWTH_OPERATING_SYSTEM.md";
const targetUrl = "https://keisan-land.netlify.app/grade1-addition-word-problems.html";
const errors = [];

async function load(name) {
  return readFile(path.join(rootDir, name), "utf8");
}

function requireText(file, source, text, message) {
  if (!source.includes(text)) errors.push(`${file}: ${message}`);
}

const [plan, report, agents, growth] = await Promise.all([
  load(planName),
  load(reportName),
  load(agentsName),
  load(growthName),
]);

requireText(agentsName, agents, "## 教育広報・紹介担当", "教育広報・紹介担当が定義されていません");
requireText(agentsName, agents, "外部フォームやメッセージの送信を、人間の最終確認なしで実行する", "無確認送信の禁止がありません");
requireText(growthName, growth, "### 教育広報・自然な紹介", "検索成長OSに教育広報の運用がありません");
requireText(growthName, growth, "外部送信は週1件以下", "外部送信の上限がありません");

requireText(planName, plan, targetUrl, "重点教材URLがありません");
requireText(planName, plan, "文部科学省「たのしくまなび隊」 | 高い | 保留", "法人要件のある候補が保留になっていません");
requireText(planName, plan, "全国学習塾協会「塾ツール」 | 中〜高 | 保留", "事業者情報が必要な候補が保留になっていません");
requireText(planName, plan, "エレファンキューブ「無料教材リンク集」 | 高い | 連絡しない", "営業を断る候補が除外されていません");
requireText(planName, plan, "算願「学習に役立つリンク集」 | 高い | 連絡しない", "相互リンクを募集しない候補が除外されていません");
requireText(planName, plan, "直前確認必須", "外部送信前の直前確認がありません");
requireText(planName, plan, "## 送信前ゲート", "送信前ゲートがありません");

const scheduledDates = [...plan.matchAll(/^\| 7\/(\d{1,2}) \|/gm)].map((match) => Number(match[1]));
const expectedDates = Array.from({ length: 16 }, (_, index) => index + 16);
if (scheduledDates.join(",") !== expectedDates.join(",")) {
  errors.push(`${planName}: 7月16日から31日までの日別作業が揃っていません`);
}

const message = plan.match(/```text\r?\n([\s\S]*?)\r?\n```/)?.[1] ?? "";
if (!message) errors.push(`${planName}: 個別案内文がありません`);
if (Array.from(message).length > 420) errors.push(`${planName}: 個別案内文が長すぎます`);
if (!message.includes(targetUrl)) errors.push(`${planName}: 個別案内文に重点教材URLがありません`);
if (!message.includes("返信は不要")) errors.push(`${planName}: 返信を強制しない案内になっていません`);
if (/成績が上がる|苦手がなくなる|必ずできる|検索1位/u.test(message)) {
  errors.push(`${planName}: 個別案内文に保証表現があります`);
}

for (const url of [
  "https://www.sangan.jp/sansu/bunt.htm",
  "https://startoo.co/workbook/84416/",
  "https://mameppu.com/math_word3/",
  "https://nikobane.com/sansuu-print-tashizan-hikizan-erabu/",
]) {
  requireText(reportName, report, url, `競合調査URLがありません（${url}）`);
}
requireText(reportName, report, "Search Consoleが認識する外部リンクは0件", "現在の外部信頼の基準値がありません");
requireText(reportName, report, "大量PDFの急造", "競合模倣を避ける判断がありません");

console.log("けいさんランド 信頼・紹介運用QA");
console.log(`対象: ${agentsName} / ${growthName} / ${reportName} / ${planName}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 紹介候補の適合性、送信禁止判断、日別計画、人間確認を確認しました。");
