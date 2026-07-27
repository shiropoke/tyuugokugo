"use strict";

(function () {
  var JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  var RANKED_MAP_DURATION_MS =
    4 * 60 * 60 * 1000 + 30 * 60 * 1000;
  var AUTO_UPDATE_INTERVAL_MS = 60 * 1000;
  var RANKED_ROTATION_VISIBLE_COUNT = 5;
  var RANKED_ASSET_VERSION = "20260727-3";
  var SCHEDULE_POSITION_LABELS = Object.freeze([
    "現在",
    "次",
    "2つ先",
    "3つ先",
    "4つ先"
  ]);

  var rankedMapRotation = Object.freeze([
    Object.freeze({
      key: "storm-point",
      name: "Storm Point",
      imageSrc:
        "./assets/ranked-maps/storm-point.jpeg?v=" +
        RANKED_ASSET_VERSION
    }),
    Object.freeze({
      key: "worlds-edge",
      name: "World’s Edge",
      imageSrc:
        "./assets/ranked-maps/worlds-edge.jpeg?v=" +
        RANKED_ASSET_VERSION
    }),
    Object.freeze({
      key: "e-district",
      name: "E-District",
      imageSrc:
        "./assets/ranked-maps/e-district.jpeg?v=" +
        RANKED_ASSET_VERSION
    })
  ]);

  // 2026-07-27 11:00 JST is 2026-07-27 02:00 UTC.
  var RANKED_ROTATION_ANCHOR_MS = Date.UTC(2026, 6, 27, 2, 0, 0);
  // 2026-08-05 02:00 JST is 2026-08-04 17:00 UTC.
  var S29_SP2_END_TIME_MS = Date.UTC(2026, 7, 4, 17, 0, 0);

  var rankedMapElements = null;
  var rankedMapUpdateTimer = null;
  var rankedMapSectionInitialized = false;
  var lifecycleListenersRegistered = false;
  var lastAnnouncedMapKey = "";

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function toTimestamp(value) {
    if (value instanceof Date) {
      return value.getTime();
    }
    return Number(value);
  }

  function padTwoDigits(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function getRotationOffsetLabel(offset) {
    return SCHEDULE_POSITION_LABELS[offset] || offset + "つ先";
  }

  function calculateRankedMapState(nowMs) {
    var safeNowMs =
      nowMs === undefined ? Date.now() : toTimestamp(nowMs);

    if (!Number.isFinite(safeNowMs)) {
      throw new RangeError("有効な日時を指定してください。");
    }

    var elapsedMs = safeNowMs - RANKED_ROTATION_ANCHOR_MS;
    var slotOffset = Math.floor(elapsedMs / RANKED_MAP_DURATION_MS);
    var currentMapIndex = positiveModulo(
      slotOffset,
      rankedMapRotation.length
    );
    var currentStartMs =
      RANKED_ROTATION_ANCHOR_MS +
      slotOffset * RANKED_MAP_DURATION_MS;
    var currentEndMs = currentStartMs + RANKED_MAP_DURATION_MS;

    var scheduleEntries = Array.from(
      { length: RANKED_ROTATION_VISIBLE_COUNT },
      function (_, offset) {
        var mapIndex = positiveModulo(
          currentMapIndex + offset,
          rankedMapRotation.length
        );
        var startMs =
          currentStartMs + offset * RANKED_MAP_DURATION_MS;

        return {
          label: getRotationOffsetLabel(offset),
          map: rankedMapRotation[mapIndex],
          startMs: startMs,
          endMs: startMs + RANKED_MAP_DURATION_MS,
          isCurrent: offset === 0
        };
      }
    );

    return {
      nowMs: safeNowMs,
      currentMap: rankedMapRotation[currentMapIndex],
      nextMap:
        rankedMapRotation[
          positiveModulo(currentMapIndex + 1, rankedMapRotation.length)
        ],
      currentStartMs: currentStartMs,
      currentEndMs: currentEndMs,
      nextStartMs: currentEndMs,
      nextEndMs: currentEndMs + RANKED_MAP_DURATION_MS,
      scheduleEntries: scheduleEntries
    };
  }

  function getJstDateTimeParts(timestampMs) {
    var safeTimestamp = toTimestamp(timestampMs);

    if (!Number.isFinite(safeTimestamp)) {
      throw new RangeError("有効な日時を指定してください。");
    }

    // Add the fixed JST offset and use UTC getters. This avoids ambiguous
    // Date-string parsing and Safari differences around Intl hour cycles.
    var jstDate = new Date(safeTimestamp + JST_OFFSET_MS);

    return {
      month: jstDate.getUTCMonth() + 1,
      day: jstDate.getUTCDate(),
      hour: jstDate.getUTCHours(),
      minute: jstDate.getUTCMinutes()
    };
  }

  function formatJstTime(timestampMs) {
    var parts = getJstDateTimeParts(timestampMs);
    return (
      padTwoDigits(parts.hour) + ":" + padTwoDigits(parts.minute)
    );
  }

  function formatJstDateTime(timestampMs) {
    var parts = getJstDateTimeParts(timestampMs);
    return (
      parts.month +
      "/" +
      parts.day +
      " " +
      padTwoDigits(parts.hour) +
      ":" +
      padTwoDigits(parts.minute)
    );
  }

  function formatJstDateTimeRange(startMs, endMs) {
    return (
      formatJstDateTime(startMs) +
      " ～ " +
      formatJstDateTime(endMs)
    );
  }

  function formatTimeRange(startMs, endMs) {
    return formatJstTime(startMs) + " ～ " + formatJstTime(endMs);
  }

  function formatRemainingTime(endMs, nowMs) {
    var safeEndMs = toTimestamp(endMs);
    var safeNowMs = toTimestamp(nowMs);
    var remainingMinutes = Math.max(
      0,
      Math.ceil((safeEndMs - safeNowMs) / (60 * 1000))
    );
    var hours = Math.floor(remainingMinutes / 60);
    var minutes = remainingMinutes % 60;

    if (hours > 0) {
      return (
        "残り" +
        hours +
        "時間" +
        padTwoDigits(minutes) +
        "分"
      );
    }
    return "残り" + minutes + "分";
  }

  function getS29Sp2Countdown(nowMs) {
    var safeNowMs =
      nowMs === undefined ? Date.now() : toTimestamp(nowMs);
    var remainingMs = S29_SP2_END_TIME_MS - safeNowMs;

    if (!Number.isFinite(remainingMs)) {
      return {
        ended: false,
        failed: true,
        text: "残り時間を取得できませんでした。"
      };
    }

    if (remainingMs <= 0) {
      return {
        ended: true,
        failed: false,
        text: "S29 SP2は終了しました。"
      };
    }

    var totalMinutes = Math.max(
      1,
      Math.ceil(remainingMs / (60 * 1000))
    );
    var days = Math.floor(totalMinutes / (24 * 60));
    var hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    var minutes = totalMinutes % 60;
    var parts = [];

    if (days > 0) {
      parts.push(days + "日");
    }
    if (hours > 0 || days > 0) {
      parts.push(hours + "時間");
    }
    parts.push(minutes + "分");

    return {
      ended: false,
      failed: false,
      text: parts.join(" ")
    };
  }

  function collectRankedMapElements() {
    return {
      currentImage: document.querySelector("#ranked-current-image"),
      currentImageFallback: document.querySelector(
        "#ranked-current-image-fallback"
      ),
      currentName: document.querySelector("#ranked-current-name"),
      currentTime: document.querySelector("#ranked-current-time"),
      currentRemaining: document.querySelector(
        "#ranked-current-remaining"
      ),
      nextImage: document.querySelector("#ranked-next-image"),
      nextImageFallback: document.querySelector(
        "#ranked-next-image-fallback"
      ),
      nextName: document.querySelector("#ranked-next-name"),
      nextTime: document.querySelector("#ranked-next-time"),
      rotationList: document.querySelector("#ranked-map-schedule"),
      seasonTitle: document.querySelector(
        "#ranked-season-countdown-title"
      ),
      seasonValue: document.querySelector(
        "#ranked-season-countdown-value"
      ),
      seasonEnd: document.querySelector(
        "#ranked-season-countdown-end"
      ),
      updateStatus: document.querySelector(
        "#ranked-map-update-status"
      )
    };
  }

  function hasRequiredRankedMapElements() {
    var requiredNames = [
      "currentImage",
      "currentImageFallback",
      "currentName",
      "currentTime",
      "currentRemaining",
      "nextImage",
      "nextImageFallback",
      "nextName",
      "nextTime",
      "rotationList",
      "seasonTitle",
      "seasonValue",
      "seasonEnd"
    ];
    var allFound = true;

    requiredNames.forEach(function (name) {
      if (!rankedMapElements[name]) {
        console.error("Ranked map element is missing: " + name);
        allFound = false;
      }
    });

    return allFound;
  }

  function getImageFallback(imageElement) {
    var imageArea = imageElement.parentElement;
    if (!imageArea) {
      return null;
    }
    return imageArea.querySelector(".ranked-map-image-fallback");
  }

  function handleRankedMapImageError(imageElement, mapName) {
    var fallback = getImageFallback(imageElement);

    imageElement.hidden = true;
    if (fallback) {
      fallback.textContent =
        mapName + "の画像を読み込めませんでした";
      fallback.hidden = false;
    }
  }

  function bindRankedMapImageError(imageElement) {
    if (imageElement.getAttribute("data-ranked-error-bound") === "true") {
      return;
    }

    imageElement.addEventListener("error", function () {
      handleRankedMapImageError(
        imageElement,
        imageElement.getAttribute("data-ranked-map-name") ||
          imageElement.alt ||
          "マップ"
      );
    });
    imageElement.setAttribute("data-ranked-error-bound", "true");
  }

  function updateMapImage(imageElement, map) {
    if (!imageElement) {
      throw new Error("Ranked map image element was not found");
    }

    var fallback = getImageFallback(imageElement);
    bindRankedMapImageError(imageElement);
    imageElement.setAttribute("data-ranked-map-name", map.name);
    imageElement.alt = map.name;
    imageElement.hidden = false;

    if (fallback) {
      fallback.hidden = true;
      fallback.textContent = "";
    }

    if (imageElement.getAttribute("src") !== map.imageSrc) {
      imageElement.setAttribute("src", map.imageSrc);
    }

    if (imageElement.complete && imageElement.naturalWidth === 0) {
      handleRankedMapImageError(imageElement, map.name);
    }
  }

  function createRankedMapImageArea(map) {
    var imageArea = document.createElement("div");
    var image = document.createElement("img");
    var fallback = document.createElement("p");

    imageArea.className =
      "ranked-map-image-area ranked-map-schedule-image-area";
    image.className = "ranked-map-schedule-image";
    image.src = map.imageSrc;
    image.alt = map.name;
    image.loading = "eager";
    image.decoding = "async";
    image.setAttribute("data-ranked-map-name", map.name);
    fallback.className = "ranked-map-image-fallback";
    fallback.hidden = true;
    fallback.setAttribute("role", "status");

    bindRankedMapImageError(image);
    imageArea.appendChild(image);
    imageArea.appendChild(fallback);
    return imageArea;
  }

  function renderCurrentRankedMap(state) {
    if (
      !rankedMapElements.currentName ||
      !rankedMapElements.currentTime ||
      !rankedMapElements.currentRemaining
    ) {
      throw new Error("Current ranked map elements were not found");
    }

    updateMapImage(
      rankedMapElements.currentImage,
      state.currentMap
    );
    rankedMapElements.currentName.textContent = state.currentMap.name;
    rankedMapElements.currentTime.textContent = formatTimeRange(
      state.currentStartMs,
      state.currentEndMs
    );
    rankedMapElements.currentRemaining.textContent =
      formatRemainingTime(state.currentEndMs, state.nowMs);
  }

  function renderNextRankedMap(state) {
    if (
      !rankedMapElements.nextName ||
      !rankedMapElements.nextTime
    ) {
      throw new Error("Next ranked map elements were not found");
    }

    updateMapImage(rankedMapElements.nextImage, state.nextMap);
    rankedMapElements.nextName.textContent = state.nextMap.name;
    rankedMapElements.nextTime.textContent = formatTimeRange(
      state.nextStartMs,
      state.nextEndMs
    );
  }

  function createRotationItem(entry) {
    var item = document.createElement("li");
    var imageArea = createRankedMapImageArea(entry.map);
    var body = document.createElement("div");
    var position = document.createElement("p");
    var mapName = document.createElement("p");
    var timeRange = document.createElement("time");

    item.className = "ranked-map-schedule-item";
    if (entry.isCurrent) {
      item.classList.add("ranked-map-schedule-item--current");
    }

    body.className = "ranked-map-schedule-body";
    position.className = "ranked-map-schedule-position";
    position.textContent = entry.label;
    mapName.className = "ranked-map-schedule-name";
    mapName.textContent = entry.map.name;
    timeRange.className = "ranked-map-schedule-time";
    timeRange.textContent = formatJstDateTimeRange(
      entry.startMs,
      entry.endMs
    );

    body.appendChild(position);
    body.appendChild(mapName);
    body.appendChild(timeRange);
    item.appendChild(imageArea);
    item.appendChild(body);
    return item;
  }

  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function renderRankedRotationList(entries) {
    var container = rankedMapElements.rotationList;
    if (!container) {
      throw new Error("ranked-map-schedule element was not found");
    }

    var fragment = document.createDocumentFragment();
    entries.forEach(function (entry) {
      fragment.appendChild(createRotationItem(entry));
    });

    clearElement(container);
    container.appendChild(fragment);
  }

  function renderRotationFailure() {
    var container = rankedMapElements.rotationList;
    if (!container) {
      return;
    }

    var item = document.createElement("li");
    item.className = "ranked-map-render-error";
    item.textContent = "ローテーションを表示できませんでした。";
    clearElement(container);
    container.appendChild(item);
  }

  function renderS29Sp2Countdown(nowMs) {
    if (
      !rankedMapElements.seasonTitle ||
      !rankedMapElements.seasonValue ||
      !rankedMapElements.seasonEnd
    ) {
      throw new Error("S29 SP2 countdown elements were not found");
    }

    var countdown = getS29Sp2Countdown(nowMs);
    rankedMapElements.seasonTitle.textContent = countdown.ended
      ? "S29 SP2"
      : "S29 SP2終了まで";
    rankedMapElements.seasonValue.textContent = countdown.text;
    rankedMapElements.seasonEnd.textContent =
      "終了日時：2026年8月5日 02:00";
    return countdown;
  }

  function renderCountdownFailure() {
    if (rankedMapElements.seasonValue) {
      rankedMapElements.seasonValue.textContent =
        "残り時間を取得できませんでした。";
    }
  }

  function safelyRenderRankedPart(
    label,
    renderFunction,
    fallbackFunction
  ) {
    try {
      return renderFunction();
    } catch (error) {
      console.error("Failed to render " + label, error);
      if (fallbackFunction) {
        try {
          fallbackFunction();
        } catch (fallbackError) {
          console.error(
            "Failed to render " + label + " fallback",
            fallbackError
          );
        }
      }
      return null;
    }
  }

  function updateRankedMapStatus(state) {
    if (
      !rankedMapElements.updateStatus ||
      lastAnnouncedMapKey === state.currentMap.key
    ) {
      return;
    }

    rankedMapElements.updateStatus.textContent =
      "現在のランクマップは" +
      state.currentMap.name +
      "です。次は" +
      state.nextMap.name +
      "です。";
    lastAnnouncedMapKey = state.currentMap.key;
  }

  function updateRankedMapSection(nowMs) {
    if (!rankedMapElements) {
      rankedMapElements = collectRankedMapElements();
    }

    var safeNowMs =
      nowMs === undefined ? Date.now() : toTimestamp(nowMs);
    var state = null;

    try {
      state = calculateRankedMapState(safeNowMs);
    } catch (error) {
      console.error("Failed to calculate ranked map state", error);
      renderRotationFailure();
    }

    if (state) {
      safelyRenderRankedPart("current map", function () {
        renderCurrentRankedMap(state);
      });
      safelyRenderRankedPart("next map", function () {
        renderNextRankedMap(state);
      });
      safelyRenderRankedPart(
        "rotation list",
        function () {
          renderRankedRotationList(state.scheduleEntries);
        },
        renderRotationFailure
      );
      safelyRenderRankedPart("ranked map status", function () {
        updateRankedMapStatus(state);
      });
    }

    var countdown = safelyRenderRankedPart(
      "season countdown",
      function () {
        return renderS29Sp2Countdown(safeNowMs);
      },
      renderCountdownFailure
    );

    return {
      state: state,
      countdown: countdown
    };
  }

  function handleVisibilityChange() {
    if (!document.hidden) {
      updateRankedMapSection();
    }
  }

  function handlePageShow() {
    updateRankedMapSection();
  }

  function registerLifecycleListeners() {
    if (lifecycleListenersRegistered) {
      return;
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    window.addEventListener("pageshow", handlePageShow);
    lifecycleListenersRegistered = true;
  }

  function initializeRankedMapSection() {
    if (rankedMapSectionInitialized) {
      updateRankedMapSection();
      return;
    }

    rankedMapElements = collectRankedMapElements();
    hasRequiredRankedMapElements();
    rankedMapSectionInitialized = true;

    // Render immediately. Do not wait for the first interval tick.
    updateRankedMapSection();

    if (rankedMapUpdateTimer === null) {
      rankedMapUpdateTimer = window.setInterval(
        updateRankedMapSection,
        AUTO_UPDATE_INTERVAL_MS
      );
    }

    registerLifecycleListeners();
  }

  window.rankedMapRotationApp = Object.freeze({
    calculateRankedMapState: calculateRankedMapState,
    formatJstDateTime: formatJstDateTime,
    formatJstDateTimeRange: formatJstDateTimeRange,
    formatRemainingTime: formatRemainingTime,
    formatTimeRange: formatTimeRange,
    getRotationOffsetLabel: getRotationOffsetLabel,
    getS29Sp2Countdown: getS29Sp2Countdown,
    handleRankedMapImageError: handleRankedMapImageError,
    initializeRankedMapSection: initializeRankedMapSection,
    positiveModulo: positiveModulo,
    rankedMapDurationMs: RANKED_MAP_DURATION_MS,
    rankedMapRotation: rankedMapRotation,
    rankedRotationAnchorMs: RANKED_ROTATION_ANCHOR_MS,
    rankedRotationVisibleCount: RANKED_ROTATION_VISIBLE_COUNT,
    s29Sp2EndTimeMs: S29_SP2_END_TIME_MS,
    updateRankedMapSection: updateRankedMapSection
  });

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeRankedMapSection
    );
  } else {
    initializeRankedMapSection();
  }
})();
