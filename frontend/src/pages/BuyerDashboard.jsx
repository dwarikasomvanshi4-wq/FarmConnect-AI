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
  ArrowLeft,
  MapPin,
  CreditCard,
} from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

function BuyerDashboard() {
  const navigate = useNavigate();
  const { language: appLanguage, setLanguage: setAppLanguage, t: uiT } =
    useLanguage();

  const recognitionRef = useRef(null);
  const processingRef = useRef(false);

  const [crops, setCrops] = useState([]);
  const [search, setSearch] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  // Nearby crops
  const [nearbyCrops, setNearbyCrops] = useState([]);
  const [nearbyRadius, setNearbyRadius] = useState("25");
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [nearbySearched, setNearbySearched] = useState(false);
  const [buyerLocation, setBuyerLocation] = useState(null);

  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState("");
  const [voiceMessage, setVoiceMessage] = useState("");

  const [processingOrder, setProcessingOrder] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState("1");
  const [checkoutError, setCheckoutError] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  const [address, setAddress] = useState({
    full_name: localStorage.getItem("name") || "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    instructions: "",
  });

  const buyerName = localStorage.getItem("name") || "Buyer";

  const getBuyerEmail = () => {
    return (
      [
        localStorage.getItem("userEmail"),
        localStorage.getItem("email"),
      ].find((value) => {
        const email = (value || "").trim().toLowerCase();
        return email && email !== "null" && email !== "undefined";
      })?.trim() || ""
    );
  };

  const languageCodes = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const language = languageCodes[appLanguage] || "en-IN";

  const messages = {
    "en-IN": {
      listening: "Listening. Please speak now.",
      help: 'Try "Show available crops", "Find tomatoes", "Buy 5 kg tomatoes", "Show my orders", or "Check weather".',
      notUnderstood: "Sorry, I did not understand. Please try again or say Help.",
      noSpeech: "I could not recognize your speech. Please try again.",
      micDenied: "Please allow microphone access in your browser settings.",
      voiceUnavailable: "Voice recognition is not supported in this browser. Please use Google Chrome.",
      searching: "Searching for",
      showCrops: "Showing all available crops.",
      noCrop: "I could not find that product. Please try another crop name.",
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
      help: "उपलब्ध फसलें दिखाने, टमाटर खोजने, फसल खरीदने, अपने ऑर्डर देखने या मौसम की जानकारी लेने के लिए बोलें।",
      notUnderstood: "माफ़ कीजिए, मैं समझ नहीं पाई। कृपया फिर से बोलें या मदद कहें।",
      noSpeech: "मैं आपकी आवाज़ पहचान नहीं पाई। कृपया फिर से कोशिश करें।",
      micDenied: "कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।",
      voiceUnavailable: "इस ब्राउज़र में वॉइस पहचान उपलब्ध नहीं है। कृपया Google Chrome का उपयोग करें।",
      searching: "खोज रही हूँ",
      showCrops: "सभी उपलब्ध फसलें दिखा रही हूँ।",
      noCrop: "मुझे यह उत्पाद नहीं मिला। कृपया किसी दूसरी फसल का नाम बोलें।",
      orderSuccess: "आपका ऑर्डर सफलतापूर्वक दे दिया गया है।",
      orderFailed: "ऑर्डर नहीं हो पाया। कृपया इंटरनेट और उपलब्ध स्टॉक जाँचें।",
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
      invalidPrice: "उत्पाद की कीमत सही नहीं है।",
      stockError: "उपलब्ध स्टॉक की पुष्टि नहीं हो पाई।",
    },
    "kn-IN": {
      listening: "ನಾನು ಕೇಳುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಈಗ ಮಾತನಾಡಿ.",
      help: "ಲಭ್ಯವಿರುವ ಬೆಳೆಗಳನ್ನು ತೋರಿಸಲು, ಟೊಮೇಟೊ ಹುಡುಕಲು, ಬೆಳೆ ಖರೀದಿಸಲು, ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ನೋಡಲು ಅಥವಾ ಹವಾಮಾನ ಪರಿಶೀಲಿಸಲು ಹೇಳಿ.",
      notUnderstood: "ಕ್ಷಮಿಸಿ, ನನಗೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಮಾತನಾಡಿ.",
      noSpeech: "ನಿಮ್ಮ ಮಾತುಗಳನ್ನು ಗುರುತಿಸಲಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      micDenied: "ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನೀಡಿ.",
      voiceUnavailable: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಬಳಸಿ.",
      searching: "ಹುಡುಕುತ್ತಿದ್ದೇನೆ",
      showCrops: "ಲಭ್ಯವಿರುವ ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ತೋರಿಸುತ್ತಿದ್ದೇನೆ.",
      noCrop: "ಆ ಉತ್ಪನ್ನ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಬೆಳೆಯ ಹೆಸರನ್ನು ಹೇಳಿ.",
      orderSuccess: "ನಿಮ್ಮ ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಮಾಡಲಾಗಿದೆ.",
      orderFailed: "ಆರ್ಡರ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಇಂಟರ್ನೆಟ್ ಮತ್ತು ಸ್ಟಾಕ್ ಪರಿಶೀಲಿಸಿ.",
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
      invalidPrice: "ಉತ್ಪನ್ನದ ಬೆಲೆ ಸರಿಯಾಗಿಲ್ಲ.",
      stockError: "ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್ ಪರಿಶೀಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    },
  };

  const voiceT = (key) =>
    messages[language]?.[key] || messages["en-IN"][key] || "";

  const normalizeText = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFC")
      .replace(/[.,!?।]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const speak = (message, onFinished) => {
    setVoiceMessage(message);

    if (!("speechSynthesis" in window)) {
      onFinished?.();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const prefix = language.split("-")[0].toLowerCase();
    const voices = window.speechSynthesis.getVoices();

    const selectedVoice =
      voices.find((voice) => voice.lang.toLowerCase() === language.toLowerCase()) ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith(prefix));

    if (selectedVoice) utterance.voice = selectedVoice;
    if (onFinished) utterance.onend = onFinished;

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    setVoiceMessage(voiceT("help"));
    loadCrops();
    loadOrders();
    loadWeather();

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

  const loadCrops = async () => {
    try {
      const response = await api.get("/crops");
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.crops)
        ? response.data.crops
        : [];

      setCrops(data);
    } catch (error) {
      console.error("Crop error:", error);
      setCrops([]);
    }
  };

  // Find crops near the buyer's current location.
  const findNearbyCrops = () => {
    if (!navigator.geolocation) {
      setNearbyError("Location is not supported by this browser.");
      return;
    }

    setNearbyLoading(true);
    setNearbyError("");
    setNearbySearched(false);
    setNearbyCrops([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setBuyerLocation({ latitude, longitude });

        try {
          const response = await api.get("/nearby-crops", {
            params: {
              lat: latitude,
              lon: longitude,
              radius: Number(nearbyRadius),
            },
          });

          const data = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.crops)
            ? response.data.crops
            : [];

          setNearbyCrops(data);
          setNearbySearched(true);
        } catch (error) {
          console.error(
            "Nearby crop search error:",
            error.response?.data || error
          );

          setNearbyError(
            error.response?.data?.error ||
              error.response?.data?.message ||
              "Unable to find nearby crops. Please try again."
          );
        } finally {
          setNearbyLoading(false);
        }
      },
      (error) => {
        console.error("Buyer location error:", error.message);

        const errorMessages = {
          1: "Location permission was denied. Allow location access in your browser settings.",
          2: "Your location could not be determined. Please try again.",
          3: "Location request timed out. Please try again.",
        };

        setNearbyError(
          errorMessages[error.code] || "Unable to access your location."
        );
        setNearbyLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const loadOrders = async () => {
    const email = getBuyerEmail();

    if (!email) {
      setOrdersCount(0);
      return;
    }

    try {
      const response = await api.get(
        `/buyer-orders/${encodeURIComponent(email)}`
      );

      setOrdersCount(
        Array.isArray(response.data)
          ? response.data.length
          : Array.isArray(response.data?.orders)
          ? response.data.orders.length
          : 0
      );
    } catch (error) {
      console.error("Orders error:", error);
    }
  };

  const loadWeather = () => {
    if (!navigator.geolocation) {
      setWeatherError("Location is not supported by this browser.");
      setWeatherLoading(false);
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await api.get("/weather", {
            params: { lat: latitude, lon: longitude },
          });

          setWeather(response.data);
          setWeatherError("");
        } catch (error) {
          console.error("Buyer weather error:", error.response?.data || error);
          setWeatherError(
            error.response?.data?.error || "Unable to load weather."
          );
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Buyer location error:", error.message);
        setWeatherError("Allow location access to see your local weather.");
        setWeatherLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
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

  const resetCheckout = () => {
    setCheckoutStep(0);
    setSelectedCrop(null);
    setSelectedQuantity("1");
    setCheckoutError("");
    setLastOrder(null);
  };

  const cancelCheckout = () => {
    resetCheckout();
    scrollToCrops();
  };

  const startCheckout = (crop, quantity = "1") => {
    if (!getBuyerEmail()) {
      speak(voiceT("loginAgain"), () => navigate("/login"));
      return;
    }

    if (!crop) {
      speak(voiceT("noCrop"));
      return;
    }

    setSelectedCrop(crop);
    setSelectedQuantity(String(quantity));
    setCheckoutError("");
    setCheckoutStep(1);

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateQuantity = () => {
    const quantity = Number(selectedQuantity);
    const stock = Number(selectedCrop?.quantity);
    const price = Number(selectedCrop?.price);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setCheckoutError(voiceT("invalidQuantity"));
      return false;
    }

    if (!Number.isFinite(stock) || quantity > stock) {
      setCheckoutError(
        `${voiceT("onlyAvailable")} ${stock} ${voiceT("kgAvailable")}`
      );
      return false;
    }

    if (!Number.isFinite(price) || price < 0) {
      setCheckoutError(voiceT("invalidPrice"));
      return false;
    }

    return true;
  };

  const continueToAddress = () => {
    setCheckoutError("");
    if (!validateQuantity()) return;

    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateAddress = (field, value) => {
    setAddress((previous) => ({ ...previous, [field]: value }));
  };

  const fullDeliveryAddress = () => {
    const location = [
      address.house,
      address.street,
      address.city,
      address.state,
      address.pincode,
    ]
      .map((line) => line.trim())
      .filter(Boolean)
      .join(", ");

    const instructions = address.instructions.trim();
    return instructions
      ? `${location}\nDelivery instructions: ${instructions}`
      : location;
  };

  const validateAddress = () => {
    const requiredFields = [
      ["full_name", "Please enter your full name."],
      ["phone", "Please enter your phone number."],
      ["house", "Please enter your house or flat number."],
      ["street", "Please enter your street or area."],
      ["city", "Please enter your city."],
      ["state", "Please enter your state."],
      ["pincode", "Please enter your PIN code."],
    ];

    for (const [field, message] of requiredFields) {
      if (!address[field].trim()) {
        setCheckoutError(message);
        return false;
      }
    }

    const phoneDigits = address.phone.replace(/\D/g, "");

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setCheckoutError("Please enter a valid phone number.");
      return false;
    }

    if (!/^\d{6}$/.test(address.pincode.trim())) {
      setCheckoutError("Please enter a valid 6-digit PIN code.");
      return false;
    }

    return true;
  };

  const continueToReview = () => {
    setCheckoutError("");

    if (!validateQuantity() || !validateAddress()) return;

    setCheckoutStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const placeOrder = async () => {
    const email = getBuyerEmail();

    if (!email) {
      setCheckoutError(voiceT("loginAgain"));
      return;
    }

    if (!selectedCrop || processingRef.current) return;
    if (!validateQuantity() || !validateAddress()) return;

    processingRef.current = true;
    setProcessingOrder(true);
    setCheckoutError("");

    try {
      const latest = await api.get("/crops");
      const latestCrops = Array.isArray(latest.data)
        ? latest.data
        : Array.isArray(latest.data?.crops)
        ? latest.data.crops
        : [];

      const currentCrop = latestCrops.find(
        (item) => String(item.id) === String(selectedCrop.id)
      );

      if (!currentCrop) {
        setCrops(latestCrops);
        setCheckoutError(voiceT("unavailable"));
        setCheckoutStep(1);
        return;
      }

      const quantity = Number(selectedQuantity);
      const available = Number(currentCrop.quantity);
      const price = Number(currentCrop.price);

      if (!Number.isFinite(available) || quantity > available) {
        setCrops(latestCrops);
        setSelectedCrop(currentCrop);
        setCheckoutError(voiceT("stockChanged"));
        setCheckoutStep(1);
        return;
      }

      if (!Number.isFinite(price) || price < 0) {
        setCheckoutError(voiceT("invalidPrice"));
        return;
      }

      const total = quantity * price;
      const deliveryAddress = fullDeliveryAddress();

      const response = await api.post("/place-order", {
        buyer_email: email,
        farmer_email: currentCrop.farmer_email,
        crop_id: currentCrop.id,
        crop_name: currentCrop.crop_name,
        quantity,
        total_price: total,
        delivery_address: deliveryAddress,
        payment_method: "COD",
        payment_status: "Pending",
      });

      setLastOrder({
        id: response.data?.order_id || response.data?.id || null,
        crop_name: currentCrop.crop_name,
        quantity,
        total,
        delivery_address: deliveryAddress,
        payment_method: "COD",
        payment_status: "Pending",
      });

      setCheckoutStep(4);
      await Promise.all([loadOrders(), loadCrops()]);
      speak(voiceT("orderSuccess"));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Order error:", error);
      setCheckoutError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          voiceT("orderFailed")
      );
    } finally {
      processingRef.current = false;
      setProcessingOrder(false);
    }
  };

  const buyCrop = (crop) => {
    if (!getBuyerEmail()) {
      speak(voiceT("loginAgain"), () => navigate("/login"));
      return;
    }

    startCheckout(crop, "1");
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

    startCheckout(crop, String(amount));

    const total = amount * price;
    const promptText =
      language === "hi-IN"
        ? `आपने ${crop.crop_name} ${amount} किलोग्राम चुना है। कुल कीमत ${total.toFixed(2)} रुपये है। अब डिलीवरी पता भरकर ऑर्डर पूरा करें।`
        : language === "kn-IN"
        ? `ನೀವು ${crop.crop_name} ${amount} ಕಿಲೋಗ್ರಾಂ ಆಯ್ಕೆ ಮಾಡಿದ್ದೀರಿ. ಒಟ್ಟು ಬೆಲೆ ${total.toFixed(2)} ರೂಪಾಯಿ. ಈಗ ಡೆಲಿವರಿ ವಿಳಾಸ ನೀಡಿ ಆರ್ಡರ್ ಪೂರ್ಣಗೊಳಿಸಿ.`
        : `You selected ${amount} kilograms of ${crop.crop_name}. The total is ${total.toFixed(2)} rupees. Please enter your delivery address to continue checkout.`;

    speak(promptText);
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

  const filtered = crops.filter((crop) =>
    normalizeText(crop.crop_name).includes(normalizeText(search))
  );

  const subtotal =
    Number(selectedCrop?.price || 0) * Number(selectedQuantity || 0);

  const StepHeader = ({ number, title, description }) => (
    <div className="flex gap-3 items-start">
      <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold shrink-0">
        {number}
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `http://127.0.0.1:5000/${imageUrl.replace(/\\/g, "/")}`;
  };

  const renderCheckout = () => {
    if (checkoutStep === 0) return null;

    if (checkoutStep === 4) {
      return (
        <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
          <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-8 text-center">
            <CheckCircle size={64} className="text-green-600 mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 mt-4">
              Order placed successfully!
            </h2>
            <p className="text-gray-600 mt-2">
              Your order has been saved. You can track its progress in My Orders.
            </p>

            {lastOrder && (
              <div className="mt-6 text-left bg-green-50 rounded-2xl p-5 space-y-2">
                {lastOrder.id && (
                  <p>
                    <strong>Order ID:</strong> {lastOrder.id}
                  </p>
                )}
                <p>
                  <strong>Crop:</strong> {lastOrder.crop_name}
                </p>
                <p>
                  <strong>Quantity:</strong> {lastOrder.quantity} Kg
                </p>
                <p>
                  <strong>Total:</strong> ₹{lastOrder.total.toFixed(2)}
                </p>
                <p>
                  <strong>Payment:</strong> Cash on Delivery
                </p>
                <p>
                  <strong>Payment status:</strong> Pending
                </p>
                <p>
                  <strong>Delivery address:</strong>
                </p>
                <p className="whitespace-pre-line text-gray-700">
                  {lastOrder.delivery_address}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <button
                onClick={() => {
                  resetCheckout();
                  scrollToCrops();
                }}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => navigate("/buyer-orders")}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-8">
        <button
          onClick={cancelCheckout}
          className="flex items-center gap-2 text-green-700 hover:text-green-900 font-semibold mb-6"
        >
          <ArrowLeft size={18} />
          Back to marketplace
        </button>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {["Select quantity", "Delivery address", "Review & payment"].map(
              (step, index) => (
                <div
                  key={step}
                  className={`px-3 py-2 rounded-full text-sm font-semibold ${
                    checkoutStep === index + 1
                      ? "bg-green-700 text-white"
                      : checkoutStep > index + 1
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}. {step}
                </div>
              )
            )}
          </div>

          {checkoutError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
              {checkoutError}
            </div>
          )}

          {checkoutStep === 1 && (
            <div className="space-y-6">
              <StepHeader
                number="1"
                title="Select quantity"
                description="Choose how many kilograms you want to purchase."
              />

              {selectedCrop && (
                <div className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                  {selectedCrop.image_url ? (
                    <img
                      src={getImageUrl(selectedCrop.image_url)}
                      alt={selectedCrop.crop_name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-green-100 rounded-xl flex items-center justify-center">
                      <Package className="text-green-700" size={34} />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedCrop.crop_name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      Farmer:{" "}
                      {selectedCrop.farmer_name ||
                        selectedCrop.farmer_email ||
                        "Local Farmer"}
                    </p>
                    <p className="text-green-700 font-bold mt-2">
                      ₹{Number(selectedCrop.price).toFixed(2)} / Kg
                    </p>
                    <p className="text-sm text-gray-500">
                      Stock available: {selectedCrop.quantity} Kg
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity in kilograms *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  max={selectedCrop?.quantity}
                  value={selectedQuantity}
                  onChange={(event) => {
                    setSelectedQuantity(event.target.value);
                    setCheckoutError("");
                  }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="bg-green-50 rounded-xl p-4 flex justify-between items-center">
                <span className="text-gray-700 font-medium">Estimated total</span>
                <span className="text-2xl font-bold text-green-800">
                  {(
                    Number(selectedCrop?.price || 0) *
                    Number(selectedQuantity || 0)
                  ).toFixed(2)}
                </span>
              </div>

              <button
                onClick={continueToAddress}
                className="w-full bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-semibold"
              >
                Continue to Delivery Address
              </button>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-6">
              <StepHeader
                number="2"
                title="Enter delivery address"
                description="Provide the address where the farmer should deliver your order."
              />

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full name *
                  </label>
                  <input
                    value={address.full_name}
                    onChange={(e) => updateAddress("full_name", e.target.value)}
                    autoComplete="name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone number *
                  </label>
                  <input
                    type="tel"
                    value={address.phone}
                    onChange={(e) => updateAddress("phone", e.target.value)}
                    autoComplete="tel"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    House / Flat number *
                  </label>
                  <input
                    value={address.house}
                    onChange={(e) => updateAddress("house", e.target.value)}
                    autoComplete="address-line1"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="House or flat number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street / Area *
                  </label>
                  <input
                    value={address.street}
                    onChange={(e) => updateAddress("street", e.target.value)}
                    autoComplete="address-line2"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="Street or area"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    value={address.city}
                    onChange={(e) => updateAddress("city", e.target.value)}
                    autoComplete="address-level2"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    value={address.state}
                    onChange={(e) => updateAddress("state", e.target.value)}
                    autoComplete="address-level1"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN code *
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    value={address.pincode}
                    onChange={(e) =>
                      updateAddress(
                        "pincode",
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    autoComplete="postal-code"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3"
                    placeholder="6-digit PIN code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery instructions (optional)
                </label>
                <textarea
                  rows={3}
                  value={address.instructions}
                  onChange={(e) => updateAddress("instructions", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                  placeholder="Landmark or instructions for delivery"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setCheckoutError("");
                    setCheckoutStep(1);
                  }}
                  className="sm:w-1/3 border border-gray-300 rounded-xl py-3 font-semibold text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={continueToReview}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-semibold"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {checkoutStep === 3 && (
            <div className="space-y-6">
              <StepHeader
                number="3"
                title="Review order and total"
                description="Verify your order, delivery address and payment method before placing it."
              />

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="bg-gray-50 p-4 font-bold text-gray-800">
                  Order summary
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Crop</span>
                    <span className="font-semibold text-right">
                      {selectedCrop?.crop_name}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-semibold">{selectedQuantity} Kg</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Price per Kg</span>
                    <span>₹{Number(selectedCrop?.price || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between gap-4">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-green-800">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <MapPin className="text-green-700 mt-1" size={22} />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">Delivery address</h3>
                    <p className="mt-2 font-semibold">{address.full_name}</p>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="text-gray-600 mt-1 whitespace-pre-line">
                      {fullDeliveryAddress()}
                    </p>
                    <button
                      onClick={() => {
                        setCheckoutError("");
                        setCheckoutStep(2);
                      }}
                      className="text-green-700 font-semibold text-sm mt-3 hover:underline"
                    >
                      Edit address
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-green-200 bg-green-50 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <CreditCard className="text-green-700 mt-1" size={23} />
                  <div>
                    <h3 className="font-bold text-gray-800">Payment method</h3>
                    <p className="font-semibold text-green-800 mt-1">
                      Cash on Delivery (COD)
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Payment status: Pending. Pay when your order is delivered.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setCheckoutError("");
                    setCheckoutStep(2);
                  }}
                  disabled={processingOrder}
                  className="sm:w-1/3 border border-gray-300 rounded-xl py-3 font-semibold text-gray-700 disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  onClick={placeOrder}
                  disabled={processingOrder}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
                >
                  {processingOrder ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {checkoutStep > 0 ? (
        <>
          <div className="bg-gradient-to-r from-green-800 to-green-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">🌾 FarmConnect AI</h1>
                <p className="text-green-100 mt-1">
                  Secure checkout for {buyerName}
                </p>
              </div>
              <button
                onClick={() => navigate("/buyer-orders")}
                className="bg-white text-green-700 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
              >
                <ShoppingCart size={19} />
                My Orders ({ordersCount})
              </button>
            </div>
          </div>

          {renderCheckout()}
        </>
      ) : (
        <>
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

              <p className="text-sm text-gray-500 mt-4">
                {uiT("helpCommand") ||
                  'Try: "Help", "Show available crops", "Find tomatoes", "Buy 5 kg tomatoes", "Show my orders", or "Check weather".'}
              </p>
            </div>
          </div>

          {/* Dashboard cards */}
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
                <p className="text-4xl font-bold text-orange-500 mt-2">
                  {weatherLoading
                    ? "..."
                    : weather
                    ? `${Math.round(weather.temperature)}°C`
                    : "--°C"}
                </p>
                <p className="text-gray-700 text-sm mt-1 capitalize">
                  {weather?.weather || weatherError || "Current weather"}
                </p>
                {weather?.city && (
                  <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                    <MapPin size={14} />
                    {weather.city}
                  </p>
                )}
                {weather && (
                  <p className="text-gray-500 text-sm mt-1">
                    Humidity: {weather.humidity}% · Wind: {weather.wind_speed} m/s
                  </p>
                )}
              </button>
            </div>
          </div>

          {/* Find Nearby Crops */}
          <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-8">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-green-100 p-3 rounded-xl">
                  <MapPin className="text-green-700" size={28} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Find Nearby Crops
                  </h2>
                  <p className="text-sm text-gray-500">
                    Discover available crops near your current location.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Search radius
                  </label>
                  <select
                    value={nearbyRadius}
                    onChange={(event) => setNearbyRadius(event.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
                    disabled={nearbyLoading}
                  >
                    <option value="5">Within 5 km</option>
                    <option value="10">Within 10 km</option>
                    <option value="25">Within 25 km</option>
                    <option value="50">Within 50 km</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={findNearbyCrops}
                    disabled={nearbyLoading}
                    className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MapPin size={18} />
                    {nearbyLoading ? "Finding Crops..." : "Use My Location"}
                  </button>
                </div>
              </div>

              {buyerLocation && (
                <p className="text-xs text-gray-500 mt-3">
                  Your location: {buyerLocation.latitude.toFixed(5)},{" "}
                  {buyerLocation.longitude.toFixed(5)}
                </p>
              )}

              {nearbyError && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                  {nearbyError}
                </div>
              )}

              {nearbySearched && nearbyCrops.length === 0 && !nearbyError && (
                <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
                  No crops with saved locations were found within{" "}
                  {nearbyRadius} km. Try a larger radius or check whether farmers
                  have saved their crop locations.
                </div>
              )}

              {nearbyCrops.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Nearby crops ({nearbyCrops.length})
                  </h3>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {nearbyCrops.map((crop) => (
                      <div
                        key={crop.id}
                        className="border border-green-100 rounded-2xl overflow-hidden hover:shadow-lg transition bg-white"
                      >
                        {crop.image_url || crop.image ? (
                          <img
                            src={getImageUrl(crop.image_url || crop.image)}
                            alt={crop.crop_name}
                            className="w-full h-40 object-cover"
                          />
                        ) : (
                          <div className="h-40 bg-green-50 flex items-center justify-center">
                            <Package size={48} className="text-green-300" />
                          </div>
                        )}

                        <div className="p-5">
                          <h4 className="text-lg font-bold text-gray-800">
                            {crop.crop_name}
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            Farmer:{" "}
                            {crop.farmer_name ||
                              crop.farmer_email ||
                              "Local Farmer"}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-sm text-blue-700">
                            <MapPin size={16} />
                            {Number(crop.distance_km).toFixed(2)} km away
                          </div>

                          <p className="text-xl font-bold text-green-700 mt-3">
                            ₹{Number(crop.price).toFixed(2)}
                            <span className="text-sm font-normal text-gray-500">
                              {" "}/ Kg
                            </span>
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Available: {crop.quantity} Kg
                          </p>

                          <button
                            onClick={() => buyCrop(crop)}
                            disabled={Number(crop.quantity) <= 0}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            <ShoppingCart size={18} />
                            Buy Directly
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* All available crops */}
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
                        src={getImageUrl(crop.image_url)}
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
        </>
      )}
    </div>
  );
}

export default BuyerDashboard;