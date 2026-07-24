import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

async function loadJson(name) {
  return JSON.parse(await readFile(path.join(rootDir, name), "utf8"));
}

function add(message) {
  errors.push(message);
}

function insideRoot(name) {
  const resolved = path.resolve(rootDir, name);
  return resolved.startsWith(`${rootDir}${path.sep}`) ? resolved : null;
}

function sourceHash(buffer) {
  const normalized = buffer.toString("utf8").replace(/\r\n?/gu, "\n");
  return `sha256:${createHash("sha256").update(normalized, "utf8").digest("hex")}`;
}

const [inbox, policy] = await Promise.all([
  loadJson("OWNER_PUBLISHING_INBOX.json"),
  loadJson("AUTO_PUBLISH_POLICY.json"),
]);

if (inbox.schema_version !== 1) add("投稿ボックスのschema_versionが不正です");
if (inbox.final_external_action !== "owner_only") add("投稿ボックスの最終投稿者が社長ではありません");
if (policy.external_publish_enabled) add("外部自動投稿が有効になっています");
if (policy.owner_charter?.final_external_action !== "owner_only") {
  add("公開ポリシーの最終投稿者が社長ではありません");
}
if (!policy.owner_charter?.ai_must_not_click_publish_schedule_or_send) {
  add("AI社員の確定操作禁止が公開ポリシーにありません");
}

const publicationIds = new Set();
const priorities = new Set();
const counts = { x: 0, substack: 0, note: 0 };
const publishedCounts = { x: 0, substack: 0, note: 0 };
const expectedRoles = {
  editorial: "編集長",
  qa: "QA担当（品質保証担当）",
  safety: "安全・ブランド監査責任者",
  handoff: "AI公開承認責任者",
};

for (const entry of inbox.entries ?? []) {
  const label = entry.publication_id ?? "publication_id未設定";
  if (!entry.publication_id || publicationIds.has(entry.publication_id)) {
    add(`${label}: publication_idが未設定または重複しています`);
  }
  publicationIds.add(entry.publication_id);

  if (!Number.isInteger(entry.priority) || priorities.has(entry.priority)) {
    add(`${label}: priorityが不正または重複しています`);
  }
  priorities.add(entry.priority);

  if (!(entry.channel in counts)) add(`${label}: 未対応の媒体です`);
  else counts[entry.channel] += 1;
  if (entry.status !== "ready" || entry.handoff_status !== "owner_ready") {
    add(`${label}: 社長引き渡し可能な状態ではありません`);
  }
  if (entry.editorial_score < 90) add(`${label}: 編集評価が90点未満です`);
  if (entry.risk_level !== "green") add(`${label}: Green以外は投稿ボックスへ入れられません`);
  if (entry.owner_action !== "final_publish_in_chrome") {
    add(`${label}: 社長の最終操作が定義されていません`);
  }

  const sourcePath = insideRoot(entry.source_file);
  const packagePath = insideRoot(entry.package_file);
  if (!sourcePath || !packagePath) {
    add(`${label}: プロジェクト外のファイルが指定されています`);
    continue;
  }

  let source;
  try {
    source = await readFile(sourcePath);
    await readFile(packagePath);
  } catch {
    add(`${label}: 原稿または投稿パッケージを読み込めません`);
    continue;
  }

  const actualHash = sourceHash(source);
  if (entry.source_hash !== actualHash) add(`${label}: 承認後に原稿が変更されています`);
  const text = source.toString("utf8");
  if (!text.includes(`channel: ${entry.channel}`)) add(`${label}: 原稿の媒体が一致しません`);
  if (!text.includes(`date: ${entry.target_date}`)) add(`${label}: 原稿の日付が一致しません`);
  if (!text.includes("status: ready")) add(`${label}: 原稿がreadyではありません`);
  if (!text.includes("handoff_status: owner_ready")) {
    add(`${label}: 原稿に社長引き渡し状態がありません`);
  }
  if (!text.includes(`editorial_score: ${entry.editorial_score}`)) {
    add(`${label}: 原稿と投稿ボックスの編集評価が一致しません`);
  }

  const reviewIds = new Set();
  for (const [key, role] of Object.entries(expectedRoles)) {
    const approval = entry.approvals?.[key];
    if (!approval) {
      add(`${label}: ${key}承認がありません`);
      continue;
    }
    if (approval.role !== role) add(`${label}: ${key}承認の担当が違います`);
    if (approval.decision !== "approve") add(`${label}: ${key}承認がapproveではありません`);
    if (approval.content_hash !== actualHash) add(`${label}: ${key}承認のハッシュが違います`);
    if (!approval.review_id || reviewIds.has(approval.review_id)) {
      add(`${label}: review_idが未設定または重複しています`);
    }
    reviewIds.add(approval.review_id);
  }
}

for (const entry of inbox.published_entries ?? []) {
  const label = entry.publication_id ?? "publication_id未設定";
  if (!entry.publication_id || publicationIds.has(entry.publication_id)) {
    add(`${label}: publication_idが未設定または重複しています`);
  }
  publicationIds.add(entry.publication_id);

  if (!(entry.channel in publishedCounts)) add(`${label}: 未対応の公開媒体です`);
  else publishedCounts[entry.channel] += 1;
  if (entry.status !== "published" || entry.handoff_status !== "completed") {
    add(`${label}: 公開済み状態が不正です`);
  }
  if (entry.owner_action !== "owner_published_in_chrome") {
    add(`${label}: 社長による公開操作が記録されていません`);
  }
  if (entry.risk_level !== "green") add(`${label}: 公開済み記録がGreenではありません`);
  if (!entry.published_at || Number.isNaN(Date.parse(entry.published_at))) {
    add(`${label}: 公開日時が不正です`);
  }
  if (!entry.public_url?.startsWith("https://")) add(`${label}: 公開URLが不正です`);
  if (!entry.review_24h || !entry.review_7d) add(`${label}: 公開後確認日がありません`);
  if (!entry.verification?.title_verified) add(`${label}: 公開タイトルが未確認です`);
  if (!Array.isArray(entry.verification?.links_verified) || entry.verification.links_verified.length === 0) {
    add(`${label}: 公開リンクが未確認です`);
  }

  const sourcePath = insideRoot(entry.source_file);
  const packagePath = insideRoot(entry.package_file);
  if (!sourcePath || !packagePath) {
    add(`${label}: 公開記録がプロジェクト外を参照しています`);
    continue;
  }

  let source;
  try {
    source = await readFile(sourcePath);
    await readFile(packagePath);
  } catch {
    add(`${label}: 公開原稿または投稿パッケージを読み込めません`);
    continue;
  }

  const actualHash = sourceHash(source);
  if (entry.source_hash !== actualHash) add(`${label}: 公開時原稿のハッシュが一致しません`);

  if (entry.approvals) {
    const reviewIds = new Set();
    for (const [key, role] of Object.entries(expectedRoles)) {
      const approval = entry.approvals[key];
      if (!approval) {
        add(`${label}: 公開前の${key}承認がありません`);
        continue;
      }
      if (approval.role !== role) add(`${label}: 公開前の${key}承認担当が違います`);
      if (approval.decision !== "approve") add(`${label}: 公開前の${key}承認がapproveではありません`);
      if (approval.content_hash !== actualHash) add(`${label}: 公開前の${key}承認ハッシュが違います`);
      if (!approval.review_id || reviewIds.has(approval.review_id)) {
        add(`${label}: 公開前review_idが未設定または重複しています`);
      }
      reviewIds.add(approval.review_id);
    }
  } else if (entry.approval_mode !== "owner_published_verified_draft") {
    add(`${label}: 公開前承認または社長公開記録がありません`);
  }
}

if (counts.x > 5) add("Xの完成稿が5本を超えています");
if (counts.substack > 2) add("Substackの完成稿が2本を超えています");
if (counts.note > 2) add("noteの完成稿が2本を超えています");

console.log("けいさんランド 社長用投稿ボックスQA");
console.log(`完成稿: ${(inbox.entries ?? []).length}`);
console.log(`内訳: X ${counts.x} / Substack ${counts.substack} / note ${counts.note}`);
console.log(`公開済み: ${(inbox.published_entries ?? []).length}`);
console.log(
  `公開内訳: X ${publishedCounts.x} / Substack ${publishedCounts.substack} / note ${publishedCounts.note}`,
);
console.log(`エラー: ${errors.length}`);
for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: AI審査済み完成稿と社長の最終投稿ルールを確認しました。");
