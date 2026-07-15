const SCENARIOS = [
  {
    unit: "こ",
    text: (left, right) =>
      `りんごが ${left}こ あります。あとから ${right}こ もらいました。りんごは ぜんぶで なんこ ありますか。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `あめを ${left}こ もっています。おうちの人から ${right}こ もらいました。あめは ぜんぶで なんこ ありますか。`,
  },
  {
    unit: "まい",
    text: (left, right) =>
      `おりがみが ${left}まい あります。あとから ${right}まい もらいました。おりがみは ぜんぶで なんまい ありますか。`,
  },
  {
    unit: "さつ",
    text: (left, right) =>
      `えほんが ${left}さつ あります。あとから ${right}さつ ならべました。えほんは ぜんぶで なんさつ ありますか。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `あかい ボールが ${left}こ、あおい ボールが ${right}こ あります。ボールは ぜんぶで なんこ ありますか。`,
  },
  {
    unit: "まい",
    text: (left, right) =>
      `シールを ${left}まい もっています。あとから ${right}まい もらいました。シールは ぜんぶで なんまい ありますか。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `はこに つみきが ${left}こ あります。あとから ${right}こ いれました。つみきは ぜんぶで なんこ ありますか。`,
  },
  {
    unit: "さつ",
    text: (left, right) =>
      `つくえに ノートが ${left}さつ、たなに ${right}さつ あります。ノートは ぜんぶで なんさつ ありますか。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `おさらの いちごが ${left}こ あります。あとから ${right}こ のせました。いちごは ぜんぶで なんこ ありますか。`,
  },
];

function shuffled(values, random) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function generateGrade1AdditionProblems(random = Math.random, count = 10) {
  const pairs = [];
  for (let left = 1; left <= 9; left += 1) {
    for (let right = 1; left + right <= 10; right += 1) {
      pairs.push({ left, right });
    }
  }

  return shuffled(pairs, random).slice(0, count).map(({ left, right }, index) => {
    const answer = left + right;
    const scenario = SCENARIOS[index % SCENARIOS.length];
    return {
      left,
      right,
      answer,
      unit: scenario.unit,
      text: scenario.text(left, right),
      equation: `${left} + ${right} = ${answer}`,
      explanation: `${left}${scenario.unit}と ${right}${scenario.unit}を あわせると、${answer}${scenario.unit}です。`,
    };
  });
}

function renderProblems(root, problems) {
  const problemList = root.querySelector("[data-generated-problems]");
  const answerList = root.querySelector("[data-generated-answers]");
  problemList.replaceChildren();
  answerList.replaceChildren();

  problems.forEach((problem) => {
    const problemItem = document.createElement("li");
    const problemText = document.createElement("p");
    const answerLine = document.createElement("p");
    const equationBlank = document.createElement("span");
    const answerBlank = document.createElement("span");
    problemText.textContent = problem.text;
    answerLine.className = "answer-line";
    equationBlank.textContent = "しき: ____ + ____ = ____";
    answerBlank.textContent = `こたえ: ____${problem.unit}`;
    answerLine.append(equationBlank, answerBlank);
    problemItem.append(problemText, answerLine);
    problemList.append(problemItem);

    const answerItem = document.createElement("li");
    const answer = document.createElement("strong");
    const explanation = document.createElement("span");
    answer.textContent = `${problem.equation}　こたえ ${problem.answer}${problem.unit}`;
    explanation.className = "answer-explanation";
    explanation.textContent = problem.explanation;
    answerItem.append(answer, explanation);
    answerList.append(answerItem);
  });

  root.querySelector("[data-generator-status]").textContent =
    "新しい10問を作りました。印刷してすぐに使えます。";
}

function initializeGenerator(root) {
  const answers = root.querySelector("[data-generated-answer-section]");
  const toggleButton = root.querySelector("[data-toggle-generated-answers]");

  const generate = () => renderProblems(root, generateGrade1AdditionProblems());
  root.querySelector("[data-generate-word-problems]").addEventListener("click", generate);

  toggleButton.addEventListener("click", () => {
    answers.hidden = !answers.hidden;
    toggleButton.textContent = answers.hidden ? "答えを見る" : "答えを閉じる";
    toggleButton.setAttribute("aria-expanded", String(!answers.hidden));
  });

  root.querySelector("[data-print-generated-problems]").addEventListener("click", () => {
    document.body.classList.add("print-generated-word-problems");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("print-generated-word-problems"),
      { once: true },
    );
    window.print();
  });

  generate();
}

if (typeof document !== "undefined") {
  document.querySelectorAll("[data-word-problem-generator]").forEach(initializeGenerator);
}
