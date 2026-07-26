"use strict";

window.grammarApp = (() => {
  const SELECTED_LESSONS_STORAGE_KEY = "tyuugokugo-grammar-selected-lessons";
  const QUESTION_COUNT_STORAGE_KEY = "tyuugokugo-grammar-question-count";
  const ALL_LESSONS = [1, 2, 3, 4, 5, 6];
  const VALID_QUESTION_COUNTS = ["10", "20", "30", "40", "50", "all"];

  const elements = {
    lessonInputs: [...document.querySelectorAll('input[name="grammar-lesson"]')],
    allLessonsCheckbox: document.querySelector("#grammar-all-lessons-checkbox"),
    selectedLessonsText: document.querySelector("#grammar-selected-lessons-text"),
    candidateCount: document.querySelector("#grammar-candidate-count"),
    actualQuestionCount: document.querySelector("#grammar-actual-question-count"),
    lessonError: document.querySelector("#grammar-lesson-error"),
    questionCountInputs: [
      ...document.querySelectorAll('input[name="grammar-question-count"]')
    ],
    startButton: document.querySelector("#grammar-start-button"),
    quizScreen: document.querySelector("#grammar-quiz-screen"),
    homeButton: document.querySelector("#grammar-quiz-home-button"),
    menu: document.querySelector("#grammar-quiz-menu"),
    menuButton: document.querySelector("#grammar-quiz-menu-button"),
    menuPanel: document.querySelector("#grammar-quiz-menu-panel"),
    restartButton: document.querySelector("#grammar-restart-button"),
    currentNumber: document.querySelector("#grammar-current-number"),
    totalNumber: document.querySelector("#grammar-total-number"),
    correctCount: document.querySelector("#grammar-correct-count"),
    targetLessons: document.querySelector("#grammar-target-lessons"),
    currentContext: document.querySelector("#grammar-current-context"),
    progressBar: document.querySelector("#grammar-progress-bar"),
    progressFill: document.querySelector("#grammar-progress-fill"),
    japaneseQuestion: document.querySelector("#grammar-japanese-question"),
    answerForm: document.querySelector("#grammar-answer-form"),
    answerInput: document.querySelector("#grammar-answer-input"),
    inputError: document.querySelector("#grammar-input-error"),
    checkButton: document.querySelector("#grammar-check-button"),
    skipButton: document.querySelector("#grammar-skip-button"),
    feedback: document.querySelector("#grammar-feedback"),
    judgement: document.querySelector("#grammar-judgement"),
    correctAnswer: document.querySelector("#grammar-correct-answer"),
    userAnswer: document.querySelector("#grammar-user-answer"),
    feedbackJapanese: document.querySelector("#grammar-feedback-japanese"),
    feedbackLesson: document.querySelector("#grammar-feedback-lesson"),
    feedbackPoint: document.querySelector("#grammar-feedback-point"),
    pronunciationButton: document.querySelector("#grammar-pronunciation-button"),
    nextButton: document.querySelector("#grammar-next-button"),
    resultScreen: document.querySelector("#grammar-result-screen"),
    resultHomeTopButton: document.querySelector("#grammar-result-home-top-button"),
    resultTitle: document.querySelector("#grammar-result-title"),
    resultDescription: document.querySelector("#grammar-result-description"),
    resultAnswered: document.querySelector("#grammar-result-answered"),
    resultCorrect: document.querySelector("#grammar-result-correct"),
    resultIncorrect: document.querySelector("#grammar-result-incorrect"),
    resultRate: document.querySelector("#grammar-result-rate"),
    resultPlanned: document.querySelector("#grammar-result-planned"),
    resultTargetLessons: document.querySelector("#grammar-result-target-lessons"),
    resultQuestionCount: document.querySelector("#grammar-result-question-count"),
    resultList: document.querySelector("#grammar-result-list"),
    resultHomeButton: document.querySelector("#grammar-result-home-button"),
    retryButton: document.querySelector("#grammar-retry-button")
  };

  const state = {
    selectedLessons: [],
    questionCountSetting: "10",
    sourceQuestions: [],
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    answerHistory: [],
    currentAnswered: false,
    isInterrupted: false,
    totalPlannedQuestions: 0
  };

  let inputFocusScrollTimer = null;

  function resetState() {
    state.selectedLessons = [];
    state.questionCountSetting = "10";
    state.sourceQuestions = [];
    state.questions = [];
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answerHistory = [];
    state.currentAnswered = false;
    state.isInterrupted = false;
    state.totalPlannedQuestions = 0;
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
      // 保存できない環境でも現在の設定でクイズを続けます。
    }
  }

  function loadQuestionCount() {
    try {
      const storedValue = localStorage.getItem(QUESTION_COUNT_STORAGE_KEY);
      return VALID_QUESTION_COUNTS.includes(storedValue) ? storedValue : "10";
    } catch (error) {
      return "10";
    }
  }

  function saveQuestionCount(questionCount) {
    if (!VALID_QUESTION_COUNTS.includes(questionCount)) {
      return;
    }
    try {
      localStorage.setItem(QUESTION_COUNT_STORAGE_KEY, questionCount);
    } catch (error) {
      // 保存できない環境でも現在の設定でクイズを続けます。
    }
  }

  function getSelectedLessons() {
    return elements.lessonInputs
      .filter((input) => input.checked)
      .map((input) => Number(input.value))
      .sort((first, second) => first - second);
  }

  function applySelectedLessons(selectedLessons) {
    const selectedSet = new Set(selectedLessons);
    elements.lessonInputs.forEach((input) => {
      input.checked = selectedSet.has(Number(input.value));
    });
  }

  function getQuestionCountSetting() {
    return elements.questionCountInputs.find((input) => input.checked)?.value || "10";
  }

  function applyQuestionCount(questionCount) {
    const safeCount = VALID_QUESTION_COUNTS.includes(questionCount)
      ? questionCount
      : "10";
    elements.questionCountInputs.forEach((input) => {
      input.checked = input.value === safeCount;
    });
  }

  function formatLessons(selectedLessons) {
    if (selectedLessons.length === ALL_LESSONS.length) {
      return "全課";
    }
    return selectedLessons.map((lesson) => `第${lesson}課`).join("・");
  }

  function getQuestionsForLessons(selectedLessons) {
    return grammarQuestions.filter((question) =>
      selectedLessons.includes(question.lesson)
    );
  }

  function getActualQuestionCount(candidateCount) {
    const selectedCount = getQuestionCountSetting();
    return selectedCount === "all"
      ? candidateCount
      : Math.min(Number(selectedCount), candidateCount);
  }

  function updateHomeControls(options = {}) {
    const { save = false } = options;
    const selectedLessons = getSelectedLessons();
    const selectedCount = selectedLessons.length;
    const candidateCount = getQuestionsForLessons(selectedLessons).length;
    const actualCount = getActualQuestionCount(candidateCount);

    elements.allLessonsCheckbox.checked = selectedCount === ALL_LESSONS.length;
    elements.allLessonsCheckbox.indeterminate =
      selectedCount > 0 && selectedCount < ALL_LESSONS.length;
    elements.selectedLessonsText.textContent =
      `選択中：${selectedCount > 0 ? formatLessons(selectedLessons) : "なし"}`;
    elements.candidateCount.textContent = `出題候補：${candidateCount}項目`;
    elements.actualQuestionCount.textContent = `実際の出題数：${actualCount}問`;
    elements.lessonError.hidden = selectedCount > 0;

    if (save && selectedCount > 0) {
      saveSelectedLessons(selectedLessons);
    }
  }

  function shuffleQuestions(sourceQuestions) {
    const shuffled = [...sourceQuestions];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index]
      ];
    }
    return shuffled;
  }

  function normalizeAnswer(value) {
    return String(value)
      .trim()
      .replace(/[\s　。．.，、,？?！!・「」『』“”"‘’'…：:；;（）()【】［］\[\]]+/gu, "");
  }

  function isCorrectAnswer(input, question) {
    return normalizeAnswer(input) === normalizeAnswer(question.chinese);
  }

  function startSession(sourceQuestions, questionLimit, options = {}) {
    if (sourceQuestions.length === 0) {
      replaceHistoryWithHome();
      return;
    }

    const {
      historyAction = "push",
      selectedLessons = [...new Set(sourceQuestions.map((question) => question.lesson))]
        .sort((first, second) => first - second),
      questionCountSetting = String(questionLimit)
    } = options;
    const safeLimit = Math.min(questionLimit, sourceQuestions.length);

    state.selectedLessons = [...selectedLessons];
    state.questionCountSetting = questionCountSetting;
    state.sourceQuestions = [...sourceQuestions];
    state.questions = shuffleQuestions(sourceQuestions).slice(0, safeLimit);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answerHistory = [];
    state.currentAnswered = false;
    state.isInterrupted = false;
    state.totalPlannedQuestions = safeLimit;

    navigateToScreen("grammarQuiz", {
      historyAction,
      from: currentScreenName,
      focus: false
    });
    renderQuestion();
  }

  function startFromHome() {
    const selectedLessons = getSelectedLessons();
    if (selectedLessons.length === 0) {
      elements.lessonError.hidden = false;
      elements.lessonInputs[0].focus();
      return;
    }

    const sourceQuestions = getQuestionsForLessons(selectedLessons);
    const questionCountSetting = getQuestionCountSetting();
    const questionLimit = questionCountSetting === "all"
      ? sourceQuestions.length
      : Number(questionCountSetting);

    startSession(sourceQuestions, questionLimit, {
      historyAction: "push",
      selectedLessons,
      questionCountSetting
    });
  }

  function showQuizScreen() {
    speechController.cancel();
    closeMenu(false);
    showOnlyScreen("grammarQuiz");
  }

  function renderQuestion() {
    const question = state.questions[state.currentIndex];
    const currentNumber = state.currentIndex + 1;
    const totalQuestions = state.questions.length;

    speechController.cancel();
    closeMenu(false);
    state.currentAnswered = false;
    elements.currentNumber.textContent = String(currentNumber);
    elements.totalNumber.textContent = String(totalQuestions);
    elements.correctCount.textContent = String(state.correctCount);
    elements.targetLessons.textContent = `対象：${formatLessons(state.selectedLessons)}`;
    elements.currentContext.textContent =
      `第${question.lesson}課・POINT ${question.point}`;
    elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
    elements.progressBar.setAttribute("aria-valuenow", String(state.currentIndex));
    elements.progressFill.style.width =
      `${(state.currentIndex / totalQuestions) * 100}%`;
    elements.japaneseQuestion.textContent = question.japanese;
    elements.answerForm.reset();
    elements.answerInput.disabled = false;
    elements.checkButton.disabled = false;
    elements.skipButton.disabled = false;
    elements.inputError.hidden = true;
    elements.answerInput.removeAttribute("aria-invalid");
    elements.feedback.hidden = true;
    elements.feedback.classList.remove("correct", "incorrect");
    elements.pronunciationButton.hidden = true;
    elements.pronunciationButton.disabled = !speechController.isSupported;
    elements.pronunciationButton.dataset.defaultLabel = "発音を聞く";
    elements.pronunciationButton.textContent = "発音を聞く";
    elements.nextButton.hidden = true;
    elements.nextButton.textContent =
      currentNumber === totalQuestions ? "結果を見る" : "次の問題";
    requestAnimationFrame(() => elements.answerInput.focus({ preventScroll: true }));
  }

  function recordAnswer(question, userAnswer, wasCorrect, skipped) {
    const questionNumber = state.currentIndex + 1;
    const alreadyRecorded = state.answerHistory.some(
      (answer) => answer.questionId === question.id
    );
    if (alreadyRecorded) {
      return;
    }

    state.answerHistory.push({
      questionNumber,
      questionId: question.id,
      quizType: "grammar",
      lesson: question.lesson,
      point: question.point,
      kind: question.kind,
      japanese: question.japanese,
      chinese: question.chinese,
      userAnswer,
      isCorrect: wasCorrect,
      skipped
    });
  }

  function showAnswerResult(wasCorrect, skipped = false, userAnswer = "") {
    if (state.currentAnswered) {
      return;
    }

    const question = state.questions[state.currentIndex];
    state.currentAnswered = true;
    recordAnswer(question, userAnswer, wasCorrect, skipped);
    if (wasCorrect) {
      state.correctCount += 1;
    }

    elements.correctCount.textContent = String(state.correctCount);
    elements.progressBar.setAttribute("aria-valuenow", String(state.currentIndex + 1));
    elements.progressFill.style.width =
      `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
    elements.inputError.hidden = true;
    elements.answerInput.removeAttribute("aria-invalid");
    elements.answerInput.disabled = true;
    elements.checkButton.disabled = true;
    elements.skipButton.disabled = true;
    elements.feedback.hidden = false;
    elements.feedback.classList.add(wasCorrect ? "correct" : "incorrect");
    elements.judgement.textContent = wasCorrect ? "正解！" : "不正解";
    elements.correctAnswer.textContent = question.chinese;
    elements.userAnswer.textContent = skipped ? "未回答" : userAnswer;
    elements.feedbackJapanese.textContent = question.japanese;
    elements.feedbackLesson.textContent = `第${question.lesson}課`;
    elements.feedbackPoint.textContent = String(question.point);
    elements.pronunciationButton.hidden = false;
    elements.pronunciationButton.setAttribute(
      "aria-label",
      `${question.chinese}の発音を聞く`
    );
    if (!speechController.isSupported) {
      elements.pronunciationButton.title = speechController.unavailableMessage;
    }
    elements.nextButton.hidden = false;
    elements.nextButton.focus();
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (state.currentAnswered) {
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
    showAnswerResult(isCorrectAnswer(input, state.questions[state.currentIndex]), false, input.trim());
  }

  function skipQuestion() {
    showAnswerResult(false, true, "");
  }

  function moveToNextQuestion() {
    if (!state.currentAnswered) {
      return;
    }
    if (state.currentIndex >= state.questions.length - 1) {
      finishAsCompleted();
      return;
    }
    state.currentIndex += 1;
    renderQuestion();
  }

  function calculateSummary() {
    const answered = state.answerHistory.length;
    const correct = state.answerHistory.filter((answer) => answer.isCorrect).length;
    const incorrect = answered - correct;
    const rawRate = answered === 0 ? 0 : (correct / answered) * 100;
    const rate = Number.isInteger(rawRate) ? String(rawRate) : rawRate.toFixed(1);
    return { answered, correct, incorrect, rate };
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

    state.answerHistory.forEach((answer) => {
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
      pronunciationButton.className =
        "pronunciation-button pronunciation-button-small";

      questionNumber.textContent = `問題 ${answer.questionNumber}`;
      status.textContent = answer.isCorrect ? "正解" : "不正解";
      header.append(questionNumber, status);
      details.append(
        createResultDetail("課", `第${answer.lesson}課`),
        createResultDetail("POINT", String(answer.point)),
        createResultDetail("日本語", answer.japanese),
        createResultDetail("正解の中国語", answer.chinese, {
          className: "chinese-text",
          lang: "zh-CN"
        }),
        createResultDetail(
          "あなたの解答",
          answer.skipped ? "未回答" : answer.userAnswer,
          {
            className: "chinese-text",
            lang: "zh-CN"
          }
        )
      );

      speechController.prepareButton(pronunciationButton, answer.chinese, "発音");
      item.append(header, details, pronunciationButton);
      elements.resultList.append(item);
    });
  }

  function showResultScreen(options = {}) {
    const { focus = true } = options;
    speechController.cancel();
    const summary = calculateSummary();

    elements.resultTitle.textContent = state.isInterrupted
      ? "文法クイズ途中結果"
      : "文法クイズ結果";
    elements.resultDescription.hidden = !state.isInterrupted;
    elements.resultAnswered.textContent = String(summary.answered);
    elements.resultCorrect.textContent = String(summary.correct);
    elements.resultIncorrect.textContent = String(summary.incorrect);
    elements.resultRate.textContent = `${summary.rate}%`;
    elements.resultPlanned.hidden = !state.isInterrupted;
    elements.resultPlanned.textContent = state.isInterrupted
      ? `予定問題数：${state.totalPlannedQuestions}問`
      : "";
    elements.resultTargetLessons.textContent =
      `対象：${formatLessons(state.selectedLessons)}`;
    elements.resultQuestionCount.textContent =
      `出題数：${state.totalPlannedQuestions}問`;
    elements.retryButton.textContent = state.isInterrupted
      ? "最初からもう一度挑戦"
      : "もう一度挑戦";
    renderResultList();
    showOnlyScreen("grammarResult");
    if (focus) {
      elements.resultTitle.focus();
    }
  }

  function finishAsCompleted() {
    state.isInterrupted = false;
    navigateToScreen("grammarResult", {
      historyAction: "replace",
      from: "grammarQuiz",
      focus: true
    });
  }

  function finishAsInterrupted(options = {}) {
    const { focus = true } = options;
    if (state.answerHistory.length === 0) {
      replaceHistoryWithHome({ focus });
      return;
    }
    state.isInterrupted = true;
    navigateToScreen("grammarResult", {
      historyAction: "replace",
      from: "grammarQuiz",
      focus
    });
  }

  function requestExit() {
    if (state.answerHistory.length === 0) {
      replaceHistoryWithHome();
      return;
    }
    openConfirmDialog({
      title: "クイズを終了しますか？",
      message: "クイズを終了して、ここまでの結果を表示しますか？",
      confirmLabel: "途中結果を見る",
      cancelLabel: "クイズを続ける",
      onConfirm: finishAsInterrupted,
      returnFocus: elements.homeButton
    });
  }

  function retry() {
    startSession(state.sourceQuestions, state.totalPlannedQuestions, {
      historyAction: "replace",
      selectedLessons: state.selectedLessons,
      questionCountSetting: state.questionCountSetting
    });
  }

  function restart() {
    startSession(state.sourceQuestions, state.totalPlannedQuestions, {
      historyAction: "replace",
      selectedLessons: state.selectedLessons,
      questionCountSetting: state.questionCountSetting
    });
  }

  function requestRestart() {
    closeMenu(false);
    openConfirmDialog({
      title: "最初からやり直しますか？",
      message:
        "現在の文法クイズを終了し、最初からやり直しますか？ここまでの解答は破棄されます。",
      confirmLabel: "最初からやり直す",
      cancelLabel: "キャンセル",
      onConfirm: restart,
      returnFocus: elements.menuButton
    });
  }

  function closeMenu(restoreFocus = false) {
    if (elements.menuPanel.hidden) {
      return;
    }
    elements.menuPanel.hidden = true;
    elements.menuButton.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
      elements.menuButton.focus();
    }
  }

  function toggleMenu() {
    const willOpen = elements.menuPanel.hidden;
    elements.menuPanel.hidden = !willOpen;
    elements.menuButton.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      elements.restartButton.focus();
    }
  }

  function returnHomeFromResult() {
    replaceHistoryWithHome();
  }

  function handlePopStateExit(targetScreen) {
    if (state.answerHistory.length > 0) {
      finishAsInterrupted({ focus: false });
    } else {
      resetState();
      renderScreenFromHistory(targetScreen, { focus: false });
    }
  }

  function keepInputVisible() {
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

  function handleAnswerInputKeydown(event) {
    if (
      event.key !== "Enter" ||
      event.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }
    event.preventDefault();
    if (state.currentAnswered) {
      moveToNextQuestion();
    } else {
      elements.answerForm.requestSubmit();
    }
  }

  function handleNextButtonKeydown(event) {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
      return;
    }
    event.preventDefault();
    moveToNextQuestion();
  }

  function initialize() {
    applySelectedLessons(loadSelectedLessons());
    applyQuestionCount(loadQuestionCount());
    updateHomeControls({ save: false });

    elements.lessonInputs.forEach((input) => {
      input.addEventListener("change", () => updateHomeControls({ save: true }));
    });
    elements.allLessonsCheckbox.addEventListener("change", () => {
      const shouldSelectAll = elements.allLessonsCheckbox.checked;
      elements.lessonInputs.forEach((input) => {
        input.checked = shouldSelectAll;
      });
      updateHomeControls({ save: true });
    });
    elements.questionCountInputs.forEach((input) => {
      input.addEventListener("change", () => {
        saveQuestionCount(getQuestionCountSetting());
        updateHomeControls({ save: false });
      });
    });
    elements.startButton.addEventListener("click", startFromHome);
    elements.homeButton.addEventListener("click", requestExit);
    elements.menuButton.addEventListener("click", toggleMenu);
    elements.restartButton.addEventListener("click", requestRestart);
    elements.answerForm.addEventListener("submit", submitAnswer);
    elements.answerInput.addEventListener("focus", keepInputVisible);
    elements.answerInput.addEventListener("keydown", handleAnswerInputKeydown);
    elements.answerInput.addEventListener("input", () => {
      if (normalizeAnswer(elements.answerInput.value) !== "") {
        elements.inputError.hidden = true;
        elements.answerInput.removeAttribute("aria-invalid");
      }
    });
    elements.skipButton.addEventListener("click", skipQuestion);
    elements.nextButton.addEventListener("click", moveToNextQuestion);
    elements.nextButton.addEventListener("keydown", handleNextButtonKeydown);
    elements.pronunciationButton.addEventListener("click", () => {
      const question = state.questions[state.currentIndex];
      if (question && state.currentAnswered) {
        speechController.speak(question.chinese, elements.pronunciationButton);
      }
    });
    elements.resultHomeTopButton.addEventListener("click", returnHomeFromResult);
    elements.resultHomeButton.addEventListener("click", returnHomeFromResult);
    elements.retryButton.addEventListener("click", retry);

    document.addEventListener("click", (event) => {
      if (!elements.menuPanel.hidden && !elements.menu.contains(event.target)) {
        closeMenu(false);
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !elements.menuPanel.hidden) {
        event.preventDefault();
        closeMenu(true);
      }
    });
  }

  initialize();

  return {
    closeMenu,
    handlePopStateExit,
    normalizeAnswer,
    onHomeShown: () => updateHomeControls({ save: false }),
    resetState,
    showQuizScreen,
    showResultScreen,
    state
  };
})();
