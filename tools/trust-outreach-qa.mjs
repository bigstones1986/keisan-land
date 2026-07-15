import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const planName = "TRUST_AND_OUTREACH_PLAN_2026-07-16_TO_07-31.md";
const reportName = "COMPETITOR_TRUST_REPORT_2026-07-15.md";
const candidateReviewName = "OUTREACH_CANDIDATE_REVIEW_2026-07-16.md";
const mediaPitchName = "MEDIA_PITCH_KODOMO_IT_2026-07-16.md";
const agentsName = "AGENTS.md";
const growthName = "GROWTH_OPERATING_SYSTEM.md";
const teacherName = "teacher-print.html";
const contactName = "contact.html";
const privacyName = "privacy.html";
const targetUrl = "https://keisan-land.netlify.app/grade1-addition-word-problems.html";
const errors = [];

async function load(name) {
  return readFile(path.join(rootDir, name), "utf8");
}

function requireText(file, source, text, message) {
  if (!source.includes(text)) errors.push(`${file}: ${message}`);
}

const [plan, report, candidateReview, mediaPitch, agents, growth, teacher, contact, privacy] = await Promise.all([
  load(planName),
  load(reportName),
  load(candidateReviewName),
  load(mediaPitchName),
  load(agentsName),
  load(growthName),
  load(teacherName),
  load(contactName),
  load(privacyName),
]);

requireText(agentsName, agents, "## 教育広報・紹介担当", "教育広報・紹介担当が定義されていません");
requireText(agentsName, agents, "外部フォームやメッセージの送信を、人間の最終確認なしで実行する", "無確認送信の禁止がありません");
requireText(growthName, growth, "### 教育広報・自然な紹介", "検索成長OSに教育広報の運用がありません");
requireText(growthName, growth, "外部送信は週1件以下", "外部送信の上限がありません");
requireText(agentsName, agents, "## 利用者リサーチ・導入支援担当", "利用者リサーチ担当が定義されていません");
requireText(agentsName, agents, "実際には届いていない感想や利用例を作る", "架空の利用例を禁止していません");
requireText(agentsName, agents, "掲載許可を、問い合わせへの返信許可と同じものとして扱う", "公開許可の分離ルールがありません");
requireText(growthName, growth, "### 利用者の声と導入支援", "利用者の声を改善へ戻す運用がありません");
requireText(growthName, growth, "contact.html#teacher-feedback", "先生向け感想導線が成長OSにありません");

requireText(teacherName, teacher, "使ってみた感想をお寄せください", "先生向けページに感想案内がありません");
requireText(teacherName, teacher, "contact.html#teacher-feedback", "先生向けページから安全な連絡案内へ移動できません");
requireText(teacherName, teacher, "許可なくサイトや発信へ掲載することはありません", "無断掲載を防ぐ案内がありません");
requireText(contactName, contact, 'id="teacher-feedback"', "先生・支援者向けの連絡位置がありません");
requireText(contactName, contact, "学年と単元", "教材改善に必要な最小情報がありません");
requireText(contactName, contact, "改めて明確な許可を確認します", "掲載前の別許可が案内されていません");
requireText(privacyName, privacy, "お問い合わせメールについて", "メールで受け取る情報の説明がありません");
requireText(privacyName, privacy, "本人の明確な許可なく", "感想の無断公開を防ぐ方針がありません");

requireText(planName, plan, targetUrl, "重点教材URLがありません");
requireText(planName, plan, "文部科学省「たのしくまなび隊」 | 高い | 保留", "法人要件のある候補が保留になっていません");
requireText(planName, plan, "全国学習塾協会「塾ツール」 | 中〜高 | 保留", "事業者情報が必要な候補が保留になっていません");
requireText(planName, plan, "エレファンキューブ「無料教材リンク集」 | 高い | 連絡しない", "営業を断る候補が除外されていません");
requireText(planName, plan, "算願「学習に役立つリンク集」 | 高い | 連絡しない", "相互リンクを募集しない候補が除外されていません");
requireText(planName, plan, "直前確認必須", "外部送信前の直前確認がありません");
requireText(planName, plan, "## 送信前ゲート", "送信前ゲートがありません");
requireText(planName, plan, "こどもとIT | 高い | 個別提案を準備・未送信", "最優先の編集媒体候補が記録されていません");

requireText(candidateReviewName, candidateReview, "送信状態: 未送信", "候補レビューの送信状態が未送信ではありません");
requireText(candidateReviewName, candidateReview, "こどもとIT | 高い", "最優先候補がありません");
requireText(candidateReviewName, candidateReview, "EDUPEDIA | 中〜高", "教育実践媒体の保留判断がありません");
requireText(candidateReviewName, candidateReview, "ICT教育ニュース | 中", "個人発信を受け付けない候補の判断がありません");
requireText(candidateReviewName, candidateReview, "おやこイベント.com | 低〜中", "イベント媒体の対象外判断がありません");
requireText(candidateReviewName, candidateReview, "https://edu.watch.impress.co.jp/docs/common/contact.html", "最優先候補の公式確認先がありません");

requireText(mediaPitchName, mediaPitch, "送信状態: 未送信", "編集部向け提案が未送信になっていません");
requireText(mediaPitchName, mediaPitch, "[要入力: 差出人氏名]", "差出人氏名の確認欄がありません");
requireText(mediaPitchName, mediaPitch, "[要入力: 返信用メールアドレス]", "返信先の確認欄がありません");
requireText(mediaPitchName, mediaPitch, targetUrl, "重点教材URLがありません");
requireText(mediaPitchName, mediaPitch, "media/grade1-addition-word-problems-20260716.png", "実画面画像が指定されていません");
requireText(mediaPitchName, mediaPitch, "人間が宛先、件名、本文、添付を確認し、送信を承認した", "送信直前の人間承認がありません");

for (const [file, source] of [
  [candidateReviewName, candidateReview],
  [mediaPitchName, mediaPitch],
]) {
  if (/送信済み|掲載確定|検索1位|必ず掲載|必ず届く/u.test(source)) {
    errors.push(`${file}: 未確認の送信・掲載・成果を断定しています`);
  }
}

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
console.log(`対象: ${agentsName} / ${growthName} / ${reportName} / ${planName} / ${candidateReviewName} / ${mediaPitchName} / ${teacherName} / ${contactName} / ${privacyName}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 紹介候補の適合性、送信禁止判断、日別計画、人間確認を確認しました。");
