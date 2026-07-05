const questionList = document.getElementById("questionList");
const gradeSelect = document.getElementById("gradeSelect");
const operationSelect = document.getElementById("operationSelect");
const questionCountSelect = document.getElementById("questionCountSelect");
const newQuizButton = document.getElementById("newQuizButton");
const scoreButton = document.getElementById("scoreButton");
const bottomScoreButton = document.getElementById("bottomScoreButton");
const showAnswersButton = document.getElementById("showAnswersButton");
const printButton = document.getElementById("printButton");
const resultArea = document.getElementById("resultArea");
const keypad = document.querySelector(".keypad");
const historyStorageKey = "keisanLandScoreHistory";
const maxHistoryCount = 5;
let activeAnswerInput = null;

const operationLabels = {
  addition: "足し算",
  subtraction: "引き算",
  multiplication: "掛け算",
  multiplication2Digit: "2桁×1桁",
  division: "割り算",
  divisionRemainder: "あまりのある割り算",
  kuku: "九九"
};

const printSubtitle = document.getElementById("printSubtitle");

const gradeSettings = {
  1: {
    operations: ["addition", "subtraction"],
    maxNumber: 20
  },
  2: {
    operations: ["addition", "subtraction", "kuku"],
    maxNumber: 99
  },
  3: {
    operations: ["multiplication", "multiplication2Digit", "division", "divisionRemainder"],
    maxNumber: 12
  },
  4: {
    operations: ["addition", "subtraction", "multiplication", "division"],
    maxNumber: 9999
  },
  5: {
    operations: ["addition", "subtraction", "multiplication", "division"],
    maxNumber: 200
  },
  6: {
    operations: ["addition", "subtraction", "multiplication", "division"],
    maxNumber: 12
  }
};

function getRandomNumber(maxNumber) {
  return Math.floor(Math.random() * maxNumber) + 1;
}

function getCurrentGradeSetting() {
  return gradeSettings[gradeSelect.value];
}

function updateOperationOptions() {
  const setting = getCurrentGradeSetting();
  operationSelect.innerHTML = "";

  setting.operations.forEach(function (operation) {
    const option = document.createElement("option");
    option.value = operation;
    option.textContent = operationLabels[operation];
    operationSelect.appendChild(option);
  });
}

function updatePrintHeader(questionCount) {
  const gradeText = gradeSelect.options[gradeSelect.selectedIndex].textContent;
  const operationText = operationSelect.options[operationSelect.selectedIndex].textContent;
  printSubtitle.textContent = `${gradeText} ${operationText}ドリル（${questionCount}問）`;
}

function applyUrlSettings() {
  const params = new URLSearchParams(window.location.search);
  const grade = params.get("grade");
  const operation = params.get("operation");
  const questionCount = params.get("count");

  if (grade && gradeSettings[grade]) {
    gradeSelect.value = grade;
  }

  updateOperationOptions();

  if (operation && Array.from(operationSelect.options).some(function (option) {
    return option.value === operation;
  })) {
    operationSelect.value = operation;
  }

  if (questionCount && Array.from(questionCountSelect.options).some(function (option) {
    return option.value === questionCount;
  })) {
    questionCountSelect.value = questionCount;
  }
}

function formatDecimal(number) {
  return Number(number.toFixed(2)).toString();
}

function getDecimalNumber(maxNumber) {
  return getRandomNumber(maxNumber) / 10;
}

function getFraction(maxDenominator, allowZeroNumerator) {
  const denominator = getRandomNumber(maxDenominator - 1) + 1;
  const smallestNumerator = allowZeroNumerator ? 0 : 1;
  const numerator = Math.floor(Math.random() * denominator) + smallestNumerator;

  return {
    numerator: numerator,
    denominator: denominator
  };
}

function getGreatestCommonDivisor(firstNumber, secondNumber) {
  let a = Math.abs(firstNumber);
  let b = Math.abs(secondNumber);

  while (b !== 0) {
    const remainder = a % b;
    a = b;
    b = remainder;
  }

  return a;
}

function simplifyFraction(fraction) {
  const divisor = getGreatestCommonDivisor(fraction.numerator, fraction.denominator);

  return {
    numerator: fraction.numerator / divisor,
    denominator: fraction.denominator / divisor
  };
}

function formatFraction(fraction) {
  const simpleFraction = simplifyFraction(fraction);

  if (simpleFraction.denominator === 1) {
    return simpleFraction.numerator.toString();
  }

  return `${simpleFraction.numerator}/${simpleFraction.denominator}`;
}

function compareFractions(firstFraction, secondFraction) {
  return firstFraction.numerator * secondFraction.denominator -
    secondFraction.numerator * firstFraction.denominator;
}

function resetResult() {
  resultArea.innerHTML = "";
  resultArea.classList.remove("is-visible", "is-perfect");
}

function setActiveAnswerInput(input) {
  if (!input) {
    return;
  }

  document.querySelectorAll(".question-item").forEach(function (item) {
    item.classList.remove("is-selected");
  });

  activeAnswerInput = input;
  input.closest(".question-item").classList.add("is-selected");
}

function getActiveAnswerInput() {
  if (!activeAnswerInput || !document.body.contains(activeAnswerInput)) {
    activeAnswerInput = document.querySelector(".answer-input");
  }

  if (activeAnswerInput) {
    setActiveAnswerInput(activeAnswerInput);
  }

  return activeAnswerInput;
}

function moveToNextQuestion() {
  const inputs = Array.from(document.querySelectorAll(".answer-input"));
  const currentInput = getActiveAnswerInput();
  const currentIndex = inputs.indexOf(currentInput);
  const nextInput = inputs[currentIndex + 1] || inputs[0];

  setActiveAnswerInput(nextInput);
  nextInput.focus();
}

function insertKeypadText(text) {
  const input = getActiveAnswerInput();
  if (!input) {
    return;
  }

  input.value += text;
  input.focus();
}

function clearActiveAnswer() {
  const input = getActiveAnswerInput();
  if (!input) {
    return;
  }

  input.value = "";
  input.focus();
}

function deleteLastCharacter() {
  const input = getActiveAnswerInput();
  if (!input) {
    return;
  }

  input.value = input.value.slice(0, -1);
  input.focus();
}

function normalizeAnswer(answer) {
  return answer
    .toString()
    .replace(/[０-９．／]/g, function (character) {
      return String.fromCharCode(character.charCodeAt(0) - 65248);
    })
    .replace(/\s/g, "");
}

function parseFraction(answer) {
  const parts = answer.split("/");

  if (parts.length !== 2) {
    return null;
  }

  const numerator = Number(parts[0]);
  const denominator = Number(parts[1]);

  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return {
    numerator: numerator,
    denominator: denominator
  };
}

function areAnswersEqual(userAnswer, correctAnswer) {
  const userValue = normalizeAnswer(userAnswer);
  const correctValue = normalizeAnswer(correctAnswer);

  if (userValue === "") {
    return false;
  }

  if (userValue === correctValue) {
    return true;
  }

  const userFraction = parseFraction(userValue);
  const correctFraction = parseFraction(correctValue);

  if (userFraction && correctFraction) {
    return compareFractions(userFraction, correctFraction) === 0;
  }

  const userNumber = Number(userValue);
  const correctNumber = correctFraction
    ? correctFraction.numerator / correctFraction.denominator
    : Number(correctValue);

  if (!Number.isFinite(userNumber) || !Number.isFinite(correctNumber)) {
    return false;
  }

  return Math.abs(userNumber - correctNumber) < 0.001;
}

function escapeHtml(text) {
  return text.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getScoreHistory() {
  try {
    return JSON.parse(localStorage.getItem(historyStorageKey)) || [];
  } catch (error) {
    return [];
  }
}

function saveScoreHistory(scoreData) {
  const history = getScoreHistory();
  history.unshift(scoreData);

  const nextHistory = history.slice(0, maxHistoryCount);

  try {
    localStorage.setItem(historyStorageKey, JSON.stringify(nextHistory));
  } catch (error) {
    return nextHistory;
  }

  return nextHistory;
}

function formatHistoryLabel(item, index) {
  const label = index === 0 ? "今回" : `${index}回前`;

  return `${label}: ${item.accuracyRate}点（${item.questionCount}問中${item.correctCount}問正解）`;
}

function createHistoryHtml(history) {
  if (history.length === 0) {
    return "";
  }

  return `
    <div class="history-area">
      <h3 class="history-title">これまでの結果</h3>
      <ul class="history-list">
        ${history.map(function (item, index) {
          return `<li>${escapeHtml(formatHistoryLabel(item, index))}</li>`;
        }).join("")}
      </ul>
    </div>
  `;
}

function createWholeNumberQuestion(operation, maxNumber) {
  let firstNumber = getRandomNumber(maxNumber);
  let secondNumber = getRandomNumber(maxNumber);

  if (operation === "addition") {
    return {
      text: `${firstNumber} + ${secondNumber} = `,
      answer: firstNumber + secondNumber
    };
  }

  if (operation === "subtraction") {
    if (secondNumber > firstNumber) {
      const savedNumber = firstNumber;
      firstNumber = secondNumber;
      secondNumber = savedNumber;
    }

    return {
      text: `${firstNumber} − ${secondNumber} = `,
      answer: firstNumber - secondNumber
    };
  }

  if (operation === "multiplication") {
    secondNumber = getRandomNumber(9);

    return {
      text: `${firstNumber} × ${secondNumber} = `,
      answer: firstNumber * secondNumber
    };
  }

  const answer = getRandomNumber(maxNumber);
  secondNumber = getRandomNumber(9);
  firstNumber = answer * secondNumber;

  return {
    text: `${firstNumber} ÷ ${secondNumber} = `,
    answer: answer
  };
}

function createGrade1Question(operation) {
  if (operation === "addition") {
    const firstNumber = getRandomNumber(19);
    const secondNumber = getRandomNumber(20 - firstNumber);

    return {
      text: `${firstNumber} + ${secondNumber} = `,
      answer: firstNumber + secondNumber
    };
  }

  const firstNumber = getRandomNumber(20);
  const secondNumber = getRandomNumber(firstNumber);

  return {
    text: `${firstNumber} − ${secondNumber} = `,
    answer: firstNumber - secondNumber
  };
}

function createGrade3Question(operation) {
  if (operation === "multiplication") {
    return createWholeNumberQuestion("multiplication", 9);
  }

  if (operation === "multiplication2Digit") {
    const firstNumber = getRandomNumber(90) + 9;
    const secondNumber = getRandomNumber(8) + 1;

    return {
      text: `${firstNumber} × ${secondNumber} = `,
      answer: firstNumber * secondNumber
    };
  }

  if (operation === "divisionRemainder") {
    const divisor = getRandomNumber(8) + 1;
    const quotient = getRandomNumber(9);
    const remainder = getRandomNumber(divisor - 1);
    const dividend = divisor * quotient + remainder;

    return {
      text: `${dividend} ÷ ${divisor} = `,
      answer: {
        quotient: quotient,
        remainder: remainder
      },
      answerText: `${quotient} あまり ${remainder}`,
      type: "remainder"
    };
  }

  const answer = getRandomNumber(9);
  const secondNumber = getRandomNumber(9);
  const firstNumber = answer * secondNumber;

  return {
    text: `${firstNumber} ÷ ${secondNumber} = `,
    answer: answer
  };
}

function createKukuQuestion() {
  const firstNumber = getRandomNumber(9);
  const secondNumber = getRandomNumber(9);

  return {
    text: `${firstNumber} × ${secondNumber} = `,
    answer: firstNumber * secondNumber
  };
}

function createDecimalQuestion(operation) {
  let firstNumber = getDecimalNumber(200);
  let secondNumber = getDecimalNumber(200);

  if (operation === "addition") {
    return {
      text: `${formatDecimal(firstNumber)} + ${formatDecimal(secondNumber)} = `,
      answer: formatDecimal(firstNumber + secondNumber)
    };
  }

  if (operation === "subtraction") {
    if (secondNumber > firstNumber) {
      const savedNumber = firstNumber;
      firstNumber = secondNumber;
      secondNumber = savedNumber;
    }

    return {
      text: `${formatDecimal(firstNumber)} − ${formatDecimal(secondNumber)} = `,
      answer: formatDecimal(firstNumber - secondNumber)
    };
  }

  if (operation === "multiplication") {
    secondNumber = getRandomNumber(9);

    return {
      text: `${formatDecimal(firstNumber)} × ${secondNumber} = `,
      answer: formatDecimal(firstNumber * secondNumber)
    };
  }

  const answer = getDecimalNumber(100);
  secondNumber = getRandomNumber(9);
  firstNumber = answer * secondNumber;

  return {
    text: `${formatDecimal(firstNumber)} ÷ ${secondNumber} = `,
    answer: formatDecimal(answer)
  };
}

function createFractionQuestion(operation) {
  let firstFraction = getFraction(12, true);
  let secondFraction = getFraction(12, operation !== "division");

  if (operation === "addition") {
    return {
      text: `${formatFraction(firstFraction)} + ${formatFraction(secondFraction)} = `,
      answer: formatFraction({
        numerator: firstFraction.numerator * secondFraction.denominator +
          secondFraction.numerator * firstFraction.denominator,
        denominator: firstFraction.denominator * secondFraction.denominator
      })
    };
  }

  if (operation === "subtraction") {
    if (compareFractions(secondFraction, firstFraction) > 0) {
      const savedFraction = firstFraction;
      firstFraction = secondFraction;
      secondFraction = savedFraction;
    }

    return {
      text: `${formatFraction(firstFraction)} − ${formatFraction(secondFraction)} = `,
      answer: formatFraction({
        numerator: firstFraction.numerator * secondFraction.denominator -
          secondFraction.numerator * firstFraction.denominator,
        denominator: firstFraction.denominator * secondFraction.denominator
      })
    };
  }

  if (operation === "multiplication") {
    return {
      text: `${formatFraction(firstFraction)} × ${formatFraction(secondFraction)} = `,
      answer: formatFraction({
        numerator: firstFraction.numerator * secondFraction.numerator,
        denominator: firstFraction.denominator * secondFraction.denominator
      })
    };
  }

  return {
    text: `${formatFraction(firstFraction)} ÷ ${formatFraction(secondFraction)} = `,
    answer: formatFraction({
      numerator: firstFraction.numerator * secondFraction.denominator,
      denominator: firstFraction.denominator * secondFraction.numerator
    })
  };
}

function createQuestion() {
  const grade = gradeSelect.value;
  const operation = operationSelect.value;
  const setting = getCurrentGradeSetting();

  if (grade === "1") {
    return createGrade1Question(operation);
  }

  if (operation === "kuku") {
    return createKukuQuestion();
  }

  if (grade === "3") {
    return createGrade3Question(operation);
  }

  if (grade === "5") {
    return createDecimalQuestion(operation);
  }

  if (grade === "6") {
    return createFractionQuestion(operation);
  }

  return createWholeNumberQuestion(operation, setting.maxNumber);
}

function showQuestions() {
  const questionCount = Number(questionCountSelect.value);

  questionList.innerHTML = "";
  questionList.dataset.count = questionCount.toString();
  questionList.classList.remove("answers-visible");
  showAnswersButton.textContent = "答えを表示";
  activeAnswerInput = null;
  resetResult();
  updatePrintHeader(questionCount);

  for (let i = 0; i < questionCount; i++) {
    const question = createQuestion();
    const item = document.createElement("li");
    item.className = "question-item";
    item.dataset.answerType = question.type || "single";

    if (question.type === "remainder") {
      item.dataset.quotient = question.answer.quotient;
      item.dataset.remainder = question.answer.remainder;
      item.dataset.answer = question.answerText;

      item.innerHTML = `
        <span class="question-body question-body-remainder">
          <span class="question-text">${question.text}</span>
          <span class="remainder-inputs">
            <label>
              <span>商</span>
              <input class="answer-input quotient-input" type="text" inputmode="numeric" placeholder="商" aria-label="${i + 1}問目の商">
            </label>
            <label>
              <span>あまり</span>
              <input class="answer-input remainder-input" type="text" inputmode="numeric" placeholder="あまり" aria-label="${i + 1}問目のあまり">
            </label>
          </span>
          <span class="answer">${question.answerText}</span>
        </span>
      `;

      questionList.appendChild(item);
      continue;
    }

    item.dataset.answer = question.answer;

    item.innerHTML = `
      <span class="question-body">
        <span class="question-text">${question.text}</span>
        <input class="answer-input" type="text" inputmode="decimal" placeholder="こたえ" aria-label="${i + 1}問目の答え">
        <span class="answer">${question.answer}</span>
      </span>
    `;

    questionList.appendChild(item);
  }

  setActiveAnswerInput(document.querySelector(".answer-input"));
}

function retryQuiz() {
  showQuestions();

  if (typeof window.scrollTo === "function") {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function changeGrade() {
  updateOperationOptions();
  showQuestions();
}

function toggleAnswers() {
  const answersAreVisible = questionList.classList.toggle("answers-visible");
  showAnswersButton.textContent = answersAreVisible ? "答えをかくす" : "答えを表示";
}

function scoreQuestions() {
  const items = Array.from(document.querySelectorAll(".question-item"));
  const wrongQuestions = [];
  let correctCount = 0;

  items.forEach(function (item, index) {
    const questionText = item.querySelector(".question-text").textContent;
    let userAnswer = "";
    let correctAnswer = item.dataset.answer;
    let isCorrect = false;

    if (item.dataset.answerType === "remainder") {
      const quotientInput = item.querySelector(".quotient-input");
      const remainderInput = item.querySelector(".remainder-input");

      if (!quotientInput || !remainderInput) {
        correctAnswer = item.dataset.answer || "確認できません";
        userAnswer = "入力欄を確認できません";
      } else {
        const userQuotient = quotientInput.value;
        const userRemainder = remainderInput.value;
        const quotientIsCorrect = areAnswersEqual(userQuotient, item.dataset.quotient);
        const remainderIsCorrect = areAnswersEqual(userRemainder, item.dataset.remainder);

        userAnswer = `${userQuotient.trim() || "未入力"} あまり ${userRemainder.trim() || "未入力"}`;
        isCorrect = quotientIsCorrect && remainderIsCorrect;
      }
    } else {
      const input = item.querySelector(".answer-input");

      if (!input) {
        correctAnswer = item.dataset.answer || "確認できません";
        userAnswer = "入力欄を確認できません";
      } else {
        userAnswer = input.value;
        isCorrect = areAnswersEqual(userAnswer, correctAnswer);
      }
    }

    item.classList.toggle("is-correct", isCorrect);
    item.classList.toggle("is-wrong", !isCorrect);

    if (isCorrect) {
      correctCount++;
    } else {
      wrongQuestions.push({
        number: index + 1,
        text: questionText,
        userAnswer: userAnswer.trim() || "未入力",
        correctAnswer: correctAnswer
      });
    }
  });

  showScore(correctCount, items.length, wrongQuestions);
}

function showScore(correctCount, questionCount, wrongQuestions) {
  const accuracyRate = Math.round((correctCount / questionCount) * 100);
  const scoreHistory = saveScoreHistory({
    correctCount: correctCount,
    questionCount: questionCount,
    accuracyRate: accuracyRate,
    grade: gradeSelect.value,
    operation: operationSelect.value,
    date: new Date().toISOString()
  });
  let message = "いい調子です！";
  let wrongListHtml = "<p>間違えた問題はありません。</p>";
  const historyHtml = createHistoryHtml(scoreHistory);

  if (accuracyRate === 100) {
    message = "🎉すごい！";
  } else if (accuracyRate >= 80) {
    message = "😊よくできました！";
  } else if (accuracyRate < 60) {
    message = "📚もう一度挑戦してみよう！";
  }

  if (wrongQuestions.length > 0) {
    wrongListHtml = `
      <p class="review-message">間違えた問題を復習しよう</p>
      <p>間違えた問題</p>
      <ol class="wrong-list">
        ${wrongQuestions.map(function (question) {
          return `
            <li>
              ${question.number}問目: ${escapeHtml(question.text)}
              あなたの答え「${escapeHtml(question.userAnswer)}」 / 正しい答え「${escapeHtml(question.correctAnswer)}」
            </li>
          `;
        }).join("")}
      </ol>
    `;
  }

  resultArea.innerHTML = `
    <h2 class="result-title">採点結果</h2>
    <div class="result-main">
      <div class="result-points">${accuracyRate}点！</div>
      <div class="result-score">${questionCount}問中${correctCount}問正解</div>
      <div class="result-rate">正答率${accuracyRate}%</div>
    </div>
    <p class="result-message">${message}</p>
    ${wrongListHtml}
    ${historyHtml}
    <button type="button" class="retry-button" id="retryButton">もう一度挑戦する</button>
  `;
  resultArea.classList.add("is-visible");
  resultArea.classList.toggle("is-perfect", accuracyRate === 100);

  if (typeof resultArea.scrollIntoView === "function") {
    resultArea.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

gradeSelect.addEventListener("change", changeGrade);
operationSelect.addEventListener("change", showQuestions);
questionCountSelect.addEventListener("change", showQuestions);
newQuizButton.addEventListener("click", showQuestions);
scoreButton.addEventListener("click", scoreQuestions);
bottomScoreButton.addEventListener("click", scoreQuestions);
showAnswersButton.addEventListener("click", toggleAnswers);
printButton.addEventListener("click", function () {
  window.print();
});
questionList.addEventListener("focusin", function (event) {
  if (event.target.classList.contains("answer-input")) {
    setActiveAnswerInput(event.target);
  }
});
questionList.addEventListener("click", function (event) {
  if (event.target.classList.contains("answer-input")) {
    setActiveAnswerInput(event.target);
  }
});
keypad.addEventListener("click", function (event) {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  if (button.dataset.key) {
    insertKeypadText(button.dataset.key);
  } else if (button.dataset.action === "clear") {
    clearActiveAnswer();
  } else if (button.dataset.action === "delete") {
    deleteLastCharacter();
  } else if (button.dataset.action === "next") {
    moveToNextQuestion();
  }
});
resultArea.addEventListener("click", function (event) {
  if (event.target.id === "retryButton") {
    retryQuiz();
  }
});

applyUrlSettings();
showQuestions();
