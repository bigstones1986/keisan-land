const stepLevelSelect = document.getElementById("stepLevelSelect");
const stepCountSelect = document.getElementById("stepCountSelect");
const stepQuestionList = document.getElementById("stepQuestionList");
const stepResultArea = document.getElementById("stepResultArea");
const stepNewButton = document.getElementById("stepNewButton");
const stepScoreButton = document.getElementById("stepScoreButton");
const stepBottomScoreButton = document.getElementById("stepBottomScoreButton");
const stepAnswersButton = document.getElementById("stepAnswersButton");
const stepPrintButton = document.getElementById("stepPrintButton");
const stepPrintSubtitle = document.getElementById("stepPrintSubtitle");
const stepHelpText = document.getElementById("stepHelpText");

const stepOptions = [
  { id: "g1-add-5", label: "5までの足し算", help: "5までの足し算から、ゆっくり始めます。" },
  { id: "g1-add-10", label: "10までの足し算", help: "10までの足し算で、基本の形に慣れます。" },
  { id: "g1-add-3nums", label: "10までの3つの数", help: "3つの数を順番に足す練習です。" },
  { id: "g1-add-20", label: "20までの足し算", help: "20までの数で、少しずつ計算の幅を広げます。" },
  { id: "g1-add-carry", label: "くり上がりのある足し算", help: "10をこえる足し算をくり返し練習します。" },
  { id: "g1-sub-10", label: "10までの引き算", help: "10までの引き算で、ひく計算の基本を練習します。" },
  { id: "g1-sub-20", label: "20までの引き算", help: "20までの数で、引き算を安定させます。" },
  { id: "g1-mix-20", label: "20までの足し算・引き算", help: "足し算と引き算をまぜて、よく見て解く練習です。" },
  { id: "g2-add-100", label: "100までの足し算", help: "2年生の計算に向けて、100までの足し算を練習します。" },
  { id: "g2-sub-100", label: "100までの引き算", help: "100までの引き算を、あわてず正確に解く練習です。" },
  { id: "g2-kuku-2to5", label: "九九 2〜5の段", help: "まずは2、3、4、5の段をくり返します。" },
  { id: "g2-kuku-6to9", label: "九九 6〜9の段", help: "6、7、8、9の段を練習します。" },
  { id: "g2-kuku-all", label: "九九のまとめ", help: "九九をランダムに出して、覚えたか確認します。" },
  { id: "g3-mul-2digit-1digit", label: "2けた×1けた", help: "2けたの数に1けたをかける練習です。" },
  { id: "g3-div-basic", label: "九九でできるわり算", help: "九九を使って、あまりのないわり算を練習します。" },
  { id: "g3-div-remainder", label: "あまりのあるわり算", help: "商とあまりを分けて入力する練習です。" },
  { id: "g3-mix", label: "3年生の計算まとめ", help: "足し算、引き算、九九、わり算をまぜて確認します。" }
];

const stepLabels = stepOptions.reduce(function (labels, option) {
  labels[option.id] = option.label;
  return labels;
}, {});

const stepHelpMessages = stepOptions.reduce(function (messages, option) {
  messages[option.id] = option.help;
  return messages;
}, {});

function getStepRandom(max) {
  return Math.floor(Math.random() * max) + 1;
}

function pickStepNumber(numbers) {
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function createAdditionQuestion(maxSum) {
  const first = getStepRandom(maxSum - 1);
  const second = getStepRandom(maxSum - first);
  return { text: `${first} + ${second} = `, answer: first + second };
}

function createSubtractionQuestion(maxStart) {
  const first = getStepRandom(maxStart);
  const second = Math.floor(Math.random() * first) + 1;
  return { text: `${first} - ${second} = `, answer: first - second };
}

function createKukuQuestion(numbers) {
  const first = pickStepNumber(numbers);
  const second = getStepRandom(9);
  return { text: `${first} × ${second} = `, answer: first * second };
}

function createBasicDivisionQuestion(numbers) {
  const divisor = pickStepNumber(numbers);
  const quotient = getStepRandom(9);
  const dividend = divisor * quotient;
  return { text: `${dividend} ÷ ${divisor} = `, answer: quotient };
}

function createStepQuestion(level) {
  if (level === "g1-add-5") {
    return createAdditionQuestion(5);
  }

  if (level === "g1-add-10") {
    return createAdditionQuestion(10);
  }

  if (level === "g1-add-3nums") {
    const first = getStepRandom(4);
    const second = getStepRandom(9 - first);
    const maxThird = 10 - first - second;
    const third = getStepRandom(maxThird);
    return { text: `${first} + ${second} + ${third} = `, answer: first + second + third };
  }

  if (level === "g1-add-20") {
    return createAdditionQuestion(20);
  }

  if (level === "g1-add-carry") {
    const first = getStepRandom(8) + 1;
    const second = getStepRandom(9);
    if (first + second <= 10) {
      return createStepQuestion(level);
    }
    return { text: `${first} + ${second} = `, answer: first + second };
  }

  if (level === "g1-sub-10") {
    return createSubtractionQuestion(10);
  }

  if (level === "g1-sub-20") {
    return createSubtractionQuestion(20);
  }

  if (level === "g1-mix-20") {
    return Math.random() < 0.5 ? createAdditionQuestion(20) : createSubtractionQuestion(20);
  }

  if (level === "g2-add-100") {
    return createAdditionQuestion(100);
  }

  if (level === "g2-sub-100") {
    return createSubtractionQuestion(100);
  }

  if (level === "g2-kuku-2to5") {
    return createKukuQuestion([2, 3, 4, 5]);
  }

  if (level === "g2-kuku-6to9") {
    return createKukuQuestion([6, 7, 8, 9]);
  }

  if (level === "g2-kuku-all") {
    return createKukuQuestion([2, 3, 4, 5, 6, 7, 8, 9]);
  }

  if (level === "g3-mul-2digit-1digit") {
    const first = getStepRandom(80) + 19;
    const second = getStepRandom(9);
    return { text: `${first} × ${second} = `, answer: first * second };
  }

  if (level === "g3-div-basic") {
    return createBasicDivisionQuestion([2, 3, 4, 5, 6, 7, 8, 9]);
  }

  if (level === "g3-div-remainder") {
    const divisor = getStepRandom(8) + 1;
    const quotient = getStepRandom(9);
    const remainder = Math.floor(Math.random() * (divisor - 1)) + 1;
    const dividend = divisor * quotient + remainder;
    return {
      text: `${dividend} ÷ ${divisor} = `,
      answer: `${quotient}あまり${remainder}`,
      answerType: "remainder",
      quotient,
      remainder
    };
  }

  const questionTypes = [
    function () { return createAdditionQuestion(100); },
    function () { return createSubtractionQuestion(100); },
    function () { return createKukuQuestion([2, 3, 4, 5, 6, 7, 8, 9]); },
    function () { return createBasicDivisionQuestion([2, 3, 4, 5, 6, 7, 8, 9]); }
  ];
  return pickStepNumber(questionTypes)();
}

function resetStepResult() {
  stepResultArea.innerHTML = "";
  stepResultArea.classList.remove("is-visible", "is-perfect");
}

function updateStepPrintSubtitle() {
  const level = stepLevelSelect.value;
  const count = Number(stepCountSelect.value);
  stepPrintSubtitle.textContent = `毎日ステップ計算 ${stepLabels[level]}（${count}問）`;
}

function updateStepHelpText() {
  stepHelpText.textContent = stepHelpMessages[stepLevelSelect.value] || "";
}

function showStepQuestions() {
  const level = stepLevelSelect.value;
  const count = Number(stepCountSelect.value);

  stepQuestionList.innerHTML = "";
  stepQuestionList.dataset.count = count.toString();
  stepQuestionList.classList.remove("answers-visible");
  stepAnswersButton.textContent = "答えを表示";
  resetStepResult();
  updateStepPrintSubtitle();
  updateStepHelpText();

  for (let i = 0; i < count; i += 1) {
    const question = createStepQuestion(level);
    const item = document.createElement("li");
    item.className = "question-item";
    item.dataset.answer = question.answer;
    item.dataset.answerType = question.answerType || "number";

    if (question.answerType === "remainder") {
      item.dataset.quotient = question.quotient;
      item.dataset.remainder = question.remainder;
      item.innerHTML = `
        <span class="question-body question-body-remainder">
          <span class="question-text">${question.text}</span>
          <span class="remainder-inputs">
            <label>
              商
              <input class="answer-input quotient-input" type="text" inputmode="numeric" placeholder="商" aria-label="${i + 1}問目の商">
            </label>
            <label>
              あまり
              <input class="answer-input remainder-input" type="text" inputmode="numeric" placeholder="あまり" aria-label="${i + 1}問目のあまり">
            </label>
          </span>
          <span class="answer">答え: ${question.quotient} あまり ${question.remainder}</span>
        </span>
      `;
    } else {
      item.innerHTML = `
        <span class="question-body">
          <span class="question-text">${question.text}</span>
          <input class="answer-input" type="text" inputmode="numeric" placeholder="こたえ" aria-label="${i + 1}問目の答え">
          <span class="answer">答え: ${question.answer}</span>
        </span>
      `;
    }
    stepQuestionList.appendChild(item);
  }
}

function normalizeStepAnswer(value) {
  return value
    .toString()
    .replace(/[０-９]/g, function (character) {
      return String.fromCharCode(character.charCodeAt(0) - 65248);
    })
    .replace(/\s/g, "");
}

function scoreStepQuestions() {
  const items = Array.from(stepQuestionList.querySelectorAll(".question-item"));
  let correctCount = 0;
  const wrongNumbers = [];

  items.forEach(function (item, index) {
    const isRemainderQuestion = item.dataset.answerType === "remainder";
    const input = item.querySelector(".answer-input");
    const quotientInput = item.querySelector(".quotient-input");
    const remainderInput = item.querySelector(".remainder-input");
    const userAnswer = normalizeStepAnswer(input ? input.value : "");
    const correctAnswer = normalizeStepAnswer(item.dataset.answer);
    const userQuotient = normalizeStepAnswer(quotientInput ? quotientInput.value : "");
    const userRemainder = normalizeStepAnswer(remainderInput ? remainderInput.value : "");
    const isCorrect = userAnswer !== "" && userAnswer === correctAnswer;
    const isRemainderCorrect = isRemainderQuestion
      && userQuotient !== ""
      && userRemainder !== ""
      && userQuotient === normalizeStepAnswer(item.dataset.quotient)
      && userRemainder === normalizeStepAnswer(item.dataset.remainder);
    const questionIsCorrect = isRemainderQuestion ? isRemainderCorrect : isCorrect;

    item.classList.toggle("is-correct", questionIsCorrect);
    item.classList.toggle("is-wrong", !questionIsCorrect);

    if (questionIsCorrect) {
      correctCount += 1;
    } else {
      wrongNumbers.push(index + 1);
    }
  });

  showStepResult(correctCount, items.length, wrongNumbers);
}

function showStepResult(correctCount, count, wrongNumbers) {
  const score = Math.round((correctCount / count) * 100);
  const currentLevel = stepLevelSelect.value;
  const currentStepIndex = stepOptions.findIndex(function (option) {
    return option.id === currentLevel;
  });
  const nextStep = stepOptions[currentStepIndex + 1];
  let nextMessage = "同じステップをもう一度やってみよう。";

  if (score >= 90 && nextStep) {
    nextMessage = `よくできました。次は「${nextStep.label}」に進めそうです。`;
  } else if (score >= 90) {
    nextMessage = "よくできました。3年生までの計算がかなり安定しています。";
  } else if (score >= 80) {
    nextMessage = "あと少し。同じステップをもう一度やると、もっと安定しそうです。";
  }

  const wrongHtml = wrongNumbers.length
    ? `<p class="review-message">見直す問題: ${wrongNumbers.join("、")}問目</p>`
    : "<p>間違えた問題はありません。</p>";

  stepResultArea.innerHTML = `
    <h2 class="result-title">ステップ結果</h2>
    <div class="result-main">
      <div class="result-points">${score}点</div>
      <div class="result-score">${count}問中${correctCount}問正解</div>
      <div class="result-rate">正答率${score}%</div>
    </div>
    <p class="result-message">${nextMessage}</p>
    ${wrongHtml}
  `;
  stepResultArea.classList.add("is-visible");
  stepResultArea.classList.toggle("is-perfect", score === 100);

  if (typeof stepResultArea.scrollIntoView === "function") {
    stepResultArea.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function toggleStepAnswers() {
  const answersAreVisible = stepQuestionList.classList.toggle("answers-visible");
  stepAnswersButton.textContent = answersAreVisible ? "答えをかくす" : "答えを表示";
}

stepLevelSelect.addEventListener("change", showStepQuestions);
stepCountSelect.addEventListener("change", showStepQuestions);
stepNewButton.addEventListener("click", showStepQuestions);
stepScoreButton.addEventListener("click", scoreStepQuestions);
stepBottomScoreButton.addEventListener("click", scoreStepQuestions);
stepAnswersButton.addEventListener("click", toggleStepAnswers);
stepPrintButton.addEventListener("click", function () {
  window.print();
});

showStepQuestions();
