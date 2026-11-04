
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import {
  ArrowLeft,
  RefreshCw,
  Package,
  User,
  Calendar,
  IndianRupee,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CreditCard,
  XCircle,
} from "lucide-react";

const translations = {
  en: {
    myOrders: "My Orders",
    trackPurchases: "Track your purchases from farmers",
    refresh: "Refresh",
    refreshing: "Refreshing...",
    loggedInAs: "Logged in as",
    emailUnavailable: "Email not available",
    totalOrders: "Total orders",
    pending: "Pending",
    inTransit: "In transit",
    loginAgain: "Buyer email not found. Please log in again.",
    unableToLoad: "Unable to load orders. Please try again.",
    tryAgain: "Try again",
    loadingOrders: "Loading Orders...",
    noOrders: "No Orders Yet",
    noOrdersDescription: "Your orders will appear here after you purchase a crop.",
    browseCrops: "Browse Crops",
    crop: "Crop",
    order: "Order",
    accepted: "Accepted",
    shipped: "Shipped",
    delivered: "Delivered",
    rejected: "Rejected",
    farmer: "Farmer",
    notAvailable: "Not available",
    quantity: "Quantity",
    kg: "Kg",
    totalAmount: "Total Amount",
    orderDate: "Order Date",
    dateUnavailable: "Date unavailable",
    deliveryAddress: "Delivery Address",
    addressUnavailable: "Address not available for this order.",
    paymentMethod: "Payment Method",
    cashOnDelivery: "Cash on Delivery",
    paymentStatus: "Payment Status",
    paid: "Paid",
    unpaid: "Pending",
    paymentNotConfirmed: "Payment is not yet confirmed as received.",
    orderRejected: "Order Rejected",
    orderStatus: "Order Status",
    acceptedMessage: "The farmer accepted your order. It is being prepared.",
    shippedMessage: "Your order has been marked as shipped by the farmer.",
    deliveredMessage: "Your order has been marked as delivered.",
    rejectedMessage: "The farmer rejected this order. You can browse other crops.",
    pendingMessage: "Your order has been placed and is waiting for the farmer's response.",
    orderTracking: "Order Tracking",
    orderPlaced: "Order Placed",
    orderCreated: "Your order has been created.",
    orderAccepted: "Order Accepted",
    farmerAccepted: "The farmer accepted your order.",
    orderShipped: "Order Shipped",
    farmerShipped: "The farmer marked your order as shipped.",
    deliveredStep: "Delivered",
    orderDelivered: "The order is marked as delivered.",
    currentStage: "Current stage",
    rejectedFurther: "This order will not proceed further.",
    browseOtherCrops: "Browse Other Crops",
    autoRefresh: "Order status refreshes automatically every 5 seconds.",
    backDashboard: "Back to buyer dashboard",
  },

  hi: {
    myOrders: "मेरे ऑर्डर",
    trackPurchases: "किसानों से की गई अपनी खरीदारी ट्रैक करें",
    refresh: "रीफ्रेश करें",
    refreshing: "रीफ्रेश हो रहा है...",
    loggedInAs: "लॉग इन किया गया",
    emailUnavailable: "ईमेल उपलब्ध नहीं है",
    totalOrders: "कुल ऑर्डर",
    pending: "लंबित",
    inTransit: "रास्ते में",
    loginAgain: "खरीदार का ईमेल नहीं मिला। कृपया दोबारा लॉग इन करें।",
    unableToLoad: "ऑर्डर लोड नहीं हो सके। कृपया फिर से कोशिश करें।",
    tryAgain: "फिर से कोशिश करें",
    loadingOrders: "ऑर्डर लोड हो रहे हैं...",
    noOrders: "अभी तक कोई ऑर्डर नहीं",
    noOrdersDescription: "फसल खरीदने के बाद आपके ऑर्डर यहाँ दिखाई देंगे।",
    browseCrops: "फसलें देखें",
    crop: "फसल",
    order: "ऑर्डर",
    accepted: "स्वीकार किया गया",
    shipped: "भेज दिया गया",
    delivered: "डिलीवर हो गया",
    rejected: "अस्वीकार किया गया",
    farmer: "किसान",
    notAvailable: "उपलब्ध नहीं",
    quantity: "मात्रा",
    kg: "किलो",
    totalAmount: "कुल राशि",
    orderDate: "ऑर्डर की तारीख",
    dateUnavailable: "तारीख उपलब्ध नहीं",
    deliveryAddress: "डिलीवरी का पता",
    addressUnavailable: "इस ऑर्डर का पता उपलब्ध नहीं है।",
    paymentMethod: "भुगतान का तरीका",
    cashOnDelivery: "डिलीवरी पर नकद भुगतान",
    paymentStatus: "भुगतान की स्थिति",
    paid: "भुगतान हो गया",
    unpaid: "लंबित",
    paymentNotConfirmed: "भुगतान प्राप्त होने की अभी पुष्टि नहीं हुई है।",
    orderRejected: "ऑर्डर अस्वीकार किया गया",
    orderStatus: "ऑर्डर की स्थिति",
    acceptedMessage: "किसान ने आपका ऑर्डर स्वीकार कर लिया है। तैयारी की जा रही है।",
    shippedMessage: "किसान ने आपके ऑर्डर को भेज दिया है।",
    deliveredMessage: "आपके ऑर्डर की डिलीवरी पूरी हो गई है।",
    rejectedMessage: "किसान ने यह ऑर्डर अस्वीकार कर दिया है। आप दूसरी फसलें देख सकते हैं।",
    pendingMessage: "आपका ऑर्डर दर्ज हो गया है और किसान के जवाब का इंतजार है।",
    orderTracking: "ऑर्डर ट्रैकिंग",
    orderPlaced: "ऑर्डर दिया गया",
    orderCreated: "आपका ऑर्डर बनाया गया है।",
    orderAccepted: "ऑर्डर स्वीकार किया गया",
    farmerAccepted: "किसान ने आपका ऑर्डर स्वीकार कर लिया है।",
    orderShipped: "ऑर्डर भेज दिया गया",
    farmerShipped: "किसान ने ऑर्डर भेज दिया है।",
    deliveredStep: "डिलीवर हो गया",
    orderDelivered: "ऑर्डर की डिलीवरी पूरी हो गई है।",
    currentStage: "वर्तमान चरण",
    rejectedFurther: "यह ऑर्डर आगे नहीं बढ़ेगा।",
    browseOtherCrops: "दूसरी फसलें देखें",
    autoRefresh: "ऑर्डर की स्थिति हर 5 सेकंड में अपने आप अपडेट होती है।",
    backDashboard: "खरीदार डैशबोर्ड पर वापस जाएँ",
  },

  kn: {
    myOrders: "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
    trackPurchases: "ರೈತರಿಂದ ನೀವು ಖರೀದಿಸಿದ ಉತ್ಪನ್ನಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ",
    refresh: "ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    refreshing: "ರಿಫ್ರೆಶ್ ಆಗುತ್ತಿದೆ...",
    loggedInAs: "ಲಾಗಿನ್ ಆಗಿರುವವರು",
    emailUnavailable: "ಇಮೇಲ್ ಲಭ್ಯವಿಲ್ಲ",
    totalOrders: "ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು",
    pending: "ಬಾಕಿ ಇದೆ",
    inTransit: "ದಾರಿಯಲ್ಲಿದೆ",
    loginAgain: "ಖರೀದಿದಾರರ ಇಮೇಲ್ ಸಿಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    unableToLoad: "ಆರ್ಡರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    tryAgain: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    loadingOrders: "ಆರ್ಡರ್‌ಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...",
    noOrders: "ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ",
    noOrdersDescription: "ನೀವು ಬೆಳೆ ಖರೀದಿಸಿದ ನಂತರ ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    browseCrops: "ಬೆಳೆಗಳನ್ನು ನೋಡಿ",
    crop: "ಬೆಳೆ",
    order: "ಆರ್ಡರ್",
    accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    shipped: "ರವಾನಿಸಲಾಗಿದೆ",
    delivered: "ತಲುಪಿಸಲಾಗಿದೆ",
    rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    farmer: "ರೈತ",
    notAvailable: "ಲಭ್ಯವಿಲ್ಲ",
    quantity: "ಪ್ರಮಾಣ",
    kg: "ಕೆ.ಜಿ.",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    orderDate: "ಆರ್ಡರ್ ದಿನಾಂಕ",
    dateUnavailable: "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ",
    deliveryAddress: "ವಿತರಣಾ ವಿಳಾಸ",
    addressUnavailable: "ಈ ಆರ್ಡರ್‌ಗೆ ವಿಳಾಸ ಲಭ್ಯವಿಲ್ಲ.",
    paymentMethod: "ಪಾವತಿ ವಿಧಾನ",
    cashOnDelivery: "ವಿತರಣೆಯ ಸಮಯದಲ್ಲಿ ನಗದು ಪಾವತಿ",
    paymentStatus: "ಪಾವತಿ ಸ್ಥಿತಿ",
    paid: "ಪಾವತಿಸಲಾಗಿದೆ",
    unpaid: "ಬಾಕಿ ಇದೆ",
    paymentNotConfirmed: "ಪಾವತಿ ಸ್ವೀಕರಿಸಿರುವುದು ಇನ್ನೂ ದೃಢಪಟ್ಟಿಲ್ಲ.",
    orderRejected: "ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    orderStatus: "ಆರ್ಡರ್ ಸ್ಥಿತಿ",
    acceptedMessage: "ರೈತರು ನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿದ್ದಾರೆ. ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ.",
    shippedMessage: "ರೈತರು ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ರವಾನಿಸಿದ್ದಾರೆ.",
    deliveredMessage: "ನಿಮ್ಮ ಆರ್ಡರ್ ತಲುಪಿಸಲಾಗಿದೆ.",
    rejectedMessage: "ರೈತರು ಈ ಆರ್ಡರ್ ಅನ್ನು ತಿರಸ್ಕರಿಸಿದ್ದಾರೆ. ನೀವು ಬೇರೆ ಬೆಳೆಗಳನ್ನು ನೋಡಬಹುದು.",
    pendingMessage: "ನಿಮ್ಮ ಆರ್ಡರ್ ದಾಖಲಿಸಲಾಗಿದೆ. ರೈತರ ಪ್ರತಿಕ್ರಿಯೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ.",
    orderTracking: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    orderPlaced: "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ",
    orderCreated: "ನಿಮ್ಮ ಆರ್ಡರ್ ರಚಿಸಲಾಗಿದೆ.",
    orderAccepted: "ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    farmerAccepted: "ರೈತರು ನಿಮ್ಮ ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿದ್ದಾರೆ.",
    orderShipped: "ಆರ್ಡರ್ ರವಾನಿಸಲಾಗಿದೆ",
    farmerShipped: "ರೈತರು ನಿಮ್ಮ ಆರ್ಡರ್ ಅನ್ನು ರವಾನಿಸಿದ್ದಾರೆ.",
    deliveredStep: "ತಲುಪಿಸಲಾಗಿದೆ",
    orderDelivered: "ಆರ್ಡರ್ ತಲುಪಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.",
    currentStage: "ಪ್ರಸ್ತುತ ಹಂತ",
    rejectedFurther: "ಈ ಆರ್ಡರ್ ಮುಂದುವರಿಯುವುದಿಲ್ಲ.",
    browseOtherCrops: "ಬೇರೆ ಬೆಳೆಗಳನ್ನು ನೋಡಿ",
    autoRefresh: "ಆರ್ಡರ್ ಸ್ಥಿತಿ ಪ್ರತಿ 5 ಸೆಕೆಂಡಿಗೆ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತದೆ.",
    backDashboard: "ಖರೀದಿದಾರರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ",
  },
};

function BuyerOrders() {
  const navigate = useNavigate();
  const { language: appLanguage } = useLanguage();

  const language = translations[appLanguage] ? appLanguage : "en";
  const t = (key) => translations[language][key] || translations.en[key] || key;

  const locale =
    language === "hi" ? "hi-IN" : language === "kn" ? "kn-IN" : "en-IN";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const buyerEmail =
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("email");

  const loadOrders = useCallback(
    async (manual = false) => {
      if (
        !buyerEmail ||
        buyerEmail === "null" ||
        buyerEmail === "undefined"
      ) {
        setError("Buyer email not found. Please log in again.");
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        if (manual) setRefreshing(true);
        else if (orders.length === 0) setLoading(true);

        setError("");

        const res = await api.get(
          `/buyer-orders/${encodeURIComponent(buyerEmail)}`
        );

        const fetchedOrders = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.orders)
          ? res.data.orders
          : [];

        setOrders(fetchedOrders);
      } catch (err) {
        console.error("Error loading buyer orders:", err);
        setError(
          err.response?.data?.error ||
            "Unable to load orders. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [buyerEmail]
  );

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const normaliseStatus = (status) =>
    String(status || "Pending").trim().toLowerCase();

  const translateStatus = (status) => {
    switch (normaliseStatus(status)) {
      case "pending":
        return t("pending");
      case "accepted":
        return t("accepted");
      case "shipped":
        return t("shipped");
      case "delivered":
        return t("delivered");
      case "rejected":
        return t("rejected");
      default:
        return status || t("pending");
    }
  };

  const translatePaymentStatus = (status) => {
    const value = String(status || "Pending").trim().toLowerCase();

    if (value === "paid" || value === "completed" || value === "success") {
      return t("paid");
    }

    if (value === "pending") {
      return t("unpaid");
    }

    return status || t("unpaid");
  };

  const getStatusStyle = (status) => {
    switch (normaliseStatus(status)) {
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "delivered":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusMessage = (status) => {
    switch (normaliseStatus(status)) {
      case "accepted":
        return t("acceptedMessage");
      case "shipped":
        return t("shippedMessage");
      case "delivered":
        return t("deliveredMessage");
      case "rejected":
        return t("rejectedMessage");
      default:
        return t("pendingMessage");
    }
  };

  const trackingSteps = [
    {
      status: "Pending",
      label: t("orderPlaced"),
      description: t("orderCreated"),
      icon: Package,
    },
    {
      status: "Accepted",
      label: t("orderAccepted"),
      description: t("farmerAccepted"),
      icon: CheckCircle,
    },
    {
      status: "Shipped",
      label: t("orderShipped"),
      description: t("farmerShipped"),
      icon: Truck,
    },
    {
      status: "Delivered",
      label: t("deliveredStep"),
      description: t("orderDelivered"),
      icon: CheckCircle,
    },
  ];

  const getStepIndex = (status) => {
    const value = normaliseStatus(status);

    if (value === "pending") return 0;
    if (value === "accepted") return 1;
    if (value === "shipped") return 2;
    if (value === "delivered") return 3;

    return -1;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-5 md:px-8 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="bg-white text-green-700 p-2 rounded-lg hover:bg-green-100 transition"
              aria-label={t("backDashboard")}
              title={t("backDashboard")}
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {t("myOrders")}
              </h1>
              <p className="text-green-100 mt-1">{t("trackPurchases")}</p>
            </div>
          </div>

          <button
            onClick={() => loadOrders(true)}
            disabled={loading || refreshing}
            className="bg-white text-green-700 px-3 md:px-4 py-2 rounded-xl flex items-center gap-2 font-semibold hover:bg-green-100 transition disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">
              {refreshing ? t("refreshing") : t("refresh")}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">
          <p className="text-gray-500 text-sm">{t("loggedInAs")}</p>
          <p className="font-bold text-green-700 text-lg break-all">
            {buyerEmail || t("emailUnavailable")}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-green-50 text-green-700 px-3 py-2 rounded-lg">
              {t("totalOrders")}: {orders.length}
            </span>
            <span className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg">
              {t("pending")}:{" "}
              {orders.filter(
                (o) => normaliseStatus(o.status) === "pending"
              ).length}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
              {t("inTransit")}:{" "}
              {orders.filter(
                (o) => normaliseStatus(o.status) === "shipped"
              ).length}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            <p>
              {error === "Buyer email not found. Please log in again."
                ? t("loginAgain")
                : error === "Unable to load orders. Please try again."
                ? t("unableToLoad")
                : error}
            </p>
            <button
              onClick={() => loadOrders(true)}
              className="mt-2 font-semibold underline"
            >
              {t("tryAgain")}
            </button>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <RefreshCw
              size={40}
              className="mx-auto text-green-600 animate-spin"
            />
            <h2 className="text-xl font-bold text-gray-600 mt-4">
              {t("loadingOrders")}
            </h2>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={60} className="mx-auto text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-500 mt-5">
              {t("noOrders")}
            </h2>
            <p className="text-gray-400 mt-2">{t("noOrdersDescription")}</p>

            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              {t("browseCrops")}
            </button>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="space-y-7">
            {orders.map((order) => {
              const status = String(order.status || "Pending").trim();
              const statusKey = normaliseStatus(status);
              const activeStep = getStepIndex(status);
              const rejected = statusKey === "rejected";
              const paymentMethod = order.payment_method || "COD";
              const paymentStatus = order.payment_status || "Pending";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="bg-green-50 px-5 md:px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-green-800">
                        🌾 {order.crop_name || t("crop")}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        {t("order")} #{order.id}
                      </p>
                    </div>

                    <span
                      className={`self-start sm:self-auto px-4 py-2 rounded-full font-bold ${getStatusStyle(status)}`}
                    >
                      {rejected ? (
                        <XCircle size={16} className="inline mr-1" />
                      ) : statusKey === "delivered" ? (
                        <CheckCircle size={16} className="inline mr-1" />
                      ) : (
                        <Clock size={16} className="inline mr-1" />
                      )}
                      {translateStatus(status)}
                    </span>
                  </div>

                  <div className="p-5 md:p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <User size={23} className="text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-500 text-sm">{t("farmer")}</p>
                          <p className="font-semibold break-all">
                            {order.farmer_email || t("notAvailable")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Package size={23} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t("quantity")}</p>
                          <p className="font-semibold">
                            {order.quantity} {t("kg")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-100 p-3 rounded-xl">
                          <IndianRupee size={23} className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t("totalAmount")}</p>
                          <p className="text-xl font-bold text-green-700">
                            ₹{Number(order.total_price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-purple-100 p-3 rounded-xl">
                          <Calendar size={23} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">{t("orderDate")}</p>
                          <p className="font-semibold">
                            {order.order_date
                              ? new Date(order.order_date).toLocaleString(locale)
                              : t("dateUnavailable")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={22}
                          className="text-green-700 mt-1 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-800">
                            {t("deliveryAddress")}
                          </p>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                            {order.delivery_address || t("addressUnavailable")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <div className="border border-gray-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <CreditCard size={18} />
                          {t("paymentMethod")}
                        </div>
                        <p className="font-bold mt-2">
                          {String(paymentMethod).toUpperCase() === "COD"
                            ? t("cashOnDelivery")
                            : paymentMethod}
                        </p>
                      </div>

                      <div className="border border-gray-200 p-4 rounded-xl">
                        <p className="text-gray-500 text-sm">
                          {t("paymentStatus")}
                        </p>
                        <p
                          className={`font-bold mt-2 ${
                            ["paid", "completed", "success"].includes(
                              String(paymentStatus).toLowerCase()
                            )
                              ? "text-green-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {translatePaymentStatus(paymentStatus)}
                        </p>
                        {!["paid", "completed", "success"].includes(
                          String(paymentStatus).toLowerCase()
                        ) && (
                          <p className="text-gray-500 text-sm mt-1">
                            {t("paymentNotConfirmed")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className={`mt-6 p-5 rounded-xl ${getStatusStyle(status)}`}>
                      <p className="font-bold text-lg">
                        {rejected
                          ? t("orderRejected")
                          : `${t("orderStatus")}: ${translateStatus(status)}`}
                      </p>
                      <p className="mt-1">{getStatusMessage(status)}</p>
                    </div>

                    {!rejected && (
                      <div className="mt-7">
                        <h3 className="text-lg font-bold text-gray-800 mb-5">
                          {t("orderTracking")}
                        </h3>

                        <div className="space-y-5">
                          {trackingSteps.map((step, index) => {
                            const StepIcon = step.icon;
                            const completed = index <= activeStep;

                            return (
                              <div
                                key={step.status}
                                className="flex items-start gap-4"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      completed
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                                  >
                                    <StepIcon size={20} />
                                  </div>

                                  {index < trackingSteps.length - 1 && (
                                    <div
                                      className={`w-1 h-8 ${
                                        index < activeStep
                                          ? "bg-green-500"
                                          : "bg-gray-200"
                                      }`}
                                    />
                                  )}
                                </div>

                                <div className="pt-1">
                                  <p
                                    className={`font-bold ${
                                      completed
                                        ? "text-green-700"
                                        : "text-gray-500"
                                    }`}
                                  >
                                    {step.label}
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {step.description}
                                  </p>
                                  {index === activeStep && (
                                    <span className="inline-block mt-2 text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      {t("currentStage")}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {rejected && (
                      <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="font-semibold text-red-700">
                          {t("rejectedFurther")}
                        </p>
                        <button
                          onClick={() => navigate("/buyer-dashboard")}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          {t("browseOtherCrops")}
                        </button>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs mt-6">
                      {t("autoRefresh")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BuyerOrders;
