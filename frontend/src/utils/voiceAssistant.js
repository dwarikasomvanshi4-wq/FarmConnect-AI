
const VOICE_LANGUAGES = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
  "en-IN": "en-IN",
  "hi-IN": "hi-IN",
  "kn-IN": "kn-IN",
};

const VOICE_MESSAGES = {
  en: {
    ready: "Hello! How can I help you?",
    listening: "I'm listening.",
    notSupported: "Voice responses are not supported in this browser.",
    error: "Sorry, something went wrong. Please try again.",
    success: "Your action was completed successfully.",
  },
  hi: {
    ready: "नमस्ते! मैं आपकी क्या मदद कर सकती हूँ?",
    listening: "मैं सुन रही हूँ।",
    notSupported: "इस ब्राउज़र में आवाज़ की सुविधा उपलब्ध नहीं है।",
    error: "माफ़ कीजिए, कुछ गड़बड़ हुई। कृपया फिर से कोशिश करें।",
    success: "आपका काम सफलतापूर्वक पूरा हो गया है।",
  },
  kn: {
    ready: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    listening: "ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ.",
    notSupported: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಪ್ರತಿಕ್ರಿಯೆ ಲಭ್ಯವಿಲ್ಲ.",
    error: "ಕ್ಷಮಿಸಿ, ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    success: "ನಿಮ್ಮ ಕೆಲಸ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ.",
  },
};

export function getVoiceLanguage(language = "en") {
  return VOICE_LANGUAGES[language] || "en-IN";
}

export function getVoiceMessages(language = "en") {
  const shortLanguage = getVoiceLanguage(language).slice(0, 2);
  return VOICE_MESSAGES[shortLanguage] || VOICE_MESSAGES.en;
}

export function speak(text, language = "en", options = {}) {
  if (!text || typeof window === "undefined") {
    return false;
  }

  if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
    console.warn(getVoiceMessages(language).notSupported);
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = getVoiceLanguage(language);
  utterance.rate = options.rate ?? 1;
  utterance.pitch = options.pitch ?? 1;
  utterance.volume = options.volume ?? 1;

  if (options.cancelPrevious !== false) {
    window.speechSynthesis.cancel();
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (
    typeof window !== "undefined" &&
    "speechSynthesis" in window
  ) {
    window.speechSynthesis.cancel();
  }
}
