import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../grade1-addition-subtraction-word-problems.js", import.meta.url), "utf8");
const context = vm.createContext({ Math });
vm.runInContext(
  `${source}\n;globalThis.__generateGrade1MixedProblems = generateGrade1MixedProblems;`,
  context,
);
const generateGrade1MixedProblems = context.__generateGrade1MixedProblems;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

let checked = 0;
const allowedUnits = new Set(["こ", "まい", "さつ", "だい", "わ"]);

for (let seed = 1; seed <= 1000; seed += 1) {
  const problems = generateGrade1MixedProblems(seededRandom(seed));
  if (problems.length !== 10) throw new Error(`seed ${seed}: 10問ではありません`);

  const additionCount = problems.filter((problem) => problem.operation === "addition").length;
  const subtractionCount = problems.filter((problem) => problem.operation === "subtraction").length;
  if (additionCount !== 5 || subtractionCount !== 5) {
    throw new Error(`seed ${seed}: 足し算${additionCount}問・引き算${subtractionCount}問です`);
  }

  const equations = new Set();
  for (const problem of problems) {
    if (!Number.isInteger(problem.left) || !Number.isInteger(problem.right)) {
      throw new Error(`seed ${seed}: 整数ではない数があります`);
    }
    if (problem.left < 1 || problem.right < 1 || problem.answer < 1 || problem.answer > 10) {
      throw new Error(`seed ${seed}: 小学1年生の出題範囲を外れています`);
    }
    if (problem.operation === "addition" && problem.left + problem.right !== problem.answer) {
      throw new Error(`seed ${seed}: 足し算の答えが一致しません`);
    }
    if (problem.operation === "subtraction" && problem.left - problem.right !== problem.answer) {
      throw new Error(`seed ${seed}: 引き算の答えが一致しません`);
    }
    if (problem.operation === "subtraction" && problem.left <= problem.right) {
      throw new Error(`seed ${seed}: 引き算の答えが正の数になりません`);
    }
    if (!problem.text.includes(String(problem.left)) || !problem.text.includes(String(problem.right))) {
      throw new Error(`seed ${seed}: 問題文の数字が不足しています`);
    }
    if (!allowedUnits.has(problem.unit)) {
      throw new Error(`seed ${seed}: 読み方が数字で変わる助数詞があります（${problem.unit}）`);
    }
    if (!problem.explanation.includes(problem.equation)) {
      throw new Error(`seed ${seed}: 説明と式が一致しません`);
    }
    const key = `${problem.operator}${problem.left},${problem.right}`;
    if (equations.has(key)) throw new Error(`seed ${seed}: 同じ式が重複しています`);
    equations.add(key);
    checked += 1;
  }
}

console.log(
  `PASS: 小学1年生の足し算・引き算混合文章題 ${checked.toLocaleString("ja-JP")}問を確認しました。`,
);
