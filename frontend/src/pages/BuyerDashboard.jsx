
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Search,
  Package,
  Sun,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

function BuyerDashboard() {
  const navigate = useNavigate();
  const { language: appLanguage, setLanguage: setAppLanguage, t: uiT } =
    useLanguage();

  const recognitionRef = useRef(null);
  const processingRef = useRef(false);
  const confirmationRef = useRef(false);

  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");
  const [pendingPurchase, setPendingPurchase] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const buyerName = localStorage.getItem("name") || "Buyer";
  const buyerEmail = localStorage.getItem("email");

  const languageCodes = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const language = languageCodes[appLanguage] || "en-IN";

  const messages = {
    "en-IN": {
      listening: "Listening. Please speak now.",
      help: 'Say "Show available crops", "Find tomatoes", "Buy 5 kg tomatoes", "Confirm order", "Cancel order", "Show my orders", or "Check weather".',
      notUnderstood: "Sorry, I did not understand. Please try again or say Help.",
      noSpeech: "I could not recognize your speech. Please try again.",
      micDenied: "Please allow microphone access in your browser settings.",
      voiceUnavailable: "Voice recognition is not supported in this browser. Please use Google Chrome.",
      searching: "Searching for",
      showCrops: "Showing all available crops.",
      noCrop: "I could not find that product. Please try another crop name.",
      confirmPrompt: "Say confirm order to place your order, or cancel order to cancel it.",
      cancelled: "Your purchase has been cancelled.",
      orderSuccess: "Your order has been placed successfully.",
      orderFailed: "I could not place your order. Please check your internet connection and available stock.",
      stockChanged: "The available stock has changed. Please check the updated stock.",
      unavailable: "This product is no longer available.",
      loginAgain: "Please log in again before placing an order.",
      openingOrders: "Opening your orders.",
      openingWeather: "Opening weather information.",
      openingProfile: "Opening your profile.",
      dashboard: "You are on the buyer dashboard.",
      onlyAvailable: "Only",
      kgAvailable: "kilograms are currently available.",
      invalidQuantity: "Please provide a valid quantity in kilograms.",
      invalidPrice: "The product price is invalid. Please contact the farmer.",
      stockError: "The available stock could not be verified.",
    },
    "hi-IN": {
      listening: "मैं सुन रही हूँ। कृपया अब बोलिए।",
      help: "नमस्ते! उपलब्ध फसलें दिखाने, टमाटर खोजने, फसल खरीदने, ऑर्डर की पुष्टि करने या रद्द करने, अपने ऑर्डर देखने, मौसम की जानकारी लेने या प्रोफाइल खोलने के लिए बोलें।",
      notUnderstood: "माफ़ कीजिए, मैं समझ नहीं पाई। कृपया फिर से बोलें या मदद कहें।",
      noSpeech: "मैं आपकी आवाज़ पहचान नहीं पाई। कृपया फिर से कोशिश करें।",
      micDenied: "कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।",
      voiceUnavailable: "इस ब्राउज़र में वॉइस पहचान उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।",
      searching: "खोज रही हूँ",
      showCrops: "सभी उपलब्ध फसलें दिखा रही हूँ।",
      noCrop: "मुझे यह उत्पाद नहीं मिला। कृपया किसी दूसरी फसल का नाम बोलें।",
      confirmPrompt: "ऑर्डर देने के लिए ऑर्डर कन्फर्म बोलें, या रद्द करने के लिए ऑर्डर रद्द बोलें।",
      cancelled: "आपकी खरीद रद्द कर दी गई है।",
      orderSuccess: "आपका ऑर्डर सफलतापूर्वक दे दिया गया है।",
      orderFailed: "मैं आपका ऑर्डर नहीं दे पाई। कृपया इंटरनेट कनेक्शन और उपलब्ध स्टॉक जाँचें।",
      stockChanged: "उपलब्ध स्टॉक बदल गया है। कृपया नया स्टॉक देखें।",
      unavailable: "यह उत्पाद अब उपलब्ध नहीं है।",
      loginAgain: "ऑर्डर देने से पहले कृपया दोबारा लॉगिन करें।",
      openingOrders: "आपके ऑर्डर खोल रही हूँ।",
      openingWeather: "मौसम की जानकारी खोल रही हूँ।",
      openingProfile: "आपकी प्रोफाइल खोल रही हूँ।",
      dashboard: "आप बायर डैशबोर्ड पर हैं।",
      onlyAvailable: "केवल",
      kgAvailable: "किलोग्राम अभी उपलब्ध हैं।",
      invalidQuantity: "कृपया किलोग्राम में सही मात्रा बताएं।",
      invalidPrice: "उत्पाद की कीमत सही नहीं है। कृपया किसान से संपर्क करें।",
      stockError: "उपलब्ध स्टॉक की पुष्टि नहीं हो पाई।",
    },
    "kn-IN": {
      listening: "ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಈಗ ಮಾತನಾಡಿ.",
      help: "ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳನ್ನು ತೋರಿಸಲು, ಟೊಮೇಟೊ ಹುಡುಕಲು, ಬೆಳೆ ಖರೀದಿಸಲು, ಆರ್ಡರ್ ದೃಢೀಕರಿಸಲು ಅಥವಾ ರದ್ದುಮಾಡಲು, ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ನೋಡಲು, ಹವಾಮಾನ ಪರಿಶೀಲಿಸಲು ಅಥವಾ ಪ್ರೊಫೈಲ್ ತೆರೆಯಲು ಹೇಳಿ.",
      notUnderstood: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ ಅಥವಾ ಸಹಾಯ ಎಂದು ಹೇಳಿ.",
      noSpeech: "ನಿಮ್ಮ ಮಾತುಗಳನ್ನು ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      micDenied: "ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
      voiceUnavailable: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಬಳಸಿ.",
      searching: "ಹುಡುಕುತ್ತಿದ್ದೇನೆ",
      showCrops: "ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.",
      noCrop: "ಆ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಬೆಳೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.",
      confirmPrompt: "ಆರ್ಡರ್ ಮಾಡಲು ದೃಢೀಕರಿಸಿ ಎಂದು ಹೇಳಿ ಅಥವಾ ರದ್ದು ಮಾಡಲು ಆರ್ಡರ್ ರದ್ದು ಎಂದು ಹೇಳಿ.",
      cancelled: "ನಿಮ್ಮ ಖರೀದಿಯನ್ನು ರದ್ದುಪಡಿಸಲಾಗಿದೆ.",
      orderSuccess: "ನಿಮ್ಮ ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಮಾಡಲಾಗಿದೆ.",
      orderFailed: "ನಿಮ್ಮ ಆರ್ಡರ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಮತ್ತು ಸ್ಟಾಕ್ ಪರಿಶೀಲಿಸಿ.",
      stockChanged: "ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್ ಬದಲಾಗಿದೆ. ದಯವಿಟ್ಟು ಹೊಸ ಸ್ಟಾಕ್ ಪರಿಶೀಲಿಸಿ.",
      unavailable: "ಈ ಉತ್ಪನ್ನ ಈಗ ಲಭ್ಯವಿಲ್ಲ.",
      loginAgain: "ಆರ್ಡರ್ ಮಾಡುವ ಮೊದಲು ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
      openingOrders: "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      openingWeather: "ಹವಾಮಾನ ಮಾಹಿತಿಯನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      openingProfile: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
      dashboard: "ನೀವು ಖರೀದಿದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿದ್ದೀರಿ.",
      onlyAvailable: "ಕೇವಲ",
      kgAvailable: "ಕಿಲೋಗ್ರಾಂ ಮಾತ್ರ ಈಗ ಲಭ್ಯವಿದೆ.",
      invalidQuantity: "ದಯವಿಟ್ಟು ಸರಿಯಾದ ಕಿಲೋಗ್ರಾಂ ಪ್ರಮಾಣವನ್ನು ತಿಳಿಸಿ.",
      invalidPrice: "ಉತ್ಪನ್ನದ ಬೆಲೆ ಸರಿಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ರೈತರನ್ನು ಸಂಪರ್ಕಿಸಿ.",
      stockError: "ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್ ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    },
  };

  const voiceT = (key) =>
    (messages[language] || messages["en-IN"])[key] ||
    messages["en-IN"][key] ||
    "";

  // Speak first, then navigate after speech finishes.
  const speak = (message, onFinished) => {
    setVoiceMessage(message);

    if (!("speechSynthesis" in window)) {
      if (onFinished) onFinished();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const prefix = language.split("-")[0].toLowerCase();

    const selectedVoice =
      voices.find(
        (voice) => voice.lang.toLowerCase() === language.toLowerCase()
      ) ||
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(prefix)
      );

    if (selectedVoice) utterance.voice = selectedVoice;

    if (onFinished) {
      utterance.onend = onFinished;
    }

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setVoiceMessage(voiceT("help"));
    loadCrops();
    loadOrders();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Recognition may already be stopped.
        }
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVoiceMessage(voiceT("help"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFC")
      .replace(/[.,!?।]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const loadCrops = async () => {
    try {
      const res = await api.get("/crops");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.crops)
        ? res.data.crops
        : [];
      setCrops(data);
    } catch (error) {
      console.error("Crop error:", error);
      setCrops([]);
    }
  };

  const loadOrders = async () => {
    if (!buyerEmail) return;

    try {
      const res = await api.get(
        `/buyer-orders/${encodeURIComponent(buyerEmail)}`
      );

      setOrdersCount(
        Array.isArray(res.data)
          ? res.data.length
          : Array.isArray(res.data?.orders)
          ? res.data.orders.length
          : 0
      );
    } catch (error) {
      console.error("Orders error:", error);
    }
  };

  const scrollToCrops = () => {
    document.getElementById("buyer-crops-section")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cropAliases = {
    tomato: ["tomato", "tomatoes", "टमाटर", "ಟೊಮೇಟೊ", "ಟೊಮ್ಯಾಟೊ"],
    potato: ["potato", "potatoes", "आलू", "ಆಲೂಗಡ್ಡೆ"],
    onion: ["onion", "onions", "प्याज", "प्याज़", "ಈರುಳ್ಳಿ"],
    rice: ["rice", "धान", "चावल", "ಅಕ್ಕಿ"],
    wheat: ["wheat", "गेहूं", "गेहूँ", "ಗೋಧಿ"],
    carrot: ["carrot", "carrots", "गाजर", "ಕ್ಯಾರೆಟ್"],
    cabbage: ["cabbage", "पत्ता गोभी", "ಎಲೆಕೋಸು"],
    cauliflower: ["cauliflower", "फूलगोभी", "ಹೂಕೋಸು"],
    brinjal: ["brinjal", "eggplant", "बैंगन", "ಬದನೆಕಾಯಿ"],
    chilli: ["chilli", "chili", "green chilli", "मिर्च", "ಮೆಣಸಿನಕಾಯಿ"],
    beans: ["beans", "फली", "ಬೀನ್ಸ್"],
    cucumber: ["cucumber", "खीरा", "ಸೌತೆಕಾಯಿ"],
    spinach: ["spinach", "पालक", "ಪಾಲಕ್"],
    mango: ["mango", "mangoes", "आम", "ಮಾವು"],
    banana: ["banana", "bananas", "केला", "ಬಾಳೆಹಣ್ಣು"],
  };

  const translateCropName = (name) => {
    const normalized = normalizeText(name);

    for (const [english, aliases] of Object.entries(cropAliases)) {
      if (aliases.some((alias) => normalizeText(alias) === normalized)) {
        return english;
      }
    }

    return normalized;
  };

  const findCropByVoice = (name) => {
    const wanted = translateCropName(name);

    return (
      crops.find(
        (crop) =>
          normalizeText(crop.crop_name) === wanted ||
          normalizeText(crop.crop_name) === normalizeText(name)
      ) ||
      crops.find(
        (crop) =>
          normalizeText(crop.crop_name).includes(wanted) ||
          wanted.includes(normalizeText(crop.crop_name))
      )
    );
  };

  const beginVoicePurchase = (crop, quantity) => {
    const amount = Number(quantity);
    const available = Number(crop?.quantity);
    const price = Number(crop?.price);

    if (!crop) return speak(voiceT("noCrop"));

    if (!Number.isFinite(amount) || amount <= 0) {
      return speak(voiceT("invalidQuantity"));
    }

    if (!Number.isFinite(available) || available < 0) {
      return speak(voiceT("stockError"));
    }

    if (amount > available) {
      return speak(
        `${voiceT("onlyAvailable")} ${available} ${voiceT("kgAvailable")}`
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return speak(voiceT("invalidPrice"));
    }

    const total = amount * price;
    setPendingPurchase({ crop, quantity: amount, total });
    confirmationRef.current = true;

    const promptText =
      language === "hi-IN"
        ? `आपने ${crop.crop_name} ${amount} किलोग्राम चुना है। प्रति किलोग्राम कीमत ${price} रुपये है। कुल कीमत ${total.toFixed(2)} रुपये है। ऑर्डर देने के लिए ऑर्डर कन्फर्म बोलें या रद्द करने के लिए ऑर्डर रद्द बोलें।`
        : language === "kn-IN"
        ? `ನೀವು ${crop.crop_name} ${amount} ಕಿಲೋಗ್ರಾಂ ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ಪ್ರತಿ ಕಿಲೋಗ್ರಾಂ ಬೆಲೆ ${price} ರೂಪಾಯಿ. ಒಟ್ಟು ಬೆಲೆ ${total.toFixed(2)} ರೂಪಾಯಿ. ಆರ್ಡರ್ ಮಾಡಲು ದೃಢೀಕರಿಸಿ ಎಂದು ಹೇಳಿ ಅಥವಾ ರದ್ದು ಮಾಡಲು ಆರ್ಡರ್ ರದ್ದು ಎಂದು ಹೇಳಿ.`
        : `You selected ${amount} kilograms of ${crop.crop_name}. The price is ${price} rupees per kilogram. The total is ${total.toFixed(2)} rupees. Say confirm order to place it, or cancel order to cancel.`;

    speak(promptText);
  };

  const cancelVoicePurchase = () => {
    if (processingRef.current) return;

    setPendingPurchase(null);
    confirmationRef.current = false;
    speak(voiceT("cancelled"));
  };

  const confirmVoicePurchase = async () => {
    const purchase = pendingPurchase;

    if (!purchase || processingRef.current) return;

    if (!buyerEmail) {
      setPendingPurchase(null);
      confirmationRef.current = false;
      speak(voiceT("loginAgain"), () => navigate("/login"));
      return;
    }

    processingRef.current = true;
    setProcessingOrder(true);

    try {
      const latest = await api.get("/crops");
      const latestCrops = Array.isArray(latest.data)
        ? latest.data
        : Array.isArray(latest.data?.crops)
        ? latest.data.crops
        : [];

      const currentCrop = latestCrops.find(
        (item) => String(item.id) === String(purchase.crop.id)
      );

      if (!currentCrop) {
        setCrops(latestCrops);
        setPendingPurchase(null);
        confirmationRef.current = false;
        speak(voiceT("unavailable"));
        return;
      }

      const currentStock = Number(currentCrop.quantity);

      if (!Number.isFinite(currentStock) || purchase.quantity > currentStock) {
        setCrops(latestCrops);
        setPendingPurchase(null);
        confirmationRef.current = false;
        speak(voiceT("stockChanged"));
        return;
      }

      await api.post("/place-order", {
        buyer_email: buyerEmail,
        farmer_email: currentCrop.farmer_email,
        crop_name: currentCrop.crop_name,
        quantity: purchase.quantity,
        total_price: purchase.total,
      });

      setPendingPurchase(null);
      confirmationRef.current = false;
      speak(voiceT("orderSuccess"));

      await Promise.all([loadOrders(), loadCrops()]);
    } catch (error) {
      console.error("Voice order error:", error);
      speak(
        error.response?.data?.message ||
          error.response?.data?.error ||
          voiceT("orderFailed")
      );
    } finally {
      processingRef.current = false;
      setProcessingOrder(false);
    }
  };

  const handleVoiceCommand = (spokenText) => {
    const command = normalizeText(spokenText);
    setVoiceText(spokenText);

    if (!command) return speak(voiceT("notUnderstood"));

    if (
      /\bhelp\b|\bwhat can you do\b|\bvoice commands\b|\bcommands\b/.test(command) ||
      command.includes("मदद") ||
      command.includes("सहायता") ||
      command.includes("ಸಹಾಯ")
    ) {
      return speak(voiceT("help"));
    }

    if (confirmationRef.current) {
      if (
        /\b(confirm|confirm order|place my order|yes|yes confirm|yes place order)\b/.test(command) ||
        command.includes("ऑर्डर कन्फर्म") ||
        command.includes("ऑर्डर की पुष्टि") ||
        command.includes("ದೃಢೀಕರಿಸು") ||
        command.includes("ಹೌದು")
      ) {
        confirmVoicePurchase();
        return;
      }

      if (
        /\b(cancel|cancel order|cancel purchase|no|don't place)\b/.test(command) ||
        command.includes("ऑर्डर रद्द") ||
        command.includes("रद्द करो") ||
        command.includes("ರದ್ದು") ||
        command.includes("ಬೇಡ")
      ) {
        cancelVoicePurchase();
        return;
      }

      return speak(voiceT("confirmPrompt"));
    }

    // Matches commands even when speech recognition adds words before "buy".
    const buyMatch = command.match(
      /\b(?:buy|order|purchase|get)\s+(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilograms?)\s+(?:of\s+)?(.+)$/
    );

    if (buyMatch) {
      const quantity = Number(buyMatch[1]);
      const cropName = buyMatch[2]
        .replace(/\b(please|now|for me)\b/g, "")
        .trim();

      const crop = findCropByVoice(cropName);

      if (!crop) {
        setSearch(translateCropName(cropName));
        scrollToCrops();
        return speak(voiceT("noCrop"));
      }

      return beginVoicePurchase(crop, quantity);
    }

    // Weather is checked before crop-name matching.
    if (
      command.includes("weather") ||
      command.includes("मौसम") ||
      command.includes("ಹವಾಮಾನ")
    ) {
      speak(voiceT("openingWeather"), () => navigate("/weather"));
      return;
    }

    if (
      command.includes("my orders") ||
      command.includes("show orders") ||
      command.includes("show my order") ||
      command.includes("track my order") ||
      command.includes("order status") ||
      command.includes("मेरे ऑर्डर") ||
      command.includes("ऑर्डर दिखाओ") ||
      command.includes("ನನ್ನ ಆರ್ಡರ್")
    ) {
      speak(voiceT("openingOrders"), () => navigate("/buyer-orders"));
      return;
    }

    if (
      command.includes("my profile") ||
      command.includes("open profile") ||
      command.includes("प्रोफाइल") ||
      command.includes("ನನ್ನ ಪ್ರೊಫೈಲ್")
    ) {
      speak(voiceT("openingProfile"), () => navigate("/profile"));
      return;
    }

    if (
      command.includes("show available crops") ||
      command.includes("show crops") ||
      command.includes("show all crops") ||
      command.includes("show all products") ||
      command.includes("show available products") ||
      command.includes("open marketplace") ||
      command.includes("सभी फसलें दिखाओ") ||
      command.includes("फसल दिखाओ") ||
      command.includes("ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ತೋರಿಸು") ||
      command.includes("ಬೆಳೆಗಳನ್ನು ತೋರಿಸು")
    ) {
      setSearch("");
      scrollToCrops();
      return speak(voiceT("showCrops"));
    }

    const searchPatterns = [
      /^(?:can you\s+)?(?:search for|search|find|find me|show me|look for)\s+(.+)$/,
      /^i want\s+(.+)$/,
      /^i am looking for\s+(.+)$/,
      /^where can i find\s+(.+)$/,
      /^(?:खोजो|ढूंढो|ढूँढो|खोजिए)\s+(.+)$/,
      /^(?:ಹುಡುಕು|ಹುಡುಕಿ|ಹುಡುಕಿಕೊಡು)\s+(.+)$/,
    ];

    let searchTerm = "";

    for (const pattern of searchPatterns) {
      const match = command.match(pattern);
      if (match?.[1]) {
        searchTerm = match[1].trim();
        break;
      }
    }

    if (!searchTerm) {
      const aliases = Object.entries(cropAliases)
        .flatMap(([english, values]) =>
          values.map((alias) => ({
            alias: normalizeText(alias),
            english,
          }))
        )
        .sort((a, b) => b.alias.length - a.alias.length);

      const match = aliases.find(({ alias }) => command.includes(alias));
      if (match) searchTerm = match.english;
    }

    if (searchTerm) {
      const translated = translateCropName(searchTerm);
      setSearch(translated);
      scrollToCrops();

      const response =
        language === "hi-IN"
          ? `${translated} खोज रही हूँ।`
          : language === "kn-IN"
          ? `${translated} ಹುಡುಕುತ್ತಿದ್ದೇನೆ.`
          : `${voiceT("searching")} ${translated}.`;

      return speak(response);
    }

    if (
      command.includes("open dashboard") ||
      command.includes("go to dashboard") ||
      command === "dashboard" ||
      command === "home" ||
      command.includes("मुख्य पृष्ठ") ||
      command.includes("ಡ್ಯಾಶ್‌ಬೋರ್ಡ್")
    ) {
      scrollToTop();
      return speak(voiceT("dashboard"));
    }

    speak(voiceT("notUnderstood"));
  };

  const startVoiceAssistant = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak(voiceT("voiceUnavailable"));
      return;
    }

    if (listening || processingOrder) return;

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage(voiceT("listening"));
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[event.resultIndex]?.[0]?.transcript?.trim() || "";

      if (spokenText) handleVoiceCommand(spokenText);
      else speak(voiceT("noSpeech"));
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setListening(false);

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        speak(voiceT("micDenied"));
      } else if (event.error === "no-speech") {
        speak(voiceT("noSpeech"));
      } else {
        speak(voiceT("notUnderstood"));
      }
    };

    recognition.onend = () => setListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error("Unable to start recognition:", error);
      setListening(false);
      speak(voiceT("notUnderstood"));
    }
  };

  const logout = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    localStorage.clear();
    navigate("/login");
  };

  const buyCrop = async (crop) => {
    if (!buyerEmail) {
      speak(voiceT("loginAgain"), () => navigate("/login"));
      return;
    }

    const quantity = window.prompt(`Enter quantity of ${crop.crop_name} (Kg)`);
    if (quantity === null || quantity.trim() === "") return;

    const amount = Number(quantity);
    const available = Number(crop.quantity);
    const price = Number(crop.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      speak(voiceT("invalidQuantity"));
      return;
    }

    if (!Number.isFinite(available) || amount > available) {
      speak(`${voiceT("onlyAvailable")} ${crop.quantity} ${voiceT("kgAvailable")}`);
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      speak(voiceT("invalidPrice"));
      return;
    }

    const total = amount * price;
    const confirmed = window.confirm(
      `Product: ${crop.crop_name}\nQuantity: ${amount} Kg\nPrice: ₹${price}/Kg\nTotal: ₹${total.toFixed(2)}\n\nPlace order?`
    );

    if (!confirmed) {
      speak(voiceT("cancelled"));
      return;
    }

    try {
      await api.post("/place-order", {
        buyer_email: buyerEmail,
        farmer_email: crop.farmer_email,
        crop_name: crop.crop_name,
        quantity: amount,
        total_price: total,
      });

      speak(voiceT("orderSuccess"));
      await Promise.all([loadOrders(), loadCrops()]);
    } catch (error) {
      console.error("Order error:", error);
      speak(
        error.response?.data?.message ||
          error.response?.data?.error ||
          voiceT("orderFailed")
      );
    }
  };

  const filtered = crops.filter((crop) =>
    normalizeText(crop.crop_name).includes(normalizeText(search))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col lg:flex-row justify-between items-center gap-5">
          <div>
            <h1 className="text-3xl font-bold">🌾 FarmConnect AI</h1>
            <p className="text-green-100 mt-1">
              {uiT("welcomeBack") || "Welcome Back"},{" "}
              <span className="font-bold">{buyerName}</span> 👋
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => navigate("/buyer-orders")}
              className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <ShoppingCart size={19} />
              {uiT("myOrders") || "My Orders"}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <User size={19} />
              {uiT("profile") || "Profile"}
            </button>

            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
            >
              <LogOut size={19} />
              {uiT("logout") || "Logout"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8">
        <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-3xl text-white p-8 lg:p-10 shadow-xl">
          <p className="text-green-100 font-semibold mb-2">
            {uiT("directFarmMarket") || "DIRECT FARM MARKET"}
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold">
            {uiT("buyFreshCrops") || "Buy Fresh Crops Directly From Farmers"} 🌾
          </h2>
          <p className="mt-4 text-green-100 text-lg max-w-2xl">
            {uiT("discoverCrops") ||
              "Discover fresh agricultural products, connect directly with farmers and place your order easily."}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Sparkles className="text-green-700" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {uiT("voiceAssistant") || "Buyer Voice Assistant"}
              </h2>
              <p className="text-gray-500 text-sm">
                {uiT("voiceDescription") || "Talk in English, Hindi, or Kannada."}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {uiT("chooseLanguage") || "Choose your language"}
              </label>
              <select
                value={appLanguage}
                onChange={(event) => setAppLanguage(event.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                disabled={listening || processingOrder}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>

            <button
              onClick={startVoiceAssistant}
              disabled={listening || processingOrder}
              className={`px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                listening
                  ? "bg-red-100 text-red-700"
                  : "bg-green-600 hover:bg-green-700 text-white"
              } disabled:opacity-50`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
              {listening
                ? uiT("listening") || "Listening..."
                : uiT("speakCommand") || "Speak Command"}
            </button>
          </div>

          <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">
            <div className="flex gap-2 items-start">
              <Volume2 size={20} className="text-green-700 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {uiT("assistant") || "Assistant"}
                </p>
                <p className="text-gray-700 mt-1">{voiceMessage}</p>
                {voiceText && (
                  <p className="text-sm text-gray-500 mt-2">
                    {uiT("recognized") || "Recognized"}: {voiceText}
                  </p>
                )}
              </div>
            </div>
          </div>

          {pendingPurchase && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <h3 className="font-bold text-green-900">
                {uiT("confirmPurchase") || "Confirm your purchase"}
              </h3>
              <p className="mt-2 text-gray-700">
                {uiT("product") || "Product"}: {pendingPurchase.crop.crop_name}
              </p>
              <p className="text-gray-700">
                {uiT("quantity") || "Quantity"}: {pendingPurchase.quantity} Kg
              </p>
              <p className="text-gray-700">
                {uiT("pricePerKg") || "Price per Kg"}: ₹
                {pendingPurchase.crop.price}
              </p>
              <p className="font-bold text-green-800 mt-1">
                {uiT("total") || "Total"}: ₹
                {pendingPurchase.total.toFixed(2)}
              </p>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  onClick={confirmVoicePurchase}
                  disabled={processingOrder}
                  className="rounded-xl bg-green-700 hover:bg-green-800 text-white px-4 py-2 font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  {processingOrder
                    ? uiT("placingOrder") || "Placing order..."
                    : uiT("confirmOrder") || "Confirm Order"}
                </button>

                <button
                  onClick={cancelVoicePurchase}
                  disabled={processingOrder}
                  className="rounded-xl bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircle size={18} />
                  {uiT("cancel") || "Cancel"}
                </button>
              </div>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-4">
            {uiT("helpCommand") ||
              'Try: "Help", "Show available crops", "Find tomatoes", "Buy 5 kg tomatoes", "Confirm order", "Cancel order", "Show my orders", or "Check weather".'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8">
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={scrollToCrops}
            className="text-left bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl"
          >
            <Package size={40} className="text-green-600" />
            <h3 className="text-lg font-semibold mt-4">
              {uiT("availableProducts") || "Available Products"}
            </h3>
            <p className="text-4xl font-bold text-green-700 mt-2">
              {crops.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {uiT("freshCrops") || "Fresh crops from farmers"}
            </p>
          </button>

          <button
            onClick={() => navigate("/buyer-orders")}
            className="text-left bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl"
          >
            <ShoppingCart size={40} className="text-blue-600" />
            <h3 className="text-lg font-semibold mt-4">
              {uiT("myOrders") || "My Orders"}
            </h3>
            <p className="text-4xl font-bold text-blue-700 mt-2">
              {ordersCount}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {uiT("trackPurchases") || "Track your purchases"}
            </p>
          </button>

          <button
            onClick={() => navigate("/weather")}
            className="text-left bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl"
          >
            <Sun size={40} className="text-yellow-500" />
            <h3 className="text-lg font-semibold mt-4">
              {uiT("weather") || "Weather"}
            </h3>
            <p className="text-4xl font-bold text-orange-500 mt-2">☀️</p>
            <p className="text-gray-500 text-sm mt-1">
              {uiT("checkCurrentWeather") || "Check current weather"}
            </p>
          </button>
        </div>
      </div>

      <div
        id="buyer-crops-section"
        className="max-w-7xl mx-auto px-6 lg:px-10 mt-10 scroll-mt-6"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {uiT("freshCrops") || "Fresh Crops"}
            </h2>
            <p className="text-gray-500 mt-1">
              {uiT("buyDirectly") || "Buy directly from farmers"}
            </p>
          </div>
          <p className="text-gray-500">
            {filtered.length} {uiT("products") || "products"}
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-4 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={uiT("searchCrops") || "Search crops..."}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full border border-gray-200 bg-white rounded-xl py-3 pl-12 pr-4"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={60} className="mx-auto text-gray-300" />
            <h3 className="text-xl font-bold text-gray-700 mt-4">
              {uiT("noCrops") || "No crops found"}
            </h3>
            <p className="text-gray-500 mt-2">
              {uiT("tryAnotherCrop") || "Try searching for another crop."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl font-semibold"
              >
                {uiT("showAllCrops") || "Show all crops"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {crop.image_url ? (
                  <img
                    src={
                      crop.image_url.startsWith("http")
                        ? crop.image_url
                        : `http://127.0.0.1:5000/${crop.image_url.replace(/\\/g, "/")}`
                    }
                    alt={crop.crop_name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="h-48 bg-green-50 flex items-center justify-center">
                    <Package size={60} className="text-green-300" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="text-xl font-bold text-gray-800">
                      {crop.crop_name}
                    </h3>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                      {uiT("fresh") || "Fresh"}
                    </span>
                  </div>

                  <p className="text-gray-500 mt-2">
                    {uiT("farmer") || "Farmer"}:{" "}
                    {crop.farmer_name || crop.farmer_email || "Local Farmer"}
                  </p>

                  <p className="text-2xl font-bold text-green-700 mt-4">
                    ₹{crop.price}{" "}
                    <span className="text-sm text-gray-500 font-normal">
                      / Kg
                    </span>
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    {uiT("available") || "Available"}: {crop.quantity} Kg
                  </p>

                  <button
                    onClick={() => buyCrop(crop)}
                    disabled={Number(crop.quantity) <= 0}
                    className="mt-5 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                    {uiT("buyDirectly") || "Buy Directly"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="bg-green-900 text-green-100 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center text-sm">
          © {new Date().getFullYear()} FarmConnect AI.{" "}
          {uiT("copyright") || "Connecting farmers and buyers directly."}
        </div>
      </footer>
    </div>
  );
}

export default BuyerDashboard;
