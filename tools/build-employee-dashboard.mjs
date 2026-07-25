import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dashboardDir = path.join(rootDir, "employee-dashboard");
const matrixName = "AI_EMPLOYEE_GROWTH_MATRIX_2026-07-22.md";
const operationsName = "AI_EMPLOYEE_OPERATIONS.json";
const activityName = "AI_EMPLOYEE_ACTIVITY_LOG.json";
const inboxName = "OWNER_PUBLISHING_INBOX.json";
const ownerActionsName = "OWNER_ACTIONS.json";
const runtimeName = "AI_EMPLOYEE_RUNTIME.json";
const queueName = "AI_EMPLOYEE_WORK_QUEUE.json";
const queueTemplateName = "AI_EMPLOYEE_WORK_QUEUE_TEMPLATE.json";

async function readJson(name) {
  return JSON.parse(await readFile(path.join(rootDir, name), "utf8"));
}

async function readOptionalJson(name, fallback) {
  try {
    return await readJson(name);
  } catch {
    return fallback;
  }
}

function teamForRole(role) {
  if (/分析|検索露出|SEO/.test(role)) return "検索成長";
  if (/教材|利用者リサーチ/.test(role)) return "教材・利用者";
  if (/安全|承認|QA/.test(role)) return "安全・品質";
  if (/教育広報/.test(role)) return "広報・紹介";
  return "発信・編集";
}

function parseEmployees(source) {
  const employees = [];
  for (const line of source.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 5 || !/^L[1-4]$/.test(cells[1])) continue;
    employees.push({
      role: cells[0],
      level: cells[1],
      team: teamForRole(cells[0]),
      evidence: cells[2],
      missing: cells[3],
      promotion_condition: cells[4],
    });
  }
  return employees;
}

async function latestDailyReport() {
  const names = (await readdir(rootDir))
    .filter((name) => /^DAILY_GROWTH_REPORT_\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .sort();
  const name = names.at(-1);
  return name
    ? { name, source: await readFile(path.join(rootDir, name), "utf8") }
    : { name: null, source: "" };
}

function parseSearchReport(report, opportunityMap) {
  const periods = [];
  for (const match of report.matchAll(
    /^\|\s*(直近(?:7|28)日)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|$/gm,
  )) {
    periods.push({
      label: match[1].trim(),
      clicks: match[2].trim(),
      impressions: match[3].trim(),
      ctr: match[4].trim(),
      position: match[5].trim(),
    });
  }

  const finalDate = report.match(/データ最終日:\s*([^\r\n]+)/)?.[1]?.trim() ?? "未確認";
  const bottleneck = opportunityMap.match(/## 現在の詰まり\s+\*\*([^*]+)\*\*/)?.[1]?.trim()
    ?? "未確認";

  return { final_date: finalDate, periods, bottleneck };
}

function tomlValue(source, key) {
  const match = source.match(new RegExp(`^${key}\\s*=\\s*"(.*)"\\s*$`, "m"));
  return match?.[1] ?? null;
}

function japanDateKey(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function localFileHref(file) {
  if (typeof file !== "string" || !file.trim()) return null;
  const normalized = file.trim().replaceAll("\\", "/");
  if (path.isAbsolute(normalized) || normalized.split("/").includes("..")) return null;
  return `../${normalized.split("/").map((part) => encodeURIComponent(part)).join("/")}`;
}

function dueState(dueDate, today) {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}/.test(dueDate)) return "no_date";
  const date = dueDate.slice(0, 10);
  if (date < today) return "overdue";
  if (date === today) return "today";
  return "upcoming";
}

function channelLabel(channel) {
  return {
    x: "X",
    note: "note",
    substack: "Substack",
  }[channel] ?? channel ?? "外部サービス";
}

function ownerActionLabel(action, channel) {
  if (action === "final_publish_in_chrome") {
    return `Chromeで${channelLabel(channel)}の原稿を確認し、問題なければ投稿する`;
  }
  if (action === "final_publish") return "内容を確認し、問題なければ公開する";
  return action || "内容を確認して最終操作を行う";
}

async function readAutomations() {
  const automationRoot = path.join(os.homedir(), ".codex", "automations");
  const automations = [];
  let directories = [];
  try {
    directories = await readdir(automationRoot, { withFileTypes: true });
  } catch {
    return automations;
  }

  for (const entry of directories) {
    if (!entry.isDirectory()) continue;
    const file = path.join(automationRoot, entry.name, "automation.toml");
    try {
      const source = await readFile(file, "utf8");
      const fileStat = await stat(file);
      automations.push({
        id: tomlValue(source, "id") ?? entry.name,
        name: tomlValue(source, "name") ?? entry.name,
        status: tomlValue(source, "status") ?? "UNKNOWN",
        rrule: tomlValue(source, "rrule"),
        updated_at: fileStat.mtime.toISOString(),
        source_file: file,
      });
    } catch {
      // Ignore incomplete automation directories.
    }
  }
  return automations;
}

const [matrix, operations, activity, inbox, ownerActions, runtime, queue, report, automations] = await Promise.all([
  readFile(path.join(rootDir, matrixName), "utf8"),
  readJson(operationsName),
  readJson(activityName),
  readJson(inboxName),
  readOptionalJson(ownerActionsName, {
    schema_version: 1,
    updated_at: null,
    actions: [],
  }),
  readOptionalJson(runtimeName, {
    status: "offline",
    heartbeat_at: null,
    active_zone: "strategy-hub",
    current_task: null,
    recent_events: [],
  }),
  readOptionalJson(queueName, await readJson(queueTemplateName)),
  latestDailyReport(),
  readAutomations(),
]);

let opportunityMap = "";
try {
  opportunityMap = await readFile(path.join(rootDir, "SEARCH_OPPORTUNITY_MAP_2026-07-25.md"), "utf8");
} catch {
  // Search data stays marked as unconfirmed when the map does not exist.
}

const employees = parseEmployees(matrix);
const activities = [...activity.entries].sort((a, b) => {
  const aTime = Date.parse(a.completed_at ?? a.started_at);
  const bTime = Date.parse(b.completed_at ?? b.started_at);
  return bTime - aTime;
});
const publicationEntries = inbox.entries ?? [];
const publishedEntries = inbox.published_entries ?? [];
const today = japanDateKey();

const publishingOwnerTodos = publicationEntries
  .filter((entry) => entry.status === "ready" && entry.handoff_status === "owner_ready")
  .map((entry) => {
    const approvals = Object.values(entry.approvals ?? {});
    const approved = approvals.filter((approval) => approval.decision === "approve").length;
    return {
      id: `publishing:${entry.publication_id}`,
      title: `${entry.target_date ? `${entry.target_date.slice(5).replace("-", "/")}分の` : ""}${channelLabel(entry.channel)}を投稿`,
      category: "発信",
      channel: entry.channel,
      due_at: entry.target_date ?? null,
      due_state: dueState(entry.target_date, today),
      priority_score: Math.max(1, 101 - Number(entry.priority ?? 50)),
      action: ownerActionLabel(entry.owner_action, entry.channel),
      reason: `編集${entry.editorial_score ?? "未採点"}点・安全判定${entry.risk_level ?? "未確認"}・AI承認${approved}/${approvals.length}`,
      source_file: entry.package_file ?? entry.source_file ?? null,
      local_href: localFileHref(entry.package_file ?? entry.source_file),
      status: "pending",
      origin: "publishing_inbox",
    };
  });

const customOwnerTodos = (ownerActions.actions ?? [])
  .filter((action) => !["completed", "cancelled"].includes(action.status))
  .map((action) => ({
    ...action,
    id: `owner:${action.id}`,
    due_state: dueState(action.due_at, today),
    priority_score: Number(action.priority ?? 50),
    local_href: localFileHref(action.source_file),
    status: action.status ?? "pending",
    origin: "owner_actions",
  }));

const queueOwnerTodos = (queue.tasks ?? [])
  .filter((task) => (
    (task.executor === "owner" || task.owner_required === true)
    && !["completed", "cancelled"].includes(task.status)
  ))
  .map((task) => ({
    id: `queue:${task.id}`,
    title: task.title,
    category: task.category ?? "運営",
    channel: null,
    due_at: task.due_at ?? null,
    due_state: dueState(task.due_at, today),
    priority_score: Number(task.priority ?? 50),
    action: task.owner_action ?? task.success_condition,
    reason: task.reason,
    source_file: task.source_file ?? null,
    local_href: localFileHref(task.source_file),
    status: task.status,
    origin: "work_queue",
  }));

const dueOrder = { overdue: 0, today: 1, upcoming: 2, no_date: 3 };
const ownerTodos = [...publishingOwnerTodos, ...customOwnerTodos, ...queueOwnerTodos]
  .sort((a, b) => (
    (dueOrder[a.due_state] ?? 9) - (dueOrder[b.due_state] ?? 9)
    || String(a.due_at ?? "9999-12-31").localeCompare(String(b.due_at ?? "9999-12-31"))
    || (b.priority_score ?? 0) - (a.priority_score ?? 0)
    || a.title.localeCompare(b.title, "ja")
  ));

const sourcePaths = [
  path.join(rootDir, matrixName),
  path.join(rootDir, operationsName),
  path.join(rootDir, activityName),
  path.join(rootDir, inboxName),
  path.join(rootDir, ownerActionsName),
  path.join(rootDir, queueName),
  ...(report.name ? [path.join(rootDir, report.name)] : []),
  ...automations.map((automation) => automation.source_file),
];
if (await stat(path.join(rootDir, runtimeName)).then(() => true).catch(() => false)) {
  sourcePaths.push(path.join(rootDir, runtimeName));
}
const existingSourcePaths = [];
for (const sourcePath of sourcePaths) {
  if (await stat(sourcePath).then(() => true).catch(() => false)) existingSourcePaths.push(sourcePath);
}
const sourceStats = await Promise.all(existingSourcePaths.map((sourcePath) => stat(sourcePath)));
const generatedAt = new Date(Math.max(...sourceStats.map((item) => item.mtimeMs))).toISOString();
const heartbeatAgeSeconds = runtime.heartbeat_at
  ? Math.max(0, Math.round((Date.now() - Date.parse(runtime.heartbeat_at)) / 1000))
  : null;
const supervisorActive = (
  ["starting", "monitoring", "working"].includes(runtime.status)
  && heartbeatAgeSeconds !== null
  && heartbeatAgeSeconds <= operations.runtime.stale_after_seconds
);

const dashboardData = {
  schema_version: 1,
  generated_at: generatedAt,
  operations,
  automations: automations.map(({ source_file: _sourceFile, ...automation }) => automation),
  runtime: {
    ...runtime,
    heartbeat_age_seconds: heartbeatAgeSeconds,
    supervisor_active: supervisorActive,
  },
  queue: {
    ...queue,
    tasks: [...(queue.tasks ?? [])].sort((a, b) => {
      const statusOrder = { working: 0, ready: 1, waiting: 2, watching: 3, blocked: 4, completed: 5 };
      return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9)
        || (b.priority ?? 0) - (a.priority ?? 0);
    }),
  },
  employees,
  activities,
  search: {
    ...parseSearchReport(report.source, opportunityMap),
    source_file: report.name,
  },
  publishing: {
    ready: publicationEntries.filter((entry) => entry.status === "ready").length,
    published: publishedEntries.filter((entry) => entry.status === "published").length,
    green: [...publicationEntries, ...publishedEntries]
      .filter((entry) => entry.risk_level === "green").length,
  },
  owner_todos: {
    items: ownerTodos,
    counts: {
      total: ownerTodos.length,
      overdue: ownerTodos.filter((item) => item.due_state === "overdue").length,
      today: ownerTodos.filter((item) => item.due_state === "today").length,
      upcoming: ownerTodos.filter((item) => item.due_state === "upcoming").length,
    },
  },
  summary: {
    employee_count: employees.length,
    quality_assured_count: employees.filter((employee) => ["L3", "L4"].includes(employee.level)).length,
    trained_count: employees.filter((employee) => employee.level === "L4").length,
    active_automations: operations.ai_automations.filter((operation) =>
      automations.some((automation) => (
        automation.id === operation.id
        && automation.status === "ACTIVE"
      )),
    ).length,
    supervisor_active: supervisorActive,
    ready_tasks: (queue.tasks ?? []).filter((task) => task.status === "ready").length,
    owner_todo_count: ownerTodos.length,
  },
};

const output = `window.EMPLOYEE_DASHBOARD_DATA = ${JSON.stringify(dashboardData, null, 2)};\n`;
await mkdir(dashboardDir, { recursive: true });
await writeFile(path.join(dashboardDir, "dashboard-data.js"), output, "utf8");

console.log("けいさんランド AI社員ダッシュボード更新");
console.log(`AI社員: ${dashboardData.summary.employee_count}名`);
console.log(`自律監督: ${dashboardData.summary.supervisor_active ? "稼働中" : "停止"}`);
console.log(`AI判断: ${dashboardData.summary.active_automations}/${operations.ai_automations.length}`);
console.log(`仕事待ち: ${dashboardData.summary.ready_tasks}件`);
console.log(`社長ToDo: ${dashboardData.summary.owner_todo_count}件`);
console.log(`活動履歴: ${activities.length}件`);
console.log(`出力: ${path.join("employee-dashboard", "dashboard-data.js")}`);
