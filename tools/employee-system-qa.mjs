import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const agentsName = "AGENTS.md";
const growthName = "GROWTH_OPERATING_SYSTEM.md";
const matrixName = "AI_EMPLOYEE_GROWTH_MATRIX_2026-07-22.md";
const runbookName = "PUBLISHING_RUNBOOK.md";
const searchPlaybookName = "SEARCH_GROWTH_EMPLOYEE_PLAYBOOK.md";
const opportunityMapName = "SEARCH_OPPORTUNITY_MAP_2026-07-25.md";
const errors = [];

async function load(name) {
  return readFile(path.join(rootDir, name), "utf8");
}

function requireText(file, source, expected, message) {
  if (!source.includes(expected)) errors.push(`${file}: ${message}`);
}

function section(source, heading) {
  const start = source.indexOf(heading);
  if (start < 0) return null;
  const end = source.indexOf("\n## ", start + heading.length);
  return source.slice(start, end < 0 ? source.length : end);
}

const [agents, growth, matrix, runbook, searchPlaybook, opportunityMap] = await Promise.all([
  load(agentsName),
  load(growthName),
  load(matrixName),
  load(runbookName),
  load(searchPlaybookName),
  load(opportunityMapName),
]);

const requiredRoles = [
  "SEO担当",
  "検索露出改善担当",
  "教材品質責任者",
  "分析担当",
  "発信戦略責任者",
  "X投稿・コミュニティ担当",
  "Substack編集・投稿担当",
  "note編集・投稿担当",
  "安全・ブランド監査責任者",
  "AI公開承認責任者",
  "発信進行・公開管理担当",
  "教材研究・信頼担当",
  "教育広報・紹介担当",
  "利用者リサーチ・導入支援担当",
  "編集長",
  "QA担当（品質保証担当）",
];

for (const role of requiredRoles) {
  const roleSection = section(agents, `## ${role}`);
  if (!roleSection) {
    errors.push(`${agentsName}: 「${role}」の役割定義がありません`);
    continue;
  }
  for (const required of ["### 目的", "### やってはいけないこと"]) {
    if (!roleSection.includes(required)) {
      errors.push(`${agentsName}: 「${role}」に${required}がありません`);
    }
  }
  requireText(matrixName, matrix, `| ${role} |`, `「${role}」の成熟度がありません`);
}

for (const level of ["L1 役割定義", "L2 再現可能", "L3 品質保証", "L4 学習済み"]) {
  requireText(agentsName, agents, level, `成熟度「${level}」がありません`);
  requireText(matrixName, matrix, level, `成熟度「${level}」の説明がありません`);
}

for (const loop of ["発信:", "発信承認:", "教材:", "検索露出:", "紹介・信頼:"]) {
  requireText(agentsName, agents, loop, `役割別改善ループ「${loop}」がありません`);
}

for (const handoff of [
  "分析担当 → 検索露出改善担当",
  "発信戦略責任者 → X投稿・コミュニティ担当 / Substack編集・投稿担当 / note編集・投稿担当 → 編集長 → QA担当 → 安全・ブランド監査責任者 → AI公開承認責任者 → 発信進行・公開管理担当",
  "教材研究・信頼担当 → 教材品質責任者 → QA担当 → 編集長",
]) {
  requireText(growthName, growth, handoff, `社員間の引き継ぎ「${handoff}」がありません`);
}

for (const status of ["`ready`", "`verify`", "`reschedule`", "`published`", "`review`", "`hold`"]) {
  requireText(runbookName, runbook, status, `発信状態${status}がありません`);
}

requireText(matrixName, matrix, "評価期限: 2026-07-31", "7月31日の評価期限がありません");
requireText(matrixName, matrix, "証拠がない社員をL4にしない", "証拠なし昇格の禁止がありません");
requireText(agentsName, agents, "L4だけを「育成済み」と呼ぶ", "育成済みの判定条件がありません");

for (const competency of [
  "データ最終日",
  "クエリ群",
  "ページ・検索語対応表",
  "検索機会スコア",
  "検索結果観察",
  "検索表示前",
  "検索結果クリック前",
  "教材開始前",
  "外部発信からの流入",
  "今週変える一つ",
  "変えない要素",
  "7日後",
]) {
  requireText(searchPlaybookName, searchPlaybook, competency, `検索成長能力「${competency}」がありません`);
}

for (const evidence of [
  "データ最終日: 2026年7月22日",
  "直近7日",
  "直近28日",
  "grade1-addition-word-problems.html",
  "1年生 足し算 文章問題",
  "検索表示前",
  "2026年7月29日",
]) {
  requireText(opportunityMapName, opportunityMap, evidence, `検索機会マップの証拠「${evidence}」がありません`);
}

console.log("けいさんランド AI社員制度QA");
console.log(
  `対象: ${agentsName} / ${growthName} / ${matrixName} / ${runbookName} / ${searchPlaybookName} / ${opportunityMapName}`,
);
console.log(`必須社員: ${requiredRoles.length}`);
console.log(`エラー: ${errors.length}`);

for (const error of errors) console.error(`エラー: ${error}`);

if (errors.length > 0) process.exitCode = 1;
else console.log("PASS: 役割、成熟度、改善ループ、引き継ぎ、発信状態を確認しました。");
