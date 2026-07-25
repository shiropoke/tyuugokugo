"use strict";

const speechController = (() => {
  const isSupported =
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance === "function";
  const unavailableMessage = "このブラウザでは音声再生を利用できません";
  let chineseVoice = null;
  let activeButton = null;
  let activeUtterance = null;

  function getSpeakableText(text) {
    return String(text).replace(/[~～〜]/gu, "").trim();
  }

  function updateChineseVoice() {
    if (!isSupported) {
      return;
    }

    try {
      const voices = window.speechSynthesis.getVoices();
      chineseVoice =
        voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ||
        voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ||
        null;
    } catch (error) {
      chineseVoice = null;
    }
  }

  function restoreButton(button) {
    if (!button) {
      return;
    }

    button.textContent = button.dataset.defaultLabel || "🔊 発音を聞く";
    button.removeAttribute("aria-busy");
  }

  function resetActiveSpeech(utterance = activeUtterance) {
    if (utterance !== activeUtterance) {
      return;
    }

    restoreButton(activeButton);
    activeButton = null;
    activeUtterance = null;
  }

  function cancel() {
    if (isSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        // 音声停止に失敗しても、画面操作は継続します。
      }
    }

    resetActiveSpeech();
  }

  function speak(text, button) {
    if (!isSupported) {
      return false;
    }

    try {
      cancel();

      const utterance = new window.SpeechSynthesisUtterance(getSpeakableText(text));
      utterance.lang = "zh-CN";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }

      activeButton = button;
      activeUtterance = utterance;
      button.textContent = "🔊 再生中…";
      button.setAttribute("aria-busy", "true");

      utterance.addEventListener("end", () => resetActiveSpeech(utterance));
      utterance.addEventListener("error", () => resetActiveSpeech(utterance));
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      resetActiveSpeech();
      return false;
    }
  }

  function prepareButton(button, word, label = "🔊 発音を聞く") {
    button.dataset.defaultLabel = label;
    button.textContent = label;
    button.setAttribute("aria-label", `${word}の発音を聞く`);
    button.disabled = !isSupported;
    if (!isSupported) {
      button.title = unavailableMessage;
    }

    button.addEventListener("click", () => speak(word, button));
  }

  if (isSupported) {
    updateChineseVoice();
    if (typeof window.speechSynthesis.addEventListener === "function") {
      window.speechSynthesis.addEventListener("voiceschanged", updateChineseVoice);
    } else {
      window.speechSynthesis.onvoiceschanged = updateChineseVoice;
    }
  }

  return {
    cancel,
    getSpeakableText,
    isSupported,
    prepareButton,
    speak,
    unavailableMessage,
    updateChineseVoice
  };
})();
