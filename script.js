"use strict";

const STORAGE_KEY = "tyuugokugo-mistake-words";
const HISTORY_APP_ID = "tyuugokugo";
const SESSION_MODES = {
  NORMAL: "normal",
  MISTAKE_REVIEW: "mistake-review",
  CONFIRMATION: "confirmation",
  CONFIRMED_QUIZ: "confirmed-quiz"
};
const SCREEN_HASHES = {
  home: "#home",
  quiz: "#quiz",
  result: "#result",
  reviewResult: "#confirmation-result",
  wordList: "#words"
};

const elements = {
  screens: {
    home: document.querySelector("#home-screen"),
    quiz: document.querySelector("#quiz-screen"),
    result: document.querySelector("#result-screen"),
    reviewResult: document.querySelector("#review-result-screen"),
    wordList: document.querySelector("#word-list-screen")
  },
  learningModeInputs: [...document.querySelectorAll('input[name="learning-mode"]')],
  startButton: document.querySelector("#start-button"),
  homeReviewButton: document.querySelector("#home-review-button"),
  wordListButton: document.querySelector("#word-list-button"),
  savedMistakesNote: document.querySelector("#saved-mistakes-note"),
  quizHomeButton: document.querySelector("#quiz-home-button"),
  quizMenu: document.querySelector("#quiz-menu"),
  quizMenuButton: document.querySelector("#quiz-menu-button"),
  quizMenuPanel: document.querySelector("#quiz-menu-panel"),
  restartButton: document.querySelector("#restart-button"),
  currentNumber: document.querySelector("#current-number"),
  totalNumber: document.querySelector("#total-number"),
  scoreStatus: document.querySelector("#score-status"),
  correctCount: document.querySelector("#correct-count"),
  confirmationStatus: document.querySelector("#confirmation-status"),
  progressBar: document.querySelector("#progress-bar"),
  progressFill: document.querySelector("#progress-fill"),
  promptLabel: document.querySelector("#prompt-label"),
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
  confirmationControls: document.querySelector("#confirmation-controls"),
  showAnswerButton: document.querySelector("#show-answer-button"),
  confirmationAnswer: document.querySelector("#confirmation-answer"),
  confirmationPinyin: document.querySelector("#confirmation-pinyin"),
  confirmationWord: document.querySelector("#confirmation-word"),
  confirmationMeaning: document.querySelector("#confirmation-meaning"),
  confirmationNextButton: document.querySelector("#confirmation-next-button"),
  quizNavigation: document.querySelector("#quiz-navigation"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  resultAnswered: document.querySelector("#result-answered"),
  resultCorrect: document.querySelector("#result-correct"),
  resultIncorrect: document.querySelector("#result-incorrect"),
  resultRate: document.querySelector("#result-rate"),
  resultPlanned: document.querySelector("#result-planned"),
  perfectMessage: document.querySelector("#perfect-message"),
  resultList: document.querySelector("#result-list"),
  retryButton: document.querySelector("#retry-button"),
  resultReviewButton: document.querySelector("#result-review-button"),
  resultHomeButton: document.querySelector("#result-home-button"),
  reviewResultTitle: document.querySelector("#review-result-title"),
  reviewResultDescription: document.querySelector("#review-result-description"),
  reviewedCount: document.querySelector("#reviewed-count"),
  reviewPlannedCount: document.querySelector("#review-planned-count"),
  reviewResultList: document.querySelector("#review-result-list"),
  reviewResultHomeButton: document.querySelector("#review-result-home-button"),
  reviewRetryButton: document.querySelector("#review-retry-button"),
  reviewToQuizButton: document.querySelector("#review-to-quiz-button"),
  wordListTitle: document.querySelector("#word-list-title"),
  wordListHomeButton: document.querySelector("#word-list-home-button"),
  wordSearch: document.querySelector("#word-search"),
  searchResultCount: document.querySelector("#search-result-count"),
  noSearchResults: document.querySelector("#no-search-results"),
  wordList: document.querySelector("#word-list"),
  speechMessages: [...document.querySelectorAll("[data-speech-message]")],
  confirmDialog: document.querySelector("#confirm-dialog"),
  confirmDialogTitle: document.querySelector("#confirm-dialog-title"),
  confirmDialogMessage: document.querySelector("#confirm-dialog-message"),
  confirmDialogButton: document.querySelector("#confirm-dialog-button"),
  cancelDialogButton: document.querySelector("#cancel-dialog-button")
};

const quizState = {
  mode: SESSION_MODES.NORMAL,
  originalMode: "10",
  questions: [],
  sourceWords: [],
  currentIndex: 0,
  correctCount: 0,
  answerHistory: [],
  reviewedHistory: [],
  currentAnswered: false,
  currentAnswerVisible: false,
  isInterrupted: false,
  totalPlannedQuestions: 0,
  startedAt: null
};

let currentScreenName = "home";
let confirmDialogAction = null;
let focusBeforeDialog = null;
let inputFocusScrollTimer = null;

function isConfirmationMode() {
  return quizState.mode === SESSION_MODES.CONFIRMATION;
}

function resetQuizState() {
  quizState.mode = SESSION_MODES.NORMAL;
  quizState.originalMode = "10";
  quizState.questions = [];
  quizState.sourceWords = [];
  quizState.currentIndex = 0;
  quizState.correctCount = 0;
  quizState.answerHistory = [];
  quizState.reviewedHistory = [];
  quizState.currentAnswered = false;
  quizState.currentAnswerVisible = false;
  quizState.isInterrupted = false;
  quizState.totalPlannedQuestions = 0;
  quizState.startedAt = null;
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
    // 保存できない環境でも、その場の学習は続行します。
  }
}

function updateStoredMistakes(questionWord, wasCorrect) {
  const updatedWords = new Set(loadSavedMistakeWords());

  if (wasCorrect && quizState.mode === SESSION_MODES.MISTAKE_REVIEW) {
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

function updateHomeModeControls() {
  const selectedMode =
    document.querySelector('input[name="learning-mode"]:checked')?.value || "quiz";
  elements.startButton.textContent =
    selectedMode === "confirmation" ? "確認を始める" : "クイズを始める";
}

function closeQuizMenu(restoreFocus = false) {
  if (elements.quizMenuPanel.hidden) {
    return;
  }

  elements.quizMenuPanel.hidden = true;
  elements.quizMenuButton.setAttribute("aria-expanded", "false");
  if (restoreFocus) {
    elements.quizMenuButton.focus();
  }
}

function toggleQuizMenu() {
  const willOpen = elements.quizMenuPanel.hidden;
  elements.quizMenuPanel.hidden = !willOpen;
  elements.quizMenuButton.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) {
    elements.restartButton.focus();
  }
}

function showOnlyScreen(screenName) {
  closeQuizMenu(false);
  if (!elements.confirmDialog.hidden) {
    closeConfirmDialog(false);
  }

  Object.entries(elements.screens).forEach(([name, screen]) => {
    screen.hidden = name !== screenName;
  });

  currentScreenName = screenName;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showHomeScreen(options = {}) {
  const { focus = true, reset = true } = options;
  speechController.cancel();
  if (reset) {
    resetQuizState();
  }
  updateHomeModeControls();
  updateHomeReviewControls();
  showOnlyScreen("home");
  if (focus) {
    elements.startButton.focus();
  }
}

function showQuizScreen() {
  speechController.cancel();
  showOnlyScreen("quiz");
}

function calculateResultSummary() {
  const answered = quizState.answerHistory.length;
  const correct = quizState.answerHistory.filter((answer) => answer.isCorrect).length;
  const incorrect = answered - correct;
  const rawRate = answered === 0 ? 0 : (correct / answered) * 100;
  const rate = Number.isInteger(rawRate) ? String(rawRate) : rawRate.toFixed(1);

  return { answered, correct, incorrect, rate };
}

function showResultScreen(options = {}) {
  const { focus = true } = options;
  speechController.cancel();
  const summary = calculateResultSummary();

  elements.resultTitle.textContent = quizState.isInterrupted ? "途中結果" : "クイズ結果";
  elements.resultDescription.hidden = !quizState.isInterrupted;
  elements.resultAnswered.textContent = String(summary.answered);
  elements.resultCorrect.textContent = String(summary.correct);
  elements.resultIncorrect.textContent = String(summary.incorrect);
  elements.resultRate.textContent = `${summary.rate}%`;
  elements.resultPlanned.hidden = !quizState.isInterrupted;
  elements.resultPlanned.textContent = quizState.isInterrupted
    ? `予定問題数：${quizState.totalPlannedQuestions}問`
    : "";
  elements.perfectMessage.hidden = quizState.isInterrupted || summary.incorrect !== 0;
  elements.resultReviewButton.hidden = summary.incorrect === 0;
  elements.retryButton.textContent = quizState.isInterrupted
    ? "最初からもう一度挑戦"
    : "もう一度挑戦";
  renderResultList();
  showOnlyScreen("result");
  if (focus) {
    elements.resultTitle.focus();
  }
}

function showReviewResultScreen(options = {}) {
  const { focus = true } = options;
  speechController.cancel();

  elements.reviewResultTitle.textContent = quizState.isInterrupted
    ? "確認途中結果"
    : "確認完了";
  elements.reviewResultDescription.hidden = !quizState.isInterrupted;
  elements.reviewedCount.textContent = String(quizState.reviewedHistory.length);
  elements.reviewPlannedCount.textContent = String(quizState.totalPlannedQuestions);
  elements.reviewRetryButton.textContent = quizState.isInterrupted
    ? "最初からもう一度確認する"
    : "もう一度確認する";
  elements.reviewToQuizButton.textContent = quizState.isInterrupted
    ? "確認済みの単語でクイズする"
    : "この単語でクイズする";
  elements.reviewToQuizButton.disabled = quizState.reviewedHistory.length === 0;
  renderReviewResultList();
  showOnlyScreen("reviewResult");
  if (focus) {
    elements.reviewResultTitle.focus();
  }
}

function showWordListScreen(options = {}) {
  const { focus = true, resetSearch = true } = options;
  speechController.cancel();
  resetQuizState();
  if (resetSearch) {
    elements.wordSearch.value = "";
  }
  renderWordList(filterWords(elements.wordSearch.value));
  showOnlyScreen("wordList");
  if (focus) {
    elements.wordListTitle.focus();
  }
}

function isValidScreenName(screenName) {
  return Object.hasOwn(elements.screens, screenName);
}

function getScreenFromHash() {
  const entry = Object.entries(SCREEN_HASHES).find(([, hash]) => hash === window.location.hash);
  return entry?.[0] || "home";
}

function createHistoryState(screenName, from = null) {
  return {
    app: HISTORY_APP_ID,
    screen: screenName,
    from
  };
}

function renderScreenFromHistory(screenName, options = {}) {
  const { focus = false } = options;

  if (!isValidScreenName(screenName)) {
    replaceHistoryWithHome({ focus });
    return;
  }

  if (screenName === "home") {
    showHomeScreen({ focus, reset: true });
  } else if (screenName === "wordList") {
    showWordListScreen({ focus, resetSearch: true });
  } else if (screenName === "quiz" && quizState.questions.length > 0) {
    showQuizScreen();
  } else if (screenName === "result" && quizState.answerHistory.length > 0) {
    showResultScreen({ focus });
  } else if (screenName === "reviewResult" && quizState.reviewedHistory.length > 0) {
    showReviewResultScreen({ focus });
  } else {
    replaceHistoryWithHome({ focus });
  }
}

function navigateToScreen(screenName, options = {}) {
  const {
    historyAction = "push",
    from = currentScreenName,
    focus = true
  } = options;

  if (!isValidScreenName(screenName)) {
    return;
  }

  const currentState = history.state;
  const sameScreen =
    currentState?.app === HISTORY_APP_ID &&
    currentState.screen === screenName;

  if (historyAction === "push" && !sameScreen) {
    history.pushState(
      createHistoryState(screenName, from),
      "",
      SCREEN_HASHES[screenName]
    );
  } else if (historyAction === "replace" || (historyAction === "push" && sameScreen)) {
    history.replaceState(
      createHistoryState(screenName, from),
      "",
      SCREEN_HASHES[screenName]
    );
  }

  renderScreenFromHistory(screenName, { focus });
}

function replaceHistoryWithHome(options = {}) {
  const { focus = true } = options;
  history.replaceState(
    createHistoryState("home", null),
    "",
    SCREEN_HASHES.home
  );
  showHomeScreen({ focus, reset: true });
}

function initializeHistory() {
  const stateScreen =
    history.state?.app === HISTORY_APP_ID
      ? history.state.screen
      : null;
  let initialScreen = stateScreen || getScreenFromHash();

  if (["quiz", "result", "reviewResult"].includes(initialScreen)) {
    initialScreen = "home";
  }

  history.replaceState(
    createHistoryState(initialScreen, null),
    "",
    SCREEN_HASHES[initialScreen]
  );
  renderScreenFromHistory(initialScreen, { focus: false });
}

function getSelectedSessionConfiguration() {
  const selectedCount = document.querySelector('input[name="question-count"]:checked');
  const selectedLearningMode = document.querySelector('input[name="learning-mode"]:checked');
  const originalMode = selectedCount?.value || "10";
  const questionLimit = originalMode === "all" ? words.length : Number(originalMode);
  const learningMode = selectedLearningMode?.value === "confirmation"
    ? SESSION_MODES.CONFIRMATION
    : SESSION_MODES.NORMAL;

  return { originalMode, questionLimit, learningMode };
}

function startSession(sourceWords, questionLimit, mode = SESSION_MODES.NORMAL, options = {}) {
  if (sourceWords.length === 0) {
    replaceHistoryWithHome();
    return;
  }

  const {
    historyAction = "push",
    originalMode = mode === SESSION_MODES.MISTAKE_REVIEW ? "mistake-review" : String(questionLimit)
  } = options;
  const safeLimit = Math.min(questionLimit, sourceWords.length);

  quizState.mode = mode;
  quizState.originalMode = originalMode;
  quizState.sourceWords = [...sourceWords];
  quizState.questions = shuffleWords(sourceWords).slice(0, safeLimit);
  quizState.currentIndex = 0;
  quizState.correctCount = 0;
  quizState.answerHistory = [];
  quizState.reviewedHistory = [];
  quizState.currentAnswered = false;
  quizState.currentAnswerVisible = false;
  quizState.isInterrupted = false;
  quizState.totalPlannedQuestions = safeLimit;
  quizState.startedAt = Date.now();

  navigateToScreen("quiz", {
    historyAction,
    from: currentScreenName,
    focus: false
  });
  renderQuestion();
}

function startSelectedSession() {
  const configuration = getSelectedSessionConfiguration();
  startSession(words, configuration.questionLimit, configuration.learningMode, {
    historyAction: "push",
    originalMode: configuration.originalMode
  });
}

function startSavedMistakesReview() {
  const reviewQuestions = getSavedMistakeQuestions();
  startSession(reviewQuestions, reviewQuestions.length, SESSION_MODES.MISTAKE_REVIEW, {
    historyAction: "push",
    originalMode: "mistake-review"
  });
}

function startCurrentMistakesReview() {
  const incorrectWords = new Set(
    quizState.answerHistory
      .filter((answer) => !answer.isCorrect)
      .map((answer) => answer.word)
  );
  const reviewQuestions = quizState.questions.filter((question) => incorrectWords.has(question.word));
  startSession(reviewQuestions, reviewQuestions.length, SESSION_MODES.MISTAKE_REVIEW, {
    historyAction: "replace",
    originalMode: "mistake-review"
  });
}

function retryQuiz() {
  startSession(quizState.sourceWords, quizState.totalPlannedQuestions, quizState.mode, {
    historyAction: "replace",
    originalMode: quizState.originalMode
  });
}

function retryConfirmation() {
  startSession(
    quizState.sourceWords,
    quizState.totalPlannedQuestions,
    SESSION_MODES.CONFIRMATION,
    {
      historyAction: "replace",
      originalMode: quizState.originalMode
    }
  );
}

function restartCurrentSession() {
  startSession(quizState.sourceWords, quizState.totalPlannedQuestions, quizState.mode, {
    historyAction: "replace",
    originalMode: quizState.originalMode
  });
}

function getReviewedSourceWords() {
  const wordsByName = new Map(words.map((item) => [item.word, item]));
  return quizState.reviewedHistory
    .map((item) => wordsByName.get(item.word))
    .filter(Boolean);
}

function startQuizFromReviewedWords() {
  const reviewedWords = getReviewedSourceWords();
  startSession(reviewedWords, reviewedWords.length, SESSION_MODES.CONFIRMED_QUIZ, {
    historyAction: "replace",
    originalMode: "confirmed-words"
  });
}

function renderQuestion() {
  const question = quizState.questions[quizState.currentIndex];
  const currentNumber = quizState.currentIndex + 1;
  const totalQuestions = quizState.questions.length;
  const confirmationMode = isConfirmationMode();

  speechController.cancel();
  closeQuizMenu(false);
  quizState.currentAnswered = false;
  quizState.currentAnswerVisible = false;
  elements.currentNumber.textContent = String(currentNumber);
  elements.totalNumber.textContent = String(totalQuestions);
  elements.scoreStatus.hidden = confirmationMode;
  elements.confirmationStatus.hidden = !confirmationMode;
  elements.correctCount.textContent = String(quizState.correctCount);
  elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex));
  elements.progressFill.style.width = `${(quizState.currentIndex / totalQuestions) * 100}%`;
  elements.promptLabel.textContent = confirmationMode
    ? "この拼音の答えを確認"
    : "この拼音の中国語は？";
  elements.pinyin.textContent = question.pinyin;
  elements.quizPronunciationButton.setAttribute("aria-label", `${question.word}の発音を聞く`);
  elements.hintText.textContent = question.meaning;
  elements.hintText.hidden = true;
  elements.hintButton.hidden = confirmationMode;
  elements.hintButton.setAttribute("aria-expanded", "false");
  elements.hintButton.textContent = "日本語のヒントを見る";
  elements.feedback.hidden = true;
  elements.feedback.classList.remove("correct", "incorrect");
  elements.nextButton.hidden = true;
  elements.answerForm.hidden = confirmationMode;
  elements.confirmationControls.hidden = !confirmationMode;
  elements.quizNavigation.hidden = confirmationMode;

  if (confirmationMode) {
    elements.showAnswerButton.hidden = false;
    elements.confirmationAnswer.hidden = true;
    elements.confirmationNextButton.hidden = true;
    elements.confirmationNextButton.textContent =
      currentNumber === totalQuestions ? "確認を終了する" : "次の単語";
    elements.confirmationPinyin.textContent = "";
    elements.confirmationWord.textContent = "";
    elements.confirmationMeaning.textContent = "";
    requestAnimationFrame(() => elements.showAnswerButton.focus({ preventScroll: true }));
    return;
  }

  elements.answerForm.reset();
  elements.answerInput.disabled = false;
  elements.checkButton.disabled = false;
  elements.skipButton.disabled = false;
  elements.inputError.hidden = true;
  elements.answerInput.removeAttribute("aria-invalid");
  elements.nextButton.textContent = currentNumber === totalQuestions ? "結果を見る" : "次の問題";
  requestAnimationFrame(() => elements.answerInput.focus({ preventScroll: true }));
}

function revealHint() {
  if (isConfirmationMode()) {
    return;
  }

  elements.hintText.hidden = false;
  elements.hintButton.hidden = true;
  elements.hintButton.setAttribute("aria-expanded", "true");
}

function submitAnswer(event) {
  event.preventDefault();

  if (isConfirmationMode()) {
    return;
  }

  if (quizState.currentAnswered) {
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
  if (quizState.currentAnswered || isConfirmationMode()) {
    return;
  }

  const question = quizState.questions[quizState.currentIndex];
  quizState.currentAnswered = true;
  recordAnswer(question, userAnswer, wasCorrect, skipped);

  if (wasCorrect) {
    quizState.correctCount += 1;
  }

  updateStoredMistakes(question.word, wasCorrect);
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
  if (isConfirmationMode() || !quizState.currentAnswered) {
    return;
  }

  if (quizState.currentIndex >= quizState.questions.length - 1) {
    finishQuizAsCompleted();
    return;
  }

  quizState.currentIndex += 1;
  renderQuestion();
}

function recordReviewedWord(question) {
  const questionNumber = quizState.currentIndex + 1;
  const alreadyRecorded = quizState.reviewedHistory.some(
    (item) => item.questionNumber === questionNumber
  );

  if (alreadyRecorded) {
    return;
  }

  quizState.reviewedHistory.push({
    questionNumber,
    word: question.word,
    pinyin: question.pinyin,
    meaning: question.meaning,
    reviewed: true
  });
}

function revealConfirmationAnswer() {
  if (!isConfirmationMode() || quizState.currentAnswerVisible) {
    return;
  }

  const question = quizState.questions[quizState.currentIndex];
  quizState.currentAnswerVisible = true;
  recordReviewedWord(question);
  elements.confirmationPinyin.textContent = question.pinyin;
  elements.confirmationWord.textContent = question.word;
  elements.confirmationMeaning.textContent = question.meaning;
  elements.confirmationAnswer.hidden = false;
  elements.showAnswerButton.hidden = true;
  elements.confirmationNextButton.hidden = false;
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex + 1));
  elements.progressFill.style.width = `${((quizState.currentIndex + 1) / quizState.questions.length) * 100}%`;
  elements.confirmationNextButton.focus();
}

function moveToNextConfirmationWord() {
  if (!isConfirmationMode() || !quizState.currentAnswerVisible) {
    return;
  }

  if (quizState.currentIndex >= quizState.questions.length - 1) {
    finishConfirmationAsCompleted();
    return;
  }

  quizState.currentIndex += 1;
  renderQuestion();
}

function finishQuizAsCompleted() {
  quizState.isInterrupted = false;
  navigateToScreen("result", {
    historyAction: "replace",
    from: "quiz",
    focus: true
  });
}

function finishQuizAsInterrupted(options = {}) {
  const { focus = true } = options;
  if (quizState.answerHistory.length === 0) {
    replaceHistoryWithHome({ focus });
    return;
  }

  quizState.isInterrupted = true;
  navigateToScreen("result", {
    historyAction: "replace",
    from: "quiz",
    focus
  });
}

function finishConfirmationAsCompleted() {
  quizState.isInterrupted = false;
  navigateToScreen("reviewResult", {
    historyAction: "replace",
    from: "quiz",
    focus: true
  });
}

function finishConfirmationAsInterrupted(options = {}) {
  const { focus = true } = options;
  if (quizState.reviewedHistory.length === 0) {
    replaceHistoryWithHome({ focus });
    return;
  }

  quizState.isInterrupted = true;
  navigateToScreen("reviewResult", {
    historyAction: "replace",
    from: "quiz",
    focus
  });
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

  quizState.answerHistory.forEach((answer, index) => {
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

    questionNumber.textContent = `解答 ${index + 1}`;
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

function renderReviewResultList() {
  elements.reviewResultList.replaceChildren();

  quizState.reviewedHistory.forEach((reviewedItem, index) => {
    const item = document.createElement("li");
    const header = document.createElement("div");
    const questionNumber = document.createElement("p");
    const details = document.createElement("dl");
    const pronunciationButton = document.createElement("button");

    item.className = "result-item review-result-item";
    header.className = "result-item-header";
    questionNumber.className = "result-question-number";
    questionNumber.textContent = `確認 ${index + 1}`;
    details.className = "result-details";
    pronunciationButton.className = "pronunciation-button pronunciation-button-small";
    header.append(questionNumber);
    details.append(
      createResultDetail("拼音", reviewedItem.pinyin, { lang: "zh-Latn" }),
      createResultDetail("中国語", reviewedItem.word, {
        className: "chinese-text",
        lang: "zh-Hans"
      }),
      createResultDetail("意味", reviewedItem.meaning)
    );

    speechController.prepareButton(pronunciationButton, reviewedItem.word, "🔊 発音");
    item.append(header, details, pronunciationButton);
    elements.reviewResultList.append(item);
  });
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

function openConfirmDialog(options) {
  const {
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    returnFocus = document.activeElement
  } = options;

  speechController.cancel();
  closeQuizMenu(false);
  focusBeforeDialog = returnFocus;
  confirmDialogAction = onConfirm;
  elements.confirmDialogTitle.textContent = title;
  elements.confirmDialogMessage.textContent = message;
  elements.confirmDialogButton.textContent = confirmLabel;
  elements.cancelDialogButton.textContent = cancelLabel;
  elements.confirmDialog.hidden = false;
  document.body.classList.add("dialog-open");
  elements.cancelDialogButton.focus();
}

function closeConfirmDialog(restoreFocus = true) {
  elements.confirmDialog.hidden = true;
  document.body.classList.remove("dialog-open");
  confirmDialogAction = null;
  if (restoreFocus && focusBeforeDialog instanceof HTMLElement) {
    focusBeforeDialog.focus();
  }
  focusBeforeDialog = null;
}

function confirmDialogSelection() {
  const action = confirmDialogAction;
  closeConfirmDialog(false);
  if (typeof action === "function") {
    action();
  }
}

function requestExitSession() {
  if (isConfirmationMode()) {
    if (quizState.reviewedHistory.length === 0) {
      replaceHistoryWithHome();
      return;
    }

    openConfirmDialog({
      title: "確認を終了しますか？",
      message: "確認を終了して、ここまで確認した単語を表示しますか？",
      confirmLabel: "途中結果を見る",
      cancelLabel: "確認を続ける",
      onConfirm: finishConfirmationAsInterrupted,
      returnFocus: elements.quizHomeButton
    });
    return;
  }

  if (quizState.answerHistory.length === 0) {
    replaceHistoryWithHome();
    return;
  }

  openConfirmDialog({
    title: "クイズを終了しますか？",
    message: "クイズを終了して、ここまでの結果を表示しますか？",
    confirmLabel: "途中結果を見る",
    cancelLabel: "クイズを続ける",
    onConfirm: finishQuizAsInterrupted,
    returnFocus: elements.quizHomeButton
  });
}

function requestRestartSession() {
  openConfirmDialog({
    title: "最初からやり直しますか？",
    message: "現在のクイズを終了し、最初からやり直しますか？ここまでの解答は破棄されます。",
    confirmLabel: "最初からやり直す",
    cancelLabel: "キャンセル",
    onConfirm: restartCurrentSession,
    returnFocus: elements.quizMenuButton
  });
}

function handleDialogKeydown(event) {
  if (elements.confirmDialog.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeConfirmDialog();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const firstButton = elements.confirmDialogButton;
  const lastButton = elements.cancelDialogButton;
  if (event.shiftKey && document.activeElement === firstButton) {
    event.preventDefault();
    lastButton.focus();
  } else if (!event.shiftKey && document.activeElement === lastButton) {
    event.preventDefault();
    firstButton.focus();
  }
}

function navigateHomeFromWordList() {
  const state = history.state;
  const canGoBackToAppHome =
    state?.app === HISTORY_APP_ID &&
    state.screen === "wordList" &&
    state.from === "home";

  if (canGoBackToAppHome) {
    history.back();
  } else {
    replaceHistoryWithHome();
  }
}

function navigateHomeFromResult() {
  replaceHistoryWithHome();
}

function keepAnswerControlsVisible() {
  if (!window.matchMedia("(max-width: 768px)").matches) {
    return;
  }

  window.clearTimeout(inputFocusScrollTimer);
  inputFocusScrollTimer = window.setTimeout(() => {
    try {
      elements.answerInput.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest"
      });
    } catch (error) {
      elements.answerInput.scrollIntoView();
    }
  }, 250);
}

function handlePopState(event) {
  const targetScreen =
    event.state?.app === HISTORY_APP_ID
      ? event.state.screen
      : getScreenFromHash();

  if (currentScreenName === "quiz" && targetScreen !== "quiz") {
    if (isConfirmationMode() && quizState.reviewedHistory.length > 0) {
      finishConfirmationAsInterrupted({ focus: false });
    } else if (!isConfirmationMode() && quizState.answerHistory.length > 0) {
      finishQuizAsInterrupted({ focus: false });
    } else {
      resetQuizState();
      renderScreenFromHistory(targetScreen, { focus: false });
    }
    return;
  }

  renderScreenFromHistory(targetScreen, { focus: false });
}

elements.learningModeInputs.forEach((input) => {
  input.addEventListener("change", updateHomeModeControls);
});
elements.startButton.addEventListener("click", startSelectedSession);
elements.homeReviewButton.addEventListener("click", startSavedMistakesReview);
elements.wordListButton.addEventListener("click", () => {
  navigateToScreen("wordList", {
    historyAction: "push",
    from: "home",
    focus: true
  });
});
elements.quizHomeButton.addEventListener("click", requestExitSession);
elements.quizMenuButton.addEventListener("click", toggleQuizMenu);
elements.restartButton.addEventListener("click", requestRestartSession);
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
elements.showAnswerButton.addEventListener("click", revealConfirmationAnswer);
elements.confirmationNextButton.addEventListener("click", moveToNextConfirmationWord);
elements.retryButton.addEventListener("click", retryQuiz);
elements.resultReviewButton.addEventListener("click", startCurrentMistakesReview);
elements.resultHomeButton.addEventListener("click", navigateHomeFromResult);
elements.reviewResultHomeButton.addEventListener("click", navigateHomeFromResult);
elements.reviewRetryButton.addEventListener("click", retryConfirmation);
elements.reviewToQuizButton.addEventListener("click", startQuizFromReviewedWords);
elements.wordListHomeButton.addEventListener("click", navigateHomeFromWordList);
elements.wordSearch.addEventListener("input", updateWordSearch);
elements.confirmDialogButton.addEventListener("click", confirmDialogSelection);
elements.cancelDialogButton.addEventListener("click", () => closeConfirmDialog());
elements.confirmDialog.addEventListener("click", (event) => {
  if (event.target === elements.confirmDialog) {
    closeConfirmDialog();
  }
});
elements.confirmDialog.addEventListener("keydown", handleDialogKeydown);
elements.answerInput.addEventListener("focus", keepAnswerControlsVisible);
elements.answerInput.addEventListener("input", () => {
  if (normalizeAnswer(elements.answerInput.value) !== "") {
    elements.inputError.hidden = true;
    elements.answerInput.removeAttribute("aria-invalid");
  }
});
elements.answerInput.addEventListener("keydown", (event) => {
  if (
    event.key === "Enter" &&
    !quizState.currentAnswered &&
    !isConfirmationMode() &&
    !event.isComposing &&
    event.keyCode !== 229
  ) {
    event.preventDefault();
    event.stopPropagation();
    elements.checkButton.click();
  }
});
document.addEventListener("click", (event) => {
  if (!elements.quizMenuPanel.hidden && !elements.quizMenu.contains(event.target)) {
    closeQuizMenu(false);
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.quizMenuPanel.hidden) {
    event.preventDefault();
    closeQuizMenu(true);
    return;
  }

  if (
    event.key === "Enter" &&
    quizState.currentAnswered &&
    !isConfirmationMode() &&
    elements.confirmDialog.hidden &&
    !elements.screens.quiz.hidden &&
    !event.isComposing &&
    event.keyCode !== 229
  ) {
    event.preventDefault();
    moveToNextQuestion();
  }
});
window.addEventListener("popstate", handlePopState);

updateSpeechAvailability();
updateHomeModeControls();
initializeHistory();
