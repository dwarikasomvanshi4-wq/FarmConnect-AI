import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    home: "Home",
    login: "Login",
    register: "Register",
    farmerDashboard: "Farmer Dashboard",
    buyerDashboard: "Buyer Dashboard",
    addCrop: "Add Crop",
    myCrops: "My Crops",
    weather: "Weather",
    orders: "Orders",
    buyerOrders: "Buyer Orders",
    language: "Language",
    logout: "Logout",
    search: "Search",
    buyNow: "Buy Now",
    speakCommand: "Speak Command",
    welcome: "Welcome to FarmConnect AI",

    welcomeBack: "Welcome Back",
    directFarmMarket: "DIRECT FARM MARKET",
    buyFreshCrops: "Buy Fresh Crops Directly From Farmers 🌾",
    discoverCrops:
      "Discover fresh agricultural products, connect directly with farmers and place your order easily.",
    profile: "Profile",
    voiceAssistant: "Buyer Voice Assistant",
    voiceDescription: "Talk in English, Hindi, or Kannada.",
    chooseLanguage: "Choose your language",
    listening: "Listening...",
    assistant: "Assistant",
    availableProducts: "Available Products",
    freshCrops: "Fresh Crops",
    buyDirectly: "Buy directly from farmers",
    searchCrops: "Search crops...",
    available: "Available",
    price: "Price",
    farmer: "Farmer",
    noCrops: "No crops found",
    tryAnotherCrop: "Try searching for another crop.",
    showAllCrops: "Show All Crops",
    fresh: "Fresh",
    products: "products",
    confirmPurchase: "Confirm your purchase",
    quantity: "Quantity",
    pricePerKg: "Price per Kg",
    total: "Total",
    confirmOrder: "Confirm Order",
    placingOrder: "Placing order...",
    cancel: "Cancel",
    trackPurchases: "Track your purchases",
    freshCropsFromFarmers: "Fresh crops from farmers",
    checkCurrentWeather: "Check current weather",
    platform: "Platform",
    freshProducts: "Fresh Products",
    directFarmerAccess: "Direct Farmer Access",
    voiceEnabledAgriculture: "Voice-Enabled Agriculture",
    footerDescription:
      "Connecting farmers directly with buyers through smart agriculture technology.",
    trySearching: "Try:",
    helpCommand: "Help",
    showAvailableCrops: "Show available crops",
    findTomatoes: "Find tomatoes",
    buyFiveKgTomatoes: "Buy 5 kg tomatoes",
    confirmOrderCommand: "Confirm order",
    cancelOrderCommand: "Cancel order",
    showMyOrders: "Show my orders",
    checkWeather: "Check weather",
    recognized: "Recognized",
    copyright: "© 2026 FarmConnect AI. Smart Agriculture Platform.",
  },

  hi: {
    home: "होम",
    login: "लॉगिन",
    register: "रजिस्टर करें",
    farmerDashboard: "किसान डैशबोर्ड",
    buyerDashboard: "खरीदार डैशबोर्ड",
    addCrop: "फसल जोड़ें",
    myCrops: "मेरी फसलें",
    weather: "मौसम",
    orders: "ऑर्डर",
    buyerOrders: "खरीदार के ऑर्डर",
    language: "भाषा",
    logout: "लॉगआउट",
    search: "खोजें",
    buyNow: "अभी खरीदें",
    speakCommand: "बोलकर निर्देश दें",
    welcome: "FarmConnect AI में आपका स्वागत है",

    welcomeBack: "वापसी पर स्वागत है",
    directFarmMarket: "सीधा किसान बाज़ार",
    buyFreshCrops: "किसानों से सीधे ताज़ी फसलें खरीदें 🌾",
    discoverCrops:
      "ताज़े कृषि उत्पाद खोजें, किसानों से सीधे जुड़ें और आसानी से ऑर्डर करें।",
    profile: "प्रोफ़ाइल",
    voiceAssistant: "खरीदार वॉइस असिस्टेंट",
    voiceDescription: "हिंदी, अंग्रेज़ी या कन्नड़ में बात करें।",
    chooseLanguage: "अपनी भाषा चुनें",
    listening: "सुन रही हूँ...",
    assistant: "सहायक",
    availableProducts: "उपलब्ध उत्पाद",
    freshCrops: "ताज़ी फसलें",
    buyDirectly: "किसानों से सीधे खरीदें",
    searchCrops: "फसलें खोजें...",
    available: "उपलब्ध मात्रा",
    price: "कीमत",
    farmer: "किसान",
    noCrops: "कोई फसल नहीं मिली",
    tryAnotherCrop: "किसी दूसरी फसल को खोजें।",
    showAllCrops: "सभी फसलें दिखाएं",
    fresh: "ताज़ा",
    products: "उत्पाद",
    confirmPurchase: "अपनी खरीद की पुष्टि करें",
    quantity: "मात्रा",
    pricePerKg: "प्रति किलो कीमत",
    total: "कुल कीमत",
    confirmOrder: "ऑर्डर कन्फर्म करें",
    placingOrder: "ऑर्डर दिया जा रहा है...",
    cancel: "रद्द करें",
    trackPurchases: "अपनी खरीदारी देखें",
    freshCropsFromFarmers: "किसानों से ताज़ी फसलें",
    checkCurrentWeather: "वर्तमान मौसम देखें",
    platform: "प्लेटफ़ॉर्म",
    freshProducts: "ताज़े उत्पाद",
    directFarmerAccess: "किसानों से सीधा संपर्क",
    voiceEnabledAgriculture: "वॉइस-सक्षम कृषि",
    footerDescription:
      "स्मार्ट कृषि तकनीक के माध्यम से किसानों को सीधे खरीदारों से जोड़ना।",
    trySearching: "ऐसे बोलें:",
    helpCommand: "मदद",
    showAvailableCrops: "सभी फसलें दिखाओ",
    findTomatoes: "टमाटर खोजो",
    buyFiveKgTomatoes: "5 किलो टमाटर खरीदो",
    confirmOrderCommand: "ऑर्डर कन्फर्म",
    cancelOrderCommand: "ऑर्डर रद्द",
    showMyOrders: "मेरे ऑर्डर दिखाओ",
    checkWeather: "मौसम दिखाओ",
    recognized: "पहचाना गया",
    copyright: "© 2026 FarmConnect AI. स्मार्ट कृषि प्लेटफ़ॉर्म।",
  },

  kn: {
    home: "ಮುಖಪುಟ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    farmerDashboard: "ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    buyerDashboard: "ಖರೀದಿದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    addCrop: "ಬೆಳೆ ಸೇರಿಸಿ",
    myCrops: "ನನ್ನ ಬೆಳೆಗಳು",
    weather: "ಹವಾಮಾನ",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    buyerOrders: "ಖರೀದಿದಾರರ ಆರ್ಡರ್‌ಗಳು",
    language: "ಭಾಷೆ",
    logout: "ಲಾಗ್‌ಔಟ್",
    search: "ಹುಡುಕಿ",
    buyNow: "ಈಗ ಖರೀದಿಸಿ",
    speakCommand: "ಮಾತಿನ ಆಜ್ಞೆ ನೀಡಿ",
    welcome: "FarmConnect AI ಗೆ ಸ್ವಾಗತ",

    welcomeBack: "ಮರಳಿ ಸ್ವಾಗತ",
    directFarmMarket: "ನೇರ ರೈತ ಮಾರುಕಟ್ಟೆ",
    buyFreshCrops: "ರೈತರಿಂದ ನೇರವಾಗಿ ತಾಜಾ ಬೆಳೆಗಳನ್ನು ಖರೀದಿಸಿ 🌾",
    discoverCrops:
      "ತಾಜಾ ಕೃಷಿ ಉತ್ಪನ್ನಗಳನ್ನು ಹುಡುಕಿ, ರೈತರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಆರ್ಡರ್ ಮಾಡಿ.",
    profile: "ಪ್ರೊಫೈಲ್",
    voiceAssistant: "ಖರೀದಿದಾರರ ಧ್ವನಿ ಸಹಾಯಕ",
    voiceDescription: "ಇಂಗ್ಲಿಷ್, ಹಿಂದಿ ಅಥವಾ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ.",
    chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ...",
    assistant: "ಸಹಾಯಕ",
    availableProducts: "ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು",
    freshCrops: "ತಾಜಾ ಬೆಳೆಗಳು",
    buyDirectly: "ರೈತರಿಂದ ನೇರವಾಗಿ ಖರೀದಿಸಿ",
    searchCrops: "ಬೆಳೆಗಳನ್ನು ಹುಡುಕಿ...",
    available: "ಲಭ್ಯವಿದೆ",
    price: "ಬೆಲೆ",
    farmer: "ರೈತ",
    noCrops: "ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    tryAnotherCrop: "ಬೇರೆ ಬೆಳೆಯನ್ನು ಹುಡುಕಿ.",
    showAllCrops: "ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ತೋರಿಸಿ",
    fresh: "ತಾಜಾ",
    products: "ಉತ್ಪನ್ನಗಳು",
    confirmPurchase: "ನಿಮ್ಮ ಖರೀದಿಯನ್ನು ದೃಢೀಕರಿಸಿ",
    quantity: "ಪ್ರಮಾಣ",
    pricePerKg: "ಪ್ರತಿ ಕೆಜಿಗೆ ಬೆಲೆ",
    total: "ಒಟ್ಟು",
    confirmOrder: "ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ",
    placingOrder: "ಆರ್ಡರ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    cancel: "ರದ್ದುಮಾಡಿ",
    trackPurchases: "ನಿಮ್ಮ ಖರೀದಿಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    freshCropsFromFarmers: "ರೈತರಿಂದ ತಾಜಾ ಬೆಳೆಗಳು",
    checkCurrentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ",
    platform: "ವೇದಿಕೆ",
    freshProducts: "ತಾಜಾ ಉತ್ಪನ್ನಗಳು",
    directFarmerAccess: "ರೈತರೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ",
    voiceEnabledAgriculture: "ಧ್ವನಿ ಆಧಾರಿತ ಕೃಷಿ",
    footerDescription:
      "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ತಂತ್ರಜ್ಞಾನದ ಮೂಲಕ ರೈತರನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವುದು.",
    trySearching: "ಹೀಗೆ ಹೇಳಿ:",
    helpCommand: "ಸಹಾಯ",
    showAvailableCrops: "ಎಲ್ಲಾ ಬೆಳೆಗಳನ್ನು ತೋರಿಸಿ",
    findTomatoes: "ಟೊಮೇಟೊ ಹುಡುಕಿ",
    buyFiveKgTomatoes: "5 ಕೆಜಿ ಟೊಮೇಟೊ ಖರೀದಿಸಿ",
    confirmOrderCommand: "ಆರ್ಡರ್ ದೃಢೀಕರಿಸಿ",
    cancelOrderCommand: "ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ",
    showMyOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳನ್ನು ತೋರಿಸಿ",
    checkWeather: "ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ",
    recognized: "ಗುರುತಿಸಲಾಗಿದೆ",
    copyright: "© 2026 FarmConnect AI. ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆ.",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("farmconnect-language") || "en"
  );

  useEffect(() => {
    localStorage.setItem("farmconnect-language", language);

    document.documentElement.lang =
      language === "kn" ? "kn" : language === "hi" ? "hi" : "en";
  }, [language]);

  const t = (key) =>
    translations[language]?.[key] || translations.en[key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
