"use strict";

const STORAGE_KEY = "tyuugokugo-mistake-words";

const elements = {
  screens: {
    start: document.querySelector("#start-screen"),
    quiz: document.querySelector("#quiz-screen"),
    result: document.querySelector("#result-screen")
  },
  startButton: document.querySelector("#start-button"),
  startReviewButton: document.querySelector("#start-review-button"),
  savedMistakesNote: document.querySelector("#saved-mistakes-note"),
  currentNumber: document.querySelector("#current-number"),
  totalNumber: document.querySelector("#total-number"),
  correctCount: document.querySelector("#correct-count"),
  progressBar: document.querySelector("#progress-bar"),
  progressFill: document.querySelector("#progress-fill"),
  pinyin: document.querySelector("#pinyin"),
  hintButton: document.querySelector("#hint-button"),
  hintText: document.querySelector("#hint-text"),
  answerForm: document.querySelector("#answer-form"),
  answerInput: document.querySelector("#answer-input"),
  inputError: document.querySelector("#input-error"),
  checkButton: document.querySelector("#check-button"),
  skipButton: document.querySelector("#skip-button"),
  feedback: document.querySelector("#feedback"),
  judgement: document.querySelector("#judgement"),
  correctAnswer: document.querySelector("#correct-answer"),
  answerMeaning: document.querySelector("#answer-meaning"),
  nextButton: document.querySelector("#next-button"),
  restartButton: document.querySelector("#restart-button"),
  scorePercent: document.querySelector("#score-percent"),
  resultTitle: document.querySelector("#result-title"),
  resultCorrect: document.querySelector("#result-correct"),
  resultTotal: document.querySelector("#result-total"),
  resultRate: document.querySelector("#result-rate"),
  mistakesSection: document.querySelector("#mistakes-section"),
  mistakesList: document.querySelector("#mistakes-list"),
  perfectMessage: document.querySelector("#perfect-message"),
  retryButton: document.querySelector("#retry-button"),
  resultReviewButton: document.querySelector("#result-review-button"),
  backButton: document.querySelector("#back-button")
};

const quizState = {
  questions: [],
  sourceWords: [],
  questionLimit: 0,
  currentIndex: 0,
  correctCount: 0,
  mistakes: [],
  answered: false,
  mode: "normal"
};

function shuffleWords(sourceWords) {
  const shuffled = [...sourceWords];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function normalizeAnswer(value) {
  return value
    .trim()
    .replace(/[\s　]+/gu, "")
    .replace(/[~～〜・….\-－]/gu, "");
}

function isCorrectAnswer(input, question) {
  const normalizedInput = normalizeAnswer(input);
  const acceptedAnswers = question.answers ? [...question.answers] : [question.word];

  return acceptedAnswers.some((answer) => normalizeAnswer(answer) === normalizedInput);
}

function loadSavedMistakeWords() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const validWords = new Set(words.map((item) => item.word));
    return [...new Set(parsedValue.filter((item) => typeof item === "string" && validWords.has(item)))];
  } catch (error) {
    return [];
  }
}

function saveMistakeWords(wordList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(wordList)]));
  } catch (error) {
    // 保存できない環境でも、その場のクイズは続行します。
  }
}

function updateSavedMistake(questionWord, wasCorrect) {
  const savedWords = loadSavedMistakeWords();
  const updatedWords = new Set(savedWords);

  if (wasCorrect && quizState.mode === "review") {
    updatedWords.delete(questionWord);
  } else if (!wasCorrect) {
    updatedWords.add(questionWord);
  }

  saveMistakeWords([...updatedWords]);
}

function getSavedMistakeQuestions() {
  const savedWords = new Set(loadSavedMistakeWords());
  return words.filter((item) => savedWords.has(item.word));
}

function updateReviewControls() {
  const savedCount = getSavedMistakeQuestions().length;
  const hasSavedMistakes = savedCount > 0;

  elements.startReviewButton.hidden = !hasSavedMistakes;
  elements.resultReviewButton.hidden = !hasSavedMistakes;
  elements.savedMistakesNote.hidden = !hasSavedMistakes;
  elements.savedMistakesNote.textContent = hasSavedMistakes
    ? `保存中の間違い：${savedCount}問`
    : "";
}

function showScreen(screenName) {
  Object.entries(elements.screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });

  window.scrollTo({ top: 0, behavior: "auto" });
}

function getSelectedQuestionCount() {
  const selected = document.querySelector('input[name="question-count"]:checked');
  return selected?.value === "all" ? words.length : Number(selected?.value || 10);
}

function startQuiz(sourceWords, questionLimit, mode = "normal") {
  if (sourceWords.length === 0) {
    showStartScreen();
    return;
  }

  const safeLimit = Math.min(questionLimit, sourceWords.length);
  quizState.sourceWords = [...sourceWords];
  quizState.questionLimit = safeLimit;
  quizState.questions = shuffleWords(sourceWords).slice(0, safeLimit);
  quizState.currentIndex = 0;
  quizState.correctCount = 0;
  quizState.mistakes = [];
  quizState.answered = false;
  quizState.mode = mode;

  showScreen("quiz");
  renderQuestion();
}

function startSelectedQuiz() {
  startQuiz(words, getSelectedQuestionCount(), "normal");
}

function startReviewQuiz() {
  const reviewQuestions = getSavedMistakeQuestions();
  startQuiz(reviewQuestions, reviewQuestions.length, "review");
}

function renderQuestion() {
  const question = quizState.questions[quizState.currentIndex];
  const currentNumber = quizState.currentIndex + 1;
  const totalQuestions = quizState.questions.length;

  quizState.answered = false;
  elements.currentNumber.textContent = String(currentNumber);
  elements.totalNumber.textContent = String(totalQuestions);
  elements.correctCount.textContent = String(quizState.correctCount);
  elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex));
  elements.progressFill.style.width = `${(quizState.currentIndex / totalQuestions) * 100}%`;
  elements.pinyin.textContent = question.pinyin;
  elements.hintText.textContent = question.meaning;
  elements.hintText.hidden = true;
  elements.hintButton.hidden = false;
  elements.hintButton.setAttribute("aria-expanded", "false");
  elements.hintButton.textContent = "日本語のヒントを見る";
  elements.answerForm.reset();
  elements.answerInput.disabled = false;
  elements.checkButton.disabled = false;
  elements.skipButton.disabled = false;
  elements.inputError.hidden = true;
  elements.answerInput.removeAttribute("aria-invalid");
  elements.feedback.hidden = true;
  elements.feedback.classList.remove("correct", "incorrect");
  elements.nextButton.hidden = true;
  elements.nextButton.textContent = currentNumber === totalQuestions ? "結果を見る" : "次の問題";

  requestAnimationFrame(() => elements.answerInput.focus());
}

function revealHint() {
  elements.hintText.hidden = false;
  elements.hintButton.hidden = true;
  elements.hintButton.setAttribute("aria-expanded", "true");
}

function submitAnswer(event) {
  event.preventDefault();

  if (quizState.answered) {
    moveToNextQuestion();
    return;
  }

  const input = elements.answerInput.value;
  if (normalizeAnswer(input) === "") {
    elements.inputError.hidden = false;
    elements.answerInput.setAttribute("aria-invalid", "true");
    elements.answerInput.focus();
    return;
  }

  showAnswerResult(isCorrectAnswer(input, quizState.questions[quizState.currentIndex]));
}

function showAnswerResult(wasCorrect) {
  if (quizState.answered) {
    return;
  }

  const question = quizState.questions[quizState.currentIndex];
  quizState.answered = true;

  if (wasCorrect) {
    quizState.correctCount += 1;
  } else {
    quizState.mistakes.push(question);
  }

  updateSavedMistake(question.word, wasCorrect);
  elements.correctCount.textContent = String(quizState.correctCount);
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex + 1));
  elements.progressFill.style.width = `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%`;
  elements.inputError.hidden = true;
  elements.answerInput.removeAttribute("aria-invalid");
  elements.answerInput.disabled = true;
  elements.checkButton.disabled = true;
  elements.skipButton.disabled = true;
  elements.feedback.hidden = false;
  elements.feedback.classList.add(wasCorrect ? "correct" : "incorrect");
  elements.judgement.textContent = wasCorrect ? "正解！" : "不正解";
  elements.correctAnswer.textContent = question.word;
  elements.answerMeaning.textContent = question.meaning;
  elements.nextButton.hidden = false;
  elements.nextButton.focus();
}

function skipQuestion() {
  showAnswerResult(false);
}

function moveToNextQuestion() {
  if (!quizState.answered) {
    return;
  }

  if (quizState.currentIndex >= quizState.questions.length - 1) {
    showResults();
    return;
  }

  quizState.currentIndex += 1;
  renderQuestion();
}

function showResults() {
  const totalQuestions = quizState.questions.length;
  const rate = Math.round((quizState.correctCount / totalQuestions) * 100);

  elements.scorePercent.textContent = String(rate);
  elements.resultCorrect.textContent = String(quizState.correctCount);
  elements.resultTotal.textContent = String(totalQuestions);
  elements.resultRate.textContent = `${rate}%`;
  renderMistakeList();
  updateReviewControls();
  showScreen("result");
  elements.resultTitle.focus();
}

function renderMistakeList() {
  elements.mistakesList.replaceChildren();
  const hasMistakes = quizState.mistakes.length > 0;

  elements.mistakesSection.hidden = !hasMistakes;
  elements.perfectMessage.hidden = hasMistakes;

  quizState.mistakes.forEach((question) => {
    const listItem = document.createElement("li");
    const pinyin = document.createElement("p");
    const answer = document.createElement("p");
    const meaning = document.createElement("p");

    listItem.className = "mistake-item";
    pinyin.className = "mistake-pinyin";
    answer.className = "mistake-answer chinese-text";
    meaning.className = "mistake-meaning";
    pinyin.lang = "zh-Latn";
    answer.lang = "zh-Hans";
    pinyin.textContent = question.pinyin;
    answer.textContent = question.word;
    meaning.textContent = question.meaning;
    listItem.append(pinyin, answer, meaning);
    elements.mistakesList.append(listItem);
  });
}

function retryQuiz() {
  startQuiz(quizState.sourceWords, quizState.questionLimit, quizState.mode);
}

function restartCurrentQuiz() {
  startQuiz(quizState.sourceWords, quizState.questionLimit, quizState.mode);
}

function showStartScreen() {
  updateReviewControls();
  showScreen("start");
  elements.startButton.focus();
}

elements.startButton.addEventListener("click", startSelectedQuiz);
elements.startReviewButton.addEventListener("click", startReviewQuiz);
elements.answerForm.addEventListener("submit", submitAnswer);
elements.hintButton.addEventListener("click", revealHint);
elements.skipButton.addEventListener("click", skipQuestion);
elements.nextButton.addEventListener("click", moveToNextQuestion);
elements.restartButton.addEventListener("click", restartCurrentQuiz);
elements.retryButton.addEventListener("click", retryQuiz);
elements.resultReviewButton.addEventListener("click", startReviewQuiz);
elements.backButton.addEventListener("click", showStartScreen);
elements.answerInput.addEventListener("input", () => {
  if (normalizeAnswer(elements.answerInput.value) !== "") {
    elements.inputError.hidden = true;
    elements.answerInput.removeAttribute("aria-invalid");
  }
});
elements.answerInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !quizState.answered &&
    !event.isComposing &&
    event.keyCode !== 229
  ) {
    event.preventDefault();
    event.stopPropagation();
    elements.checkButton.click();
  }
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    quizState.answered &&
    !elements.screens.quiz.hidden &&
    !event.isComposing &&
    event.keyCode !== 229
  ) {
    event.preventDefault();
    moveToNextQuestion();
  }
});

updateReviewControls();
