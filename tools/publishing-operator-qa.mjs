import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

async function load(name) {
  return readFile(path.join(rootDir, name), "utf8");
}

function requireText(file, source, expected, message) {
  if (!source.includes(expected)) errors.push(`${file}: ${message}`);
}

function latest(files, prefix) {
  return files
    .filter((name) => name.startsWith(prefix) && name.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "ja", { numeric: true }))
    .at(-1);
}

const files = await readdir(rootDir);
const agentsName = "AGENTS.md";
const playbookName = "PUBLISHING_OPERATOR_PLAYBOOK.md";
const runbookName = "PUBLISHING_RUNBOOK.md";
const [agents, playbook, runbook] = await Promise.all([
  load(agentsName),
  load(playbookName),
  load(runbookName),
]);

const roles = [
  {
    name: "X投稿・コミュニティ担当",
    loop: "### X投稿実務ループ",
    operation: "## X投稿操作",
  },
  {
    name: "Substack編集・投稿担当",
    loop: "### Substack投稿実務ループ",
    operation: "## Substack投稿操作",
  },
  {
    name: "note編集・投稿担当",
    loop: "### note投稿実務ループ",
    operation: "## note投稿操作",
  },
];

for (const role of roles) {
  requireText(agentsName, agents, `## ${role.name}`, `「${role.name}」の役割がありません`);
  requireText(agentsName, agents, role.loop, `「${role.name}」の投稿実務ループがありません`);
  requireText(playbookName, playbook, role.operation, `「${role.name}」の投稿操作がありません`);
}

for (const oldRole of ["## Xコミュニティ担当", "## 長文メディア担当"]) {
  if (agents.includes(oldRole)) errors.push(`${agentsName}: 旧役割「${oldRole.slice(3)}」が残っています`);
}

for (const gate of [
  "投稿先アカウント",
  "公開パッケージ",
  "スマホ表示",
  "人間の公開承認",
  "公開日時",
  "公開URL",
  "24時間後",
  "7日後",
]) {
  requireText(playbookName, playbook, gate, `共通ゲート「${gate}」がありません`);
}

for (const stopCondition of [
  "投稿先アカウントを確認できない",
  "原稿と投稿画面の内容が一致しない",
  "リンク先が開かない",
  "既存記事や下書きを上書きする可能性がある",
  "有効なAI公開承認マニフェストがない",
]) {
  requireText(playbookName, playbook, stopCondition, `停止条件「${stopCondition}」がありません`);
}

for (const level of ["L1 役割定義", "L2 再現可能", "L3 品質保証", "L4 学習済み"]) {
  requireText(playbookName, playbook, level, `投稿担当の成熟度「${level}」がありません`);
}

requireText(
  playbookName,
  playbook,
  "公開URLがない投稿を実績に数えない",
  "公開証拠なしでの実績判定を禁止してください",
);
requireText(
  runbookName,
  runbook,
  "npm run qa:operators",
  "公開前ゲートに投稿担当QAがありません",
);
requireText(
  runbookName,
  runbook,
  "npm run qa:autopublish",
  "公開前ゲートに自律公開QAがありません",
);
requireText(
  runbookName,
  runbook,
  "PUBLISHING_OPERATOR_PLAYBOOK.md",
  "投稿担当プレイブックへの案内がありません",
);

const packageChecks = [
  {
    label: "X",
    name: latest(files, "X_PUBLISHING_PACKAGE_"),
    required: ["投稿アカウント", "投稿文", "代替テキスト", "人間が確認", "公開URL"],
  },
  {
    label: "Substack",
    name: latest(files, "SUBSTACK_PUBLISHING_PACKAGE_"),
    required: ["新規下書き", "スマホ", "人間が内容を確認", "公開URL"],
  },
  {
    label: "note",
    name: latest(files, "NOTE_PUBLISHING_PACKAGE_"),
    required: ["見出し画像", "代替テキスト", "タグ", "スマホ", "人間が内容を確認", "公開URL"],
  },
];

for (const item of packageChecks) {
  if (!item.name) {
    errors.push(`${item.label}: 公開パッケージがありません`);
    continue;
  }
  const source = await load(item.name);
  for (const expected of item.required) {
    requireText(item.name, source, expected, `${item.label}投稿確認「${expected}」がありません`);
  }
}

console.log("けいさんランド 媒体別投稿担当QA");
console.log(`担当: ${roles.map((role) => role.name).join(" / ")}`);
console.log(`公開パッケージ: ${packageChecks.map((item) => item.name ?? "なし").join(" / ")}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 3媒体の役割、操作、停止条件、承認、公開後確認を確認しました。");
