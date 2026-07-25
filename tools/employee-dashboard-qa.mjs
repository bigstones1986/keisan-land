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

const [
  html,
  css,
  app,
  dataSource,
  operationsSource,
  activitySource,
  queueTemplateSource,
  ownerActionsSource,
  launcher,
  powerShellLauncher,
  runtimeSource,
  runtimeStarter,
  stopLauncher,
  autostartInstaller,
  autostartRemover,
  ignoreSource,
] = await Promise.all([
  load("employee-dashboard/index.html"),
  load("employee-dashboard/dashboard.css"),
  load("employee-dashboard/dashboard.js"),
  load("employee-dashboard/dashboard-data.js"),
  load("AI_EMPLOYEE_OPERATIONS.json"),
  load("AI_EMPLOYEE_ACTIVITY_LOG.json"),
  load("AI_EMPLOYEE_WORK_QUEUE_TEMPLATE.json"),
  load("OWNER_ACTIONS.json"),
  load("open-ai-employee-dashboard.cmd"),
  load("open-ai-employee-dashboard.ps1"),
  load("tools/ai-company-runtime.mjs"),
  load("tools/start-ai-company-runtime.ps1"),
  load("stop-ai-company.cmd"),
  load("install-ai-company-autostart.ps1"),
  load("uninstall-ai-company-autostart.ps1"),
  load(".gitignore"),
]);

let data = null;
let operations = null;
let activity = null;
let queueTemplate = null;
let ownerActions = null;
try {
  const jsonSource = dataSource
    .replace(/^window\.EMPLOYEE_DASHBOARD_DATA\s*=\s*/, "")
    .replace(/;\s*$/, "");
  data = JSON.parse(jsonSource);
  operations = JSON.parse(operationsSource);
  activity = JSON.parse(activitySource);
  queueTemplate = JSON.parse(queueTemplateSource);
  ownerActions = JSON.parse(ownerActionsSource);
} catch (error) {
  errors.push(`JSON: ${error.message}`);
}

for (const text of [
  "AI社員ダッシュボード",
  "data-tab=\"employees\"",
  "data-tab=\"owner-todos\"",
  "data-tab=\"operations\"",
  "data-tab=\"history\"",
  "id=\"office-floor\"",
  "id=\"terminal-stream\"",
  "id=\"work-queue\"",
  "id=\"owner-todo-list\"",
  "employee-dashboard/dashboard-data.js".split("/").at(-1),
]) {
  requireText("employee-dashboard/index.html", html, text, `必須表示「${text}」がありません`);
}

for (const text of [
  "renderSummary",
  "renderEmployees",
  "renderOperations",
  "renderHistory",
  "renderOffice",
  "renderQueue",
  "renderOwnerTodos",
  "refreshLiveData",
  "escapeHtml",
]) {
  requireText("employee-dashboard/dashboard.js", app, text, `必須処理「${text}」がありません`);
}

for (const text of [
  "@media (max-width: 720px)",
  ".shift-timeline",
  ".employee-card",
  ".activity-entry",
  ".office-floor",
  ".employee-avatar",
  "@keyframes employee-bob",
  ".terminal-stream",
  ".queue-card",
  ".owner-todo-card",
  ".owner-todo-summary",
]) {
  requireText("employee-dashboard/dashboard.css", css, text, `必須スタイル「${text}」がありません`);
}

if (/https?:\/\//i.test(html)) {
  errors.push("employee-dashboard/index.html: ローカル専用画面に外部読込があります");
}

if (launcher.trim().split(/\r?\n/).length !== 1) {
  errors.push("open-ai-employee-dashboard.cmd: Windows用の1行起動形式ではありません");
}
requireText(
  "open-ai-employee-dashboard.cmd",
  launcher,
  "powershell.exe -NoProfile -ExecutionPolicy Bypass",
  "PowerShell起動処理がありません",
);
for (const text of [
  "build-employee-dashboard.mjs",
  "start-ai-company-runtime.ps1",
  "employee-dashboard\\index.html",
  "Start-Process",
  "Test-Path",
]) {
  requireText(
    "open-ai-employee-dashboard.ps1",
    powerShellLauncher,
    text,
    `起動処理「${text}」がありません`,
  );
}

if (operations) {
  if (operations.workstations?.length !== 4) {
    errors.push(`AI_EMPLOYEE_OPERATIONS.json: 作業エリアが4つではありません（${operations.workstations?.length ?? 0}件）`);
  }
  if (operations.ai_automations?.length !== 2) {
    errors.push(`AI_EMPLOYEE_OPERATIONS.json: AI判断担当が2つではありません（${operations.ai_automations?.length ?? 0}件）`);
  }
  const automationIds = new Set(operations.ai_automations?.map((automation) => automation.id));
  if (automationIds.size !== operations.ai_automations?.length) {
    errors.push("AI_EMPLOYEE_OPERATIONS.json: AI判断担当IDが重複しています");
  }
  if ((operations.guardrails?.length ?? 0) < 8) {
    errors.push("AI_EMPLOYEE_OPERATIONS.json: 暴走防止ルールが不足しています");
  }
  for (const field of [
    "heartbeat_seconds",
    "stale_after_seconds",
    "dashboard_refresh_seconds",
    "dashboard_qa_minutes",
    "full_qa_hours",
  ]) {
    if (!Number.isFinite(operations.runtime?.[field])) {
      errors.push(`AI_EMPLOYEE_OPERATIONS.json: 常駐設定${field}がありません`);
    }
  }
}

if ((queueTemplate?.tasks?.length ?? 0) < 3) {
  errors.push("AI_EMPLOYEE_WORK_QUEUE_TEMPLATE.json: 初期仕事が不足しています");
}
for (const task of queueTemplate?.tasks ?? []) {
  for (const field of ["id", "title", "priority", "status", "executor", "reason", "success_condition"]) {
    if (task[field] === undefined || task[field] === "") {
      errors.push(`AI_EMPLOYEE_WORK_QUEUE_TEMPLATE.json: ${task.id ?? "IDなし"}の${field}がありません`);
    }
  }
}

if (!Array.isArray(ownerActions?.actions)) {
  errors.push("OWNER_ACTIONS.json: actionsが配列ではありません");
}
for (const action of ownerActions?.actions ?? []) {
  for (const field of ["id", "title", "priority", "status", "action", "reason"]) {
    if (action[field] === undefined || action[field] === "") {
      errors.push(`OWNER_ACTIONS.json: ${action.id ?? "IDなし"}の${field}がありません`);
    }
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
  if (data.summary?.active_automations !== 2) {
    errors.push(`dashboard-data.js: AI判断担当が全件有効ではありません（${data.summary?.active_automations ?? 0}/2）`);
  }
  if ((data.activities?.length ?? 0) < 2) {
    errors.push("dashboard-data.js: 初期活動履歴が不足しています");
  }
  if (!data.runtime || !Array.isArray(data.runtime.recent_events)) {
    errors.push("dashboard-data.js: 常駐エンジン状態がありません");
  }
  if ((data.queue?.tasks?.length ?? 0) < 3) {
    errors.push("dashboard-data.js: 自律仕事キューが不足しています");
  }
  if (!Array.isArray(data.owner_todos?.items)) {
    errors.push("dashboard-data.js: 社長ToDoがありません");
  } else {
    const dueOrder = { overdue: 0, today: 1, upcoming: 2, no_date: 3 };
    for (let index = 1; index < data.owner_todos.items.length; index += 1) {
      const previous = data.owner_todos.items[index - 1];
      const current = data.owner_todos.items[index];
      if ((dueOrder[previous.due_state] ?? 9) > (dueOrder[current.due_state] ?? 9)) {
        errors.push("dashboard-data.js: 社長ToDoが期限順ではありません");
        break;
      }
    }
    const expectedPublishingTodos = data.publishing?.ready ?? 0;
    const actualPublishingTodos = data.owner_todos.items
      .filter((item) => item.origin === "publishing_inbox").length;
    if (actualPublishingTodos !== expectedPublishingTodos) {
      errors.push(`dashboard-data.js: 投稿待ち${expectedPublishingTodos}件と社長ToDo${actualPublishingTodos}件が一致しません`);
    }
    if (data.summary?.owner_todo_count !== data.owner_todos.items.length) {
      errors.push("dashboard-data.js: 社長ToDo件数が一致しません");
    }
  }
}

const automationDir = path.join(os.homedir(), ".codex", "automations");
for (const id of operations?.ai_automations?.map((automation) => automation.id) ?? []) {
  try {
    const automation = await readFile(path.join(automationDir, id, "automation.toml"), "utf8");
    requireText(`automation:${id}`, automation, "status = \"ACTIVE\"", "自動勤務が有効ではありません");
    requireText(`automation:${id}`, automation, "AI_EMPLOYEE_ACTIVITY_LOG.json", "活動ログへの記録指示がありません");
    requireText(`automation:${id}`, automation, "build-employee-dashboard.mjs", "ダッシュボード更新指示がありません");
  } catch {
    errors.push(`automation:${id}: 自動勤務設定が見つかりません`);
  }
}

for (const text of [
  "AI_EMPLOYEE_RUNTIME.json",
  "AI_EMPLOYEE_WORK_QUEUE.json",
  "heartbeat_at",
  "runCommand",
  "updateQueue",
  "addQaFailureTask",
  "qa:dashboard",
  "qa:site",
]) {
  requireText("tools/ai-company-runtime.mjs", runtimeSource, text, `常駐処理「${text}」がありません`);
}

for (const text of [
  "Start-Process",
  "ai-company-runtime.mjs",
  "Test-AiCompanyRunning",
  "WindowStyle Hidden",
]) {
  requireText("tools/start-ai-company-runtime.ps1", runtimeStarter, text, `起動処理「${text}」がありません`);
}

requireText("stop-ai-company.cmd", stopLauncher, "stop-ai-company.ps1", "停止処理がありません");
for (const text of [
  "GetFolderPath(\"Startup\")",
  "Keisan Land AI Company.lnk",
  "start-ai-company-runtime.ps1",
  "CreateShortcut",
]) {
  requireText("install-ai-company-autostart.ps1", autostartInstaller, text, `自動起動設定「${text}」がありません`);
}
for (const text of [
  "GetFolderPath(\"Startup\")",
  "Keisan Land AI Company.lnk",
  "Remove-Item",
]) {
  requireText("uninstall-ai-company-autostart.ps1", autostartRemover, text, `自動起動解除「${text}」がありません`);
}
for (const name of [
  "AI_EMPLOYEE_RUNTIME.json",
  "AI_EMPLOYEE_WORK_QUEUE.json",
  "employee-dashboard/dashboard-data.js",
]) {
  requireText(".gitignore", ignoreSource, name, `実行時ファイル${name}が除外されていません`);
}

console.log("けいさんランド AI社員ダッシュボードQA");
console.log(`AI社員: ${data?.employees?.length ?? 0}`);
console.log(`自律監督: ${data?.summary?.supervisor_active ? "稼働中" : "停止または未起動"}`);
console.log(`AI判断: ${data?.summary?.active_automations ?? 0}/${operations?.ai_automations?.length ?? 0}`);
console.log(`仕事キュー: ${data?.queue?.tasks?.length ?? 0}`);
console.log(`社長ToDo: ${data?.owner_todos?.items?.length ?? 0}`);
console.log(`活動履歴: ${data?.activities?.length ?? 0}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) {
  process.exitCode = 1;
} else {
  console.log("PASS: 育成状況、自律監督、AI判断、仕事キュー、活動履歴、暴走防止を確認しました。");
}
