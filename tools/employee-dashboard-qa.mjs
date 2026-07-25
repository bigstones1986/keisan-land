import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

async function load(relativePath) {
  try {
    return await readFile(path.join(rootDir, relativePath), "utf8");
  } catch {
    errors.push(`${relativePath}: ファイルを読み込めません`);
    return "";
  }
}

function requireText(name, source, text, message) {
  if (!source.includes(text)) errors.push(`${name}: ${message}`);
}

const [html, css, app, dataSource, operationsSource, activitySource] = await Promise.all([
  load("employee-dashboard/index.html"),
  load("employee-dashboard/dashboard.css"),
  load("employee-dashboard/dashboard.js"),
  load("employee-dashboard/dashboard-data.js"),
  load("AI_EMPLOYEE_OPERATIONS.json"),
  load("AI_EMPLOYEE_ACTIVITY_LOG.json"),
]);

let data = null;
let operations = null;
let activity = null;
try {
  const jsonSource = dataSource
    .replace(/^window\.EMPLOYEE_DASHBOARD_DATA\s*=\s*/, "")
    .replace(/;\s*$/, "");
  data = JSON.parse(jsonSource);
  operations = JSON.parse(operationsSource);
  activity = JSON.parse(activitySource);
} catch (error) {
  errors.push(`JSON: ${error.message}`);
}

for (const text of [
  "AI社員ダッシュボード",
  "data-tab=\"employees\"",
  "data-tab=\"operations\"",
  "data-tab=\"history\"",
  "employee-dashboard/dashboard-data.js".split("/").at(-1),
]) {
  requireText("employee-dashboard/index.html", html, text, `必須表示「${text}」がありません`);
}

for (const text of [
  "renderSummary",
  "renderEmployees",
  "renderOperations",
  "renderHistory",
  "currentShift",
  "escapeHtml",
]) {
  requireText("employee-dashboard/dashboard.js", app, text, `必須処理「${text}」がありません`);
}

for (const text of [
  "@media (max-width: 720px)",
  ".shift-timeline",
  ".employee-card",
  ".activity-entry",
]) {
  requireText("employee-dashboard/dashboard.css", css, text, `必須スタイル「${text}」がありません`);
}

if (/https?:\/\//i.test(html)) {
  errors.push("employee-dashboard/index.html: ローカル専用画面に外部読込があります");
}

if (operations) {
  if (operations.shifts?.length !== 4) {
    errors.push(`AI_EMPLOYEE_OPERATIONS.json: 4交代ではありません（${operations.shifts?.length ?? 0}件）`);
  }
  const automationIds = new Set(operations.shifts?.map((shift) => shift.automation_id));
  if (automationIds.size !== operations.shifts?.length) {
    errors.push("AI_EMPLOYEE_OPERATIONS.json: 自動勤務IDが重複しています");
  }
  if ((operations.guardrails?.length ?? 0) < 5) {
    errors.push("AI_EMPLOYEE_OPERATIONS.json: 暴走防止ルールが不足しています");
  }
}

if (activity) {
  for (const entry of activity.entries ?? []) {
    for (const field of ["id", "shift_id", "started_at", "status", "roles", "title", "summary", "qa", "handoff"]) {
      if (!entry[field] || (Array.isArray(entry[field]) && entry[field].length === 0)) {
        errors.push(`AI_EMPLOYEE_ACTIVITY_LOG.json: ${entry.id ?? "IDなし"}の${field}がありません`);
      }
    }
  }
}

if (data) {
  if (data.employees?.length !== 16) {
    errors.push(`dashboard-data.js: AI社員が16名ではありません（${data.employees?.length ?? 0}名）`);
  }
  if (data.summary?.trained_count !== data.employees?.filter((employee) => employee.level === "L4").length) {
    errors.push("dashboard-data.js: L4と育成済み人数が一致しません");
  }
  if (data.summary?.active_automations !== 4) {
    errors.push(`dashboard-data.js: 自動勤務が全件有効ではありません（${data.summary?.active_automations ?? 0}/4）`);
  }
  if ((data.activities?.length ?? 0) < 2) {
    errors.push("dashboard-data.js: 初期活動履歴が不足しています");
  }
}

const automationDir = path.join(os.homedir(), ".codex", "automations");
for (const id of operations?.shifts?.map((shift) => shift.automation_id) ?? []) {
  try {
    const automation = await readFile(path.join(automationDir, id, "automation.toml"), "utf8");
    requireText(`automation:${id}`, automation, "status = \"ACTIVE\"", "自動勤務が有効ではありません");
    requireText(`automation:${id}`, automation, "AI_EMPLOYEE_ACTIVITY_LOG.json", "活動ログへの記録指示がありません");
    requireText(`automation:${id}`, automation, "build-employee-dashboard.mjs", "ダッシュボード更新指示がありません");
  } catch {
    errors.push(`automation:${id}: 自動勤務設定が見つかりません`);
  }
}

console.log("けいさんランド AI社員ダッシュボードQA");
console.log(`AI社員: ${data?.employees?.length ?? 0}`);
console.log(`自動勤務: ${data?.summary?.active_automations ?? 0}/${operations?.shifts?.length ?? 0}`);
console.log(`活動履歴: ${data?.activities?.length ?? 0}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log("PASS: 育成状況、4交代勤務、活動履歴、暴走防止を確認しました。");
}
