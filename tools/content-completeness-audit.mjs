import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

const wordProblemPages = [
  "grade1-addition-word-problems.html",
  "grade1-addition-subtraction-word-problems.html",
  "grade1-subtraction-word-problems.html",
  "grade2-addition-word-problems.html",
  "grade2-subtraction-word-problems.html",
  "grade2-kuku-word-problems.html",
  "grade3-multiplication-word-problems.html",
  "grade3-division-word-problems.html",
  "grade3-division-remainder-word-problems.html"
];

const drillConfigurations = {
  "grade1-addition.html": { grade: "1", operation: "addition" },
  "grade1-subtraction.html": { grade: "1", operation: "subtraction" },
  "grade2-addition.html": { grade: "2", operation: "addition" },
  "grade2-subtraction.html": { grade: "2", operation: "subtraction" },
  "grade2-kuku.html": { grade: "2", operation: "kuku" },
  "grade3-multiplication.html": { grade: "3", operation: "multiplication" },
  "grade3-multiplication-2digit.html": { grade: "3", operation: "multiplication2Digit" },
  "grade3-division.html": { grade: "3", operation: "division" },
  "grade3-division-remainder.html": { grade: "3", operation: "divisionRemainder" }
};
const drillPages = Object.keys(drillConfigurations);

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function sectionItemCount(source, className) {
  const section = source.match(new RegExp(`<ol class="${className}">([\\s\\S]*?)<\\/ol>`));
  return section ? countMatches(section[1], /<li(?:\s|>)/g) : 0;
}

function metaDescription(source) {
  return source.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? "";
}

function pageTitle(source) {
  return source.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
}

function answerEquationErrors(source) {
  const section = source.match(/<ol class="answer-list">([\s\S]*?)<\/ol>/)?.[1] ?? "";
  const answers = [...section.matchAll(/<li><strong>([^<]+)<\/strong>/g)].map((match) => match[1]);
  const errors = [];

  if (answers.length !== 10) errors.push(`答えの式が10件ではありません（${answers.length}件）`);

  answers.forEach((answer, index) => {
    const equation = answer.match(/(\d+)\s*([+\-×÷])\s*(\d+)\s*=\s*(\d+)(?:\s*あまり\s*(\d+))?/);
    if (!equation) {
      errors.push(`${index + 1}問目の式を読み取れません`);
      return;
    }

    const [, leftText, operator, rightText, resultText, remainderText] = equation;
    const left = Number(leftText);
    const right = Number(rightText);
    const result = Number(resultText);
    const remainder = remainderText === undefined ? undefined : Number(remainderText);
    let valid = false;

    if (operator === "+") valid = left + right === result;
    if (operator === "-") valid = left - right === result;
    if (operator === "×") valid = left * right === result;
    if (operator === "÷" && remainder === undefined) valid = left === right * result;
    if (operator === "÷" && remainder !== undefined) {
      valid = left === right * result + remainder && remainder >= 0 && remainder < right;
    }

    if (!valid) errors.push(`${index + 1}問目の式が成立しません（${equation[0]}）`);
  });

  return errors;
}

function scoreWordProblemPage(source) {
  const title = pageTitle(source);
  const description = metaDescription(source);
  const checks = {
    searchPromise: title.includes("無料") && title.includes("10問") && title.includes("答え付き"),
    specificDescription: description.includes("無料") && description.includes("10問") && description.includes("答え"),
    completeWorksheet: sectionItemCount(source, "word-problem-list") === 10 && sectionItemCount(source, "answer-list") === 10,
    explanations: countMatches(source, /class="answer-explanation"/g) === 10,
    solvingSteps: source.includes("learning-step-list"),
    guardianGuidance: source.includes("見守り方"),
    qualityReview: source.includes('class="quality-note"'),
    socialMetadata: source.includes('property="og:title"') && source.includes('name="twitter:card"'),
    structuredData: countMatches(source, /application\/ld\+json/g) >= 2,
    relatedLinks: countMatches(source.match(/<nav class="drill-links"[\s\S]*?<\/nav>/)?.[0] ?? "", /<a href=/g) >= 5
  };
  return checks;
}

function scoreDrillPage(source, file) {
  const configuration = drillConfigurations[file];
  const hasDedicatedPractice = source.includes("data-drill-tool") &&
    source.includes(`data-drill-grade="${configuration.grade}"`) &&
    source.includes(`data-drill-operation="${configuration.operation}"`) &&
    source.includes('href="#questionList"') &&
    source.includes('id="questionList"') &&
    source.includes('src="script.js?v=20260715-dedicated-drills"');
  const checks = {
    seoFoundation: Boolean(pageTitle(source) && metaDescription(source) && source.includes('rel="canonical"') && source.includes("<h1")),
    learningScope: source.includes("このドリルで練習できること") && countMatches(source, /<li(?:\s|>)/g) >= 4,
    relevantStartLink: hasDedicatedPractice,
    questionChoices: source.includes("10問") && source.includes("20問") && source.includes("50問"),
    feedbackAndPrint: source.includes("採点") && source.includes("答え") && source.includes("印刷"),
    practiceGuidance: source.includes("練習の進め方"),
    qualityReview: source.includes('class="quality-note"'),
    socialMetadata: source.includes('property="og:title"') && source.includes('name="twitter:card"'),
    structuredData: countMatches(source, /application\/ld\+json/g) >= 2,
    directPracticeOnPage: hasDedicatedPractice
  };
  return checks;
}

async function audit(files, scorer) {
  const results = [];
  for (const file of files) {
    const source = await readFile(resolve(root, file), "utf8");
    const checks = scorer(source, file);
    const score = Object.values(checks).filter(Boolean).length;
    results.push({ file, score, maximum: Object.keys(checks).length, missing: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name) });
  }
  return results;
}

const wordResults = await audit(wordProblemPages, scoreWordProblemPage);
const drillResults = await audit(drillPages, scoreDrillPage);
const results = [...wordResults, ...drillResults];
const equationErrors = [];
for (const file of wordProblemPages) {
  const source = await readFile(resolve(root, file), "utf8");
  answerEquationErrors(source).forEach((message) => equationErrors.push(`${file}: ${message}`));
}
const score = results.reduce((sum, result) => sum + result.score, 0);
const maximum = results.reduce((sum, result) => sum + result.maximum, 0);

console.log("けいさんランド 教材ページ完成度監査");
console.log(`対象: 文章題 ${wordResults.length}ページ / 通常ドリル ${drillResults.length}ページ`);
console.log(`総合: ${score} / ${maximum} (${((score / maximum) * 100).toFixed(1)}%)`);
console.log("");

for (const result of results) {
  console.log(`${result.score}/${result.maximum} ${result.file}`);
  if (result.missing.length) console.log(`  未達: ${result.missing.join(", ")}`);
}

if (equationErrors.length) {
  console.error("\n教材計算エラー:");
  equationErrors.forEach((message) => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`\nPASS: 文章題${wordProblemPages.length * 10}問の式と答えが成立しています。`);
}

if (process.argv.includes("--require-80") && score / maximum < 0.8) {
  console.error("\nFAIL: 教材ページ完成度が80%未満です。");
  process.exitCode = 1;
}

if (process.argv.includes("--require-100") && score !== maximum) {
  console.error("\nFAIL: 教材ページ完成度が100%ではありません。");
  process.exitCode = 1;
}
