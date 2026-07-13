import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const source = await readFile(path.resolve(toolsDir, "..", "step-calculation.js"), "utf8");

function createClassList() {
  return { add() {}, remove() {}, toggle() { return false; } };
}

function createElement(value = "") {
  return {
    value,
    dataset: {},
    classList: createClassList(),
    innerHTML: "",
    textContent: "",
    addEventListener() {},
    appendChild() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    scrollIntoView() {}
  };
}

const elements = {
  stepLevelSelect: createElement("g1-add-5"),
  stepCountSelect: createElement("20")
};
const document = {
  getElementById(id) {
    if (!elements[id]) elements[id] = createElement();
    return elements[id];
  },
  createElement() {
    return createElement();
  }
};

const context = vm.createContext({ document, window: { print() {} }, console, Math });
vm.runInContext(
  `${source}\n;globalThis.__stepQa = { stepOptions, createStepQuestion, normalizeStepAnswer };`,
  context
);

const { stepOptions, createStepQuestion, normalizeStepAnswer } = context.__stepQa;
const failures = [];
const sampleCount = 1000;

function fail(level, question, reason) {
  if (failures.length < 20) failures.push(`${level}: ${question.text} / ${question.answer} (${reason})`);
}

function readNumbers(text) {
  return (text.match(/\d+/g) || []).map(Number);
}

function validate(level, question) {
  const numbers = readNumbers(question.text);
  if (!question.text || question.answer === undefined || question.answer === null) {
    fail(level, question, "問題文または答えがありません");
    return;
  }

  if (question.answerType === "remainder") {
    const [dividend, divisor] = numbers;
    if (!(divisor >= 2 && divisor <= 9)) fail(level, question, "割る数が2〜9ではありません");
    if (!(question.remainder > 0 && question.remainder < divisor)) fail(level, question, "あまりの範囲が不正です");
    if (dividend !== divisor * question.quotient + question.remainder) fail(level, question, "商とあまりが一致しません");
    if (question.answer !== `${question.quotient}あまり${question.remainder}`) fail(level, question, "答え表記が不正です");
    return;
  }

  const [first, second, third] = numbers;
  if (question.text.includes(" + ")) {
    const expected = third === undefined ? first + second : first + second + third;
    if (question.answer !== expected) fail(level, question, "足し算の答えが不正です");
  } else if (question.text.includes(" - ")) {
    if (question.answer !== first - second || first < second) fail(level, question, "引き算の答えが不正です");
  } else if (question.text.includes(" × ")) {
    if (question.answer !== first * second) fail(level, question, "掛け算の答えが不正です");
  } else if (question.text.includes(" ÷ ")) {
    if (question.answer !== first / second || first % second !== 0) fail(level, question, "割り算の答えが不正です");
  } else {
    fail(level, question, "計算記号を判定できません");
  }

  const sum = numbers.reduce((total, number) => total + number, 0);
  const rules = {
    "g1-add-5": () => sum <= 5,
    "g1-add-10": () => sum <= 10,
    "g1-add-3nums": () => numbers.length === 3 && sum <= 10,
    "g1-add-20": () => sum <= 20,
    "g1-add-carry": () => sum > 10 && sum <= 18,
    "g1-sub-10": () => first <= 10,
    "g1-sub-20": () => first <= 20,
    "g1-mix-20": () => first <= 20 && Number(question.answer) <= 20,
    "g2-add-100": () => sum <= 100,
    "g2-sub-100": () => first <= 100,
    "g2-kuku-2to5": () => first >= 2 && first <= 5 && second >= 1 && second <= 9,
    "g2-kuku-6to9": () => first >= 6 && first <= 9 && second >= 1 && second <= 9,
    "g2-kuku-all": () => first >= 2 && first <= 9 && second >= 1 && second <= 9,
    "g3-mul-2digit-1digit": () => first >= 20 && first <= 99 && second >= 1 && second <= 9,
    "g3-div-basic": () => second >= 2 && second <= 9 && question.answer >= 1 && question.answer <= 9,
    "g3-mix": () => true
  };
  if (rules[level] && !rules[level]()) fail(level, question, "ステップの出題範囲外です");
}

if (stepOptions.length !== 17) {
  failures.push(`ステップ数が17ではありません（${stepOptions.length}）`);
}

for (const option of stepOptions) {
  for (let index = 0; index < sampleCount; index += 1) {
    validate(option.id, createStepQuestion(option.id));
  }
}

const normalized = normalizeStepAnswer(" １２３ ");
if (normalized !== "123") failures.push(`全角数字の正規化に失敗しました（${normalized}）`);

if (failures.length) {
  console.error(`毎日ステップ計算 QA: FAIL（${failures.length}件以上）`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`毎日ステップ計算 QA: PASS`);
  console.log(`17ステップ × ${sampleCount}問 = 17,000問の出題範囲と答えを確認しました。`);
  console.log("全角数字の入力も正しく半角へ変換されます。");
}
