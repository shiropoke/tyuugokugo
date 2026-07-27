"use strict";

(() => {
  const JST_TIME_ZONE = "Asia/Tokyo";
  const MAP_DURATION_MINUTES = 270;
  const MAP_DURATION_MS = MAP_DURATION_MINUTES * 60 * 1000;
  const AUTO_UPDATE_INTERVAL_MS = 60 * 1000;
  const RANKED_ROTATION_VISIBLE_COUNT = 5;
  const SCHEDULE_POSITION_LABELS = Object.freeze([
    "現在",
    "次",
    "2つ先",
    "3つ先",
    "4つ先"
  ]);

  const rankedMapRotation = Object.freeze([
    Object.freeze({
      key: "storm-point",
      name: "Storm Point",
      image: "./assets/images/storm-point.png"
    }),
    Object.freeze({
      key: "worlds-edge",
      name: "World’s Edge",
      image: "./assets/images/worlds-edge.png"
    }),
    Object.freeze({
      key: "e-district",
      name: "E-District",
      image: "./assets/images/e-district.png"
    })
  ]);

  const rankedRotationAnchor = Object.freeze({
    year: 2026,
    month: 7,
    day: 27,
    hour: 11,
    minute: 0,
    mapIndex: 0
  });

  // 2026-07-27 11:00 JST is 2026-07-27 02:00 UTC.
  const RANKED_ROTATION_ANCHOR_MS = Date.UTC(2026, 6, 27, 2, 0);
  // 2026-08-05 02:00 JST is 2026-08-04 17:00 UTC.
  const S29_SP2_END_TIME_MS = Date.UTC(2026, 7, 4, 17, 0, 0);
  const jstTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const jstScheduleFormatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: JST_TIME_ZONE,
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23"
  });

  const elements = {
    currentImage: document.querySelector("#ranked-current-image"),
    currentName: document.querySelector("#ranked-current-name"),
    currentTime: document.querySelector("#ranked-current-time"),
    currentRemaining: document.querySelector("#ranked-current-remaining"),
    nextImage: document.querySelector("#ranked-next-image"),
    nextName: document.querySelector("#ranked-next-name"),
    nextTime: document.querySelector("#ranked-next-time"),
    schedule: document.querySelector("#ranked-map-schedule"),
    seasonCountdownTitle: document.querySelector(
      "#ranked-season-countdown-title"
    ),
    seasonCountdownValue: document.querySelector(
      "#ranked-season-countdown-value"
    ),
    seasonCountdownEnd: document.querySelector(
      "#ranked-season-countdown-end"
    ),
    updateStatus: document.querySelector("#ranked-map-update-status")
  };

  let autoUpdateTimer = null;
  let visibilityListenerRegistered = false;
  let lastAnnouncedMapKey = "";

  function positiveModulo(value, divisor) {
    return ((value % divisor) + divisor) % divisor;
  }

  function getCurrentJstDate() {
    // Date stores an absolute instant; formatting below always uses Asia/Tokyo.
    return new Date();
  }

  function getRankedMapRotationState(now = getCurrentJstDate()) {
    const nowDate = now instanceof Date ? now : new Date(now);
    const nowMs = nowDate.getTime();

    if (!Number.isFinite(nowMs)) {
      throw new RangeError("有効な日時を指定してください。");
    }

    const elapsedMs = nowMs - RANKED_ROTATION_ANCHOR_MS;
    const slotOffset = Math.floor(elapsedMs / MAP_DURATION_MS);
    const currentMapIndex = positiveModulo(
      rankedRotationAnchor.mapIndex + slotOffset,
      rankedMapRotation.length
    );
    const currentStartMs =
      RANKED_ROTATION_ANCHOR_MS + slotOffset * MAP_DURATION_MS;
    const currentEndMs = currentStartMs + MAP_DURATION_MS;

    const scheduleEntries = Array.from(
      { length: RANKED_ROTATION_VISIBLE_COUNT },
      (_, entryIndex) => {
        const mapIndex = positiveModulo(
          currentMapIndex + entryIndex,
          rankedMapRotation.length
        );
        const startMs = currentStartMs + entryIndex * MAP_DURATION_MS;

        return {
          map: rankedMapRotation[mapIndex],
          start: new Date(startMs),
          end: new Date(startMs + MAP_DURATION_MS),
          isCurrent: entryIndex === 0
        };
      }
    );

    return {
      now: nowDate,
      currentMap: rankedMapRotation[currentMapIndex],
      currentStart: new Date(currentStartMs),
      currentEnd: new Date(currentEndMs),
      nextMap:
        rankedMapRotation[
          positiveModulo(currentMapIndex + 1, rankedMapRotation.length)
        ],
      nextStart: new Date(currentEndMs),
      nextEnd: new Date(currentEndMs + MAP_DURATION_MS),
      scheduleEntries
    };
  }

  function formatJstTime(date) {
    return jstTimeFormatter.format(date);
  }

  function formatTimeRange(startDate, endDate) {
    return `${formatJstTime(startDate)} ～ ${formatJstTime(endDate)}`;
  }

  function formatJstDateTime(date) {
    const parts = jstScheduleFormatter.formatToParts(date);
    const valueFor = (type) =>
      parts.find((part) => part.type === type)?.value ?? "";

    return (
      `${valueFor("month")}/${valueFor("day")} ` +
      `${valueFor("hour")}:${valueFor("minute")}`
    );
  }

  function formatDateTimeRange(startDate, endDate) {
    return (
      `${formatJstDateTime(startDate)} ～ ` +
      `${formatJstDateTime(endDate)}`
    );
  }

  function formatRemainingTime(endDate, nowDate) {
    const remainingMinutes = Math.max(
      0,
      Math.ceil((endDate.getTime() - nowDate.getTime()) / (60 * 1000))
    );
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    if (hours > 0) {
      return `残り${hours}時間${String(minutes).padStart(2, "0")}分`;
    }
    return `残り${minutes}分`;
  }

  function getSeasonCountdownState(now = getCurrentJstDate()) {
    const nowDate = now instanceof Date ? now : new Date(now);
    const nowMs = nowDate.getTime();

    if (!Number.isFinite(nowMs)) {
      throw new RangeError("有効な日時を指定してください。");
    }

    const remainingMs = S29_SP2_END_TIME_MS - nowMs;

    if (remainingMs <= 0) {
      return {
        hasEnded: true,
        remainingText: "S29 SP2は終了しました。"
      };
    }

    const totalMinutes = Math.max(
      0,
      Math.ceil(remainingMs / (60 * 1000))
    );
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    const parts = [];

    if (days > 0) {
      parts.push(`${days}日`);
    }
    if (hours > 0) {
      parts.push(`${hours}時間`);
    }
    if (minutes > 0 || parts.length === 0) {
      parts.push(`${minutes}分`);
    }

    return {
      hasEnded: false,
      remainingText: parts.join(" ")
    };
  }

  function updateMapImage(imageElement, map) {
    if (imageElement.getAttribute("src") !== map.image) {
      imageElement.src = map.image;
    }
    imageElement.alt = map.name;
  }

  function createScheduleEntry(entry, entryIndex) {
    const item = document.createElement("li");
    const image = document.createElement("img");
    const body = document.createElement("div");
    const position = document.createElement("p");
    const mapName = document.createElement("p");
    const timeRange = document.createElement("p");

    item.className = "ranked-map-schedule-item";
    if (entry.isCurrent) {
      item.classList.add("ranked-map-schedule-item--current");
    }

    image.className = "ranked-map-schedule-image";
    image.src = entry.map.image;
    image.alt = entry.map.name;
    image.loading = "lazy";
    image.decoding = "async";

    body.className = "ranked-map-schedule-body";
    position.className = "ranked-map-schedule-position";
    position.textContent =
      SCHEDULE_POSITION_LABELS[entryIndex] ?? `${entryIndex}つ先`;
    mapName.className = "ranked-map-schedule-name";
    mapName.textContent = entry.map.name;
    timeRange.className = "ranked-map-schedule-time";
    timeRange.textContent = formatDateTimeRange(entry.start, entry.end);

    body.append(position, mapName, timeRange);
    item.append(image, body);
    return item;
  }

  function renderSeasonCountdown(now = getCurrentJstDate()) {
    if (
      !elements.seasonCountdownTitle ||
      !elements.seasonCountdownValue ||
      !elements.seasonCountdownEnd
    ) {
      return null;
    }

    const countdownState = getSeasonCountdownState(now);

    elements.seasonCountdownTitle.textContent = countdownState.hasEnded
      ? "S29 SP2"
      : "S29 SP2終了まで";
    elements.seasonCountdownValue.textContent =
      countdownState.remainingText;
    elements.seasonCountdownEnd.textContent =
      "終了日時：2026年8月5日 02:00";

    return countdownState;
  }

  function renderRankedMapBlock(now = getCurrentJstDate()) {
    if (!elements.schedule) {
      return null;
    }

    const state = getRankedMapRotationState(now);

    updateMapImage(elements.currentImage, state.currentMap);
    elements.currentName.textContent = state.currentMap.name;
    elements.currentTime.textContent = formatTimeRange(
      state.currentStart,
      state.currentEnd
    );
    elements.currentRemaining.textContent = formatRemainingTime(
      state.currentEnd,
      state.now
    );

    updateMapImage(elements.nextImage, state.nextMap);
    elements.nextName.textContent = state.nextMap.name;
    elements.nextTime.textContent = formatTimeRange(
      state.nextStart,
      state.nextEnd
    );

    elements.schedule.replaceChildren(
      ...state.scheduleEntries.map(createScheduleEntry)
    );
    const seasonCountdown = renderSeasonCountdown(state.now);

    if (lastAnnouncedMapKey !== state.currentMap.key) {
      elements.updateStatus.textContent =
        `現在のランクマップは${state.currentMap.name}です。` +
        `次は${state.nextMap.name}です。`;
      lastAnnouncedMapKey = state.currentMap.key;
    }

    return {
      ...state,
      seasonCountdown
    };
  }

  function handleVisibilityChange() {
    if (!document.hidden) {
      renderRankedMapBlock();
    }
  }

  function startRankedMapAutoUpdate() {
    if (!elements.schedule || autoUpdateTimer !== null) {
      return;
    }

    renderRankedMapBlock();
    autoUpdateTimer = window.setInterval(
      renderRankedMapBlock,
      AUTO_UPDATE_INTERVAL_MS
    );

    if (!visibilityListenerRegistered) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      visibilityListenerRegistered = true;
    }
  }

  window.rankedMapRotationApp = Object.freeze({
    formatDateTimeRange,
    formatJstDateTime,
    formatRemainingTime,
    formatTimeRange,
    getCurrentJstDate,
    getRankedMapRotationState,
    getSeasonCountdownState,
    positiveModulo,
    rankedMapDurationMs: MAP_DURATION_MS,
    rankedMapRotation,
    rankedRotationAnchorMs: RANKED_ROTATION_ANCHOR_MS,
    rankedRotationAnchor,
    rankedRotationVisibleCount: RANKED_ROTATION_VISIBLE_COUNT,
    renderRankedMapBlock,
    renderSeasonCountdown,
    s29Sp2EndTimeMs: S29_SP2_END_TIME_MS,
    startRankedMapAutoUpdate
  });

  startRankedMapAutoUpdate();
})();
