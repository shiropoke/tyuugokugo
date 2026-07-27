"use strict";

(() => {
  const HIDDEN_MEANING_TEXT = "――――";
  const ALL_CHAPTERS_VALUE = "all";
  const visibleEnglishMeanings = new Set();

  const elements = {
    chapterButtons: [...document.querySelectorAll("[data-english-chapter]")],
    homeButton: document.querySelector("#english-vocabulary-home-button"),
    previousSlot: document.querySelector("#english-chapter-previous"),
    nextSlot: document.querySelector("#english-chapter-next"),
    title: document.querySelector("#english-vocabulary-title"),
    count: document.querySelector("#english-vocabulary-count"),
    content: document.querySelector("#english-vocabulary-content"),
    status: document.querySelector("#english-vocabulary-status")
  };

  let currentChapter = null;

  function isChapterNumber(chapterNumber) {
    return (
      Number.isInteger(chapterNumber) &&
      chapterNumber >= 1 &&
      chapterNumber <= englishVocabularyChapters.length
    );
  }

  function normalizeChapterValue(chapterValue) {
    if (chapterValue === ALL_CHAPTERS_VALUE) {
      return ALL_CHAPTERS_VALUE;
    }

    const chapterNumber = Number(chapterValue);
    return isChapterNumber(chapterNumber) ? chapterNumber : null;
  }

  function isValidChapter(chapterValue) {
    return normalizeChapterValue(chapterValue) !== null;
  }

  function getChapterData(chapterNumber) {
    return englishVocabularyChapters.find(
      (chapter) => chapter.chapter === chapterNumber
    );
  }

  function getTotalWordCount() {
    return englishVocabularyChapters.reduce(
      (total, chapter) => total + chapter.words.length,
      0
    );
  }

  function announce(message) {
    elements.status.textContent = "";
    window.requestAnimationFrame(() => {
      elements.status.textContent = message;
    });
  }

  function getMeaningKey(chapterNumber, wordIndex) {
    return `chapter-${chapterNumber}-word-${wordIndex}`;
  }

  function updateMeaningRow({
    chapterNumber,
    wordIndex,
    wordData,
    meaningCell,
    toggleButton
  }) {
    const meaningKey = getMeaningKey(chapterNumber, wordIndex);
    const isVisible = visibleEnglishMeanings.has(meaningKey);

    meaningCell.textContent = isVisible
      ? wordData.meaning
      : HIDDEN_MEANING_TEXT;
    meaningCell.dataset.visible = String(isVisible);
    toggleButton.textContent = isVisible ? "非表示" : "表示";
    toggleButton.setAttribute("aria-expanded", String(isVisible));
    toggleButton.setAttribute(
      "aria-label",
      `${wordData.word}の日本語訳を${isVisible ? "非表示にする" : "表示する"}`
    );
  }

  function createVocabularyRow(chapterNumber, wordData, wordIndex) {
    const row = document.createElement("tr");
    const wordCell = document.createElement("th");
    const meaningCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const toggleButton = document.createElement("button");
    const meaningCellId = `english-meaning-${chapterNumber}-${wordIndex + 1}`;

    wordCell.scope = "row";
    wordCell.className = "english-word";
    wordCell.textContent = wordData.word;

    meaningCell.id = meaningCellId;
    meaningCell.className = "english-meaning";

    toggleButton.type = "button";
    toggleButton.className = "button button-secondary english-meaning-toggle";
    toggleButton.setAttribute("aria-controls", meaningCellId);

    updateMeaningRow({
      chapterNumber,
      wordIndex,
      wordData,
      meaningCell,
      toggleButton
    });

    toggleButton.addEventListener("click", () => {
      const meaningKey = getMeaningKey(chapterNumber, wordIndex);
      if (visibleEnglishMeanings.has(meaningKey)) {
        visibleEnglishMeanings.delete(meaningKey);
      } else {
        visibleEnglishMeanings.add(meaningKey);
      }

      updateMeaningRow({
        chapterNumber,
        wordIndex,
        wordData,
        meaningCell,
        toggleButton
      });

      announce(
        `${wordData.word}の日本語訳を${
          visibleEnglishMeanings.has(meaningKey) ? "表示しました" : "非表示にしました"
        }。`
      );
    });

    actionCell.className = "english-vocabulary-action";
    actionCell.append(toggleButton);
    row.append(wordCell, meaningCell, actionCell);
    return row;
  }

  function createVocabularyTable(chapterData) {
    const tableWrap = document.createElement("div");
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    const colgroup = document.createElement("colgroup");
    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const tableBody = document.createElement("tbody");

    tableWrap.className = "english-vocabulary-table-wrap";
    table.className = "english-vocabulary-table";
    caption.textContent = `${chapterData.title} 英単語・英熟語一覧`;

    [
      "english-word-column",
      "english-meaning-column",
      "english-action-column"
    ].forEach((className) => {
      const column = document.createElement("col");
      column.className = className;
      colgroup.append(column);
    });

    ["英単語", "日本語の意味", "操作"].forEach((label) => {
      const heading = document.createElement("th");
      heading.scope = "col";
      heading.textContent = label;
      headRow.append(heading);
    });

    chapterData.words.forEach((wordData, wordIndex) => {
      tableBody.append(
        createVocabularyRow(chapterData.chapter, wordData, wordIndex)
      );
    });

    tableHead.append(headRow);
    table.append(caption, colgroup, tableHead, tableBody);
    tableWrap.append(table);
    return tableWrap;
  }

  function renderEnglishChapter(chapterData) {
    elements.content.replaceChildren(createVocabularyTable(chapterData));
  }

  function renderAllEnglishChapters() {
    const groups = document.createDocumentFragment();

    englishVocabularyChapters.forEach((chapterData) => {
      const section = document.createElement("section");
      const heading = document.createElement("h2");
      const headingId = `english-all-chapter-${chapterData.chapter}-title`;

      section.className = "english-vocabulary-group";
      section.setAttribute("aria-labelledby", headingId);
      heading.id = headingId;
      heading.textContent = chapterData.title;
      section.append(heading, createVocabularyTable(chapterData));
      groups.append(section);
    });

    elements.content.replaceChildren(groups);
  }

  function navigateToChapter(chapterValue, options = {}) {
    const { from = "home" } = options;
    const normalizedChapter = normalizeChapterValue(chapterValue);
    const isCurrentHistoryEntry =
      history.state?.app === HISTORY_APP_ID &&
      history.state.screen === "englishVocabulary" &&
      history.state.chapter === normalizedChapter;

    if (normalizedChapter === null || isCurrentHistoryEntry) {
      return;
    }

    navigateToScreen("englishVocabulary", {
      historyAction: "push",
      from,
      focus: true,
      stateData: { chapter: normalizedChapter }
    });
  }

  function createChapterNavigationButton(chapterNumber, direction) {
    const button = document.createElement("button");
    const isPrevious = direction === "previous";

    button.type = "button";
    button.className = "button button-secondary english-chapter-nav-button";
    button.textContent = isPrevious
      ? `←Chapter${chapterNumber}`
      : `Chapter${chapterNumber}→`;
    button.setAttribute(
      "aria-label",
      `Chapter${chapterNumber}へ移動する`
    );
    button.addEventListener("click", () => {
      navigateToChapter(chapterNumber, { from: "englishVocabulary" });
    });
    return button;
  }

  function renderEnglishChapterNavigation(chapterValue) {
    elements.previousSlot.replaceChildren();
    elements.nextSlot.replaceChildren();

    if (chapterValue === ALL_CHAPTERS_VALUE) {
      elements.title.textContent = "全Chapter";
      return;
    }

    elements.title.textContent = `Chapter${chapterValue}`;
    const previousChapter = chapterValue > 1 ? chapterValue - 1 : null;
    const nextChapter =
      chapterValue < englishVocabularyChapters.length
        ? chapterValue + 1
        : null;

    if (previousChapter !== null) {
      elements.previousSlot.append(
        createChapterNavigationButton(previousChapter, "previous")
      );
    }
    if (nextChapter !== null) {
      elements.nextSlot.append(
        createChapterNavigationButton(nextChapter, "next")
      );
    }
  }

  function showEnglishVocabularyScreen(chapterValue, options = {}) {
    const { focus = true } = options;
    const normalizedChapter = normalizeChapterValue(chapterValue);

    if (normalizedChapter === null) {
      replaceHistoryWithHome({ focus });
      return;
    }

    currentChapter = normalizedChapter;
    visibleEnglishMeanings.clear();
    elements.status.textContent = "";
    renderEnglishChapterNavigation(normalizedChapter);

    if (normalizedChapter === ALL_CHAPTERS_VALUE) {
      elements.count.textContent = `全${getTotalWordCount()}語`;
      renderAllEnglishChapters();
    } else {
      const chapterData = getChapterData(normalizedChapter);
      elements.count.textContent = `全${chapterData.words.length}語`;
      renderEnglishChapter(chapterData);
    }

    showOnlyScreen("englishVocabulary");
    if (focus) {
      elements.title.focus();
    }
  }

  function navigateHome() {
    const currentState = history.state;
    if (
      currentState?.app === HISTORY_APP_ID &&
      currentState.screen === "englishVocabulary" &&
      currentState.from === "home"
    ) {
      history.back();
      return;
    }

    replaceHistoryWithHome();
  }

  elements.chapterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      navigateToChapter(button.dataset.englishChapter);
    });
  });
  elements.homeButton.addEventListener("click", navigateHome);

  window.englishVocabularyApp = Object.freeze({
    get currentChapter() {
      return currentChapter;
    },
    isValidChapter,
    normalizeChapterValue,
    showScreen: showEnglishVocabularyScreen
  });
})();
