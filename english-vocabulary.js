"use strict";

(() => {
  const HIDDEN_MEANING_TEXT = "――――";
  const ALL_CHAPTERS_VALUE = "all";
  const visibleEnglishMeanings = new Set();
  const itemTypes = Object.freeze({
    word: Object.freeze({
      collectionName: "words",
      valueProperty: "word",
      label: "英単語",
      unit: "語",
      itemClass: "english-word",
      columnClass: "english-word-column"
    }),
    phrase: Object.freeze({
      collectionName: "phrases",
      valueProperty: "phrase",
      label: "英熟語",
      unit: "個",
      itemClass: "english-phrase",
      columnClass: "english-phrase-column"
    })
  });

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

  function getTotalItemCount(itemType) {
    const config = itemTypes[itemType];
    return englishVocabularyChapters.reduce(
      (total, chapter) => total + chapter[config.collectionName].length,
      0
    );
  }

  function announce(message) {
    elements.status.textContent = "";
    window.requestAnimationFrame(() => {
      elements.status.textContent = message;
    });
  }

  function getMeaningKey(itemType, chapterNumber, itemIndex) {
    return `${itemType}:${chapterNumber}:${itemIndex}`;
  }

  function updateMeaningRow({
    itemType,
    chapterNumber,
    itemIndex,
    itemData,
    meaningCell,
    toggleButton
  }) {
    const config = itemTypes[itemType];
    const itemLabel = itemData[config.valueProperty];
    const meaningKey = getMeaningKey(itemType, chapterNumber, itemIndex);
    const isVisible = visibleEnglishMeanings.has(meaningKey);

    meaningCell.textContent = isVisible
      ? itemData.meaning
      : HIDDEN_MEANING_TEXT;
    meaningCell.dataset.visible = String(isVisible);
    toggleButton.textContent = isVisible ? "非表示" : "表示";
    toggleButton.setAttribute("aria-expanded", String(isVisible));
    toggleButton.setAttribute(
      "aria-label",
      `${itemLabel}の日本語訳を${isVisible ? "非表示にする" : "表示する"}`
    );
  }

  function createEnglishItemRow(
    itemType,
    chapterNumber,
    itemData,
    itemIndex,
    onVisibilityChange
  ) {
    const config = itemTypes[itemType];
    const itemLabel = itemData[config.valueProperty];
    const row = document.createElement("tr");
    const itemCell = document.createElement("th");
    const meaningCell = document.createElement("td");
    const actionCell = document.createElement("td");
    const toggleButton = document.createElement("button");
    const meaningCellId =
      `english-${itemType}-meaning-${chapterNumber}-${itemIndex + 1}`;

    itemCell.scope = "row";
    itemCell.className = config.itemClass;
    itemCell.textContent = itemLabel;

    meaningCell.id = meaningCellId;
    meaningCell.className = "english-meaning";

    toggleButton.type = "button";
    toggleButton.className = "button button-secondary english-meaning-toggle";
    toggleButton.setAttribute("aria-controls", meaningCellId);

    updateMeaningRow({
      itemType,
      chapterNumber,
      itemIndex,
      itemData,
      meaningCell,
      toggleButton
    });

    toggleButton.addEventListener("click", () => {
      const meaningKey = getMeaningKey(itemType, chapterNumber, itemIndex);
      if (visibleEnglishMeanings.has(meaningKey)) {
        visibleEnglishMeanings.delete(meaningKey);
      } else {
        visibleEnglishMeanings.add(meaningKey);
      }

      updateMeaningRow({
        itemType,
        chapterNumber,
        itemIndex,
        itemData,
        meaningCell,
        toggleButton
      });
      onVisibilityChange();

      announce(
        `${itemLabel}の日本語訳を${
          visibleEnglishMeanings.has(meaningKey) ? "表示しました" : "非表示にしました"
        }。`
      );
    });

    actionCell.className = "english-vocabulary-action";
    actionCell.append(toggleButton);
    row.append(itemCell, meaningCell, actionCell);
    return {
      row,
      update: () => {
        updateMeaningRow({
          itemType,
          chapterNumber,
          itemIndex,
          itemData,
          meaningCell,
          toggleButton
        });
      }
    };
  }

  function areAllMeaningsVisible(itemType, chapterNumber, itemCount) {
    return Array.from({ length: itemCount }, (_, itemIndex) =>
      visibleEnglishMeanings.has(
        getMeaningKey(itemType, chapterNumber, itemIndex)
      )
    ).every(Boolean);
  }

  function updateToggleAllButton(
    toggleAllButton,
    itemType,
    chapterData,
    itemCount
  ) {
    const config = itemTypes[itemType];
    const allVisible = areAllMeaningsVisible(
      itemType,
      chapterData.chapter,
      itemCount
    );
    toggleAllButton.textContent = allVisible
      ? "すべて非表示"
      : "すべて表示";
    toggleAllButton.setAttribute("aria-pressed", String(allVisible));
    toggleAllButton.setAttribute(
      "aria-label",
      `${chapterData.title}の${config.label}の日本語訳をすべて${
        allVisible ? "非表示にする" : "表示する"
      }`
    );
  }

  function createEnglishTableSection(
    chapterData,
    itemType,
    headingLevel = 2
  ) {
    const config = itemTypes[itemType];
    const items = chapterData[config.collectionName];
    const section = document.createElement("section");
    const tableHeading = document.createElement("div");
    const heading = document.createElement(`h${headingLevel}`);
    const toggleAllButton = document.createElement("button");
    const tableWrap = document.createElement("div");
    const table = document.createElement("table");
    const caption = document.createElement("caption");
    const colgroup = document.createElement("colgroup");
    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const tableBody = document.createElement("tbody");
    const headingId =
      `english-${itemType}-heading-${chapterData.chapter}`;
    const tableId =
      `english-${itemType}-table-${chapterData.chapter}`;
    const rowControllers = [];

    section.className = `english-table-section english-table-section--${itemType}`;
    section.setAttribute("aria-labelledby", headingId);
    tableHeading.className = "english-table-heading";
    heading.id = headingId;
    heading.textContent = `${chapterData.title} ${config.label}一覧`;
    toggleAllButton.type = "button";
    toggleAllButton.className =
      "button button-secondary english-toggle-all-button";
    toggleAllButton.setAttribute("aria-controls", tableId);
    tableWrap.className = "english-vocabulary-table-wrap";
    table.className = "english-vocabulary-table";
    table.id = tableId;
    caption.className = "visually-hidden";
    caption.textContent = `${chapterData.title} ${config.label}一覧`;

    [
      config.columnClass,
      "english-meaning-column",
      "english-action-column"
    ].forEach((className) => {
      const column = document.createElement("col");
      column.className = className;
      colgroup.append(column);
    });

    [config.label, "日本語の意味", "操作"].forEach((label) => {
      const heading = document.createElement("th");
      heading.scope = "col";
      heading.textContent = label;
      headRow.append(heading);
    });

    const updateToggleAll = () => {
      updateToggleAllButton(
        toggleAllButton,
        itemType,
        chapterData,
        items.length
      );
    };

    items.forEach((itemData, itemIndex) => {
      const rowController = createEnglishItemRow(
        itemType,
        chapterData.chapter,
        itemData,
        itemIndex,
        updateToggleAll
      );
      rowControllers.push(rowController);
      tableBody.append(rowController.row);
    });

    updateToggleAll();
    toggleAllButton.addEventListener("click", () => {
      const shouldShowAll = !areAllMeaningsVisible(
        itemType,
        chapterData.chapter,
        items.length
      );

      items.forEach((_, itemIndex) => {
        const meaningKey = getMeaningKey(
          itemType,
          chapterData.chapter,
          itemIndex
        );
        if (shouldShowAll) {
          visibleEnglishMeanings.add(meaningKey);
        } else {
          visibleEnglishMeanings.delete(meaningKey);
        }
      });

      rowControllers.forEach((rowController) => rowController.update());
      updateToggleAll();
      announce(
        `${chapterData.title}の${config.label}の日本語訳をすべて${
          shouldShowAll ? "表示しました" : "非表示にしました"
        }。`
      );
    });

    tableHead.append(headRow);
    table.append(caption, colgroup, tableHead, tableBody);
    tableWrap.append(table);
    tableHeading.append(heading, toggleAllButton);
    section.append(tableHeading, tableWrap);
    return section;
  }

  function renderEnglishChapter(chapterData) {
    elements.content.replaceChildren(
      createEnglishTableSection(chapterData, "word"),
      createEnglishTableSection(chapterData, "phrase")
    );
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
      section.append(
        heading,
        createEnglishTableSection(chapterData, "word", 3),
        createEnglishTableSection(chapterData, "phrase", 3)
      );
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
      elements.count.textContent =
        `英単語${getTotalItemCount("word")}語・` +
        `英熟語${getTotalItemCount("phrase")}個`;
      renderAllEnglishChapters();
    } else {
      const chapterData = getChapterData(normalizedChapter);
      elements.count.textContent =
        `英単語${chapterData.words.length}語・` +
        `英熟語${chapterData.phrases.length}個`;
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
