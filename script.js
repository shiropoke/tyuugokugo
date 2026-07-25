"use strict";

const STORAGE_KEY = "tyuugokugo-mistake-words";

const elements = {
  screens: {
    home: document.querySelector("#home-screen"),
    quiz: document.querySelector("#quiz-screen"),
    result: document.querySelector("#result-screen"),
    wordList: document.querySelector("#word-list-screen")
  },
  startButton: document.querySelector("#start-button"),
  homeReviewButton: document.querySelector("#home-review-button"),
  wordListButton: document.querySelector("#word-list-button"),
  savedMistakesNote: document.querySelector("#saved-mistakes-note"),
  quizHomeButton: document.querySelector("#quiz-home-button"),
  currentNumber: document.querySelector("#current-number"),
  totalNumber: document.querySelector("#total-number"),
  correctCount: document.querySelector("#correct-count"),
  progressBar: document.querySelector("#progress-bar"),
  progressFill: document.querySelector("#progress-fill"),
  pinyin: document.querySelector("#pinyin"),
  quizPronunciationButton: document.querySelector("#quiz-pronunciation-button"),
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
  perfectMessage: document.querySelector("#perfect-message"),
  resultList: document.querySelector("#result-list"),
  retryButton: document.querySelector("#retry-button"),
  resultReviewButton: document.querySelector("#result-review-button"),
  resultHomeButton: document.querySelector("#result-home-button"),
  wordListTitle: document.querySelector("#word-list-title"),
  wordListHomeButton: document.querySelector("#word-list-home-button"),
  wordSearch: document.querySelector("#word-search"),
  searchResultCount: document.querySelector("#search-result-count"),
  noSearchResults: document.querySelector("#no-search-results"),
  wordList: document.querySelector("#word-list"),
  speechMessages: [...document.querySelectorAll("[data-speech-message]")],
  exitDialog: document.querySelector("#exit-dialog"),
  confirmExitButton: document.querySelector("#confirm-exit-button"),
  cancelExitButton: document.querySelector("#cancel-exit-button")
};

const quizState = {
  questions: [],
  sourceWords: [],
  questionLimit: 0,
  currentIndex: 0,
  correctCount: 0,
  answerHistory: [],
  answered: false,
  mode: "normal"
};

let focusBeforeDialog = null;

function resetQuizState() {
  quizState.questions = [];
  quizState.sourceWords = [];
  quizState.questionLimit = 0;
  quizState.currentIndex = 0;
  quizState.correctCount = 0;
  quizState.answerHistory = [];
  quizState.answered = false;
  quizState.mode = "normal";
}

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

function updateHomeReviewControls() {
  const savedCount = getSavedMistakeQuestions().length;
  const hasSavedMistakes = savedCount > 0;

  elements.homeReviewButton.hidden = !hasSavedMistakes;
  elements.savedMistakesNote.hidden = !hasSavedMistakes;
  elements.savedMistakesNote.textContent = hasSavedMistakes
    ? `保存中の間違い：${savedCount}問`
    : "";
}

function showOnlyScreen(screenName) {
  Object.entries(elements.screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });

  window.scrollTo({ top: 0, behavior: "auto" });
}

function showHomeScreen() {
  speechController.cancel();
  resetQuizState();
  updateHomeReviewControls();
  showOnlyScreen("home");
  elements.startButton.focus();
}

function showQuizScreen() {
  speechController.cancel();
  showOnlyScreen("quiz");
}

function showResultScreen() {
  speechController.cancel();
  const totalQuestions = quizState.answerHistory.length;
  const rate = totalQuestions === 0
    ? 0
    : Math.round((quizState.correctCount / totalQuestions) * 100);
  const incorrectAnswers = quizState.answerHistory.filter((answer) => !answer.isCorrect);

  elements.scorePercent.textContent = String(rate);
  elements.resultCorrect.textContent = String(quizState.correctCount);
  elements.resultTotal.textContent = String(totalQuestions);
  elements.resultRate.textContent = `${rate}%`;
  elements.perfectMessage.hidden = incorrectAnswers.length !== 0;
  elements.resultReviewButton.hidden = incorrectAnswers.length === 0;
  renderResultList();
  showOnlyScreen("result");
  elements.resultTitle.focus();
}

function showWordListScreen() {
  speechController.cancel();
  resetQuizState();
  elements.wordSearch.value = "";
  renderWordList(words);
  showOnlyScreen("wordList");
  elements.wordListTitle.focus();
}

function getSelectedQuestionCount() {
  const selected = document.querySelector('input[name="question-count"]:checked');
  return selected?.value === "all" ? words.length : Number(selected?.value || 10);
}

function startQuiz(sourceWords, questionLimit, mode = "normal") {
  if (sourceWords.length === 0) {
    showHomeScreen();
    return;
  }

  const safeLimit = Math.min(questionLimit, sourceWords.length);
  quizState.sourceWords = [...sourceWords];
  quizState.questionLimit = safeLimit;
  quizState.questions = shuffleWords(sourceWords).slice(0, safeLimit);
  quizState.currentIndex = 0;
  quizState.correctCount = 0;
  quizState.answerHistory = [];
  quizState.answered = false;
  quizState.mode = mode;

  showQuizScreen();
  renderQuestion();
}

function startSelectedQuiz() {
  startQuiz(words, getSelectedQuestionCount(), "normal");
}

function startSavedMistakesReview() {
  const reviewQuestions = getSavedMistakeQuestions();
  startQuiz(reviewQuestions, reviewQuestions.length, "review");
}

function startCurrentMistakesReview() {
  const incorrectWords = new Set(
    quizState.answerHistory
      .filter((answer) => !answer.isCorrect)
      .map((answer) => answer.word)
  );
  const reviewQuestions = quizState.questions.filter((question) => incorrectWords.has(question.word));
  startQuiz(reviewQuestions, reviewQuestions.length, "review");
}

function renderQuestion() {
  const question = quizState.questions[quizState.currentIndex];
  const currentNumber = quizState.currentIndex + 1;
  const totalQuestions = quizState.questions.length;

  speechController.cancel();
  quizState.answered = false;
  elements.currentNumber.textContent = String(currentNumber);
  elements.totalNumber.textContent = String(totalQuestions);
  elements.correctCount.textContent = String(quizState.correctCount);
  elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex));
  elements.progressFill.style.width = `${(quizState.currentIndex / totalQuestions) * 100}%`;
  elements.pinyin.textContent = question.pinyin;
  elements.quizPronunciationButton.setAttribute("aria-label", `${question.word}の発音を聞く`);
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

  showAnswerResult(
    isCorrectAnswer(input, quizState.questions[quizState.currentIndex]),
    false,
    input.trim()
  );
}

function recordAnswer(question, userAnswer, wasCorrect, skipped) {
  const questionNumber = quizState.currentIndex + 1;
  const alreadyRecorded = quizState.answerHistory.some(
    (answer) => answer.questionNumber === questionNumber
  );

  if (alreadyRecorded) {
    return;
  }

  quizState.answerHistory.push({
    questionNumber,
    word: question.word,
    pinyin: question.pinyin,
    meaning: question.meaning,
    userAnswer,
    isCorrect: wasCorrect,
    skipped
  });
}

function showAnswerResult(wasCorrect, skipped = false, userAnswer = "") {
  if (quizState.answered) {
    return;
  }

  const question = quizState.questions[quizState.currentIndex];
  quizState.answered = true;
  recordAnswer(question, userAnswer, wasCorrect, skipped);

  if (wasCorrect) {
    quizState.correctCount += 1;
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
  showAnswerResult(false, true, "");
}

function moveToNextQuestion() {
  if (!quizState.answered) {
    return;
  }

  if (quizState.currentIndex >= quizState.questions.length - 1) {
    showResultScreen();
    return;
  }

  quizState.currentIndex += 1;
  renderQuestion();
}

function createResultDetail(labelText, valueText, options = {}) {
  const wrapper = document.createElement("div");
  const term = document.createElement("dt");
  const definition = document.createElement("dd");

  term.textContent = labelText;
  definition.textContent = valueText;
  if (options.className) {
    definition.className = options.className;
  }
  if (options.lang) {
    definition.lang = options.lang;
  }

  wrapper.append(term, definition);
  return wrapper;
}

function renderResultList() {
  elements.resultList.replaceChildren();

  quizState.answerHistory.forEach((answer) => {
    const item = document.createElement("li");
    const header = document.createElement("div");
    const questionNumber = document.createElement("p");
    const status = document.createElement("p");
    const details = document.createElement("dl");
    const pronunciationButton = document.createElement("button");

    item.className = answer.isCorrect
      ? "result-item result-item--correct"
      : "result-item result-item--incorrect";
    header.className = "result-item-header";
    questionNumber.className = "result-question-number";
    status.className = answer.isCorrect
      ? "result-status result-status--correct"
      : "result-status result-status--incorrect";
    details.className = "result-details";
    pronunciationButton.className = "pronunciation-button pronunciation-button-small";

    questionNumber.textContent = `問題 ${answer.questionNumber}`;
    status.textContent = answer.isCorrect ? "正解" : "不正解";
    header.append(questionNumber, status);

    details.append(
      createResultDetail("拼音", answer.pinyin, { lang: "zh-Latn" }),
      createResultDetail("正解", answer.word, { className: "chinese-text", lang: "zh-Hans" }),
      createResultDetail("あなたの解答", answer.skipped ? "未回答" : answer.userAnswer, {
        className: "chinese-text",
        lang: "zh-Hans"
      }),
      createResultDetail("意味", answer.meaning)
    );

    speechController.prepareButton(pronunciationButton, answer.word, "🔊 発音");
    item.append(header, details, pronunciationButton);
    elements.resultList.append(item);
  });
}

function retryQuiz() {
  startQuiz(quizState.sourceWords, quizState.questionLimit, quizState.mode);
}

function restartCurrentQuiz() {
  startQuiz(quizState.sourceWords, quizState.questionLimit, quizState.mode);
}

function normalizeSearchText(value) {
  return String(value).trim().toLocaleLowerCase();
}

function filterWords(searchText) {
  const normalizedQuery = normalizeSearchText(searchText);
  if (normalizedQuery === "") {
    return words;
  }

  return words.filter((item) =>
    [item.word, item.pinyin, item.meaning]
      .map(normalizeSearchText)
      .some((value) => value.includes(normalizedQuery))
  );
}

function createWordDetail(labelText, valueText, options = {}) {
  const paragraph = document.createElement("p");
  const label = document.createElement("span");
  const value = document.createElement("span");

  paragraph.className = "word-detail";
  label.className = "word-detail-label";
  label.textContent = `${labelText}：`;
  value.textContent = valueText;
  if (options.className) {
    value.className = options.className;
  }
  if (options.lang) {
    value.lang = options.lang;
  }

  paragraph.append(label, value);
  return paragraph;
}

function renderWordList(filteredWords) {
  elements.wordList.replaceChildren();
  elements.noSearchResults.hidden = filteredWords.length !== 0;
  elements.searchResultCount.textContent = `${filteredWords.length}件 / 全${words.length}件`;

  filteredWords.forEach((item) => {
    const listItem = document.createElement("li");
    const pronunciationButton = document.createElement("button");

    listItem.className = "word-list-item";
    pronunciationButton.className = "pronunciation-button";

    listItem.append(
      createWordDetail("中国語", item.word, {
        className: "word-list-chinese chinese-text",
        lang: "zh-Hans"
      }),
      createWordDetail("拼音", item.pinyin, { className: "word-list-pinyin", lang: "zh-Latn" }),
      createWordDetail("意味", item.meaning)
    );
    speechController.prepareButton(pronunciationButton, item.word);
    listItem.append(pronunciationButton);
    elements.wordList.append(listItem);
  });
}

function updateWordSearch() {
  renderWordList(filterWords(elements.wordSearch.value));
}

function updateSpeechAvailability() {
  const unavailable = !speechController.isSupported;

  elements.quizPronunciationButton.dataset.defaultLabel = "🔊 発音を聞く";
  elements.quizPronunciationButton.disabled = unavailable;
  if (unavailable) {
    elements.quizPronunciationButton.title = speechController.unavailableMessage;
  }

  elements.speechMessages.forEach((message) => {
    message.hidden = !unavailable;
    message.textContent = unavailable ? speechController.unavailableMessage : "";
  });
}

function openExitDialog() {
  speechController.cancel();
  focusBeforeDialog = document.activeElement;
  elements.exitDialog.hidden = false;
  document.body.classList.add("dialog-open");
  elements.cancelExitButton.focus();
}

function closeExitDialog(restoreFocus = true) {
  elements.exitDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  if (restoreFocus && focusBeforeDialog instanceof HTMLElement) {
    focusBeforeDialog.focus();
  }
  focusBeforeDialog = null;
}

function handleQuizHomeRequest() {
  if (quizState.answerHistory.length === 0) {
    showHomeScreen();
    return;
  }

  openExitDialog();
}

function confirmQuizExit() {
  closeExitDialog(false);
  showHomeScreen();
}

function handleDialogKeydown(event) {
  if (elements.exitDialog.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeExitDialog();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const firstButton = elements.confirmExitButton;
  const lastButton = elements.cancelExitButton;
  if (event.shiftKey && document.activeElement === firstButton) {
    event.preventDefault();
    lastButton.focus();
  } else if (!event.shiftKey && document.activeElement === lastButton) {
    event.preventDefault();
    firstButton.focus();
  }
}

elements.startButton.addEventListener("click", startSelectedQuiz);
elements.homeReviewButton.addEventListener("click", startSavedMistakesReview);
elements.wordListButton.addEventListener("click", showWordListScreen);
elements.quizHomeButton.addEventListener("click", handleQuizHomeRequest);
elements.answerForm.addEventListener("submit", submitAnswer);
elements.quizPronunciationButton.addEventListener("click", () => {
  const question = quizState.questions[quizState.currentIndex];
  if (question) {
    speechController.speak(question.word, elements.quizPronunciationButton);
  }
});
elements.hintButton.addEventListener("click", revealHint);
elements.skipButton.addEventListener("click", skipQuestion);
elements.nextButton.addEventListener("click", moveToNextQuestion);
elements.restartButton.addEventListener("click", restartCurrentQuiz);
elements.retryButton.addEventListener("click", retryQuiz);
elements.resultReviewButton.addEventListener("click", startCurrentMistakesReview);
elements.resultHomeButton.addEventListener("click", showHomeScreen);
elements.wordListHomeButton.addEventListener("click", showHomeScreen);
elements.wordSearch.addEventListener("input", updateWordSearch);
elements.confirmExitButton.addEventListener("click", confirmQuizExit);
elements.cancelExitButton.addEventListener("click", () => closeExitDialog());
elements.exitDialog.addEventListener("click", (event) => {
  if (event.target === elements.exitDialog) {
    closeExitDialog();
  }
});
elements.exitDialog.addEventListener("keydown", handleDialogKeydown);
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
    elements.exitDialog.hidden &&
    !elements.screens.quiz.hidden &&
    !event.isComposing &&
    event.keyCode !== 229
  ) {
    event.preventDefault();
    moveToNextQuestion();
  }
});

updateSpeechAvailability();
updateHomeReviewControls();
