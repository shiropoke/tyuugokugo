"use strict";

const STORAGE_KEY = "tyuugokugo-mistake-words";
const SELECTED_LESSONS_STORAGE_KEY = "tyuugokugo-selected-lessons";
const LEARNING_MODE_STORAGE_KEY = "tyuugokugo-learning-mode";
const LAST_INPUT_MODE_STORAGE_KEY = "tyuugokugo-last-input-mode";
const HISTORY_APP_ID = "tyuugokugo";
const ALL_LESSONS = [1, 2, 3, 4, 5, 6];
const LEARNING_MODES = {
  PINYIN_TO_HANZI: "pinyin-to-hanzi",
  MEANING_TO_HANZI: "meaning-to-hanzi",
  REVIEW: "review"
};
const LEARNING_MODE_LABELS = {
  [LEARNING_MODES.PINYIN_TO_HANZI]: "拼音→簡体字",
  [LEARNING_MODES.MEANING_TO_HANZI]: "日本語→簡体字",
  [LEARNING_MODES.REVIEW]: "確認モード"
};
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
  lessonInputs: [...document.querySelectorAll('input[name="lesson"]')],
  allLessonsCheckbox: document.querySelector("#all-lessons-checkbox"),
  selectedLessonsText: document.querySelector("#selected-lessons-text"),
  candidateWordCount: document.querySelector("#candidate-word-count"),
  actualQuestionCount: document.querySelector("#actual-question-count"),
  lessonSelectionError: document.querySelector("#lesson-selection-error"),
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
  quizLearningMode: document.querySelector("#quiz-learning-mode"),
  quizTargetLessons: document.querySelector("#quiz-target-lessons"),
  progressBar: document.querySelector("#progress-bar"),
  progressFill: document.querySelector("#progress-fill"),
  promptLabel: document.querySelector("#prompt-label"),
  questionContent: document.querySelector("#question-content"),
  quizTools: document.querySelector("#quiz-tools"),
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
  feedbackPinyin: document.querySelector("#feedback-pinyin"),
  answerMeaning: document.querySelector("#answer-meaning"),
  feedbackUserAnswer: document.querySelector("#feedback-user-answer"),
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
  resultLearningMode: document.querySelector("#result-learning-mode"),
  resultTargetLessons: document.querySelector("#result-target-lessons"),
  resultQuestionCount: document.querySelector("#result-question-count"),
  perfectMessage: document.querySelector("#perfect-message"),
  resultList: document.querySelector("#result-list"),
  retryButton: document.querySelector("#retry-button"),
  resultReviewButton: document.querySelector("#result-review-button"),
  resultHomeButton: document.querySelector("#result-home-button"),
  reviewResultTitle: document.querySelector("#review-result-title"),
  reviewResultDescription: document.querySelector("#review-result-description"),
  reviewedCount: document.querySelector("#reviewed-count"),
  reviewPlannedCount: document.querySelector("#review-planned-count"),
  reviewLearningMode: document.querySelector("#review-learning-mode"),
  reviewTargetLessons: document.querySelector("#review-target-lessons"),
  reviewQuestionCount: document.querySelector("#review-question-count"),
  reviewResultList: document.querySelector("#review-result-list"),
  reviewResultHomeButton: document.querySelector("#review-result-home-button"),
  reviewRetryButton: document.querySelector("#review-retry-button"),
  reviewToQuizButton: document.querySelector("#review-to-quiz-button"),
  wordListTitle: document.querySelector("#word-list-title"),
  wordListHomeButton: document.querySelector("#word-list-home-button"),
  wordListLessonFilter: document.querySelector("#word-list-lesson-filter"),
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
  learningMode: LEARNING_MODES.PINYIN_TO_HANZI,
  originalMode: "10",
  selectedLessons: [],
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
  return quizState.learningMode === LEARNING_MODES.REVIEW;
}

function isMeaningToHanziMode() {
  return quizState.learningMode === LEARNING_MODES.MEANING_TO_HANZI;
}

function resetQuizState() {
  quizState.mode = SESSION_MODES.NORMAL;
  quizState.learningMode = LEARNING_MODES.PINYIN_TO_HANZI;
  quizState.originalMode = "10";
  quizState.selectedLessons = [];
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
  const acceptedAnswers = [question.word, ...(question.answers || [])];

  return [...new Set(acceptedAnswers)].some(
    (answer) => normalizeAnswer(answer) === normalizedInput
  );
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

function isValidLessonSelection(value) {
  return (
    Array.isArray(value) &&
    value.length >= 1 &&
    value.length <= ALL_LESSONS.length &&
    value.every((lesson) => Number.isInteger(lesson) && ALL_LESSONS.includes(lesson)) &&
    new Set(value).size === value.length
  );
}

function loadSelectedLessons() {
  try {
    const storedValue = localStorage.getItem(SELECTED_LESSONS_STORAGE_KEY);
    if (!storedValue) {
      return [...ALL_LESSONS];
    }

    const parsedValue = JSON.parse(storedValue);
    return isValidLessonSelection(parsedValue)
      ? [...parsedValue].sort((first, second) => first - second)
      : [...ALL_LESSONS];
  } catch (error) {
    return [...ALL_LESSONS];
  }
}

function saveSelectedLessons(selectedLessons) {
  if (!isValidLessonSelection(selectedLessons)) {
    return;
  }

  try {
    localStorage.setItem(
      SELECTED_LESSONS_STORAGE_KEY,
      JSON.stringify([...selectedLessons])
    );
  } catch (error) {
    // 保存できない環境でも、現在の選択で学習を続行します。
  }
}

function normalizeStoredLearningMode(value) {
  const compatibleModes = {
    quiz: LEARNING_MODES.PINYIN_TO_HANZI,
    pinyin: LEARNING_MODES.PINYIN_TO_HANZI,
    confirmation: LEARNING_MODES.REVIEW,
    [LEARNING_MODES.PINYIN_TO_HANZI]: LEARNING_MODES.PINYIN_TO_HANZI,
    [LEARNING_MODES.MEANING_TO_HANZI]: LEARNING_MODES.MEANING_TO_HANZI,
    [LEARNING_MODES.REVIEW]: LEARNING_MODES.REVIEW
  };

  return compatibleModes[value] || LEARNING_MODES.PINYIN_TO_HANZI;
}

function normalizeInputLearningMode(value) {
  return value === LEARNING_MODES.MEANING_TO_HANZI
    ? LEARNING_MODES.MEANING_TO_HANZI
    : LEARNING_MODES.PINYIN_TO_HANZI;
}

function loadLearningMode() {
  try {
    const storedMode = localStorage.getItem(LEARNING_MODE_STORAGE_KEY);
    const normalizedMode = normalizeStoredLearningMode(storedMode);
    if (storedMode !== normalizedMode) {
      saveLearningMode(normalizedMode);
    }
    return normalizedMode;
  } catch (error) {
    return LEARNING_MODES.PINYIN_TO_HANZI;
  }
}

function saveLearningMode(learningMode) {
  if (!Object.hasOwn(LEARNING_MODE_LABELS, learningMode)) {
    return;
  }

  try {
    localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
  } catch (error) {
    // 保存できない環境でも、現在のモードで学習を続行します。
  }
}

function loadLastInputMode() {
  try {
    const storedMode = localStorage.getItem(LAST_INPUT_MODE_STORAGE_KEY);
    const normalizedMode = normalizeInputLearningMode(storedMode);
    if (storedMode !== normalizedMode) {
      saveLastInputMode(normalizedMode);
    }
    return normalizedMode;
  } catch (error) {
    return LEARNING_MODES.PINYIN_TO_HANZI;
  }
}

function saveLastInputMode(learningMode) {
  if (
    learningMode !== LEARNING_MODES.PINYIN_TO_HANZI &&
    learningMode !== LEARNING_MODES.MEANING_TO_HANZI
  ) {
    return;
  }

  try {
    localStorage.setItem(LAST_INPUT_MODE_STORAGE_KEY, learningMode);
  } catch (error) {
    // 保存できない環境でも、現在のモードで学習を続行します。
  }
}

function getSelectedLearningMode() {
  return normalizeStoredLearningMode(
    document.querySelector('input[name="learning-mode"]:checked')?.value
  );
}

function applyLearningModeSelection(learningMode) {
  const safeMode = normalizeStoredLearningMode(learningMode);
  elements.learningModeInputs.forEach((input) => {
    input.checked = input.value === safeMode;
  });
}

function getLearningModeLabel(learningMode) {
  return LEARNING_MODE_LABELS[learningMode] || LEARNING_MODE_LABELS[LEARNING_MODES.PINYIN_TO_HANZI];
}

function getMistakeReviewLearningMode(selectedMode = getSelectedLearningMode()) {
  return selectedMode === LEARNING_MODES.MEANING_TO_HANZI
    ? LEARNING_MODES.MEANING_TO_HANZI
    : LEARNING_MODES.PINYIN_TO_HANZI;
}

function getQuestionPrompt(question, learningMode) {
  if (learningMode === LEARNING_MODES.MEANING_TO_HANZI) {
    return {
      type: "meaning",
      value: question.meaning
    };
  }

  return {
    type: "pinyin",
    value: question.pinyin
  };
}

function getSelectedLessonsFromControls() {
  return elements.lessonInputs
    .filter((input) => input.checked)
    .map((input) => Number(input.value))
    .sort((first, second) => first - second);
}

function applyLessonSelection(selectedLessons) {
  const selectedSet = new Set(selectedLessons);
  elements.lessonInputs.forEach((input) => {
    input.checked = selectedSet.has(Number(input.value));
  });
}

function formatLessons(selectedLessons) {
  if (selectedLessons.length === ALL_LESSONS.length) {
    return "全課";
  }

  return selectedLessons.map((lesson) => `第${lesson}課`).join("・");
}

function getWordsForLessons(selectedLessons) {
  return words.filter((item) => selectedLessons.includes(item.lesson));
}

function getSelectedQuestionCountValue() {
  return document.querySelector('input[name="question-count"]:checked')?.value || "10";
}

function getActualQuestionCount(candidateCount) {
  const selectedCount = getSelectedQuestionCountValue();
  return selectedCount === "all"
    ? candidateCount
    : Math.min(Number(selectedCount), candidateCount);
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

function getSavedMistakeQuestions(selectedLessons = ALL_LESSONS) {
  const savedWords = new Set(loadSavedMistakeWords());
  return words.filter(
    (item) => savedWords.has(item.word) && selectedLessons.includes(item.lesson)
  );
}

function updateHomeReviewControls(selectedLessons = getSelectedLessonsFromControls()) {
  const totalSavedCount = getSavedMistakeQuestions(ALL_LESSONS).length;
  const selectedSavedCount = getSavedMistakeQuestions(selectedLessons).length;
  const hasSavedMistakes = totalSavedCount > 0;

  elements.homeReviewButton.hidden = !hasSavedMistakes;
  elements.homeReviewButton.disabled = selectedSavedCount === 0;
  elements.homeReviewButton.textContent =
    `間違えた問題だけ復習（${selectedSavedCount}語）`;
  elements.savedMistakesNote.hidden = !hasSavedMistakes;
  elements.savedMistakesNote.textContent = hasSavedMistakes
    ? selectedSavedCount > 0
      ? `選択中の復習対象：${selectedSavedCount}語（${getLearningModeLabel(getMistakeReviewLearningMode())}）`
      : "選択した課には、復習する単語がありません。"
    : "";
}

function updateLessonSelectionUI(options = {}) {
  const { save = true } = options;
  const selectedLessons = getSelectedLessonsFromControls();
  const selectedCount = selectedLessons.length;
  const candidateCount = getWordsForLessons(selectedLessons).length;
  const actualCount = getActualQuestionCount(candidateCount);

  elements.allLessonsCheckbox.checked = selectedCount === ALL_LESSONS.length;
  elements.allLessonsCheckbox.indeterminate =
    selectedCount > 0 && selectedCount < ALL_LESSONS.length;
  elements.selectedLessonsText.textContent =
    `選択中：${selectedCount > 0 ? formatLessons(selectedLessons) : "なし"}`;
  elements.candidateWordCount.textContent = `出題候補：${candidateCount}語`;
  elements.actualQuestionCount.textContent = `実際の出題数：${actualCount}問`;
  elements.lessonSelectionError.textContent =
    "出題する課を1つ以上選択してください。";
  elements.lessonSelectionError.hidden = selectedCount > 0;
  updateHomeReviewControls(selectedLessons);

  if (save && selectedCount > 0) {
    saveSelectedLessons(selectedLessons);
  }
}

function updateHomeModeControls(options = {}) {
  const { save = false } = options;
  const selectedMode = getSelectedLearningMode();
  const buttonLabels = {
    [LEARNING_MODES.PINYIN_TO_HANZI]: "拼音→簡体字を始める",
    [LEARNING_MODES.MEANING_TO_HANZI]: "日本語→簡体字を始める",
    [LEARNING_MODES.REVIEW]: "確認を始める"
  };

  elements.startButton.textContent = buttonLabels[selectedMode];
  updateHomeReviewControls();

  if (save) {
    saveLearningMode(selectedMode);
    saveLastInputMode(selectedMode);
  }
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
  updateLessonSelectionUI({ save: false });
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
  elements.resultLearningMode.textContent =
    `学習モード：${getLearningModeLabel(quizState.learningMode)}`;
  elements.resultTargetLessons.textContent =
    `対象：${formatLessons(quizState.selectedLessons)}`;
  elements.resultQuestionCount.textContent =
    `出題数：${quizState.totalPlannedQuestions}問`;
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
  elements.reviewLearningMode.textContent =
    `学習モード：${getLearningModeLabel(LEARNING_MODES.REVIEW)}`;
  elements.reviewTargetLessons.textContent =
    `対象：${formatLessons(quizState.selectedLessons)}`;
  elements.reviewQuestionCount.textContent =
    `予定単語数：${quizState.totalPlannedQuestions}語`;
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
    elements.wordListLessonFilter.value = "all";
  }
  renderWordList(
    filterWords(elements.wordSearch.value, elements.wordListLessonFilter.value)
  );
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
  const originalMode = selectedCount?.value || "10";
  const learningMode = getSelectedLearningMode();
  const sessionMode = learningMode === LEARNING_MODES.REVIEW
    ? SESSION_MODES.CONFIRMATION
    : SESSION_MODES.NORMAL;

  return { originalMode, learningMode, sessionMode };
}

function startSession(sourceWords, questionLimit, mode = SESSION_MODES.NORMAL, options = {}) {
  if (sourceWords.length === 0) {
    replaceHistoryWithHome();
    return;
  }

  const {
    historyAction = "push",
    originalMode = mode === SESSION_MODES.MISTAKE_REVIEW ? "mistake-review" : String(questionLimit),
    learningMode = mode === SESSION_MODES.CONFIRMATION
      ? LEARNING_MODES.REVIEW
      : LEARNING_MODES.PINYIN_TO_HANZI,
    selectedLessons = [...new Set(sourceWords.map((item) => item.lesson))].sort(
      (first, second) => first - second
    )
  } = options;
  const safeLimit = Math.min(questionLimit, sourceWords.length);

  quizState.mode = mode;
  quizState.learningMode = learningMode;
  quizState.originalMode = originalMode;
  quizState.selectedLessons = [...selectedLessons];
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
  const selectedLessons = getSelectedLessonsFromControls();

  if (selectedLessons.length === 0) {
    elements.lessonSelectionError.hidden = false;
    elements.lessonInputs[0].focus();
    return;
  }

  const availableWords = getWordsForLessons(selectedLessons);
  const questionLimit = configuration.originalMode === "all"
    ? availableWords.length
    : Number(configuration.originalMode);
  startSession(availableWords, questionLimit, configuration.sessionMode, {
    historyAction: "push",
    originalMode: configuration.originalMode,
    learningMode: configuration.learningMode,
    selectedLessons
  });
}

function startSavedMistakesReview() {
  const selectedLessons = getSelectedLessonsFromControls();
  const reviewLearningMode = getMistakeReviewLearningMode();
  const reviewQuestions = getSavedMistakeQuestions(selectedLessons);
  if (reviewQuestions.length === 0) {
    elements.lessonSelectionError.textContent =
      "選択した課には、復習する単語がありません。";
    elements.lessonSelectionError.hidden = false;
    return;
  }

  startSession(reviewQuestions, reviewQuestions.length, SESSION_MODES.MISTAKE_REVIEW, {
    historyAction: "push",
    originalMode: "mistake-review",
    learningMode: reviewLearningMode,
    selectedLessons
  });
}

function startCurrentMistakesReview() {
  const incorrectWords = new Set(
    quizState.answerHistory
      .filter((answer) => !answer.isCorrect)
      .map((answer) => answer.word)
  );
  const reviewQuestions = quizState.questions.filter((question) => incorrectWords.has(question.word));
  const selectedLessons = [...new Set(reviewQuestions.map((question) => question.lesson))].sort(
    (first, second) => first - second
  );
  startSession(reviewQuestions, reviewQuestions.length, SESSION_MODES.MISTAKE_REVIEW, {
    historyAction: "replace",
    originalMode: "mistake-review",
    learningMode: normalizeInputLearningMode(quizState.learningMode),
    selectedLessons
  });
}

function retryQuiz() {
  startSession(quizState.sourceWords, quizState.totalPlannedQuestions, quizState.mode, {
    historyAction: "replace",
    originalMode: quizState.originalMode,
    learningMode: quizState.learningMode,
    selectedLessons: quizState.selectedLessons
  });
}

function retryConfirmation() {
  startSession(
    quizState.sourceWords,
    quizState.totalPlannedQuestions,
    SESSION_MODES.CONFIRMATION,
    {
      historyAction: "replace",
      originalMode: quizState.originalMode,
      learningMode: LEARNING_MODES.REVIEW,
      selectedLessons: quizState.selectedLessons
    }
  );
}

function restartCurrentSession() {
  startSession(quizState.sourceWords, quizState.totalPlannedQuestions, quizState.mode, {
    historyAction: "replace",
    originalMode: quizState.originalMode,
    learningMode: quizState.learningMode,
    selectedLessons: quizState.selectedLessons
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
  const selectedLessons = [...new Set(reviewedWords.map((item) => item.lesson))].sort(
    (first, second) => first - second
  );
  startSession(reviewedWords, reviewedWords.length, SESSION_MODES.CONFIRMED_QUIZ, {
    historyAction: "replace",
    originalMode: "confirmed-words",
    learningMode: loadLastInputMode(),
    selectedLessons
  });
}

function renderQuestion() {
  const question = quizState.questions[quizState.currentIndex];
  const currentNumber = quizState.currentIndex + 1;
  const totalQuestions = quizState.questions.length;
  const confirmationMode = isConfirmationMode();
  const meaningMode = isMeaningToHanziMode();
  const prompt = getQuestionPrompt(question, quizState.learningMode);

  speechController.cancel();
  closeQuizMenu(false);
  quizState.currentAnswered = false;
  quizState.currentAnswerVisible = false;
  elements.currentNumber.textContent = String(currentNumber);
  elements.totalNumber.textContent = String(totalQuestions);
  elements.scoreStatus.hidden = confirmationMode;
  elements.confirmationStatus.hidden = !confirmationMode;
  elements.correctCount.textContent = String(quizState.correctCount);
  elements.quizLearningMode.textContent =
    `学習モード：${getLearningModeLabel(quizState.learningMode)}`;
  elements.quizTargetLessons.textContent =
    `対象：${formatLessons(quizState.selectedLessons)}`;
  elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
  elements.progressBar.setAttribute("aria-valuenow", String(quizState.currentIndex));
  elements.progressFill.style.width = `${(quizState.currentIndex / totalQuestions) * 100}%`;
  elements.promptLabel.textContent = confirmationMode
    ? "この拼音の答えを確認"
    : meaningMode
      ? "日本語の意味に対応する簡体字は？"
      : "この拼音の簡体字は？";
  elements.questionContent.textContent = prompt.value;
  elements.questionContent.className = meaningMode
    ? "question-content meaning-question"
    : "question-content pinyin";
  elements.questionContent.lang = meaningMode ? "ja" : "zh-Latn";
  elements.quizPronunciationButton.setAttribute("aria-label", `${question.word}の発音を聞く`);
  elements.hintText.textContent = question.meaning;
  elements.hintText.hidden = true;
  elements.quizTools.hidden = meaningMode;
  elements.quizPronunciationButton.hidden = false;
  elements.hintButton.hidden = confirmationMode || meaningMode;
  elements.hintButton.setAttribute("aria-expanded", "false");
  elements.hintButton.textContent = "日本語のヒントを見る";
  elements.feedback.hidden = true;
  elements.feedback.classList.remove("correct", "incorrect");
  elements.nextButton.hidden = true;
  elements.answerForm.hidden = confirmationMode;
  elements.confirmationControls.hidden = !confirmationMode;
  elements.quizNavigation.hidden = confirmationMode;
  elements.feedbackPinyin.textContent = "";
  elements.feedbackUserAnswer.textContent = "";

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
  const prompt = getQuestionPrompt(question, quizState.learningMode);
  const alreadyRecorded = quizState.answerHistory.some(
    (answer) => answer.questionNumber === questionNumber
  );

  if (alreadyRecorded) {
    return;
  }

  quizState.answerHistory.push({
    questionNumber,
    learningMode: quizState.learningMode,
    promptType: prompt.type,
    prompt: prompt.value,
    word: question.word,
    pinyin: question.pinyin,
    meaning: question.meaning,
    lesson: question.lesson,
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
  elements.feedbackPinyin.textContent = question.pinyin;
  elements.answerMeaning.textContent = question.meaning;
  elements.feedbackUserAnswer.textContent = skipped ? "未回答" : userAnswer;
  if (isMeaningToHanziMode()) {
    elements.quizTools.hidden = false;
    elements.hintButton.hidden = true;
  }
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
    lesson: question.lesson,
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

    questionNumber.textContent = `問題 ${answer.questionNumber || index + 1}`;
    status.textContent = answer.isCorrect ? "正解" : "不正解";
    header.append(questionNumber, status);

    const promptLabel = answer.promptType === "meaning"
      ? "出題された日本語"
      : "出題された拼音";

    details.append(
      createResultDetail("課", `第${answer.lesson}課`),
      createResultDetail(promptLabel, answer.prompt, {
        lang: answer.promptType === "meaning" ? "ja" : "zh-Latn"
      }),
      createResultDetail("意味", answer.meaning),
      createResultDetail("正解の簡体字", answer.word, {
        className: "chinese-text",
        lang: "zh-CN"
      }),
      createResultDetail("拼音", answer.pinyin, { lang: "zh-Latn" }),
      createResultDetail("あなたの解答", answer.skipped ? "未回答" : answer.userAnswer, {
        className: "chinese-text",
        lang: "zh-CN"
      })
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
      createResultDetail("課", `第${reviewedItem.lesson}課`),
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

function filterWords(searchText, lessonFilter = "all") {
  const normalizedQuery = normalizeSearchText(searchText);
  const selectedLesson = lessonFilter === "all" ? null : Number(lessonFilter);

  return words.filter((item) => {
    const matchesLesson = selectedLesson === null || item.lesson === selectedLesson;
    const matchesSearch =
      normalizedQuery === "" ||
      [item.word, item.pinyin, item.meaning]
        .map(normalizeSearchText)
        .some((value) => value.includes(normalizedQuery));
    return matchesLesson && matchesSearch;
  });
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
  let currentLesson = null;

  filteredWords.forEach((item) => {
    if (item.lesson !== currentLesson) {
      const headingItem = document.createElement("li");
      const heading = document.createElement("h2");
      headingItem.className = "word-list-lesson-heading";
      heading.textContent = `第${item.lesson}課`;
      headingItem.append(heading);
      elements.wordList.append(headingItem);
      currentLesson = item.lesson;
    }

    const listItem = document.createElement("li");
    const lessonBadge = document.createElement("p");
    const pronunciationButton = document.createElement("button");

    listItem.className = "word-list-item";
    lessonBadge.className = "lesson-badge";
    lessonBadge.textContent = `第${item.lesson}課`;
    pronunciationButton.className = "pronunciation-button";

    listItem.append(
      lessonBadge,
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
  renderWordList(
    filterWords(elements.wordSearch.value, elements.wordListLessonFilter.value)
  );
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
  input.addEventListener("change", () => updateHomeModeControls({ save: true }));
});
elements.lessonInputs.forEach((input) => {
  input.addEventListener("change", () => updateLessonSelectionUI());
});
elements.allLessonsCheckbox.addEventListener("change", () => {
  const shouldSelectAll = elements.allLessonsCheckbox.checked;
  elements.lessonInputs.forEach((input) => {
    input.checked = shouldSelectAll;
  });
  updateLessonSelectionUI();
});
document.querySelectorAll('input[name="question-count"]').forEach((input) => {
  input.addEventListener("change", () => updateLessonSelectionUI({ save: false }));
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
elements.wordListLessonFilter.addEventListener("change", updateWordSearch);
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

applyLearningModeSelection(loadLearningMode());
loadLastInputMode();
applyLessonSelection(loadSelectedLessons());
updateSpeechAvailability();
updateHomeModeControls();
updateLessonSelectionUI({ save: false });
initializeHistory();
