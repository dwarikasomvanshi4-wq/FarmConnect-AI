import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Bell, Sun, Sprout, ShoppingBag, IndianRupee, CloudSun,
  Mic, MicOff, Volume2, AlertTriangle, RefreshCw, Package,
  CheckCircle2, TrendingUp, Download
} from "lucide-react";
import api from "../services/api";
import { registerFarmerForNotifications } from "../notificationService";
import { useLanguage } from "../i18n/LanguageContext";

const languageMap = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };

const translations = {
  "en-IN": {
    welcome: "Welcome Back 👋",
    subtitle: "Your Farm, Your Business",
    assistant: "FarmConnect Voice Assistant",
    assistantDesc: "Manage your farming activities using your voice.",
    recognized: "Recognized Command",
    response: "Assistant Response",
    repeat: "Repeat Response",
    trySaying: "Try saying:",
    myCrops: "My Crops",
    orders: "Orders",
    earnings: "Confirmed Earnings",
    weather: "Weather",
    stock: "Available Stock",
    inventory: "Inventory Watch",
    recent: "Recent Orders",
    addCrop: "Add Crop",
    loading: "Loading dashboard...",
    refresh: "Refresh",
    lowStock: "Low stock",
    noLowStock: "All listed crops have more than 10 kg in stock.",
    noOrders: "No orders yet. Your orders will appear here.",
    noCrops: "No crops listed yet.",
    sales: "Your Farming Snapshot",
    quantity: "Quantity",
    status: "Status",
    payment: "Payment",
    listening: "Listening... Speak now.",
    selected: "Language selected. Click the microphone and speak.",
    stop: "Stop listening",
    start: "Start voice command",
    lowStockDesc: "These crops may need restocking.",
    dashboardError: "Unable to refresh dashboard data.",
    tagline1: "Grow smarter.",
    tagline2: "Sell better.",
    farmDescription: "Keep track of your crops, monitor stock, manage orders and follow your confirmed payments from one place.",
    language: "Language",
    liveInfo: "Live information from your FarmConnect account",
    autoRefresh: "Auto-refreshing",
    inventoryLabel: "Inventory",
    stockLabel: "Stock",
    activityLabel: "Activity",
    paymentsLabel: "Payments",
    retry: "Retry",
    cropPriceTitle: "Crop Price Trend Analysis",
    cropPriceDesc: "View historical average selling prices per kilogram.",
    loadingPrices: "Loading price history...",
    noPriceData: "No historical price data is available for",
    latestPrice: "Latest recorded price",
    recordedDates: "Recorded dates",
    priceChange: "Price change",
    perKg: "Per kg",
    previousDate: "Versus the previous recorded date",
    farmingAtGlance: "Farming at a glance",
    farmingDescription: "Your inventory and orders update automatically while this page is open.",
    listedVarieties: "Listed crop varieties",
    ordersReceived: "Orders received",
    cropsAttention: "Crops needing attention",
    footer: "FarmConnect AI · Smart farming, connected markets",
    heroLabel: "Your farm at a glance",
    latestOrdersDesc: "Latest orders from your buyers",
    weatherLoading: "Loading...",
    weatherUnsupported: "Location is not supported by this browser.",
    weatherLoadError: "Unable to load current weather.",
    weatherPermission: "Allow location access to see weather for your current area.",
    speechUnsupported: "Speech output is not supported by this browser.",
    assistantSpeaking: "Assistant is speaking...",
    responseCompleted: "Response completed.",
    speechError: "Could not play the response. Please try again.",
    startError: "Could not start voice recognition.",
    commandNotRecognized: "Command not recognized",
    dashboard: "Dashboard",
    help: "Help",
    cropOrder: "Crop order",
    pending: "Pending",
    priceChartTitle: "price history (₹/kg)",
    priceDisclaimer: "Prices are inferred from FarmConnect-AI order records, not official market prices. This chart shows historical data only and does not guarantee future prices.",
    loginAgain: "User email not found. Please log in again.",
    priceLoadError: "Unable to load crop price history. Please try again.",
    crop: "Crop",
    tomato: "Tomato",
    potato: "Potato",
    cabbage: "Cabbage",
    weatherPage: "Opening the weather page.",
    recognizedAs: "You said:",
    commandHelp: "Say Add Crop, My Crops, Weather, My Orders, Dashboard, Available Stock, Total Earnings, or Low Stock.",
    locationLoading: "Loading...",
    analyticsTitle: "Sales Analytics",
    analyticsDesc: "Track your earnings and best-selling crops.",
    monthlyEarnings: "Sales Earnings",
    paidOrders: "Paid Orders",
    deliveredOrders: "Delivered Orders",
    bestSellingCrops: "Best-Selling Crops",
    quantitySold: "Quantity Sold",
    noSalesData: "No delivered sales recorded in this period.",
    noCropSales: "No crop sales data available yet.",
    lastSixMonths: "Last 6 Months",
    today: "Today",
    thisWeek: "This Week",
    thisMonth: "This Month",
    kgSold: "kg sold",
    filterSales: "Filter Sales By",
    downloadReport: "Download Sales Report",
    downloadDescription: "Download delivered orders for the selected period.",
    totalSales: "Total Sales",
    totalStock: "Total Available Stock",
    weatherRetry: "Retry weather",
    refreshSuccess: "Dashboard refreshed."
  },

  "hi-IN": {
    welcome: "वापसी पर स्वागत है 👋",
    subtitle: "आपका खेत, आपका व्यवसाय",
    assistant: "FarmConnect वॉइस असिस्टेंट",
    assistantDesc: "आवाज़ से अपनी खेती की गतिविधियाँ प्रबंधित करें।",
    recognized: "पहचाना गया निर्देश",
    response: "सहायक का जवाब",
    repeat: "जवाब दोबारा सुनें",
    trySaying: "ऐसा बोलकर देखें:",
    myCrops: "मेरी फसलें",
    orders: "ऑर्डर",
    earnings: "पुष्ट कमाई",
    weather: "मौसम",
    stock: "उपलब्ध स्टॉक",
    inventory: "स्टॉक की स्थिति",
    recent: "हाल के ऑर्डर",
    addCrop: "फसल जोड़ें",
    loading: "डैशबोर्ड लोड हो रहा है...",
    refresh: "रीफ्रेश",
    lowStock: "कम स्टॉक",
    noLowStock: "सभी फसलों का स्टॉक 10 किलो से अधिक है।",
    noOrders: "अभी कोई ऑर्डर नहीं है।",
    sales: "आपकी खेती की जानकारी",
    quantity: "मात्रा",
    status: "स्थिति",
    payment: "भुगतान",
    listening: "सुन रहा हूँ... अब बोलिए।",
    selected: "भाषा चुनी गई है। माइक्रोफ़ोन दबाकर बोलिए।",
    stop: "सुनना बंद करें",
    start: "वॉइस निर्देश शुरू करें",
    lowStockDesc: "इन फसलों में स्टॉक बढ़ाने की आवश्यकता हो सकती है।",
    dashboardError: "डैशबोर्ड डेटा अपडेट नहीं हो पाया।",
    tagline1: "समझदारी से खेती करें।",
    tagline2: "बेहतर बिक्री करें।",
    farmDescription: "अपनी फसलों, स्टॉक, ऑर्डर और पुष्ट भुगतानों की जानकारी एक ही जगह देखें।",
    language: "भाषा",
    liveInfo: "आपके FarmConnect खाते की लाइव जानकारी",
    autoRefresh: "अपने आप अपडेट हो रहा है",
    inventoryLabel: "इन्वेंटरी",
    stockLabel: "स्टॉक",
    activityLabel: "गतिविधि",
    paymentsLabel: "भुगतान",
    retry: "फिर से प्रयास करें",
    cropPriceTitle: "फसल मूल्य रुझान विश्लेषण",
    cropPriceDesc: "प्रति किलोग्राम औसत बिक्री मूल्य का पुराना रिकॉर्ड देखें।",
    loadingPrices: "मूल्य इतिहास लोड हो रहा है...",
    noPriceData: "इसके लिए कोई पुराना मूल्य डेटा उपलब्ध नहीं है:",
    latestPrice: "नवीनतम दर्ज मूल्य",
    recordedDates: "दर्ज तारीखें",
    priceChange: "मूल्य में बदलाव",
    perKg: "प्रति किलो",
    previousDate: "पिछली दर्ज तारीख की तुलना में",
    farmingAtGlance: "खेती की एक झलक",
    farmingDescription: "यह पेज खुला रहने पर आपकी इन्वेंटरी और ऑर्डर अपने आप अपडेट होते हैं।",
    listedVarieties: "सूचीबद्ध फसलें",
    ordersReceived: "प्राप्त ऑर्डर",
    cropsAttention: "ध्यान देने वाली फसलें",
    footer: "FarmConnect AI · स्मार्ट खेती, जुड़े हुए बाज़ार",
    heroLabel: "एक नज़र में आपका खेत",
    latestOrdersDesc: "खरीदारों के नवीनतम ऑर्डर",
    weatherLoading: "लोड हो रहा है...",
    weatherUnsupported: "यह ब्राउज़र लोकेशन सुविधा का समर्थन नहीं करता।",
    weatherLoadError: "वर्तमान मौसम लोड नहीं हो पाया।",
    weatherPermission: "अपने क्षेत्र का मौसम देखने के लिए लोकेशन की अनुमति दें।",
    speechUnsupported: "यह ब्राउज़र आवाज़ में जवाब देने का समर्थन नहीं करता।",
    assistantSpeaking: "सहायक बोल रहा है...",
    responseCompleted: "जवाब पूरा हुआ।",
    speechError: "जवाब चल नहीं पाया। फिर से कोशिश करें।",
    startError: "वॉइस पहचान शुरू नहीं हो पाई।",
    commandNotRecognized: "निर्देश पहचाना नहीं गया",
    dashboard: "डैशबोर्ड",
    help: "मदद",
    cropOrder: "फसल का ऑर्डर",
    pending: "लंबित",
    priceChartTitle: "मूल्य इतिहास (₹/किलो)",
    priceDisclaimer: "कीमतें FarmConnect-AI के ऑर्डर रिकॉर्ड से अनुमानित हैं, आधिकारिक बाज़ार मूल्य नहीं हैं।",
    loginAgain: "उपयोगकर्ता का ईमेल नहीं मिला। कृपया फिर से लॉग इन करें।",
    priceLoadError: "फसल के मूल्य का इतिहास लोड नहीं हो पाया।",
    crop: "फसल",
    tomato: "टमाटर",
    potato: "आलू",
    cabbage: "पत्तागोभी",
    weatherPage: "मौसम का पेज खोल रहा हूँ।",
    recognizedAs: "आपने कहा:",
    commandHelp: "फसल जोड़ें, मेरी फसलें, मौसम, मेरे ऑर्डर, डैशबोर्ड, उपलब्ध स्टॉक, कुल कमाई या कम स्टॉक बोलें।",
    locationLoading: "लोड हो रहा है...",
    analyticsTitle: "बिक्री विश्लेषण",
    analyticsDesc: "अपनी कमाई और सबसे ज्यादा बिकने वाली फसलें देखें।",
    monthlyEarnings: "बिक्री की कमाई",
    paidOrders: "भुगतान किए गए ऑर्डर",
    deliveredOrders: "डिलीवर किए गए ऑर्डर",
    bestSellingCrops: "सबसे ज्यादा बिकने वाली फसलें",
    quantitySold: "बेची गई मात्रा",
    noSalesData: "इस अवधि में कोई डिलीवर की गई बिक्री दर्ज नहीं हुई।",
    noCropSales: "अभी फसल बिक्री का डेटा उपलब्ध नहीं है।",
    lastSixMonths: "पिछले 6 महीने",
    today: "आज",
    thisWeek: "इस सप्ताह",
    thisMonth: "इस महीने",
    kgSold: "किलो बिका",
    filterSales: "बिक्री फ़िल्टर करें",
    downloadReport: "बिक्री रिपोर्ट डाउनलोड करें",
    downloadDescription: "चुनी गई अवधि के डिलीवर किए गए ऑर्डर डाउनलोड करें।",
    totalSales: "कुल बिक्री",
    totalStock: "कुल उपलब्ध स्टॉक",
    weatherRetry: "मौसम फिर से लोड करें"
  },

  "kn-IN": {
    welcome: "ಮತ್ತೆ ಸ್ವಾಗತ 👋",
    subtitle: "ನಿಮ್ಮ ಹೊಲ, ನಿಮ್ಮ ವ್ಯವಹಾರ",
    assistant: "FarmConnect ಧ್ವನಿ ಸಹಾಯಕ",
    assistantDesc: "ನಿಮ್ಮ ಧ್ವನಿಯಿಂದ ಕೃಷಿ ಚಟುವಟಿಕೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    recognized: "ಗುರುತಿಸಿದ ಆಜ್ಞೆ",
    response: "ಸಹಾಯಕನ ಪ್ರತಿಕ್ರಿಯೆ",
    repeat: "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಮತ್ತೆ ಕೇಳಿ",
    trySaying: "ಹೀಗೆ ಹೇಳಿ:",
    myCrops: "ನನ್ನ ಬೆಳೆಗಳು",
    orders: "ಆರ್ಡರ್‌ಗಳು",
    earnings: "ದೃಢೀಕೃತ ಆದಾಯ",
    weather: "ಹವಾಮಾನ",
    stock: "ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್",
    inventory: "ಸ್ಟಾಕ್ ಪರಿಶೀಲನೆ",
    recent: "ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು",
    addCrop: "ಬೆಳೆ ಸೇರಿಸಿ",
    loading: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    refresh: "ರಿಫ್ರೆಶ್",
    lowStock: "ಕಡಿಮೆ ಸ್ಟಾಕ್",
    noLowStock: "ಎಲ್ಲಾ ಬೆಳೆಗಳಲ್ಲಿ 10 ಕೆಜಿಗಿಂತ ಹೆಚ್ಚು ಸ್ಟಾಕ್ ಇದೆ.",
    noOrders: "ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ.",
    sales: "ನಿಮ್ಮ ಕೃಷಿ ವಿವರಗಳು",
    quantity: "ಪ್ರಮಾಣ",
    status: "ಸ್ಥಿತಿ",
    payment: "ಪಾವತಿ",
    listening: "ಕೇಳುತ್ತಿದ್ದೇನೆ... ಈಗ ಮಾತನಾಡಿ.",
    selected: "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ. ಮೈಕ್ರೋಫೋನ್ ಒತ್ತಿ ಮಾತನಾಡಿ.",
    stop: "ಕೇಳುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
    start: "ಧ್ವನಿ ಆಜ್ಞೆ ಪ್ರಾರಂಭಿಸಿ",
    lowStockDesc: "ಈ ಬೆಳೆಗಳಿಗೆ ಹೆಚ್ಚಿನ ಸ್ಟಾಕ್ ಬೇಕಾಗಬಹುದು.",
    dashboardError: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಡೇಟಾ ಅಪ್‌ಡೇಟ್ ಆಗಲಿಲ್ಲ.",
    tagline1: "ಬುದ್ಧಿವಂತಿಕೆಯಿಂದ ಕೃಷಿ ಮಾಡಿ.",
    tagline2: "ಉತ್ತಮವಾಗಿ ಮಾರಾಟ ಮಾಡಿ.",
    farmDescription: "ನಿಮ್ಮ ಬೆಳೆಗಳು, ಸ್ಟಾಕ್, ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ದೃಢೀಕೃತ ಪಾವತಿಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.",
    language: "ಭಾಷೆ",
    liveInfo: "ನಿಮ್ಮ FarmConnect ಖಾತೆಯ ನೇರ ಮಾಹಿತಿ",
    autoRefresh: "ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ",
    inventoryLabel: "ದಾಸ್ತಾನು",
    stockLabel: "ಸ್ಟಾಕ್",
    activityLabel: "ಚಟುವಟಿಕೆ",
    paymentsLabel: "ಪಾವತಿಗಳು",
    retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    cropPriceTitle: "ಬೆಳೆ ಬೆಲೆ ಪ್ರವೃತ್ತಿ ವಿಶ್ಲೇಷಣೆ",
    cropPriceDesc: "ಪ್ರತಿ ಕಿಲೋಗ್ರಾಂಗೆ ಸರಾಸರಿ ಮಾರಾಟ ಬೆಲೆಯ ಹಿಂದಿನ ದಾಖಲೆಗಳನ್ನು ನೋಡಿ.",
    loadingPrices: "ಬೆಲೆ ಇತಿಹಾಸ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noPriceData: "ಇದಕ್ಕೆ ಹಿಂದಿನ ಬೆಲೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ:",
    latestPrice: "ಇತ್ತೀಚಿನ ದಾಖಲಾದ ಬೆಲೆ",
    recordedDates: "ದಾಖಲಾದ ದಿನಾಂಕಗಳು",
    priceChange: "ಬೆಲೆ ಬದಲಾವಣೆ",
    perKg: "ಪ್ರತಿ ಕೆಜಿ",
    previousDate: "ಹಿಂದಿನ ದಾಖಲಾದ ದಿನಾಂಕಕ್ಕೆ ಹೋಲಿಸಿದರೆ",
    farmingAtGlance: "ಕೃಷಿಯ ಒಂದು ನೋಟ",
    farmingDescription: "ಈ ಪುಟ ತೆರೆದಿರುವಾಗ ನಿಮ್ಮ ದಾಸ್ತಾನು ಮತ್ತು ಆರ್ಡರ್‌ಗಳು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಿಸುತ್ತವೆ.",
    listedVarieties: "ಪಟ್ಟಿ ಮಾಡಲಾದ ಬೆಳೆಗಳು",
    ordersReceived: "ಸ್ವೀಕರಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    cropsAttention: "ಗಮನ ಅಗತ್ಯವಿರುವ ಬೆಳೆಗಳು",
    footer: "FarmConnect AI · ಸ್ಮಾರ್ಟ್ ಕೃಷಿ, ಸಂಪರ್ಕಿತ ಮಾರುಕಟ್ಟೆಗಳು",
    heroLabel: "ನಿಮ್ಮ ಹೊಲದ ಒಂದು ನೋಟ",
    latestOrdersDesc: "ಖರೀದಿದಾರರ ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು",
    weatherLoading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    weatherUnsupported: "ಈ ಬ್ರೌಸರ್ ಸ್ಥಳ ಸೌಲಭ್ಯವನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    weatherLoadError: "ಪ್ರಸ್ತುತ ಹವಾಮಾನವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    weatherPermission: "ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಮಾನ ನೋಡಲು ಸ್ಥಳ ಅನುಮತಿ ನೀಡಿ.",
    speechUnsupported: "ಈ ಬ್ರೌಸರ್ ಧ್ವನಿ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
    assistantSpeaking: "ಸಹಾಯಕ ಮಾತನಾಡುತ್ತಿದ್ದಾನೆ...",
    responseCompleted: "ಪ್ರತಿಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ.",
    speechError: "ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಪ್ಲೇ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    startError: "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    commandNotRecognized: "ಆಜ್ಞೆಯನ್ನು ಗುರುತಿಸಲಾಗಲಿಲ್ಲ",
    dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    help: "ಸಹಾಯ",
    cropOrder: "ಬೆಳೆ ಆರ್ಡರ್",
    pending: "ಬಾಕಿ ಇದೆ",
    priceChartTitle: "ಬೆಲೆ ಇತಿಹಾಸ (₹/ಕೆಜಿ)",
    priceDisclaimer: "ಬೆಲೆಗಳನ್ನು FarmConnect-AI ಆರ್ಡರ್ ದಾಖಲೆಗಳಿಂದ ಅಂದಾಜಿಸಲಾಗಿದೆ; ಇವು ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳಲ್ಲ.",
    loginAgain: "ಬಳಕೆದಾರರ ಇಮೇಲ್ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    priceLoadError: "ಬೆಳೆ ಬೆಲೆ ಇತಿಹಾಸವನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    crop: "ಬೆಳೆ",
    tomato: "ಟೊಮೇಟೊ",
    potato: "ಆಲೂಗಡ್ಡೆ",
    cabbage: "ಎಲೆಕೋಸು",
    weatherPage: "ಹವಾಮಾನ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
    recognizedAs: "ನೀವು ಹೇಳಿದ್ದು:",
    commandHelp: "ಬೆಳೆ ಸೇರಿಸಿ, ನನ್ನ ಬೆಳೆಗಳು, ಹವಾಮಾನ, ನನ್ನ ಆರ್ಡರ್‌ಗಳು, ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್, ಒಟ್ಟು ಆದಾಯ ಅಥವಾ ಕಡಿಮೆ ಸ್ಟಾಕ್ ಎಂದು ಹೇಳಿ.",
    locationLoading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    analyticsTitle: "ಮಾರಾಟ ವಿಶ್ಲೇಷಣೆ",
    analyticsDesc: "ನಿಮ್ಮ ಮಾಸಿಕ ಆದಾಯ ಮತ್ತು ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಬೆಳೆಗಳನ್ನು ನೋಡಿ.",
    monthlyEarnings: "ಮಾರಾಟದ ಆದಾಯ",
    paidOrders: "ಪಾವತಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    deliveredOrders: "ವಿತರಿಸಲಾದ ಆರ್ಡರ್‌ಗಳು",
    bestSellingCrops: "ಹೆಚ್ಚು ಮಾರಾಟವಾದ ಬೆಳೆಗಳು",
    quantitySold: "ಮಾರಾಟವಾದ ಪ್ರಮಾಣ",
    noSalesData: "ಈ ಅವಧಿಯಲ್ಲಿ ವಿತರಿಸಲಾದ ಮಾರಾಟ ದಾಖಲಾಗಿಲ್ಲ.",
    noCropSales: "ಇನ್ನೂ ಬೆಳೆ ಮಾರಾಟದ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ.",
    lastSixMonths: "ಕಳೆದ 6 ತಿಂಗಳುಗಳು",
    today: "ಇಂದು",
    thisWeek: "ಈ ವಾರ",
    thisMonth: "ಈ ತಿಂಗಳು",
    kgSold: "ಕೆಜಿ ಮಾರಾಟ",
    filterSales: "ಮಾರಾಟವನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ",
    downloadReport: "ಮಾರಾಟ ವರದಿ ಡೌನ್‌ಲೋಡ್",
    downloadDescription: "ಆಯ್ಕೆ ಮಾಡಿದ ಅವಧಿಯ ವಿತರಿಸಲಾದ ಆರ್ಡರ್‌ಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
    totalSales: "ಒಟ್ಟು ಮಾರಾಟ",
    totalStock: "ಒಟ್ಟು ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್",
    weatherRetry: "ಹವಾಮಾನ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ"
  }
};

const responses = {
  "en-IN": {
    greeting: "Hello! I am your FarmConnect assistant. How can I help you today?",
    addCrop: "Opening the Add Crop page.",
    myCrops: "Opening your crops page.",
    weather: "Opening the weather page.",
    orders: "Opening your orders page.",
    dashboard: "You are already on your farmer dashboard.",
    help: "Say Add Crop, My Crops, Weather, My Orders, or Dashboard.",
    unknown: "Sorry, I did not understand that command. Please try again.",
    micError: "Voice recognition is not supported. Please use Google Chrome.",
    micDenied: "Microphone permission was denied.",
    noSpeech: "I could not hear anything. Please try again.",
    network: "Network problem. Please check your internet connection."
  },
  "hi-IN": {
    greeting: "नमस्ते! मैं आपका FarmConnect सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?",
    addCrop: "फसल जोड़ने वाला पेज खोल रहा हूँ।",
    myCrops: "आपकी फसलों का पेज खोल रहा हूँ।",
    weather: "मौसम का पेज खोल रहा हूँ।",
    orders: "आपके ऑर्डर का पेज खोल रहा हूँ।",
    dashboard: "आप किसान डैशबोर्ड पर हैं।",
    help: "फसल जोड़ें, मेरी फसलें, मौसम, मेरे ऑर्डर या डैशबोर्ड बोलें।",
    unknown: "माफ़ कीजिए, निर्देश समझ नहीं आया। फिर से कोशिश करें।",
    micError: "कृपया आवाज़ पहचानने के लिए Google Chrome का उपयोग करें।",
    micDenied: "माइक्रोफ़ोन की अनुमति नहीं मिली।",
    noSpeech: "आपकी आवाज़ सुनाई नहीं दी। फिर से कोशिश करें।",
    network: "नेटवर्क समस्या है। इंटरनेट कनेक्शन जाँचें।"
  },
  "kn-IN": {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ FarmConnect ಸಹಾಯಕ. ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    addCrop: "ಬೆಳೆ ಸೇರಿಸುವ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
    myCrops: "ನಿಮ್ಮ ಬೆಳೆಗಳ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
    weather: "ಹವಾಮಾನ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
    orders: "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳ ಪುಟವನ್ನು ತೆರೆಯುತ್ತಿದ್ದೇನೆ.",
    dashboard: "ನೀವು ಈಗಾಗಲೇ ರೈತರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿದ್ದೀರಿ.",
    help: "ಬೆಳೆ ಸೇರಿಸಿ, ನನ್ನ ಬೆಳೆಗಳು, ಹವಾಮಾನ, ನನ್ನ ಆರ್ಡರ್‌ಗಳು ಅಥವಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಎಂದು ಹೇಳಿ.",
    unknown: "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಆಜ್ಞೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
    micError: "ಧ್ವನಿ ಗುರುತಿಸಲು Google Chrome ಬಳಸಿ.",
    micDenied: "ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ.",
    noSpeech: "ನಿಮ್ಮ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ.",
    network: "ನೆಟ್‌ವರ್ಕ್ ಸಮಸ್ಯೆ ಇದೆ. ಇಂಟರ್ನೆಟ್ ಪರಿಶೀಲಿಸಿ."
  }
};

function FarmerDashboard() {
  const navigate = useNavigate();
  const { language: appLanguage, setLanguage: setAppLanguage } = useLanguage();

  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);
  const lastSpeechRef = useRef({ text: "", lang: "en-US" });

  const [language, setLanguage] = useState(languageMap[appLanguage] || "en-IN");
  const ui = translations[language] || translations["en-IN"];
  const reply = responses[language] || responses["en-IN"];

  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState(ui.selected);
  const [assistantResponse, setAssistantResponse] = useState(reply.greeting);

  const [dashboardCrops, setDashboardCrops] = useState([]);
  const [dashboardOrders, setDashboardOrders] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const [selectedPriceCrop, setSelectedPriceCrop] = useState("Tomato");
  const [priceHistory, setPriceHistory] = useState([]);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState("");

  const [selectedSalesRange, setSelectedSalesRange] = useState("6months");
  const [salesAnalytics, setSalesAnalytics] = useState(null);
const [analyticsLoading, setAnalyticsLoading] = useState(false);
const [analyticsError, setAnalyticsError] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const handleEnableNotifications = async () => {
    setNotificationLoading(true);
    setNotificationMessage("");

    try {
      const result = await registerFarmerForNotifications();

      setNotificationMessage(result.message);

      if (result.success) {
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error("Enable notifications failed:", error);
      setNotificationMessage(
        "Unable to enable notifications. Please try again."
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // Load weather using the farmer's current location.
  const loadWeather = useCallback(() => {
    if (!navigator.geolocation) {
      setWeatherError(ui.weatherUnsupported);
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
            params: { lat: latitude, lon: longitude }
          });

          setWeather(response.data);
          setWeatherError("");
        } catch (error) {
          console.error("Weather loading failed:", error);
          setWeatherError(ui.weatherLoadError);
        } finally {
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Location error:", error);
        setWeatherError(
          error.code === 1 ? ui.weatherPermission : ui.weatherLoadError
        );
        setWeatherLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [ui.weatherUnsupported, ui.weatherLoadError, ui.weatherPermission]);

  // Load crop price history.
  const loadPriceHistory = useCallback(async () => {
    setPriceLoading(true);
    setPriceError("");

    try {
      const response = await api.get("/crop-price-trends", {
        params: { crop: selectedPriceCrop }
      });

      const history = Array.isArray(response.data?.history)
        ? response.data.history
        : [];

      const sortedHistory = [...history].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setPriceHistory(sortedHistory);
    } catch (error) {
      console.error("Crop price history loading failed:", error);
      setPriceHistory([]);
      setPriceError(ui.priceLoadError);
    } finally {
      setPriceLoading(false);
    }
  }, [selectedPriceCrop, ui.priceLoadError]);

  // Load farmer crops and orders.
  const loadSalesAnalytics = useCallback(async () => {
  const email = sessionStorage.getItem("userEmail");

  if (!email) {
    setSalesAnalytics(null);
    setAnalyticsError(ui.loginAgain);
    return;
  }

  setAnalyticsLoading(true);
  setAnalyticsError("");

  try {
    const analyticsResponse = await api.get(
      `/farmer-sales-analytics/${encodeURIComponent(email)}`
    );

    setSalesAnalytics(analyticsResponse.data);
  } catch (analyticsErr) {
    console.error("Sales analytics loading failed:", analyticsErr);
    setSalesAnalytics(null);
    setAnalyticsError("Unable to load sales analytics.");
  } finally {
    setAnalyticsLoading(false);
  }
}, [ui.loginAgain]);
  const loadDashboardData = useCallback(async () => {
    const email = sessionStorage.getItem("userEmail");

    if (!email) {
      setDashboardError(ui.loginAgain);
      setDashboardLoading(false);
      return;
    }

    try {
      const [cropsResponse, ordersResponse] = await Promise.all([
        api.get("/crops"),
        api.get(`/farmer-orders/${encodeURIComponent(email)}`)
      ]);

      const allCrops = Array.isArray(cropsResponse.data)
        ? cropsResponse.data
        : [];

      const myCrops = allCrops.filter(
        (crop) =>
          crop.farmer_email?.trim().toLowerCase() === email.trim().toLowerCase()
      );

      const myOrders = Array.isArray(ordersResponse.data)
        ? ordersResponse.data
        : [];

      setDashboardCrops(myCrops);
setDashboardOrders(myOrders);
setDashboardError("");

// Load sales analytics from the backend.
// Load sales analytics separately.
await loadSalesAnalytics();
    } catch (error) {
      console.error("Dashboard data loading failed:", error);
      setDashboardError(ui.dashboardError);
    } finally {
      setDashboardLoading(false);
    }
  },  [ui.dashboardError, ui.loginAgain, loadSalesAnalytics]);

  // Component cleanup.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      try {
        recognitionRef.current?.abort();
      } catch (error) {
        console.log("Recognition cleanup:", error);
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Weather refresh.
  useEffect(() => {
    loadWeather();
    const intervalId = setInterval(loadWeather, 15 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [loadWeather]);

  // Price history refresh.
  useEffect(() => {
    loadPriceHistory();
  }, [loadPriceHistory]);

  // Synchronize application language.
  useEffect(() => {
    const nextLanguage = languageMap[appLanguage] || "en-IN";

    if (nextLanguage !== language) {
      setLanguage(nextLanguage);
      setAssistantResponse(
        responses[nextLanguage]?.greeting || responses["en-IN"].greeting
      );
      setVoiceText(
        translations[nextLanguage]?.selected || translations["en-IN"].selected
      );
    }
  }, [appLanguage, language]);

  // Dashboard refresh every 30 seconds.
  useEffect(() => {
    loadDashboardData();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDashboardData]);

  // Dashboard calculations.
  const totalCrops = dashboardCrops.length;
  const totalOrders = dashboardOrders.length;

  const confirmedEarnings = salesAnalytics
  ? Number(salesAnalytics.total_revenue || 0)
  : dashboardOrders
      .filter(
        (order) =>
          String(order.status || "").toLowerCase() === "delivered"
      )
      .reduce(
        (sum, order) => sum + Number(order.total_price || 0),
        0
      );

  const totalAvailableStock = dashboardCrops.reduce(
    (sum, crop) => sum + Number(crop.quantity || 0),
    0
  );

  const lowStockCrops = dashboardCrops.filter(
    (crop) => Number(crop.quantity || 0) <= 10
  );

   // Only successfully delivered orders count as sales.
const deliveredOrders = dashboardOrders.filter(
  (order) =>
    String(order.status || "").trim().toLowerCase() === "delivered"
);

  // Selected sales date range.
  const currentDate = new Date();

  const todayStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const { rangeStart, rangeEnd, rangeLabel } = useMemo(() => {
    const start = new Date(todayStart);
    let end = new Date(todayStart);
    let label = ui.today;

    if (selectedSalesRange === "week") {
      const day = start.getDay();
      const daysFromMonday = (day + 6) % 7;

      start.setDate(start.getDate() - daysFromMonday);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      label = ui.thisWeek;
    } else if (selectedSalesRange === "month") {
      start.setDate(1);
      end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      label = ui.thisMonth;
    } else if (selectedSalesRange === "6months") {
      start.setDate(1);
      start.setMonth(start.getMonth() - 5);
      end = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      );
      label = ui.lastSixMonths;
    } else {
      end.setDate(end.getDate() + 1);
    }

    return { rangeStart: start, rangeEnd: end, rangeLabel: label };
  }, [selectedSalesRange, ui.today, ui.thisWeek, ui.thisMonth, ui.lastSixMonths]);

  // Filter delivered orders for the selected period.
  // Filter delivered orders using the selected date range.
const filteredDeliveredOrders = useMemo(() => {
  return deliveredOrders.filter((order) => {
    const orderDate = new Date(order.order_date || order.created_at);

    return (
      !Number.isNaN(orderDate.getTime()) &&
      orderDate >= rangeStart &&
      orderDate < rangeEnd
    );
  });
}, [deliveredOrders, rangeStart, rangeEnd]);

  // Monthly chart data.
  const monthlySales = useMemo(() => {
    if (selectedSalesRange === "6months") {
      const months = Array.from({ length: 6 }, (_, index) => {
        const monthDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - 5 + index,
          1
        );

        const monthKey = `${monthDate.getFullYear()}-${String(
          monthDate.getMonth() + 1
        ).padStart(2, "0")}`;

        return {
          key: monthKey,
          label: monthDate.toLocaleDateString(language, { month: "short" }),
          earnings: 0,
          orders: 0
        };
      });

      filteredDeliveredOrders.forEach((order) => {
        const date = new Date(order.order_date || order.created_at)
        if (Number.isNaN(date.getTime())) return;

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        const month = months.find((item) => item.key === key);

        if (month) {
          month.earnings += Number(order.total_price || 0);
          month.orders += 1;
        }
      });

      return months;
    }

    return [{
      key: selectedSalesRange,
      label: rangeLabel,
      earnings: filteredDeliveredOrders.reduce(
        (sum, order) => sum + Number(order.total_price || 0),
        0
      ),
      orders: filteredDeliveredOrders.length
    }];
  }, [selectedSalesRange, filteredDeliveredOrders, currentDate, language, rangeLabel]);

  const highestMonthlyEarnings = Math.max(
    ...monthlySales.map((month) => month.earnings),
    1
  );

  // Best-selling crops.
  const bestSellingCrops = useMemo(() => {
    const cropSalesMap = {};

    filteredDeliveredOrders.forEach((order) => {
      const cropName = order.crop_name || "Other";
      cropSalesMap[cropName] =
        (cropSalesMap[cropName] || 0) + Number(order.quantity || 0);
    });

    return Object.entries(cropSalesMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [filteredDeliveredOrders]);

  const highestCropQuantity = Math.max(
    ...bestSellingCrops.map((crop) => crop.quantity),
    1
  );

  const totalDeliveredOrders = filteredDeliveredOrders.length;

  const totalSelectedSales = filteredDeliveredOrders.reduce(
    (sum, order) => sum + Number(order.total_price || 0),
    0
  );
  const totalQuantitySold = filteredDeliveredOrders.reduce(
  (sum, order) => sum + Number(order.quantity || 0),
  0
);

  const recentOrders = [...dashboardOrders]
    .sort(
      (a, b) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
    )
    .slice(0, 4);

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2
    })}`;

  // Voice assistant.
  const getSpokenText = (message, englishFallback) => {
    if (language === "kn-IN") {
      return {
        text: englishFallback || "Your command has been processed.",
        lang: "en-US"
      };
    }

    return {
      text: message,
      lang: language === "hi-IN" ? "hi-IN" : "en-US"
    };
  };

  const speak = (message, onFinished, englishFallback) => {
    if (!mountedRef.current) return;

    setAssistantResponse(message);

    if (!("speechSynthesis" in window)) {
      setVoiceText(ui.speechUnsupported);
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

    utterance.onstart = () => {
      if (mountedRef.current) setVoiceText(ui.assistantSpeaking);
    };

    utterance.onend = () => {
      if (mountedRef.current) {
        setVoiceText(ui.responseCompleted);
        onFinished?.();
      }
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event.error);
      if (mountedRef.current) setVoiceText(ui.speechError);
    };

    const voice = window.speechSynthesis.getVoices().find(
      (item) => item.lang.toLowerCase() === spoken.lang.toLowerCase()
    );

    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  };

  const normalizeText = (value) =>
    value.toLowerCase().normalize("NFC")
      .replace(/[.,!?;:।]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const handleVoiceCommand = (command) => {
    const text = normalizeText(command);
    setVoiceText(`${ui.recognizedAs} "${command}"`);

    const stockDetails = dashboardCrops
      .filter((crop) => Number(crop.quantity || 0) > 0)
      .map((crop) => `${crop.crop_name}: ${Number(crop.quantity)} kilograms`);

    const stockMessage = language === "hi-IN"
      ? `आपके पास कुल ${totalAvailableStock} किलो स्टॉक है।`
      : language === "kn-IN"
      ? `ನಿಮ್ಮ ಬಳಿ ಒಟ್ಟು ${totalAvailableStock} ಕೆಜಿ ಸ್ಟಾಕ್ ಇದೆ.`
      : `You have a total of ${totalAvailableStock} kilograms of stock. Crop details: ${stockDetails.join(". ")}.`;

    const earningsMessage = language === "hi-IN"
      ? `आपकी कुल पुष्ट कमाई ${confirmedEarnings} रुपये है।`
      : language === "kn-IN"
      ? `ನಿಮ್ಮ ಒಟ್ಟು ದೃಢೀಕೃತ ಆದಾಯ ${confirmedEarnings} ರೂಪಾಯಿಗಳು.`
      : `Your total confirmed earnings are ${confirmedEarnings} rupees.`;

    const lowStockMessage = lowStockCrops.length === 0
      ? language === "hi-IN"
        ? "आपकी किसी भी फसल का स्टॉक कम नहीं है।"
        : language === "kn-IN"
        ? "ಯಾವುದೇ ಬೆಳೆಯಲ್ಲಿ ಕಡಿಮೆ ಸ್ಟಾಕ್ ಇಲ್ಲ."
        : "None of your crops have low stock."
      : `Your low stock crops are: ${lowStockCrops.map(
          (crop) => `${crop.crop_name}, ${crop.quantity} kilograms`
        ).join(", ")}.`;

    const commands = [
      {
        words: ["available stock", "total stock", "how much stock", "check stock",
          "stock available", "उपलब्ध स्टॉक", "कितना स्टॉक", "ಸ್ಟಾಕ್ ಎಷ್ಟು",
          "ಲಭ್ಯವಿರುವ ಸ್ಟಾಕ್"],
        response: stockMessage,
        fallback: `You have ${totalAvailableStock} kilograms of available crop stock.`,
        path: null,
        label: ui.stock
      },
      {
        words: ["total earnings", "my earnings", "confirmed earnings",
          "how much money", "total income", "मेरी कमाई", "कुल कमाई",
          "कितने पैसे", "ಒಟ್ಟು ಆದಾಯ", "ನನ್ನ ಆದಾಯ"],
        response: earningsMessage,
        fallback: `Your total confirmed earnings are ${confirmedEarnings} rupees.`,
        path: null,
        label: ui.earnings
      },
      {
        words: ["low stock", "show low stock", "which crops are low",
          "crops needing attention", "कम स्टॉक", "कम फसल", "ಕಡಿಮೆ ಸ್ಟಾಕ್"],
        response: lowStockMessage,
        fallback: "Check your dashboard for crops with low stock.",
        path: null,
        label: ui.lowStock
      },
      {
        words: ["add crop", "add a crop", "add new crop", "new crop",
          "create crop", "register crop", "post crop", "sell crop",
          "फसल जोड़ें", "नई फसल", "ಹೊಸ ಬೆಳೆ", "ಬೆಳೆ ಸೇರಿಸಿ"],
        response: reply.addCrop,
        fallback: "Opening the Add Crop page.",
        path: "/add-crop",
        label: ui.addCrop
      },
      {
        words: ["show my crops", "my crops", "my crop", "show crops",
          "view my crops", "see my crops", "list my crops", "crop list",
          "मेरी फसल", "फसल दिखाओ", "ನನ್ನ ಬೆಳೆ"],
        response: reply.myCrops,
        fallback: "Opening your crops page.",
        path: "/my-crops",
        label: ui.myCrops
      },
      {
        words: ["weather", "show weather", "check weather", "weather today",
          "temperature", "forecast", "rain", "मौसम", "आज का मौसम",
          "ಹವಾಮಾನ", "ಮಳೆ"],
        response: reply.weather,
        fallback: "Opening the weather page.",
        path: "/weather",
        label: ui.weather
      },
      {
        words: ["show my orders", "my orders", "show orders", "view orders",
          "check orders", "pending orders", "orders", "order",
          "मेरे ऑर्डर", "ऑर्डर दिखाओ", "ನನ್ನ ಆರ್ಡರ್‌ಗಳು"],
        response: reply.orders,
        fallback: "Opening your orders page.",
        path: "/orders",
        label: ui.orders
      },
      {
        words: ["open dashboard", "go to dashboard", "main dashboard",
          "dashboard", "go home", "home", "डैशबोर्ड", "ಹೋಮ್"],
        response: reply.dashboard,
        fallback: "You are on your farmer dashboard.",
        path: "/farmer-dashboard",
        label: ui.dashboard
      },
      {
        words: ["help", "commands", "what can you do", "what can i say",
          "मदद", "सहायता", "ಸಹಾಯ"],
        response: reply.help,
        fallback: ui.commandHelp,
        path: null,
        label: ui.help
      }
    ];

    const matchedCommand = commands.find((item) =>
      item.words.some((word) => text.includes(normalizeText(word)))
    );

    if (matchedCommand) {
      setVoiceText(
        `${ui.recognizedAs} "${command}" — ${matchedCommand.label}`
      );

      speak(
        matchedCommand.response,
        () => {
          if (mountedRef.current && matchedCommand.path) {
            navigate(matchedCommand.path);
          }
        },
        matchedCommand.fallback
      );
      return;
    }

    setVoiceText(
      `${ui.recognizedAs} "${command}" — ${ui.commandNotRecognized}`
    );

    speak(reply.unknown, null, "Sorry, I did not understand that command.");
  };

  const startListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak(reply.micError);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText(ui.listening);
    };

    recognition.onresult = (event) => {
      handleVoiceCommand(event.results[0][0].transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error === "not-allowed") {
        speak(reply.micDenied);
      } else if (event.error === "no-speech") {
        speak(reply.noSpeech);
      } else if (event.error === "network") {
        speak(reply.network);
      } else if (event.error !== "aborted") {
        speak(reply.unknown);
      }
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (error) {
      console.error("Recognition start error:", error);
      setIsListening(false);
      setVoiceText(ui.startError);
    }
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);

    const contextLanguageMap = {
      "en-IN": "en",
      "hi-IN": "hi",
      "kn-IN": "kn"
    };

    setAppLanguage(contextLanguageMap[newLanguage] || "en");

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setAssistantResponse(
      responses[newLanguage]?.greeting || responses["en-IN"].greeting
    );

    setVoiceText(
      translations[newLanguage]?.selected || translations["en-IN"].selected
    );
  };

  const repeatResponse = () => {
    const lastSpeech = lastSpeechRef.current;

    if (!lastSpeech.text) {
      speak(reply.greeting);
      return;
    }

    if (!("speechSynthesis" in window)) {
      setVoiceText(ui.speechUnsupported);
      return;
    }

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
      setVoiceText(ui.speechError);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Download only delivered orders from the selected date range.
  const downloadSalesReport = () => {
    if (filteredDeliveredOrders.length === 0) return;

    const headers = [
      "Order ID",
      "Crop Name",
      "Order Date",
      "Quantity (kg)",
      "Total Amount (INR)",
      "Order Status",
      "Payment Status"
    ];

    const rows = filteredDeliveredOrders.map((order) => [
      order.id ?? "",
      order.crop_name || "Other",
      order.order_date  || order.created_at || "",
      order.quantity ?? 0,
      order.total_price ?? 0,
      order.status || "",
      order.payment_status || ""
    ]);

    const escapeCSV = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `FarmConnect_Sales_Report_${selectedSalesRange}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const statusColor = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "accepted":
        return "bg-indigo-100 text-indigo-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f0]">
      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-72">
        {/* HEADER */}
        <header className="sticky top-0 z-30 flex flex-col gap-4 border-b border-green-100 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6 md:px-8 lg:pl-8">
          <div className="min-w-0 pl-14 sm:pl-0">
            <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
              FARMCONNECT AI
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              {ui.welcome}
            </h1>
            <p className="mt-1 text-gray-500">{ui.subtitle}</p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-amber-700">
              <Sun size={20} />
              <span className="font-semibold">
                {weatherLoading
                  ? ui.weatherLoading
                  : weather
                  ? `${Math.round(weather.temperature)}°C`
                  : "--°C"}
              </span>
            </div>

            <button
              onClick={loadDashboardData}
              className="rounded-xl border border-green-200 bg-white p-3 text-green-800 transition hover:bg-green-50"
              title={ui.refresh}
              aria-label={ui.refresh}
            >
              <RefreshCw size={20} />
            </button>

                        <button
              onClick={handleEnableNotifications}
              disabled={notificationLoading || notificationsEnabled}
              className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-semibold transition sm:flex-none sm:px-4 sm:text-sm ${
  notificationsEnabled
    ? "bg-green-100 text-green-800"
    : "bg-emerald-700 text-white hover:bg-emerald-800"
} disabled:cursor-not-allowed`}
            >
              <Bell size={20} />
              <span>
                {notificationLoading
                  ? "Enabling..."
                  : notificationsEnabled
                  ? "Notifications Enabled"
                  : "Enable Notifications"}
              </span>
            </button>

            <img
              src="https://ui-avatars.com/api/?name=Farmer&background=166534&color=fff"
              alt="Farmer profile"
              className="h-11 w-11 rounded-full border-2 border-green-100"
            />
          </div>
        </header>
                {notificationMessage && (
          <div className="mx-4 mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800 md:mx-8">
            {notificationMessage}
          </div>
        )}

        <div className="space-y-8 p-4 md:p-8">
          {dashboardError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <span>{dashboardError}</span>
              <button onClick={loadDashboardData} className="font-semibold underline">
                {ui.retry}
              </button>
            </div>
          )}

          {weatherError && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <span>{weatherError}</span>
              <button onClick={loadWeather} className="font-semibold underline">
                {ui.retry}
              </button>
            </div>
          )}

          {/* HERO AND VOICE ASSISTANT */}
          <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-950 via-green-800 to-emerald-600 p-4 text-white shadow-xl md:p-9">
            <div className="flex flex-col justify-between gap-7 xl:flex-row xl:items-center">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
                  <Sprout size={17} />
                  {ui.heroLabel}
                </div>

                <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                  {ui.tagline1}
                  <br />
                  {ui.tagline2}
                </h2>

                <p className="mt-3 max-w-xl leading-7 text-green-100">
                  {ui.farmDescription}
                </p>

                <button
                  onClick={() => navigate("/add-crop")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-green-900 shadow-lg transition hover:bg-green-50"
                >
                  <Sprout size={19} />
                  {ui.addCrop}
                </button>
              </div>

              <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white/15 p-3">
                    <Volume2 size={25} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{ui.assistant}</h3>
                    <p className="text-sm text-green-100">{ui.assistantDesc}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-sm text-green-100">
                    {ui.language}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-gray-900 outline-none"
                  >
                    <option value="en-IN">English</option>
                    <option value="hi-IN">हिंदी</option>
                    <option value="kn-IN">ಕನ್ನಡ</option>
                  </select>
                </div>

                <button
                  onClick={startListening}
                  className={`mt-4 flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-bold transition ${
                    isListening
                      ? "bg-red-100 text-red-800"
                      : "bg-white text-green-900 hover:bg-green-50"
                  }`}
                  title={isListening ? ui.stop : ui.start}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                  {isListening ? ui.stop : ui.start}
                </button>

                <div className="mt-4 rounded-xl bg-black/15 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-100">
                    {ui.recognized}
                  </p>
                  <p className="mt-1 break-words font-medium">{voiceText}</p>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-green-100">
                    {ui.response}
                  </p>
                  <p className="mt-1 break-words text-sm">{assistantResponse}</p>

                  <button
                    onClick={repeatResponse}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-white/50 underline-offset-4"
                  >
                    <Volume2 size={16} />
                    {ui.repeat}
                  </button>
                </div>

                <p className="mt-3 text-xs leading-5 text-green-100">
                  {ui.trySaying} {ui.addCrop} · {ui.myCrops} · {ui.weather} · {ui.orders} · {ui.stock} · {ui.earnings} · {ui.lowStock} · {ui.help}
                </p>
              </div>
            </div>
          </section>

          {/* DASHBOARD SUMMARY */}
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{ui.sales}</h2>
                <p className="mt-1 text-gray-500">{ui.liveInfo}</p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                {ui.autoRefresh}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <button
                onClick={() => navigate("/my-crops")}
                className="rounded-2xl border border-green-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                    <Sprout size={25} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {ui.inventoryLabel}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold text-gray-900">
                  {dashboardLoading ? "…" : totalCrops}
                </p>
                <p className="mt-1 font-medium text-gray-500">{ui.myCrops}</p>
              </button>

              <button
                onClick={() => navigate("/my-crops")}
                className="rounded-2xl border border-green-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-lime-50 p-3 text-lime-700">
                    <Package size={25} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {ui.stockLabel}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold text-gray-900">
                  {dashboardLoading ? "…" : `${totalAvailableStock} kg`}
                </p>
                <p className="mt-1 font-medium text-gray-500">{ui.stock}</p>
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="rounded-2xl border border-blue-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                    <ShoppingBag size={25} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {ui.activityLabel}
                  </span>
                </div>
                <p className="mt-5 text-3xl font-bold text-gray-900">
                  {dashboardLoading ? "…" : totalOrders}
                </p>
                <p className="mt-1 font-medium text-gray-500">{ui.orders}</p>
              </button>

              <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-amber-50 p-3 text-amber-700">
                    <IndianRupee size={25} />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {ui.paymentsLabel}
                  </span>
                </div>
                <p className="mt-5 break-words text-3xl font-bold text-gray-900">
                  {dashboardLoading ? "…" : formatMoney(confirmedEarnings)}
                </p>
                <p className="mt-1 font-medium text-gray-500">{ui.earnings}</p>
              </div>
            </div>
          </section>

          {/* LOW STOCK AND RECENT ORDERS */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    <AlertTriangle className="mr-2 inline text-amber-600" size={22} />
                    {ui.inventory}
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">{ui.lowStockDesc}</p>
                </div>
                <span className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
                  {dashboardLoading ? "…" : lowStockCrops.length}
                </span>
              </div>

              {dashboardLoading ? (
                <p className="mt-5 text-gray-500">{ui.loading}</p>
              ) : lowStockCrops.length === 0 ? (
                <div className="mt-5 rounded-xl border border-green-100 bg-green-50 p-5 text-green-800">
                  <CheckCircle2 className="mr-2 inline" size={20} />
                  {ui.noLowStock}
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {lowStockCrops.slice(0, 5).map((crop, index) => (
                    <div
                      key={crop.id ?? index}
                      className="flex items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50/70 p-4"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{crop.crop_name}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {crop.category || ui.crop}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-800">
                          {Number(crop.quantity || 0)} kg
                        </p>
                        <p className="text-xs text-amber-700">{ui.lowStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate("/my-crops")}
                className="mt-5 w-full rounded-xl border border-green-200 px-4 py-3 font-semibold text-green-800 transition hover:bg-green-50"
              >
                {ui.myCrops} →
              </button>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{ui.recent}</h2>
                  <p className="mt-2 text-sm text-gray-500">{ui.latestOrdersDesc}</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
                  <ShoppingBag size={23} />
                </div>
              </div>

              {dashboardLoading ? (
                <p className="mt-5 text-gray-500">{ui.loading}</p>
              ) : recentOrders.length === 0 ? (
                <div className="mt-5 rounded-xl bg-gray-50 p-5 text-gray-500">
                  {ui.noOrders}
                </div>
              ) : (
                <div className="mt-5 space-y-3">
                  {recentOrders.map((order, index) => (
                    <div
                      key={order.id ?? index}
                      className="rounded-xl border border-gray-100 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            {order.crop_name || ui.cropOrder}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {ui.quantity}: {order.quantity ?? "—"} kg
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {formatMoney(order.total_price)}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                          {order.status || ui.pending}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                        <span className="text-gray-500">{ui.payment}</span>
                        <span className={`font-semibold ${
                          String(order.payment_status || "").toLowerCase() === "paid"
                            ? "text-emerald-700"
                            : "text-amber-700"
                        }`}>
                          {order.payment_status || ui.pending}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => navigate("/orders")}
                className="mt-5 w-full rounded-xl bg-gray-900 px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
              >
                {ui.orders} →
              </button>
            </div>
          </section>

          {/* SALES ANALYTICS */}
          <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <TrendingUp size={25} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {ui.analyticsTitle}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {ui.analyticsDesc}
                </p>
              </div>
            </div>
                        {analyticsLoading && (
              <div className="mt-5 rounded-xl bg-blue-50 p-5 text-center text-blue-700">
                {ui.loading} Sales Analytics...
              </div>
            )}

            {!analyticsLoading && analyticsError && (
  <div
    role="alert"
    className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
  >
    <p className="font-semibold">
      Unable to load Sales Analytics
    </p>

    <p className="mt-1 text-sm">{analyticsError}</p>

    <button
      type="button"
      onClick={loadSalesAnalytics}
      className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
    >
      Retry
    </button>
  </div>
)}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-600">
                {ui.filterSales}
              </label>
              <select
                value={selectedSalesRange}
                onChange={(e) => setSelectedSalesRange(e.target.value)}
                className="w-full max-w-xs rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-600"
              >
                <option value="today">{ui.today}</option>
                <option value="week">{ui.thisWeek}</option>
                <option value="month">{ui.thisMonth}</option>
                <option value="6months">{ui.lastSixMonths}</option>
              </select>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-500">
                {ui.downloadDescription}
              </p>
              <button
                type="button"
                onClick={downloadSalesReport}
                disabled={filteredDeliveredOrders.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={18} />
                {ui.downloadReport}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-5">
                <p className="text-sm font-medium text-emerald-800">
                  {ui.monthlyEarnings}
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-950">
                  {formatMoney(totalSelectedSales)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">{rangeLabel}</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm font-medium text-blue-800">
                  {ui.deliveredOrders}
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-950">
                  {totalDeliveredOrders}
                </p>
                <p className="mt-1 text-xs text-blue-700">{rangeLabel}</p>
              </div>

              <div className="rounded-xl bg-amber-50 p-5">
                
                <p className="text-sm text-gray-500">{ui.quantitySold}</p>
<p className="text-2xl font-bold text-gray-900">
  {totalQuantitySold} kg
</p>
                <p className="mt-1 text-xs text-amber-700">{rangeLabel}</p>
              </div>
            </div>

            {/* EARNINGS CHART */}
            <div className="mt-7">
              <h3 className="font-bold text-gray-900">{ui.monthlyEarnings}</h3>

              {dashboardLoading ? (
                <p className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  {ui.loading}
                </p>
              ) : totalDeliveredOrders === 0 ? (
                <p className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  {ui.noSalesData}
                </p>
              ) : (
                <div className="mt-5 flex h-64 items-end justify-around gap-3 border-b border-gray-200 px-2">
                  {monthlySales.map((month) => (
                    <div
                      key={month.key}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="max-w-full truncate text-center text-xs font-semibold text-gray-700">
                        {formatMoney(month.earnings)}
                      </span>
                      <div className="flex h-40 w-full items-end justify-center">
                        <div
                          className="w-full max-w-12 rounded-t-lg bg-emerald-600 transition-all"
                          style={{
                            height: month.earnings > 0
                              ? `${Math.max(
                                  (month.earnings / highestMonthlyEarnings) * 100,
                                  4
                                )}%`
                              : "0%"
                          }}
                          title={`${month.label}: ${formatMoney(month.earnings)}`}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500">
                        {month.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* BEST-SELLING CROPS */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900">{ui.bestSellingCrops}</h3>

              {dashboardLoading ? (
                <p className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  {ui.loading}
                </p>
              ) : bestSellingCrops.length === 0 ? (
                <p className="mt-4 rounded-xl bg-gray-50 p-5 text-center text-gray-500">
                  {ui.noCropSales}
                </p>
              ) : (
                <div className="mt-4 space-y-4">
                  {bestSellingCrops.map((crop, index) => (
                    <div key={crop.name}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-800">
                          {index + 1}. {crop.name}
                        </span>
                        <span className="text-sm font-semibold text-emerald-700">
                          {crop.quantity} {ui.kgSold}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{
                            width: `${(crop.quantity / highestCropQuantity) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* CROP PRICE TREND ANALYSIS */}
          <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-emerald-700" size={25} />
                  <h2 className="text-xl font-bold text-gray-900">
                    {ui.cropPriceTitle}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-gray-500">{ui.cropPriceDesc}</p>
              </div>

              <select
                value={selectedPriceCrop}
                onChange={(e) => setSelectedPriceCrop(e.target.value)}
                className="rounded-xl border border-green-200 bg-white px-4 py-3 font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Tomato">{ui.tomato}</option>
                <option value="potato">{ui.potato}</option>
                <option value="cabbage">{ui.cabbage}</option>
              </select>
            </div>

            {priceLoading ? (
              <div className="mt-6 rounded-xl bg-green-50 p-8 text-center text-gray-600">
                {ui.loadingPrices}
              </div>
            ) : priceError ? (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
                <p>{priceError}</p>
                <button
                  onClick={loadPriceHistory}
                  className="mt-2 font-semibold underline"
                >
                  {ui.retry}
                </button>
              </div>
            ) : priceHistory.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                {ui.noPriceData} {selectedPriceCrop}.
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-sm text-emerald-800">{ui.latestPrice}</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-950">
                      ₹{Number(priceHistory[priceHistory.length - 1].average_price).toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">
                      {ui.perKg} · {priceHistory[priceHistory.length - 1].date}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">{ui.recordedDates}</p>
                    <p className="mt-1 text-2xl font-bold text-blue-950">
                      {priceHistory.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">{ui.priceChange}</p>
                    <p className="mt-1 text-2xl font-bold text-amber-950">
                      {priceHistory.length > 1
                        ? `${Number(
                            priceHistory[priceHistory.length - 1].average_price -
                            priceHistory[priceHistory.length - 2].average_price
                          ) > 0 ? "+" : ""}₹${(
                            Number(priceHistory[priceHistory.length - 1].average_price) -
                            Number(priceHistory[priceHistory.length - 2].average_price)
                          ).toFixed(2)}`
                        : "—"}
                    </p>
                    <p className="mt-1 text-xs text-amber-800">{ui.previousDate}</p>
                  </div>
                </div>

                {(() => {
                  const width = 700;
                  const height = 260;
                  const padding = { top: 25, right: 25, bottom: 45, left: 55 };

                  const values = priceHistory.map((item) =>
                    Number(item.average_price)
                  );

                  const minPrice = Math.min(...values);
                  const maxPrice = Math.max(...values);
                  const range = maxPrice - minPrice || 1;

                  const points = priceHistory.map((item, index) => {
                    const x = padding.left +
                      (priceHistory.length === 1
                        ? (width - padding.left - padding.right) / 2
                        : (index / (priceHistory.length - 1)) *
                          (width - padding.left - padding.right));

                    const y = height - padding.bottom -
                      ((Number(item.average_price) - minPrice) / range) *
                      (height - padding.top - padding.bottom);

                    return { ...item, x, y };
                  });

                  const polylinePoints = points
                    .map((point) => `${point.x},${point.y}`)
                    .join(" ");

                  return (
                    <div className="mt-6 rounded-xl border border-gray-100 p-3 sm:p-5">
                      <h3 className="mb-2 font-semibold text-gray-800">
                        {selectedPriceCrop} {ui.priceChartTitle}
                      </h3>

                      <div className="w-full overflow-x-auto">
                        <svg
                          viewBox={`0 0 ${width} ${height}`}
                          className="h-auto min-w-[500px] w-full"
                          role="img"
                          aria-label={`${ui.priceChartTitle}: ${selectedPriceCrop}`}
                        >
                          {[0, 1, 2, 3].map((step) => {
                            const y = padding.top +
                              (step / 3) *
                              (height - padding.top - padding.bottom);

                            const price = maxPrice - (step / 3) * range;

                            return (
                              <g key={step}>
                                <line
                                  x1={padding.left}
                                  y1={y}
                                  x2={width - padding.right}
                                  y2={y}
                                  stroke="#e5e7eb"
                                  strokeDasharray="4 4"
                                />
                                <text
                                  x={padding.left - 8}
                                  y={y + 4}
                                  fontSize="12"
                                  textAnchor="end"
                                  fill="#6b7280"
                                >
                                  ₹{price.toFixed(0)}
                                </text>
                              </g>
                            );
                          })}

                          {points.length > 1 && (
                            <polyline
                              points={polylinePoints}
                              fill="none"
                              stroke="#047857"
                              strokeWidth="3"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                            />
                          )}

                          {points.map((point) => (
                            <g key={`${point.date}-${point.x}`}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="#047857"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <title>
                                  {point.date}: ₹{Number(point.average_price).toFixed(2)}/kg
                                </title>
                              </circle>

                              <text
                                x={point.x}
                                y={height - 15}
                                fontSize={points.length > 5 ? "10" : "11"}
                                textAnchor="middle"
                                fill="#6b7280"
                              >
                                {point.date.slice(5)}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                  );
                })()}

                <p className="mt-4 text-xs leading-5 text-gray-500">
                  {ui.priceDisclaimer}
                </p>
              </>
            )}
          </section>

          {/* FARMING OVERVIEW */}
          <section className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm md:p-7">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                <CloudSun size={25} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {ui.farmingAtGlance}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {ui.farmingDescription}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-green-50 p-4">
                <p className="text-sm text-green-800">{ui.listedVarieties}</p>
                <p className="mt-1 text-2xl font-bold text-green-950">
                  {dashboardLoading ? "…" : totalCrops}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4">
                <p className="text-sm text-blue-800">{ui.ordersReceived}</p>
                <p className="mt-1 text-2xl font-bold text-blue-950">
                  {dashboardLoading ? "…" : totalOrders}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-4">
                <p className="text-sm text-amber-800">{ui.cropsAttention}</p>
                <p className="mt-1 text-2xl font-bold text-amber-950">
                  {dashboardLoading ? "…" : lowStockCrops.length}
                </p>
              </div>
            </div>
          </section>

          <footer className="pb-3 text-center text-sm text-gray-400">
            {ui.footer}
          </footer>
        </div>
      </main>
    </div>
  );
}

export default FarmerDashboard;
