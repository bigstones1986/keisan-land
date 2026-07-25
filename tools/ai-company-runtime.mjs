import { spawn } from "node:child_process";
import {
  appendFile,
  copyFile,
  readFile,
  rename,
  stat,
  unlink,
  watch,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimePath = path.join(rootDir, "AI_EMPLOYEE_RUNTIME.json");
const queuePath = path.join(rootDir, "AI_EMPLOYEE_WORK_QUEUE.json");
const queueTemplatePath = path.join(rootDir, "AI_EMPLOYEE_WORK_QUEUE_TEMPLATE.json");
const operationsPath = path.join(rootDir, "AI_EMPLOYEE_OPERATIONS.json");
const stopSignalPath = path.join(rootDir, "AI_EMPLOYEE_STOP.signal");
const runtimeLogPath = path.join(rootDir, "ai-company-runtime.log");
const nodeCommand = process.execPath;
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const operations = JSON.parse(await readFile(operationsPath, "utf8"));
const settings = operations.runtime;
const nowIso = () => new Date().toISOString();
const recentEvents = [];
let stopping = false;
let pendingSiteQaAt = null;
let lastDashboardAt = 0;
let lastDashboardQaAt = 0;
let lastFullQaAt = 0;
let lastQueueReviewAt = 0;

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

async function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const previousRuntime = await readJson(runtimePath);
if (
  previousRuntime
  && previousRuntime.pid !== process.pid
  && await isProcessAlive(previousRuntime.pid)
  && (Date.now() - Date.parse(previousRuntime.heartbeat_at)) < (settings.stale_after_seconds * 1000)
) {
  console.log(`AI company runtime is already active (PID ${previousRuntime.pid}).`);
  process.exit(0);
}

if (!await exists(queuePath)) {
  await copyFile(queueTemplatePath, queuePath);
}
if (await exists(stopSignalPath)) {
  await unlink(stopSignalPath);
}

const runtime = {
  schema_version: 1,
  pid: process.pid,
  status: "starting",
  mode: "autonomous_watch",
  started_at: nowIso(),
  heartbeat_at: nowIso(),
  loop_count: 0,
  active_zone: "strategy-hub",
  current_task: {
    id: "runtime-start",
    title: "自律監督エンジンを起動",
    started_at: nowIso(),
  },
  last_completed: null,
  next_ai_pulse: "1時間以内",
  recent_events: [],
  safety: {
    external_publish: "blocked",
    paid_actions: "blocked",
    search_console_submit: "blocked",
  },
};

async function addEvent(level, message, zone = runtime.active_zone) {
  const event = { at: nowIso(), level, message, zone };
  recentEvents.unshift(event);
  recentEvents.splice(30);
  runtime.recent_events = recentEvents;
  await appendFile(runtimeLogPath, `[${event.at}] ${level.toUpperCase()} ${message}\n`, "utf8");
}

async function writeRuntime() {
  runtime.heartbeat_at = nowIso();
  runtime.loop_count += 1;
  await writeJsonAtomic(runtimePath, runtime);
}

async function runCommand(title, command, args, zone) {
  runtime.status = "working";
  runtime.active_zone = zone;
  runtime.current_task = { id: title, title, started_at: nowIso() };
  await addEvent("work", `${title}を開始`, zone);
  await writeRuntime();

  return await new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      windowsHide: true,
      shell: process.platform === "win32" && command === npmCommand,
    });
    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > 12000) output = output.slice(-12000);
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
      if (output.length > 12000) output = output.slice(-12000);
    });
    child.on("error", async (error) => {
      await addEvent("error", `${title}を起動できませんでした: ${error.message}`, zone);
      resolve({ ok: false, code: -1, output });
    });
    child.on("close", async (code) => {
      const ok = code === 0;
      const meaningfulLine = output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .at(-1);
      await addEvent(
        ok ? "success" : "error",
        `${title}: ${ok ? "完了" : `失敗 (${code})`}${meaningfulLine ? ` / ${meaningfulLine}` : ""}`,
        zone,
      );
      resolve({ ok, code, output });
    });
  });
}

async function updateQueue() {
  const queue = await readJson(queuePath, { schema_version: 1, tasks: [] });
  const now = Date.now();
  let changed = false;

  for (const task of queue.tasks) {
    if (
      task.status === "waiting"
      && task.due_at
      && Date.parse(task.due_at) <= now
    ) {
      task.status = "ready";
      changed = true;
      await addEvent("queue", `仕事を開始可能へ変更: ${task.title}`, "strategy-hub");
    }
    if ((task.attempts ?? 0) >= 3 && !["completed", "blocked"].includes(task.status)) {
      task.status = "blocked";
      task.blocked_reason = "同じ仕事が3回失敗したため自動停止";
      changed = true;
      await addEvent("warning", `3回失敗で停止: ${task.title}`, "quality-gate");
    }
  }

  queue.updated_at = nowIso();
  queue.summary = {
    ready: queue.tasks.filter((task) => task.status === "ready").length,
    working: queue.tasks.filter((task) => task.status === "working").length,
    waiting: queue.tasks.filter((task) => task.status === "waiting").length,
    blocked: queue.tasks.filter((task) => task.status === "blocked").length,
  };
  if (changed || (Date.now() - lastQueueReviewAt) >= 60000) {
    await writeJsonAtomic(queuePath, queue);
  }
}

async function addQaFailureTask(title, result) {
  const queue = await readJson(queuePath, { schema_version: 1, tasks: [] });
  const id = `qa-failure-${title.replaceAll(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  const existing = queue.tasks.find((task) => task.id === id);
  const failure = {
    id,
    title: `${title}の失敗を修正`,
    category: "重大な品質問題",
    priority: 120,
    status: "ready",
    executor: "ai_director",
    due_at: nowIso(),
    reason: result.output.split(/\r?\n/).filter(Boolean).slice(-4).join(" / "),
    success_condition: "原因を修正し、同じQAが合格する。",
    allowed_actions: ["原因調査", "必要最小限の修正", "再QA"],
    blocked_actions: ["外部公開", "失敗の非表示"],
    attempts: (existing?.attempts ?? 0) + 1,
  };
  if (existing) Object.assign(existing, failure);
  else queue.tasks.push(failure);
  queue.updated_at = nowIso();
  await writeJsonAtomic(queuePath, queue);
}

function shouldWatchFile(filename) {
  if (!filename) return false;
  const normalized = filename.replaceAll("\\", "/");
  if (
    normalized.startsWith(".git/")
    || normalized.startsWith("dist/")
    || normalized.startsWith("employee-dashboard/")
    || normalized.includes("AI_EMPLOYEE_RUNTIME.json")
    || normalized.includes("AI_EMPLOYEE_WORK_QUEUE.json")
    || normalized.endsWith(".log")
  ) return false;
  return /\.(?:html|css|js|mjs|json|xml|md)$/i.test(normalized);
}

const watcher = watch(rootDir, { recursive: true });
(async () => {
  try {
    for await (const event of watcher) {
      if (!shouldWatchFile(event.filename)) continue;
      pendingSiteQaAt = Date.now() + (settings.site_qa_after_change_minutes * 60 * 1000);
      await addEvent("watch", `変更を検知: ${event.filename}`, "quality-gate");
    }
  } catch (error) {
    await addEvent("error", `ファイル監視が停止: ${error.message}`, "quality-gate");
  }
})();

async function runLoop() {
  runtime.status = "monitoring";
  runtime.current_task = null;
  await addEvent("success", "自律監督エンジンが監視を開始", "strategy-hub");
  await writeRuntime();

  while (!stopping) {
    const now = Date.now();
    if (await exists(stopSignalPath)) {
      stopping = true;
      break;
    }

    await updateQueue();
    lastQueueReviewAt = now;

    if ((now - lastDashboardAt) >= (settings.dashboard_refresh_seconds * 1000)) {
      await runCommand(
        "ライブダッシュボード更新",
        nodeCommand,
        ["tools/build-employee-dashboard.mjs"],
        "strategy-hub",
      );
      lastDashboardAt = Date.now();
    }

    if (
      pendingSiteQaAt
      && Date.now() >= pendingSiteQaAt
    ) {
      const result = await runCommand(
        "変更後サイトQA",
        npmCommand,
        ["run", "qa:site"],
        "quality-gate",
      );
      if (!result.ok) await addQaFailureTask("site-qa", result);
      pendingSiteQaAt = null;
    }

    if ((Date.now() - lastDashboardQaAt) >= (settings.dashboard_qa_minutes * 60 * 1000)) {
      const result = await runCommand(
        "運営室QA",
        npmCommand,
        ["run", "qa:dashboard"],
        "quality-gate",
      );
      if (!result.ok) await addQaFailureTask("dashboard-qa", result);
      lastDashboardQaAt = Date.now();
    }

    if ((Date.now() - lastFullQaAt) >= (settings.full_qa_hours * 60 * 60 * 1000)) {
      const result = await runCommand(
        "全社品質監査",
        npmCommand,
        ["run", "qa"],
        "quality-gate",
      );
      if (!result.ok) await addQaFailureTask("full-qa", result);
      lastFullQaAt = Date.now();
    }

    runtime.status = "monitoring";
    runtime.active_zone = "strategy-hub";
    runtime.current_task = null;
    runtime.last_completed = runtime.recent_events.find((event) => event.level === "success") ?? null;
    await writeRuntime();
    await sleep(settings.heartbeat_seconds * 1000);
  }
}

async function shutdown(reason) {
  if (runtime.status === "stopped") return;
  stopping = true;
  runtime.status = "stopped";
  runtime.current_task = null;
  await addEvent("info", `自律監督エンジンを停止: ${reason}`, "strategy-hub");
  await writeRuntime();
  try {
    watcher.close();
  } catch {
    // Watcher may already be closed.
  }
  if (await exists(stopSignalPath)) await unlink(stopSignalPath);
}

process.on("SIGINT", () => {
  shutdown("SIGINT").finally(() => process.exit(0));
});
process.on("SIGTERM", () => {
  shutdown("SIGTERM").finally(() => process.exit(0));
});

try {
  await runLoop();
  await shutdown("停止ファイルを検知");
} catch (error) {
  runtime.status = "failed";
  runtime.current_task = null;
  await addEvent("error", `自律監督エンジンが異常終了: ${error.message}`, "quality-gate");
  await writeRuntime();
  process.exitCode = 1;
}
