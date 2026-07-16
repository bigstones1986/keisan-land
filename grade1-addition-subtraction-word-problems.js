const ADDITION_SCENARIOS = [
  {
    unit: "こ",
    text: (left, right) =>
      `りんごが ${left}こ あります。あとから ${right}こ もらいました。りんごは ぜんぶで なんこ ありますか。`,
    explanation: (left, right, answer) =>
      `${left}こに ${right}こ増えたので、${left} + ${right} = ${answer}です。`,
  },
  {
    unit: "まい",
    text: (left, right) =>
      `おりがみが ${left}まい あります。あとから ${right}まい もらいました。おりがみは ぜんぶで なんまい ありますか。`,
    explanation: (left, right, answer) =>
      `${left}まいに ${right}まい増えたので、${left} + ${right} = ${answer}です。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `あかい ボールが ${left}こ、あおい ボールが ${right}こ あります。ボールは ぜんぶで なんこ ありますか。`,
    explanation: (left, right, answer) =>
      `${left}こと ${right}こを合わせるので、${left} + ${right} = ${answer}です。`,
  },
  {
    unit: "さつ",
    text: (left, right) =>
      `つくえに ノートが ${left}さつ、たなに ${right}さつ あります。ノートは ぜんぶで なんさつ ありますか。`,
    explanation: (left, right, answer) =>
      `${left}さつと ${right}さつを合わせるので、${left} + ${right} = ${answer}です。`,
  },
  {
    unit: "だい",
    text: (left, right) =>
      `おもちゃの くるまが ${left}だい あります。あとから ${right}だい ふえました。くるまは ぜんぶで なんだい ありますか。`,
    explanation: (left, right, answer) =>
      `${left}だいに ${right}だい増えたので、${left} + ${right} = ${answer}です。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `はこに つみきが ${left}こ あります。あとから ${right}こ いれました。つみきは ぜんぶで なんこ ありますか。`,
    explanation: (left, right, answer) =>
      `${left}こに ${right}こ入れたので、${left} + ${right} = ${answer}です。`,
  },
];

const SUBTRACTION_SCENARIOS = [
  {
    unit: "こ",
    text: (left, right) =>
      `クッキーが ${left}こ あります。${right}こ たべました。のこりは なんこ ですか。`,
    explanation: (left, right, answer) =>
      `${left}このうち ${right}こ減ったので、${left} - ${right} = ${answer}です。`,
  },
  {
    unit: "だい",
    text: (left, right) =>
      `おもちゃの くるまが ${left}だい あります。${right}だい かたづけました。のこりは なんだい ですか。`,
    explanation: (left, right, answer) =>
      `${left}だいのうち ${right}だい片づけたので、${left} - ${right} = ${answer}です。`,
  },
  {
    unit: "わ",
    text: (left, right) =>
      `とりが ${left}わ います。${right}わ とんでいきました。のこりは なんわ ですか。`,
    explanation: (left, right, answer) =>
      `${left}わのうち ${right}わ飛んでいったので、${left} - ${right} = ${answer}です。`,
  },
  {
    unit: "まい",
    text: (left, right) =>
      `シールが ${left}まい あります。${right}まい つかいました。のこりは なんまい ですか。`,
    explanation: (left, right, answer) =>
      `${left}まいのうち ${right}まい使ったので、${left} - ${right} = ${answer}です。`,
  },
  {
    unit: "こ",
    text: (left, right) =>
      `あかい ボールが ${left}こ、あおい ボールが ${right}こ あります。あかい ボールは、あおい ボールより なんこ おおいですか。`,
    explanation: (left, right, answer) =>
      `多い ${left}こから少ない ${right}こを引くので、${left} - ${right} = ${answer}です。`,
  },
  {
    unit: "さつ",
    text: (left, right) =>
      `あかい ほんが ${left}さつ、あおい ほんが ${right}さつ あります。あかい ほんは、あおい ほんより なんさつ おおいですか。`,
    explanation: (left, right, answer) =>
      `多い ${left}さつから少ない ${right}さつを引くので、${left} - ${right} = ${answer}です。`,
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

function generateGrade1MixedProblems(random = Math.random) {
  const additionPairs = [];
  for (let left = 1; left <= 9; left += 1) {
    for (let right = 1; left + right <= 10; right += 1) {
      additionPairs.push({ left, right });
    }
  }

  const subtractionPairs = [];
  for (let left = 2; left <= 10; left += 1) {
    for (let right = 1; right < left; right += 1) {
      subtractionPairs.push({ left, right });
    }
  }

  const additionScenarios = shuffled(ADDITION_SCENARIOS, random);
  const additions = shuffled(additionPairs, random).slice(0, 5).map(({ left, right }, index) => {
    const answer = left + right;
    const scenario = additionScenarios[index];
    return {
      operation: "addition",
      operator: "+",
      left,
      right,
      answer,
      unit: scenario.unit,
      text: scenario.text(left, right),
      equation: `${left} + ${right} = ${answer}`,
      explanation: scenario.explanation(left, right, answer),
    };
  });

  const subtractionScenarios = shuffled(SUBTRACTION_SCENARIOS, random);
  const subtractions = shuffled(subtractionPairs, random).slice(0, 5).map(({ left, right }, index) => {
    const answer = left - right;
    const scenario = subtractionScenarios[index];
    return {
      operation: "subtraction",
      operator: "-",
      left,
      right,
      answer,
      unit: scenario.unit,
      text: scenario.text(left, right),
      equation: `${left} - ${right} = ${answer}`,
      explanation: scenario.explanation(left, right, answer),
    };
  });

  return shuffled([...additions, ...subtractions], random);
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
    equationBlank.textContent = "しき: ____（+ / -）____ = ____";
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
    "足し算5問・引き算5問の新しい10問を作りました。印刷してすぐに使えます。";
}

function initializeGenerator(root) {
  const answers = root.querySelector("[data-generated-answer-section]");
  const toggleButton = root.querySelector("[data-toggle-generated-answers]");
  const generate = () => renderProblems(root, generateGrade1MixedProblems());

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
  document.querySelectorAll("[data-mixed-word-problem-generator]").forEach(initializeGenerator);
}
