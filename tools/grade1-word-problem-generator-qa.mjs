import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../grade1-addition-word-problems.js", import.meta.url), "utf8");
const context = vm.createContext({ Math });
vm.runInContext(
  `${source}\n;globalThis.__generateGrade1AdditionProblems = generateGrade1AdditionProblems;`,
  context,
);
const generateGrade1AdditionProblems = context.__generateGrade1AdditionProblems;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

let checked = 0;

for (let seed = 1; seed <= 1000; seed += 1) {
  const problems = generateGrade1AdditionProblems(seededRandom(seed), 10);
  if (problems.length !== 10) {
    throw new Error(`seed ${seed}: 10問ではありません`);
  }

  const equations = new Set();
  for (const problem of problems) {
    if (!Number.isInteger(problem.left) || !Number.isInteger(problem.right)) {
      throw new Error(`seed ${seed}: 整数ではない数があります`);
    }
    if (problem.left < 1 || problem.right < 1 || problem.answer > 10) {
      throw new Error(`seed ${seed}: 小学1年生の出題範囲を外れています`);
    }
    if (problem.left + problem.right !== problem.answer) {
      throw new Error(`seed ${seed}: 答えが一致しません`);
    }
    const key = `${problem.left}+${problem.right}`;
    if (equations.has(key)) {
      throw new Error(`seed ${seed}: 同じ式が重複しています`);
    }
    if (!problem.text.includes(String(problem.left)) || !problem.text.includes(String(problem.right))) {
      throw new Error(`seed ${seed}: 問題文の数字が不足しています`);
    }
    equations.add(key);
    checked += 1;
  }
}

console.log(`PASS: 小学1年生の足し算文章題 ${checked.toLocaleString("ja-JP")}問を確認しました。`);
