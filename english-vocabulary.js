"use strict";

(() => {
  const HIDDEN_MEANING_TEXT = "――――";
  const visibleEnglishMeanings = new Set();

  const elements = {
    chapterButtons: [...document.querySelectorAll("[data-english-chapter]")],
    screen: document.querySelector("#english-vocabulary-screen"),
    homeButton: document.querySelector("#english-vocabulary-home-button"),
    title: document.querySelector("#english-vocabulary-title"),
    count: document.querySelector("#english-vocabulary-count"),
    caption: document.querySelector("#english-vocabulary-caption"),
    tableBody: document.querySelector("#english-vocabulary-table-body"),
    status: document.querySelector("#english-vocabulary-status")
  };

  let currentChapter = null;

  function isValidChapter(chapterNumber) {
    return (
      Number.isInteger(chapterNumber) &&
      chapterNumber >= 1 &&
      chapterNumber <= 7
    );
  }

  function getChapterData(chapterNumber) {
    return englishVocabularyChapters.find(
      (chapter) => chapter.chapter === chapterNumber
    );
  }

  function announce(message) {
    elements.status.textContent = "";
    window.requestAnimationFrame(() => {
      elements.status.textContent = message;
    });
  }

  function updateMeaningRow({
    chapterNumber,
    wordIndex,
    wordData,
    meaningCell,
    toggleButton
  }) {
    const meaningKey = `${chapterNumber}:${wordIndex}`;
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
      const meaningKey = `${chapterNumber}:${wordIndex}`;
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

  function renderEnglishVocabularyTable(chapterData) {
    elements.tableBody.replaceChildren();

    chapterData.words.forEach((wordData, wordIndex) => {
      elements.tableBody.append(
        createVocabularyRow(chapterData.chapter, wordData, wordIndex)
      );
    });
  }

  function showEnglishVocabularyScreen(chapterNumber, options = {}) {
    const { focus = true } = options;
    const chapterData = getChapterData(chapterNumber);

    if (!chapterData) {
      replaceHistoryWithHome({ focus });
      return;
    }

    currentChapter = chapterNumber;
    visibleEnglishMeanings.clear();
    elements.status.textContent = "";
    elements.title.textContent = chapterData.title;
    elements.count.textContent = `全${chapterData.words.length}語`;
    elements.caption.textContent = `${chapterData.title} 英単語・英熟語一覧`;
    renderEnglishVocabularyTable(chapterData);
    showOnlyScreen("englishVocabulary");

    if (focus) {
      elements.title.focus();
    }
  }

  function navigateToChapter(chapterNumber) {
    if (!isValidChapter(chapterNumber)) {
      replaceHistoryWithHome();
      return;
    }

    navigateToScreen("englishVocabulary", {
      historyAction: "push",
      from: "home",
      focus: true,
      stateData: { chapter: chapterNumber }
    });
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
      navigateToChapter(Number(button.dataset.englishChapter));
    });
  });
  elements.homeButton.addEventListener("click", navigateHome);

  window.englishVocabularyApp = Object.freeze({
    get currentChapter() {
      return currentChapter;
    },
    isValidChapter,
    showScreen: showEnglishVocabularyScreen
  });
})();
