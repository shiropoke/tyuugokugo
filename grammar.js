"use strict";

window.grammarApp = (() => {
  const SELECTED_LESSONS_STORAGE_KEY = "tyuugokugo-grammar-selected-lessons";
  const QUESTION_COUNT_STORAGE_KEY = "tyuugokugo-grammar-question-count";
  const LEARNING_MODE_STORAGE_KEY = "tyuugokugo-grammar-learning-mode";
  const ALL_LESSONS = [1, 2, 3, 4, 5, 6];
  const VALID_QUESTION_COUNTS = ["10", "20", "30", "40", "50", "all"];
  const LEARNING_MODES = Object.freeze({
    INPUT: "grammar-input",
    REVIEW: "grammar-review"
  });
  const VALID_LEARNING_MODES = Object.values(LEARNING_MODES);

  const elements = {
    learningModeInputs: [
      ...document.querySelectorAll('input[name="grammar-learning-mode"]')
    ],
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
    sentenceListButton: document.querySelector("#grammar-sentence-list-button"),

    quizScreen: document.querySelector("#grammar-quiz-screen"),
    homeButton: document.querySelector("#grammar-quiz-home-button"),
    menu: document.querySelector("#grammar-quiz-menu"),
    menuButton: document.querySelector("#grammar-quiz-menu-button"),
    menuPanel: document.querySelector("#grammar-quiz-menu-panel"),
    restartButton: document.querySelector("#grammar-restart-button"),
    currentNumber: document.querySelector("#grammar-current-number"),
    totalNumber: document.querySelector("#grammar-total-number"),
    scoreStatus: document.querySelector("#grammar-score-status"),
    correctCount: document.querySelector("#grammar-correct-count"),
    reviewStatus: document.querySelector("#grammar-review-status"),
    targetLessons: document.querySelector("#grammar-target-lessons"),
    currentContext: document.querySelector("#grammar-current-context"),
    progressBar: document.querySelector("#grammar-progress-bar"),
    progressFill: document.querySelector("#grammar-progress-fill"),
    promptLabel: document.querySelector("#grammar-prompt-label"),
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

    reviewControls: document.querySelector("#grammar-review-controls"),
    reviewPrimaryAction: document.querySelector("#grammar-review-primary-action"),
    reviewAnswer: document.querySelector("#grammar-review-answer"),
    reviewChinese: document.querySelector("#grammar-review-chinese"),
    reviewJapanese: document.querySelector("#grammar-review-japanese"),
    reviewContext: document.querySelector("#grammar-review-context"),
    reviewPronunciationButton: document.querySelector(
      "#grammar-review-pronunciation-button"
    ),
    quizNavigation: document.querySelector("#grammar-quiz-navigation"),

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
    retryButton: document.querySelector("#grammar-retry-button"),

    reviewResultScreen: document.querySelector("#grammar-review-result-screen"),
    reviewResultHomeTopButton: document.querySelector(
      "#grammar-review-result-home-top-button"
    ),
    reviewResultTitle: document.querySelector("#grammar-review-result-title"),
    reviewResultDescription: document.querySelector(
      "#grammar-review-result-description"
    ),
    reviewedCount: document.querySelector("#grammar-reviewed-count"),
    reviewPlannedCount: document.querySelector("#grammar-review-planned-count"),
    reviewResultTargetLessons: document.querySelector(
      "#grammar-review-result-target-lessons"
    ),
    reviewResultQuestionCount: document.querySelector(
      "#grammar-review-result-question-count"
    ),
    reviewResultList: document.querySelector("#grammar-review-result-list"),
    reviewResultHomeButton: document.querySelector(
      "#grammar-review-result-home-button"
    ),
    reviewRetryButton: document.querySelector("#grammar-review-retry-button"),
    reviewToQuizButton: document.querySelector("#grammar-review-to-quiz-button"),

    sentenceListScreen: document.querySelector("#grammar-sentence-list-screen"),
    sentenceListHomeButton: document.querySelector(
      "#grammar-sentence-list-home-button"
    ),
    sentenceListTitle: document.querySelector("#grammar-sentence-list-title"),
    sentenceLessonFilter: document.querySelector(
      "#grammar-sentence-lesson-filter"
    ),
    sentenceSearch: document.querySelector("#grammar-sentence-search"),
    sentenceResultCount: document.querySelector(
      "#grammar-sentence-result-count"
    ),
    sentenceEmptyMessage: document.querySelector(
      "#grammar-sentence-empty-message"
    ),
    sentenceList: document.querySelector("#grammar-sentence-list")
  };

  const state = {
    learningMode: LEARNING_MODES.INPUT,
    selectedLessons: [],
    questionCountSetting: "10",
    sourceQuestions: [],
    questions: [],
    currentIndex: 0,
    correctCount: 0,
    answerHistory: [],
    reviewedHistory: [],
    currentAnswered: false,
    currentAnswerVisible: false,
    isInterrupted: false,
    totalPlannedQuestions: 0
  };

  let inputFocusScrollTimer = null;

  function resetState() {
    state.learningMode = LEARNING_MODES.INPUT;
    state.selectedLessons = [];
    state.questionCountSetting = "10";
    state.sourceQuestions = [];
    state.questions = [];
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answerHistory = [];
    state.reviewedHistory = [];
    state.currentAnswered = false;
    state.currentAnswerVisible = false;
    state.isInterrupted = false;
    state.totalPlannedQuestions = 0;
  }

  function isReviewMode() {
    return state.learningMode === LEARNING_MODES.REVIEW;
  }

  function isValidLessonSelection(value) {
    return (
      Array.isArray(value) &&
      value.length >= 1 &&
      value.length <= ALL_LESSONS.length &&
      value.every(
        (lesson) => Number.isInteger(lesson) && ALL_LESSONS.includes(lesson)
      ) &&
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
      // 保存できない環境でも現在の設定で学習を続けます。
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
      // 保存できない環境でも現在の設定で学習を続けます。
    }
  }

  function loadLearningMode() {
    try {
      const storedValue = localStorage.getItem(LEARNING_MODE_STORAGE_KEY);
      return VALID_LEARNING_MODES.includes(storedValue)
        ? storedValue
        : LEARNING_MODES.INPUT;
    } catch (error) {
      return LEARNING_MODES.INPUT;
    }
  }

  function saveLearningMode(learningMode) {
    if (!VALID_LEARNING_MODES.includes(learningMode)) {
      return;
    }
    try {
      localStorage.setItem(LEARNING_MODE_STORAGE_KEY, learningMode);
    } catch (error) {
      // 保存できない環境でも現在の設定で学習を続けます。
    }
  }

  function getSelectedLearningMode() {
    const selectedInput = elements.learningModeInputs.find(
      (input) => input.checked
    );
    return VALID_LEARNING_MODES.includes(selectedInput?.value)
      ? selectedInput.value
      : LEARNING_MODES.INPUT;
  }

  function applyLearningMode(learningMode) {
    const safeMode = VALID_LEARNING_MODES.includes(learningMode)
      ? learningMode
      : LEARNING_MODES.INPUT;
    elements.learningModeInputs.forEach((input) => {
      input.checked = input.value === safeMode;
    });
  }

  function updateLearningModeControls(options = {}) {
    const { save = false } = options;
    const learningMode = getSelectedLearningMode();
    elements.startButton.textContent =
      learningMode === LEARNING_MODES.REVIEW
        ? "文法の確認を始める"
        : "文法クイズを始める";
    if (save) {
      saveLearningMode(learningMode);
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
    return (
      elements.questionCountInputs.find((input) => input.checked)?.value || "10"
    );
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
      .replace(
        /[\s　。．.，、,？?！!・「」『』“”"‘’'…：:；;（）()【】［］\[\]]+/gu,
        ""
      );
  }

  function isCorrectAnswer(input, question) {
    return normalizeAnswer(input) === normalizeAnswer(question.chinese);
  }

  function getQuizHistoryScreen() {
    return isReviewMode() ? "grammarReview" : "grammarQuiz";
  }

  function startSession(sourceQuestions, questionLimit, options = {}) {
    if (sourceQuestions.length === 0) {
      replaceHistoryWithHome();
      return;
    }

    const {
      historyAction = "push",
      selectedLessons = [
        ...new Set(sourceQuestions.map((question) => question.lesson))
      ].sort((first, second) => first - second),
      questionCountSetting = String(questionLimit),
      learningMode = LEARNING_MODES.INPUT
    } = options;
    const safeLimit = Math.min(questionLimit, sourceQuestions.length);

    state.learningMode = VALID_LEARNING_MODES.includes(learningMode)
      ? learningMode
      : LEARNING_MODES.INPUT;
    state.selectedLessons = [...selectedLessons];
    state.questionCountSetting = questionCountSetting;
    state.sourceQuestions = [...sourceQuestions];
    state.questions = shuffleQuestions(sourceQuestions).slice(0, safeLimit);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answerHistory = [];
    state.reviewedHistory = [];
    state.currentAnswered = false;
    state.currentAnswerVisible = false;
    state.isInterrupted = false;
    state.totalPlannedQuestions = safeLimit;

    navigateToScreen(getQuizHistoryScreen(), {
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
    const questionLimit =
      questionCountSetting === "all"
        ? sourceQuestions.length
        : Number(questionCountSetting);

    startSession(sourceQuestions, questionLimit, {
      historyAction: "push",
      selectedLessons,
      questionCountSetting,
      learningMode: getSelectedLearningMode()
    });
  }

  function showQuizScreen() {
    speechController.cancel();
    closeMenu(false);
    showOnlyScreen(getQuizHistoryScreen());
  }

  function updateReviewPrimaryAction() {
    if (!state.currentAnswerVisible) {
      elements.reviewPrimaryAction.textContent = "答えを見る";
      elements.reviewPrimaryAction.setAttribute("aria-label", "答えを見る");
      elements.reviewPrimaryAction.setAttribute("aria-expanded", "false");
      return;
    }

    const isLastQuestion = state.currentIndex >= state.questions.length - 1;
    elements.reviewPrimaryAction.textContent = isLastQuestion
      ? "確認を終了する"
      : "次の文章";
    elements.reviewPrimaryAction.setAttribute(
      "aria-label",
      isLastQuestion ? "確認を終了する" : "次の文章へ進む"
    );
    elements.reviewPrimaryAction.setAttribute("aria-expanded", "true");
  }

  function resetReviewAnswerDisplay() {
    state.currentAnswerVisible = false;
    elements.reviewAnswer.hidden = true;
    elements.reviewChinese.textContent = "";
    elements.reviewJapanese.textContent = "";
    elements.reviewContext.textContent = "";
    elements.reviewPronunciationButton.hidden = true;
    elements.reviewPronunciationButton.textContent = "発音を聞く";
    elements.reviewPronunciationButton.dataset.defaultLabel = "発音を聞く";
    updateReviewPrimaryAction();
  }

  function renderQuestion() {
    const question = state.questions[state.currentIndex];
    const currentNumber = state.currentIndex + 1;
    const totalQuestions = state.questions.length;
    const reviewMode = isReviewMode();

    speechController.cancel();
    closeMenu(false);
    state.currentAnswered = false;
    state.currentAnswerVisible = false;
    elements.currentNumber.textContent = String(currentNumber);
    elements.totalNumber.textContent = String(totalQuestions);
    elements.correctCount.textContent = String(state.correctCount);
    elements.scoreStatus.hidden = reviewMode;
    elements.reviewStatus.hidden = !reviewMode;
    elements.targetLessons.textContent =
      `対象：${formatLessons(state.selectedLessons)}`;
    elements.currentContext.textContent =
      `第${question.lesson}課・POINT ${question.point}`;
    elements.progressBar.setAttribute("aria-valuemax", String(totalQuestions));
    elements.progressBar.setAttribute("aria-valuenow", String(state.currentIndex));
    elements.progressFill.style.width =
      `${(state.currentIndex / totalQuestions) * 100}%`;
    elements.promptLabel.textContent = reviewMode
      ? "この日本語の中国語を考えてください"
      : "この日本語を中国語にしてください";
    elements.japaneseQuestion.textContent = question.japanese;

    elements.answerForm.hidden = reviewMode;
    elements.reviewControls.hidden = !reviewMode;
    elements.quizNavigation.hidden = reviewMode;
    elements.feedback.hidden = true;
    elements.feedback.classList.remove("correct", "incorrect");
    elements.nextButton.hidden = true;

    if (reviewMode) {
      resetReviewAnswerDisplay();
      requestAnimationFrame(() =>
        elements.reviewPrimaryAction.focus({ preventScroll: true })
      );
      return;
    }

    elements.answerForm.reset();
    elements.answerInput.disabled = false;
    elements.checkButton.disabled = false;
    elements.skipButton.disabled = false;
    elements.inputError.hidden = true;
    elements.answerInput.removeAttribute("aria-invalid");
    elements.pronunciationButton.hidden = true;
    elements.pronunciationButton.disabled = !speechController.isSupported;
    elements.pronunciationButton.dataset.defaultLabel = "発音を聞く";
    elements.pronunciationButton.textContent = "発音を聞く";
    elements.nextButton.textContent =
      currentNumber === totalQuestions ? "結果を見る" : "次の問題";
    requestAnimationFrame(() =>
      elements.answerInput.focus({ preventScroll: true })
    );
  }

  function recordAnswer(question, userAnswer, wasCorrect, skipped) {
    if (
      state.answerHistory.some((answer) => answer.questionId === question.id)
    ) {
      return;
    }

    state.answerHistory.push({
      questionNumber: state.currentIndex + 1,
      questionId: question.id,
      quizType: "grammar",
      learningMode: LEARNING_MODES.INPUT,
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

  function recordReviewedQuestion(question) {
    if (
      state.reviewedHistory.some(
        (reviewedItem) => reviewedItem.questionId === question.id
      )
    ) {
      return;
    }

    state.reviewedHistory.push({
      questionNumber: state.currentIndex + 1,
      questionId: question.id,
      quizType: "grammar",
      learningMode: LEARNING_MODES.REVIEW,
      lesson: question.lesson,
      point: question.point,
      kind: question.kind,
      japanese: question.japanese,
      chinese: question.chinese,
      reviewed: true
    });
  }

  function revealCurrentReviewAnswer() {
    if (!isReviewMode() || state.currentAnswerVisible) {
      return;
    }

    const question = state.questions[state.currentIndex];
    recordReviewedQuestion(question);
    state.currentAnswerVisible = true;
    elements.reviewChinese.textContent = question.chinese;
    elements.reviewJapanese.textContent = question.japanese;
    elements.reviewContext.textContent =
      `第${question.lesson}課・POINT ${question.point}`;
    elements.reviewPronunciationButton.hidden = false;
    elements.reviewPronunciationButton.disabled = !speechController.isSupported;
    elements.reviewPronunciationButton.dataset.defaultLabel = "発音を聞く";
    elements.reviewPronunciationButton.textContent = "発音を聞く";
    elements.reviewPronunciationButton.setAttribute(
      "aria-label",
      `${question.chinese}の発音を聞く`
    );
    if (!speechController.isSupported) {
      elements.reviewPronunciationButton.title =
        speechController.unavailableMessage;
    }
    elements.reviewAnswer.hidden = false;
    elements.progressBar.setAttribute(
      "aria-valuenow",
      String(state.currentIndex + 1)
    );
    elements.progressFill.style.width =
      `${((state.currentIndex + 1) / state.questions.length) * 100}%`;
    updateReviewPrimaryAction();
  }

  function handleReviewPrimaryAction() {
    if (!state.currentAnswerVisible) {
      revealCurrentReviewAnswer();
      return;
    }

    if (state.currentIndex >= state.questions.length - 1) {
      finishReviewAsCompleted();
      return;
    }

    state.currentIndex += 1;
    renderQuestion();
  }

  function showAnswerResult(wasCorrect, skipped = false, userAnswer = "") {
    if (state.currentAnswered || isReviewMode()) {
      return;
    }

    const question = state.questions[state.currentIndex];
    state.currentAnswered = true;
    recordAnswer(question, userAnswer, wasCorrect, skipped);
    if (wasCorrect) {
      state.correctCount += 1;
    }

    elements.correctCount.textContent = String(state.correctCount);
    elements.progressBar.setAttribute(
      "aria-valuenow",
      String(state.currentIndex + 1)
    );
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
    if (isReviewMode()) {
      return;
    }
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
    showAnswerResult(
      isCorrectAnswer(input, state.questions[state.currentIndex]),
      false,
      input.trim()
    );
  }

  function skipQuestion() {
    showAnswerResult(false, true, "");
  }

  function moveToNextQuestion() {
    if (!state.currentAnswered || isReviewMode()) {
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
    const correct = state.answerHistory.filter(
      (answer) => answer.isCorrect
    ).length;
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

      speechController.prepareButton(
        pronunciationButton,
        answer.chinese,
        "発音"
      );
      item.append(header, details, pronunciationButton);
      elements.resultList.append(item);
    });
  }

  function renderReviewResultList() {
    elements.reviewResultList.replaceChildren();

    state.reviewedHistory.forEach((reviewedItem) => {
      const item = document.createElement("li");
      const header = document.createElement("div");
      const questionNumber = document.createElement("p");
      const details = document.createElement("dl");
      const pronunciationButton = document.createElement("button");

      item.className = "result-item review-result-item";
      header.className = "result-item-header";
      questionNumber.className = "result-question-number";
      details.className = "result-details";
      pronunciationButton.className =
        "pronunciation-button pronunciation-button-small";

      questionNumber.textContent = `問題 ${reviewedItem.questionNumber}`;
      header.append(questionNumber);
      details.append(
        createResultDetail("課", `第${reviewedItem.lesson}課`),
        createResultDetail("POINT", String(reviewedItem.point)),
        createResultDetail("日本語", reviewedItem.japanese),
        createResultDetail("中国語", reviewedItem.chinese, {
          className: "chinese-text",
          lang: "zh-CN"
        })
      );
      speechController.prepareButton(
        pronunciationButton,
        reviewedItem.chinese,
        "発音"
      );
      item.append(header, details, pronunciationButton);
      elements.reviewResultList.append(item);
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

  function showReviewResultScreen(options = {}) {
    const { focus = true } = options;
    speechController.cancel();
    const interrupted = state.isInterrupted;

    elements.reviewResultTitle.textContent = interrupted
      ? "文法確認途中結果"
      : "文法確認完了";
    elements.reviewResultDescription.hidden = !interrupted;
    elements.reviewedCount.textContent = String(state.reviewedHistory.length);
    elements.reviewPlannedCount.textContent = String(
      state.totalPlannedQuestions
    );
    elements.reviewResultTargetLessons.textContent =
      `対象：${formatLessons(state.selectedLessons)}`;
    elements.reviewResultQuestionCount.textContent =
      `予定文章数：${state.totalPlannedQuestions}件`;
    elements.reviewRetryButton.textContent = interrupted
      ? "最初からもう一度確認する"
      : "もう一度確認する";
    elements.reviewToQuizButton.textContent = interrupted
      ? "確認済みの文章で文法クイズをする"
      : "確認した文章で文法クイズをする";
    renderReviewResultList();
    showOnlyScreen(
      interrupted ? "grammarReviewInterrupted" : "grammarReviewComplete"
    );
    if (focus) {
      elements.reviewResultTitle.focus();
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

  function finishReviewAsCompleted() {
    state.isInterrupted = false;
    navigateToScreen("grammarReviewComplete", {
      historyAction: "replace",
      from: "grammarReview",
      focus: true
    });
  }

  function finishReviewAsInterrupted(options = {}) {
    const { focus = true } = options;
    if (state.reviewedHistory.length === 0) {
      replaceHistoryWithHome({ focus });
      return;
    }
    state.isInterrupted = true;
    navigateToScreen("grammarReviewInterrupted", {
      historyAction: "replace",
      from: "grammarReview",
      focus
    });
  }

  function requestExit() {
    if (isReviewMode()) {
      if (state.reviewedHistory.length === 0) {
        replaceHistoryWithHome();
        return;
      }
      openConfirmDialog({
        title: "確認を終了しますか？",
        message: "確認を終了して、ここまで確認した文章を表示しますか？",
        confirmLabel: "途中結果を見る",
        cancelLabel: "確認を続ける",
        onConfirm: finishReviewAsInterrupted,
        returnFocus: elements.homeButton
      });
      return;
    }

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

  function retryCurrentMode() {
    startSession(state.sourceQuestions, state.totalPlannedQuestions, {
      historyAction: "replace",
      selectedLessons: state.selectedLessons,
      questionCountSetting: state.questionCountSetting,
      learningMode: state.learningMode
    });
  }

  function getReviewedQuestions() {
    return state.reviewedHistory
      .map((reviewedItem) =>
        grammarQuestions.find(
          (question) => question.id === reviewedItem.questionId
        )
      )
      .filter(Boolean);
  }

  function startQuizFromReviewedQuestions() {
    const reviewedQuestions = getReviewedQuestions();
    if (reviewedQuestions.length === 0) {
      replaceHistoryWithHome();
      return;
    }
    const selectedLessons = [
      ...new Set(reviewedQuestions.map((question) => question.lesson))
    ].sort((first, second) => first - second);
    startSession(reviewedQuestions, reviewedQuestions.length, {
      historyAction: "replace",
      selectedLessons,
      questionCountSetting: String(reviewedQuestions.length),
      learningMode: LEARNING_MODES.INPUT
    });
  }

  function requestRestart() {
    closeMenu(false);
    const reviewMode = isReviewMode();
    openConfirmDialog({
      title: "最初からやり直しますか？",
      message: reviewMode
        ? "現在の確認を終了し、最初からやり直しますか？ここまでの確認履歴は破棄されます。"
        : "現在の文法クイズを終了し、最初からやり直しますか？ここまでの解答は破棄されます。",
      confirmLabel: "最初からやり直す",
      cancelLabel: "キャンセル",
      onConfirm: retryCurrentMode,
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
    if (isReviewMode() && state.reviewedHistory.length > 0) {
      finishReviewAsInterrupted({ focus: false });
      return;
    }
    if (!isReviewMode() && state.answerHistory.length > 0) {
      finishAsInterrupted({ focus: false });
      return;
    }
    resetState();
    renderScreenFromHistory(targetScreen, { focus: false });
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

  function getKindLabel(kind) {
    return kind === "phrase" ? "語句" : "文章";
  }

  function getOrderedGrammarQuestions() {
    return grammarQuestions
      .map((question, originalIndex) => ({ question, originalIndex }))
      .sort(
        (first, second) =>
          first.question.lesson - second.question.lesson ||
          first.question.point - second.question.point ||
          first.originalIndex - second.originalIndex
      )
      .map((item) => item.question);
  }

  function filterSentenceList() {
    const selectedLesson = elements.sentenceLessonFilter.value;
    const query = elements.sentenceSearch.value.trim().toLocaleLowerCase();

    return getOrderedGrammarQuestions().filter((question) => {
      const matchesLesson =
        selectedLesson === "all" ||
        question.lesson === Number(selectedLesson);
      const searchableText = [
        question.chinese,
        question.japanese,
        `第${question.lesson}課`,
        `POINT ${question.point}`,
        `POINT${question.point}`
      ]
        .join(" ")
        .toLocaleLowerCase();
      return matchesLesson && (query === "" || searchableText.includes(query));
    });
  }

  function createSentenceListItem(question) {
    const item = document.createElement("article");
    const meta = document.createElement("p");
    const details = document.createElement("dl");
    const pronunciationButton = document.createElement("button");

    item.className = "grammar-sentence-item";
    meta.className = "grammar-sentence-meta";
    meta.textContent =
      `第${question.lesson}課・POINT ${question.point}・${getKindLabel(question.kind)}`;
    details.className = "grammar-sentence-details";
    details.append(
      createResultDetail("中国語", question.chinese, {
        className: "chinese-text grammar-sentence-chinese",
        lang: "zh-CN"
      }),
      createResultDetail("日本語", question.japanese),
      createResultDetail("種類", getKindLabel(question.kind))
    );
    pronunciationButton.className = "pronunciation-button";
    speechController.prepareButton(
      pronunciationButton,
      question.chinese,
      "発音を聞く"
    );
    item.append(meta, details, pronunciationButton);
    return item;
  }

  function renderSentenceList() {
    const filteredQuestions = filterSentenceList();
    const fragment = document.createDocumentFragment();
    let previousLesson = null;
    let lessonGroup = null;

    filteredQuestions.forEach((question) => {
      if (question.lesson !== previousLesson) {
        lessonGroup = document.createElement("section");
        const heading = document.createElement("h2");
        const list = document.createElement("div");
        const headingId = `grammar-sentence-lesson-${question.lesson}`;

        lessonGroup.className = "grammar-sentence-lesson-group";
        lessonGroup.setAttribute("aria-labelledby", headingId);
        heading.id = headingId;
        heading.textContent = `第${question.lesson}課`;
        list.className = "grammar-sentence-grid";
        lessonGroup.append(heading, list);
        fragment.append(lessonGroup);
        previousLesson = question.lesson;
      }
      lessonGroup.lastElementChild.append(createSentenceListItem(question));
    });

    elements.sentenceList.replaceChildren(fragment);
    elements.sentenceResultCount.textContent =
      `表示中：${filteredQuestions.length}件`;
    elements.sentenceEmptyMessage.hidden = filteredQuestions.length > 0;
  }

  function showSentenceListScreen(options = {}) {
    const { focus = true, resetFilters = false } = options;
    speechController.cancel();
    closeMenu(false);
    if (resetFilters) {
      elements.sentenceLessonFilter.value = "all";
      elements.sentenceSearch.value = "";
    }
    renderSentenceList();
    showOnlyScreen("grammarSentenceList");
    if (focus) {
      elements.sentenceListTitle.focus();
    }
  }

  function navigateToSentenceList() {
    navigateToScreen("grammarSentenceList", {
      historyAction: "push",
      from: "home",
      focus: true
    });
  }

  function navigateHomeFromSentenceList() {
    const stateIsAppList =
      history.state?.app === "tyuugokugo" &&
      history.state.screen === "grammarSentenceList" &&
      history.state.from === "home";
    if (stateIsAppList && history.length > 1) {
      history.back();
      return;
    }
    replaceHistoryWithHome();
  }

  function initialize() {
    applyLearningMode(loadLearningMode());
    applySelectedLessons(loadSelectedLessons());
    applyQuestionCount(loadQuestionCount());
    updateLearningModeControls({ save: false });
    updateHomeControls({ save: false });

    elements.learningModeInputs.forEach((input) => {
      input.addEventListener("change", () =>
        updateLearningModeControls({ save: true })
      );
    });
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
    elements.sentenceListButton.addEventListener("click", navigateToSentenceList);
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
    elements.reviewPrimaryAction.addEventListener(
      "click",
      handleReviewPrimaryAction
    );
    elements.pronunciationButton.addEventListener("click", () => {
      const question = state.questions[state.currentIndex];
      if (question && state.currentAnswered) {
        speechController.speak(question.chinese, elements.pronunciationButton);
      }
    });
    elements.reviewPronunciationButton.addEventListener("click", () => {
      const question = state.questions[state.currentIndex];
      if (question && state.currentAnswerVisible) {
        speechController.speak(
          question.chinese,
          elements.reviewPronunciationButton
        );
      }
    });
    elements.resultHomeTopButton.addEventListener(
      "click",
      returnHomeFromResult
    );
    elements.resultHomeButton.addEventListener("click", returnHomeFromResult);
    elements.retryButton.addEventListener("click", retryCurrentMode);
    elements.reviewResultHomeTopButton.addEventListener(
      "click",
      returnHomeFromResult
    );
    elements.reviewResultHomeButton.addEventListener(
      "click",
      returnHomeFromResult
    );
    elements.reviewRetryButton.addEventListener("click", retryCurrentMode);
    elements.reviewToQuizButton.addEventListener(
      "click",
      startQuizFromReviewedQuestions
    );
    elements.sentenceListHomeButton.addEventListener(
      "click",
      navigateHomeFromSentenceList
    );
    elements.sentenceLessonFilter.addEventListener(
      "change",
      renderSentenceList
    );
    elements.sentenceSearch.addEventListener("input", renderSentenceList);

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
    learningModes: LEARNING_MODES,
    normalizeAnswer,
    onHomeShown: () => {
      updateLearningModeControls({ save: false });
      updateHomeControls({ save: false });
    },
    resetState,
    showQuizScreen,
    showResultScreen,
    showReviewResultScreen,
    showSentenceListScreen,
    state
  };
})();
