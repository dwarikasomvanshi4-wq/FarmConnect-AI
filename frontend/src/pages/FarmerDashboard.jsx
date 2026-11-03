
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Bell,
  Sun,
  Sprout,
  ShoppingBag,
  IndianRupee,
  CloudSun,
  Mic,
  MicOff,
  Volume2,
} from "lucide-react";
import { useLanguage } from "../i18n/LanguageContext";

function FarmerDashboard() {
  const navigate = useNavigate();
  const { language: appLanguage } = useLanguage();
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);
  const lastSpeechRef = useRef({ text: "", lang: "en-US" });

  const languageMap = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
  const [language, setLanguage] = useState(languageMap[appLanguage] || "en-IN");
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState("Click the microphone and speak a command.");
  const [assistantResponse, setAssistantResponse] = useState(
    "Hello! I am your FarmConnect assistant. How can I help you today?"
  );

  const translations = {
    "en-IN": {
      welcome: "Welcome Back 👋",
      subtitle: "Smart Farming Dashboard",
      assistant: "FarmConnect Voice Assistant",
      assistantDesc: "Control your farming dashboard using your voice.",
      recognized: "Recognized Command",
      response: "Assistant Response",
      repeat: "Repeat Response",
      trySaying: "Try saying:",
      myCrops: "My Crops",
      orders: "Orders",
      earnings: "Earnings",
      weather: "Weather",
      sales: "📈 Sales Overview",
      chart: "Sales Chart Coming Soon",
      activity: "🌱 Recent Activity",
      tomato: "Tomato Added",
      quantity: "Quantity: 50 Kg",
      today: "Today",
      orderReceived: "Order Received",
      potato: "20 Kg Potato",
      yesterday: "Yesterday",
      payment: "Payment Received",
      twoDays: "2 Days Ago",
      listening: "Listening... Speak now.",
      selected: "English selected. Click the microphone and speak.",
      stop: "Stop listening",
      start: "Start voice command",
      kannadaNote: "Kannada commands are supported. Spoken replies use English audio if a Kannada voice is unavailable.",
    },
    "hi-IN": {
      welcome: "वापसी पर स्वागत है 👋",
      subtitle: "स्मार्ट खेती डैशबोर्ड",
      assistant: "FarmConnect वॉइस असिस्टेंट",
      assistantDesc: "अपनी आवाज़ से खेती के डैशबोर्ड को नियंत्रित करें।",
      recognized: "पहचाना गया निर्देश",
      response: "सहायक का जवाब",
      repeat: "जवाब दोबारा सुनें",
      trySaying: "ऐसा बोलकर देखें:",
      myCrops: "मेरी फसलें",
      orders: "ऑर्डर",
      earnings: "कमाई",
      weather: "मौसम",
      sales: "📈 बिक्री का विवरण",
      chart: "बिक्री चार्ट जल्द उपलब्ध होगा",
      activity: "🌱 हाल की गतिविधियाँ",
      tomato: "टमाटर जोड़े गए",
      quantity: "मात्रा: 50 किलो",
      today: "आज",
      orderReceived: "ऑर्डर प्राप्त हुआ",
      potato: "20 किलो आलू",
      yesterday: "कल",
      payment: "भुगतान प्राप्त हुआ",
      twoDays: "2 दिन पहले",
      listening: "सुन रहा हूँ... अब बोलिए।",
      selected: "हिंदी चुनी गई है। माइक्रोफ़ोन दबाकर बोलिए।",
      stop: "सुनना बंद करें",
      start: "वॉइस निर्देश शुरू करें",
      kannadaNote: "कन्नड़ निर्देश उपलब्ध हैं। कन्नड़ आवाज़ उपलब्ध नहीं होने पर जवाब अंग्रेज़ी में सुनाई देंगे।",
    },
    "kn-IN": {
      welcome: "ಮತ್ತೆ ಸ್ವಾಗತ 👋",
      subtitle: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
      assistant: "FarmConnect ಧ್ವನಿ ಸಹಾಯಕ",
      assistantDesc: "ನಿಮ್ಮ ಧ್ವನಿಯ ಮೂಲಕ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನಿಯಂತ್ರಿಸಿ.",
      recognized: "ಗುರುತಿಸಿದ ಆಜ್ಞೆ",
      response: "ಸಹಾಯಕನ ಪ್ರತಿಕ್ರಿಯೆ",
      repeat: "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ",
      trySaying: "ಹೀಗೆ ಹೇಳಿ:",
      myCrops: "ನನ್ನ ಬೆಳೆಗಳು",
      orders: "ಆರ್ಡರ್‌ಗಳು",
      earnings: "ಆದಾಯ",
      weather: "ಹವಾಮಾನ",
      sales: "📈 ಮಾರಾಟದ ವಿವರ",
      chart: "ಮಾರಾಟದ ಚಾರ್ಟ್ ಶೀಘ್ರದಲ್ಲೇ ಬರಲಿದೆ",
      activity: "🌱 ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು",
      tomato: "ಟೊಮೆಟೊ ಸೇರಿಸಲಾಗಿದೆ",
      quantity: "ಪ್ರಮಾಣ: 50 ಕೆಜಿ",
      today: "ಇಂದು",
      orderReceived: "ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
      potato: "20 ಕೆಜಿ ಆಲೂಗಡ್ಡೆ",
      yesterday: "ನಿನ್ನೆ",
      payment: "ಪಾವತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
      twoDays: "2 ದಿನಗಳ ಹಿಂದೆ",
      listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ.",
      selected: "ಕನ್ನಡ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.",
      stop: "ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
      start: "ಧ್ವನಿ ಆಜ್ಞೆ ಪ್ರಾರಂಭಿಸಿ",
      kannadaNote: "ಕನ್ನಡ ಆಜ್ಞೆಗಳನ್ನು ಬಳಸಬಹುದು. ಕನ್ನಡ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲದಿದ್ದರೆ ಉತ್ತರಗಳು ಇಂಗ್ಲಿಷ್ ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿಸುತ್ತವೆ.",
    },
  };

  const ui = translations[language] || translations["en-IN"];

  const responses = {
    "en-IN": {
      greeting: "Hello! I am your FarmConnect assistant. How can I help you today?",
      addCrop: "I am opening the Add Crop page for you.",
      myCrops: "I am opening your crops page.",
      weather: "I am opening the weather page for you.",
      orders: "I am opening your orders page.",
      dashboard: "I am taking you back to your farmer dashboard.",
      help: "You can say Add Crop, Show My Crops, Check Weather, Show My Orders, or Open Dashboard.",
      unknown: "Sorry, I did not understand that command. Please try again.",
      micError: "Voice recognition is not supported in this browser. Please use Google Chrome.",
      micDenied: "Microphone permission was denied. Please allow microphone access.",
      noSpeech: "I could not hear anything. Please try again.",
      network: "There is a network problem. Please check your internet connection.",
    },
    "hi-IN": {
      greeting: "नमस्ते! मैं आपका फार्म कनेक्ट सहायक हूँ। बताइए, मैं आपकी क्या मदद कर सकता हूँ?",
      addCrop: "मैं आपके लिए फसल जोड़ने वाला पेज खोल रहा हूँ।",
      myCrops: "मैं आपकी फसलों का पेज खोल रहा हूँ।",
      weather: "मैं आपके लिए मौसम का पेज खोल रहा हूँ।",
      orders: "मैं आपके ऑर्डर का पेज खोल रहा हूँ।",
      dashboard: "मैं आपको किसान डैशबोर्ड पर वापस ले जा रहा हूँ।",
      help: "आप फसल जोड़ें, मेरी फसलें दिखाएँ, मौसम दिखाएँ, मेरे ऑर्डर दिखाएँ या डैशबोर्ड खोलें कह सकते हैं।",
      unknown: "माफ़ कीजिए, मैं आपका निर्देश नहीं समझ पाया। कृपया फिर से कोशिश करें।",
      micError: "कृपया आवाज़ पहचानने के लिए गूगल क्रोम का उपयोग करें।",
      micDenied: "माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया माइक्रोफ़ोन की अनुमति दें।",
      noSpeech: "आपकी आवाज़ सुनाई नहीं दी। कृपया फिर से कोशिश करें।",
      network: "नेटवर्क में समस्या है। कृपया इंटरनेट कनेक्शन जाँचें।",
    },
    "kn-IN": {
      greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಫಾರ್ಮ್ ಕನೆಕ್ಟ್ ಸಹಾಯಕ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
      addCrop: "ನಿಮಗಾಗಿ ಬೆಳೆ ಸೇರಿಸುವ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      myCrops: "ನಿಮ್ಮ ಬೆಳೆಗಳ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      weather: "ನಿಮಗಾಗಿ ಹವಾಮಾನ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      orders: "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      dashboard: "ನಿಮ್ಮ ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗುತ್ತಿದ್ದೇನೆ.",
      help: "ಬೆಳೆ ಸೇರಿಸು, ನನ್ನ ಬೆಳೆಗಳನ್ನು ತೋರಿಸು, ಹವಾಮಾನ ತೋರಿಸು, ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸು ಅಥವಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ ಎಂದು ಹೇಳಬಹುದು.",
      unknown: "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಆಜ್ಞೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
      micError: "ದಯವಿಟ್ಟು ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಗಾಗಿ ಗೂಗಲ್ ಕ್ರೋಮ್ ಬಳಸಿ.",
      micDenied: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
      noSpeech: "ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      network: "ನೆಟ್‌ವರ್ಕ್ ಸಮಸ್ಯೆ ಇದೆ. ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.",
    },
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        recognitionRef.current?.abort();
      } catch (error) {
        console.log("Recognition cleanup:", error);
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const nextLanguage = languageMap[appLanguage] || "en-IN";
    if (nextLanguage !== language) {
      setLanguage(nextLanguage);
      setAssistantResponse(responses[nextLanguage].greeting);
      setVoiceText(translations[nextLanguage].selected);
    }
  }, [appLanguage]);

  const getSpokenText = (message, englishFallback) => {
    if (language === "kn-IN") {
      return {
        text: englishFallback || "Your command has been processed.",
        lang: "en-US",
      };
    }
    return {
      text: message,
      lang: language === "hi-IN" ? "hi-IN" : "en-US",
    };
  };

  const speak = (message, onFinished, englishFallback) => {
    if (!mountedRef.current) return;
    setAssistantResponse(message);

    if (!("speechSynthesis" in window)) {
      setVoiceText("Speech output is not supported by this browser.");
      return;
    }

    const spoken = getSpokenText(message, englishFallback);
    lastSpeechRef.current = spoken;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spoken.text);
    utterance.lang = spoken.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (mountedRef.current && onFinished) onFinished();
    };

    utterance.onstart = () => {
      if (mountedRef.current) setVoiceText("Assistant is speaking...");
    };
    utterance.onend = () => {
      if (mountedRef.current) setVoiceText("Response completed.");
      finish();
    };
    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      if (mountedRef.current) {
        setVoiceText("Could not play the spoken response. Press Repeat Response to try again.");
      }
    };

    const voice = window.speechSynthesis.getVoices().find(
      (item) => item.lang.toLowerCase() === spoken.lang.toLowerCase()
    );
    if (voice) utterance.voice = voice;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech error:", error);
      setVoiceText("Speech could not start. Press Repeat Response to retry.");
    }
  };

  const normalizeText = (value) =>
    value.toLowerCase().normalize("NFC").replace(/[.,!?;:।]/g, " ").replace(/\s+/g, " ").trim();

  const handleVoiceCommand = (command) => {
    const text = normalizeText(command);
    const reply = responses[language];
    setVoiceText(`You said: "${command}"`);

    const commands = [
      {
        words: [
          "add crop", "add a crop", "add new crop", "new crop", "create crop",
          "register crop", "post crop", "sell crop", "फसल जोड़ो", "फसल जोड़ें",
          "नई फसल", "ಹೊಸ ಬೆಳೆ", "ಬೆಳೆ ಸೇರಿಸು", "ಬೆಳೆ ಸೇರಿಸಿ",
        ],
        response: reply.addCrop,
        fallback: "I am opening the Add Crop page for you.",
        path: "/add-crop",
        label: "Add Crop",
      },
      {
        words: [
          "show my crops", "my crops", "my crop", "show crops", "view my crops",
          "see my crops", "list my crops", "crop list", "मेरी फसल", "फसल दिखाओ",
          "ನನ್ನ ಬೆಳೆ", "ನನ್ನ ಬೆಳೆಗಳನ್ನು ತೋರಿಸು", "ಬೆಳೆ ತೋರಿಸು",
        ],
        response: reply.myCrops,
        fallback: "I am opening your crops page.",
        path: "/my-crops",
        label: "My Crops",
      },
      {
        words: [
          "weather", "show weather", "check weather", "weather today", "today weather",
          "what is the weather", "temperature", "forecast", "rain", "मौसम",
          "आज का मौसम", "मौसम दिखाओ", "ಹವಾಮಾನ", "ಇಂದಿನ ಹವಾಮಾನ", "ಮಳೆ",
        ],
        response: reply.weather,
        fallback: "I am opening the weather page for you.",
        path: "/weather",
        label: "Weather",
      },
      {
        words: [
          "show my orders", "my orders", "show orders", "view orders", "view my orders",
          "check orders", "pending orders", "orders", "order", "मेरे ऑर्डर",
          "ऑर्डर दिखाओ", "ನನ್ನ ಆರ್ಡರ್", "ನನ್ನ ಆರ್ಡರ್‌ಗಳು", "ಆರ್ಡರ್ ತೋರಿಸು",
        ],
        response: reply.orders,
        fallback: "I am opening your orders page.",
        path: "/orders",
        label: "My Orders",
      },
      {
        words: [
          "open dashboard", "go to dashboard", "main dashboard", "dashboard",
          "go home", "home", "main page", "डैशबोर्ड", "होम", "ಮುಖ್ಯ ಪುಟ",
          "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "ಹೋಮ್",
        ],
        response: reply.dashboard,
        fallback: "I am taking you back to your farmer dashboard.",
        path: "/farmer-dashboard",
        label: "Dashboard",
      },
      {
        words: ["help", "commands", "what can you do", "what can i say", "मदद", "सहायता", "ಸಹಾಯ"],
        response: reply.help,
        fallback: "You can say Add Crop, Show My Crops, Check Weather, Show My Orders, or Open Dashboard.",
        path: null,
        label: "Help",
      },
    ];

    const matchedCommand = commands.find((item) =>
      item.words.some((word) => text.includes(normalizeText(word)))
    );

    if (matchedCommand) {
      setVoiceText(`You said: "${command}" — ${matchedCommand.label}`);
      speak(matchedCommand.response, () => {
        if (mountedRef.current && matchedCommand.path) navigate(matchedCommand.path);
      }, matchedCommand.fallback);
      return;
    }

    setVoiceText(`You said: "${command}" — Command not recognized`);
    speak(reply.unknown, null, "Sorry, I did not understand that command. Please try again.");
  };

  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak(responses[language].micError, null, "Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }

    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText(translations[language].listening);
    };

    recognition.onresult = (event) => {
      handleVoiceCommand(event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const reply = responses[language];
      if (event.error === "not-allowed") {
        speak(reply.micDenied, null, "Microphone permission was denied. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        speak(reply.noSpeech, null, "I could not hear anything. Please try again.");
      } else if (event.error === "network") {
        speak(reply.network, null, "There is a network problem. Please check your internet connection.");
      } else if (event.error !== "aborted") {
        speak(reply.unknown, null, "Sorry, something went wrong. Please try again.");
      }
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error("Recognition start error:", error);
      setIsListening(false);
      setVoiceText("Could not start voice recognition.");
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setAssistantResponse(responses[newLanguage].greeting);
    setVoiceText(translations[newLanguage].selected);
  };

  const repeatResponse = () => {
    const lastSpeech = lastSpeechRef.current;
    if (!lastSpeech.text) {
      speak(assistantResponse, null, "Hello! I am your FarmConnect assistant. How can I help you today?");
      return;
    }
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastSpeech.text);
    utterance.lang = lastSpeech.lang;
    utterance.rate = 0.9;
    utterance.volume = 1;

    const voice = window.speechSynthesis.getVoices().find(
      (item) => item.lang.toLowerCase() === lastSpeech.lang.toLowerCase()
    );
    if (voice) utterance.voice = voice;

    utterance.onerror = (event) => {
      console.error("Repeat speech error:", event.error);
      setVoiceText("Could not play the response. Please try again.");
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="ml-72">
        <div className="bg-white shadow-md px-10 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{ui.welcome}</h1>
            <p className="text-gray-500 mt-1">{ui.subtitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-yellow-500">
              <Sun />
              <span>28°C</span>
            </div>
            <Bell className="text-gray-600 cursor-pointer" />
            <img
              src="https://ui-avatars.com/api/?name=Farmer"
              alt="profile"
              className="w-12 h-12 rounded-full"
            />
          </div>
        </div>

        <div className="p-10">
          <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-3xl shadow-xl p-8 mb-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Volume2 size={32} />
                  <h2 className="text-2xl font-bold">{ui.assistant}</h2>
                </div>

                <p className="mt-2 text-green-100">{ui.assistantDesc}</p>

                <div className="mt-5 bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-green-100">{ui.recognized}</p>
                  <p className="font-semibold mt-1 break-words">{voiceText}</p>
                </div>

                <div className="mt-4 bg-white/10 rounded-xl p-4">
                  <p className="text-sm text-green-100">{ui.response}</p>
                  <p className="font-semibold mt-1 break-words">{assistantResponse}</p>
                </div>

                <button
                  onClick={repeatResponse}
                  className="mt-4 flex items-center gap-2 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition"
                >
                  <Volume2 size={18} />
                  {ui.repeat}
                </button>

                {language === "kn-IN" && (
                  <p className="text-sm text-green-100 mt-3">{ui.kannadaNote}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <select
                  value={language}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-white text-gray-800 px-4 py-3 rounded-xl font-semibold outline-none"
                >
                  <option value="en-IN">English</option>
                  <option value="hi-IN">हिंदी</option>
                  <option value="kn-IN">ಕನ್ನಡ</option>
                </select>

                <button
                  onClick={startListening}
                  className={`w-20 h-20 rounded-full bg-white text-green-700 flex items-center justify-center shadow-lg transition ${
                    isListening ? "scale-110 ring-4 ring-white/40" : "hover:scale-105"
                  }`}
                  title={isListening ? ui.stop : ui.start}
                >
                  {isListening ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-semibold mb-3">{ui.trySaying}</p>
              <div className="flex flex-wrap gap-3">
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">🎤 {ui.myCrops}</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">🎤 {ui.weather}</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">🎤 {ui.orders}</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">🎤 {ui.assistant === "FarmConnect Voice Assistant" ? "Add Crop" : ui.assistant === "FarmConnect वॉइस असिस्टेंट" ? "फसल जोड़ें" : "ಬೆಳೆ ಸೇರಿಸಿ"}</span>
                <span className="bg-white/10 px-4 py-2 rounded-full text-sm">🎤 Help / सहायता / ಸಹಾಯ</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div
              onClick={() => navigate("/my-crops")}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer"
            >
              <Sprout className="text-green-600" size={40} />
              <h2 className="text-4xl font-bold mt-4">12</h2>
              <p className="text-gray-500 mt-2">{ui.myCrops}</p>
            </div>

            <div
              onClick={() => navigate("/orders")}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition cursor-pointer"
            >
              <ShoppingBag className="text-blue-600" size={40} />
              <h2 className="text-4xl font-bold mt-4">5</h2>
              <p className="text-gray-500 mt-2">{ui.orders}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <IndianRupee className="text-green-700" size={40} />
              <h2 className="text-4xl font-bold mt-4">₹12,500</h2>
              <p className="text-gray-500 mt-2">{ui.earnings}</p>
            </div>

            <div
              onClick={() => navigate("/weather")}
              className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl cursor-pointer transition"
            >
              <CloudSun className="text-orange-500" size={40} />
              <h2 className="text-4xl font-bold mt-4">28°C</h2>
              <p className="text-gray-500 mt-2">{ui.weather}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">{ui.sales}</h2>
              <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-xl text-gray-400 text-xl">
                {ui.chart}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">{ui.activity}</h2>
              <div className="space-y-5">
                <div className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-semibold">{ui.tomato}</p>
                    <p className="text-gray-500 text-sm">{ui.quantity}</p>
                  </div>
                  <span className="text-green-600 font-bold">{ui.today}</span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <div>
                    <p className="font-semibold">{ui.orderReceived}</p>
                    <p className="text-gray-500 text-sm">{ui.potato}</p>
                  </div>
                  <span className="text-blue-600 font-bold">{ui.yesterday}</span>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{ui.payment}</p>
                    <p className="text-gray-500 text-sm">₹2500</p>
                  </div>
                  <span className="text-purple-600 font-bold">{ui.twoDays}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;
