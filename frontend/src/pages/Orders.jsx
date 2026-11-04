
import { useCallback, useEffect, useState } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  CalendarDays,
  UserRound,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

const translations = {
  en: {
    title: "📦 Farmer Orders",
    subtitle: "Manage orders and update delivery progress.",
    refresh: "Refresh",
    loggedInAs: "Logged in as",
    notLoggedIn: "Not logged in",
    loading: "Loading orders...",
    noOrders: "No Orders Yet",
    noOrdersDescription: "Orders placed by buyers will appear here.",
    totalOrders: "Total Orders",
    pending: "Pending",
    inProgress: "In Progress",
    delivered: "Delivered",
    buyer: "Buyer",
    notAvailable: "Not available",
    quantity: "Quantity",
    totalAmount: "Total Amount",
    orderDate: "Order Date",
    dateUnavailable: "Date unavailable",
    deliveryAddress: "Delivery Address",
    addressUnavailable: "Address unavailable",
    payment: "Payment",
    cashOnDelivery: "Cash on Delivery",
    paymentStatus: "Payment status",
    orderProgress: "Order Progress",
    rejectedMessage: "This order was rejected.",
    deliveredMessage: "Order delivered successfully.",
    confirmPayment: "Confirm COD Payment Received",
    confirmingPayment: "Confirming Payment...",
    cashConfirmed: "Cash payment confirmed",
    nextAction: "Next Action",
    acceptOrder: "Accept Order",
    rejectOrder: "Reject Order",
    markShipped: "Mark as Shipped",
    markDelivered: "Mark as Delivered",
    updating: "Updating...",
    loginAgain: "Please log in again.",
    loadError: "Failed to load orders. Please try again.",
    updateError: "Unable to update order. Please try again.",
    paymentError: "Unable to confirm payment. Please try again.",
    confirmStatus: (id, status) =>
      `Change order #${id} to "${status}"?`,
    statusUpdated: (id, status) =>
      `Order #${id} updated to ${status}.`,
    confirmCash: (amount, id) =>
      `Confirm that you received ₹${amount} in cash for order #${id}?`,
    paymentMarked: (id) =>
      `Payment for order #${id} marked as Paid.`,
    statuses: {
      Pending: "Pending",
      Accepted: "Accepted",
      Rejected: "Rejected",
      Shipped: "Shipped",
      Delivered: "Delivered",
      Paid: "Paid",
    },
  },

  hi: {
    title: "📦 किसान के ऑर्डर",
    subtitle: "ऑर्डर प्रबंधित करें और डिलीवरी की प्रगति अपडेट करें।",
    refresh: "रिफ्रेश करें",
    loggedInAs: "लॉग इन अकाउंट",
    notLoggedIn: "लॉग इन नहीं है",
    loading: "ऑर्डर लोड हो रहे हैं...",
    noOrders: "अभी कोई ऑर्डर नहीं है",
    noOrdersDescription: "खरीदारों द्वारा दिए गए ऑर्डर यहाँ दिखाई देंगे।",
    totalOrders: "कुल ऑर्डर",
    pending: "लंबित",
    inProgress: "प्रगति में",
    delivered: "डिलीवर हो चुके",
    buyer: "खरीदार",
    notAvailable: "उपलब्ध नहीं",
    quantity: "मात्रा",
    totalAmount: "कुल राशि",
    orderDate: "ऑर्डर की तारीख",
    dateUnavailable: "तारीख उपलब्ध नहीं",
    deliveryAddress: "डिलीवरी का पता",
    addressUnavailable: "पता उपलब्ध नहीं",
    payment: "भुगतान",
    cashOnDelivery: "डिलीवरी पर नकद भुगतान",
    paymentStatus: "भुगतान की स्थिति",
    orderProgress: "ऑर्डर की प्रगति",
    rejectedMessage: "यह ऑर्डर अस्वीकार कर दिया गया है।",
    deliveredMessage: "ऑर्डर सफलतापूर्वक डिलीवर हो गया।",
    confirmPayment: "नकद भुगतान प्राप्ति की पुष्टि करें",
    confirmingPayment: "भुगतान की पुष्टि हो रही है...",
    cashConfirmed: "नकद भुगतान की पुष्टि हो गई",
    nextAction: "अगला कदम",
    acceptOrder: "ऑर्डर स्वीकार करें",
    rejectOrder: "ऑर्डर अस्वीकार करें",
    markShipped: "भेजा गया चिह्नित करें",
    markDelivered: "डिलीवर हुआ चिह्नित करें",
    updating: "अपडेट हो रहा है...",
    loginAgain: "कृपया दोबारा लॉग इन करें।",
    loadError: "ऑर्डर लोड नहीं हो पाए। कृपया फिर से प्रयास करें।",
    updateError: "ऑर्डर अपडेट नहीं हो पाया। कृपया फिर से प्रयास करें।",
    paymentError: "भुगतान की पुष्टि नहीं हो पाई। कृपया फिर से प्रयास करें।",
    confirmStatus: (id, status) =>
      `क्या आप ऑर्डर #${id} की स्थिति "${status}" करना चाहते हैं?`,
    statusUpdated: (id, status) =>
      `ऑर्डर #${id} की स्थिति ${status} कर दी गई है।`,
    confirmCash: (amount, id) =>
      `क्या आपको ऑर्डर #${id} के लिए ₹${amount} नकद प्राप्त हुए हैं?`,
    paymentMarked: (id) =>
      `ऑर्डर #${id} का भुगतान पूरा चिह्नित कर दिया गया है।`,
    statuses: {
      Pending: "लंबित",
      Accepted: "स्वीकार किया गया",
      Rejected: "अस्वीकार किया गया",
      Shipped: "भेज दिया गया",
      Delivered: "डिलीवर हो गया",
      Paid: "भुगतान हो गया",
    },
  },

  kn: {
    title: "📦 ರೈತರ ಆರ್ಡರ್‌ಗಳು",
    subtitle: "ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಡೆಲಿವರಿ ಪ್ರಗತಿಯನ್ನು ನವೀಕರಿಸಿ.",
    refresh: "ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    loggedInAs: "ಲಾಗಿನ್ ಖಾತೆ",
    notLoggedIn: "ಲಾಗಿನ್ ಆಗಿಲ್ಲ",
    loading: "ಆರ್ಡರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    noOrders: "ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ",
    noOrdersDescription: "ಖರೀದಿದಾರರು ನೀಡಿದ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    totalOrders: "ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು",
    pending: "ಬಾಕಿ ಇದೆ",
    inProgress: "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    delivered: "ಡೆಲಿವರಿ ಆಗಿದೆ",
    buyer: "ಖರೀದಿದಾರರು",
    notAvailable: "ಲಭ್ಯವಿಲ್ಲ",
    quantity: "ಪ್ರಮಾಣ",
    totalAmount: "ಒಟ್ಟು ಮೊತ್ತ",
    orderDate: "ಆರ್ಡರ್ ದಿನಾಂಕ",
    dateUnavailable: "ದಿನಾಂಕ ಲಭ್ಯವಿಲ್ಲ",
    deliveryAddress: "ಡೆಲಿವರಿ ವಿಳಾಸ",
    addressUnavailable: "ವಿಳಾಸ ಲಭ್ಯವಿಲ್ಲ",
    payment: "ಪಾವತಿ",
    cashOnDelivery: "ಡೆಲಿವರಿ ಸಮಯದಲ್ಲಿ ನಗದು ಪಾವತಿ",
    paymentStatus: "ಪಾವತಿ ಸ್ಥಿತಿ",
    orderProgress: "ಆರ್ಡರ್ ಪ್ರಗತಿ",
    rejectedMessage: "ಈ ಆರ್ಡರ್ ಅನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.",
    deliveredMessage: "ಆರ್ಡರ್ ಯಶಸ್ವಿಯಾಗಿ ಡೆಲಿವರಿ ಆಗಿದೆ.",
    confirmPayment: "ನಗದು ಪಾವತಿ ಸ್ವೀಕೃತಿಯನ್ನು ದೃಢೀಕರಿಸಿ",
    confirmingPayment: "ಪಾವತಿಯನ್ನು ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    cashConfirmed: "ನಗದು ಪಾವತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    nextAction: "ಮುಂದಿನ ಕ್ರಮ",
    acceptOrder: "ಆರ್ಡರ್ ಸ್ವೀಕರಿಸಿ",
    rejectOrder: "ಆರ್ಡರ್ ತಿರಸ್ಕರಿಸಿ",
    markShipped: "ರವಾನಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    markDelivered: "ಡೆಲಿವರಿ ಆಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
    updating: "ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ...",
    loginAgain: "ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    loadError: "ಆರ್ಡರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    updateError: "ಆರ್ಡರ್ ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    paymentError: "ಪಾವತಿಯನ್ನು ದೃಢೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    confirmStatus: (id, status) =>
      `ಆರ್ಡರ್ #${id} ಸ್ಥಿತಿಯನ್ನು "${status}" ಎಂದು ಬದಲಾಯಿಸಬೇಕೇ?`,
    statusUpdated: (id, status) =>
      `ಆರ್ಡರ್ #${id} ಸ್ಥಿತಿಯನ್ನು ${status} ಎಂದು ನವೀಕರಿಸಲಾಗಿದೆ.`,
    confirmCash: (amount, id) =>
      `ಆರ್ಡರ್ #${id} ಗಾಗಿ ₹${amount} ನಗದು ಸ್ವೀಕರಿಸಿರುವುದನ್ನು ದೃಢೀಕರಿಸುತ್ತೀರಾ?`,
    paymentMarked: (id) =>
      `ಆರ್ಡರ್ #${id} ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ.`,
    statuses: {
      Pending: "ಬಾಕಿ ಇದೆ",
      Accepted: "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
      Rejected: "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
      Shipped: "ರವಾನಿಸಲಾಗಿದೆ",
      Delivered: "ಡೆಲಿವರಿ ಆಗಿದೆ",
      Paid: "ಪಾವತಿಯಾಗಿದೆ",
    },
  },
};

function Orders() {
  const { language } = useLanguage();

  const lang = translations[language] ? language : "en";
  const t = translations[lang];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const farmerEmail =
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("email");

  const getTranslatedStatus = (status) => {
    const originalStatus = status || "Pending";
    return t.statuses[originalStatus] || originalStatus;
  };

  const loadOrders = useCallback(async () => {
    if (!farmerEmail) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(
        `/farmer-orders/${encodeURIComponent(farmerEmail)}`
      );

      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading farmer orders:", err);

      alert(err.response?.data?.error || t.loadError);
    } finally {
      setLoading(false);
    }
  }, [farmerEmail, t.loadError]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, newStatus) => {
    if (!farmerEmail) {
      alert(t.loginAgain);
      return;
    }

    const confirmation = window.confirm(
      t.confirmStatus(order.id, getTranslatedStatus(newStatus))
    );

    if (!confirmation) return;

    try {
      setUpdatingOrderId(order.id);

      await api.put(`/update-order/${order.id}`, {
        status: newStatus,
        farmer_email: farmerEmail,
      });

      await loadOrders();

      alert(t.statusUpdated(order.id, getTranslatedStatus(newStatus)));
    } catch (err) {
      console.error("Update order error:", err);

      alert(err.response?.data?.error || t.updateError);

      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const confirmCODPayment = async (order) => {
    if (!farmerEmail) {
      alert(t.loginAgain);
      return;
    }

    const amount = Number(order.total_price || 0).toFixed(2);

    const confirmation = window.confirm(
      t.confirmCash(amount, order.id)
    );

    if (!confirmation) return;

    try {
      setUpdatingOrderId(order.id);

      await api.put(`/confirm-cod-payment/${order.id}`, {
        farmer_email: farmerEmail,
      });

      await loadOrders();

      alert(t.paymentMarked(order.id));
    } catch (err) {
      console.error("COD payment confirmation error:", err);

      alert(err.response?.data?.error || t.paymentError);

      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusStyle = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getNextAction = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "pending":
        return [
          { label: t.acceptOrder, status: "Accepted", color: "green" },
          { label: t.rejectOrder, status: "Rejected", color: "red" },
        ];
      case "accepted":
        return [
          { label: t.markShipped, status: "Shipped", color: "blue" },
        ];
      case "shipped":
        return [
          { label: t.markDelivered, status: "Delivered", color: "green" },
        ];
      default:
        return [];
    }
  };

  const getProgressStep = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "accepted":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      case "rejected":
        return 0;
      default:
        return 1;
    }
  };

  const progressSteps = [
    { key: "Pending", label: t.statuses.Pending },
    { key: "Accepted", label: t.statuses.Accepted },
    { key: "Shipped", label: t.statuses.Shipped },
    { key: "Delivered", label: t.statuses.Delivered },
  ];

  const summaryCards = [
    {
      label: t.totalOrders,
      count: orders.length,
      style: "text-gray-800",
    },
    {
      label: t.pending,
      count: orders.filter(
        (o) => (o.status || "Pending").toLowerCase() === "pending"
      ).length,
      style: "text-yellow-700",
    },
    {
      label: t.inProgress,
      count: orders.filter((o) =>
        ["accepted", "shipped"].includes((o.status || "").toLowerCase())
      ).length,
      style: "text-blue-700",
    },
    {
      label: t.delivered,
      count: orders.filter(
        (o) => (o.status || "").toLowerCase() === "delivered"
      ).length,
      style: "text-green-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                {t.title}
              </h1>

              <p className="mt-2 text-green-100">
                {t.subtitle}
              </p>
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              {t.refresh}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">{t.loggedInAs}</p>

          <p className="mt-1 break-all font-semibold text-green-700">
            {farmerEmail || t.notLoggedIn}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow">
            <p className="text-gray-600">{t.loading}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow">
            <Package size={52} className="mx-auto text-gray-400" />

            <h2 className="mt-4 text-2xl font-bold text-gray-700">
              {t.noOrders}
            </h2>

            <p className="mt-2 text-gray-500">
              {t.noOrdersDescription}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {summaryCards.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <p className="text-sm text-gray-500">
                    {item.label}
                  </p>

                  <p className={`mt-2 text-3xl font-bold ${item.style}`}>
                    {item.count}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => {
                const status = order.status || "Pending";
                const normalizedStatus = status.toLowerCase();
                const actions = getNextAction(status);
                const isUpdating = updatingOrderId === order.id;
                const progressStep = getProgressStep(status);

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-lg transition hover:shadow-xl"
                  >
                    <div className="bg-green-50 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-xl font-bold text-green-800">
                            {order.crop_name || "Crop"}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            Order #{order.id}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(status)}`}
                        >
                          {getTranslatedStatus(status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="flex gap-3">
                        <UserRound
                          className="mt-1 shrink-0 text-gray-400"
                          size={19}
                        />

                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">
                            {t.buyer}
                          </p>

                          <p className="break-all font-medium">
                            {order.buyer_email || t.notAvailable}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Package
                          className="mt-1 shrink-0 text-gray-400"
                          size={19}
                        />

                        <div>
                          <p className="text-sm text-gray-500">
                            {t.quantity}
                          </p>

                          <p className="font-semibold">
                            {order.quantity} kg
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          {t.totalAmount}
                        </p>

                        <p className="text-2xl font-bold text-green-700">
                          ₹{Number(order.total_price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <CalendarDays
                          className="mt-1 shrink-0 text-gray-400"
                          size={19}
                        />

                        <div>
                          <p className="text-sm text-gray-500">
                            {t.orderDate}
                          </p>

                          <p className="font-medium">
                            {order.order_date || t.dateUnavailable}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <MapPin
                          className="mt-1 shrink-0 text-gray-400"
                          size={19}
                        />

                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">
                            {t.deliveryAddress}
                          </p>

                          <p className="whitespace-pre-wrap break-words font-medium">
                            {order.delivery_address || t.addressUnavailable}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <CreditCard
                          className="mt-1 shrink-0 text-gray-400"
                          size={19}
                        />

                        <div>
                          <p className="text-sm text-gray-500">
                            {t.payment}
                          </p>

                          <p className="font-semibold">
                            {String(order.payment_method || "COD")
                              .trim()
                              .toUpperCase() === "COD"
                              ? t.cashOnDelivery
                              : order.payment_method}
                          </p>

                          <p className="text-sm text-gray-600">
                            {t.paymentStatus}:{" "}
                            {getTranslatedStatus(
                              order.payment_status || "Pending"
                            )}
                          </p>
                        </div>
                      </div>

                      {normalizedStatus !== "rejected" && (
                        <div className="border-t pt-5">
                          <p className="mb-4 text-sm font-semibold text-gray-600">
                            {t.orderProgress}
                          </p>

                          <div className="space-y-3">
                            {progressSteps.map((step, index) => {
                              const stepNumber = index + 1;
                              const complete = progressStep >= stepNumber;

                              return (
                                <div
                                  key={step.key}
                                  className="flex items-center gap-3"
                                >
                                  {complete ? (
                                    <CheckCircle2
                                      size={20}
                                      className="shrink-0 text-green-600"
                                    />
                                  ) : (
                                    <div className="h-5 w-5 shrink-0 rounded-full border-2 border-gray-300" />
                                  )}

                                  <span
                                    className={
                                      complete
                                        ? "font-semibold text-green-700"
                                        : "text-gray-400"
                                    }
                                  >
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {normalizedStatus === "rejected" && (
                        <div className="rounded-xl bg-red-50 p-4 text-center font-semibold text-red-700">
                          <XCircle className="mx-auto mb-2" size={25} />
                          {t.rejectedMessage}
                        </div>
                      )}

                      {normalizedStatus === "delivered" && (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-green-50 p-4 text-center font-semibold text-green-700">
                            <Truck className="mx-auto mb-2" size={25} />
                            {t.deliveredMessage}
                          </div>

                          {String(order.payment_method || "COD")
                            .trim()
                            .toUpperCase() === "COD" &&
                            String(order.payment_status || "Pending")
                              .trim()
                              .toLowerCase() !== "paid" && (
                              <button
                                onClick={() => confirmCODPayment(order)}
                                disabled={isUpdating}
                                className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isUpdating
                                  ? t.confirmingPayment
                                  : t.confirmPayment}
                              </button>
                            )}

                          {String(order.payment_status || "")
                            .trim()
                            .toLowerCase() === "paid" && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700">
                              ✓ {t.cashConfirmed}
                            </div>
                          )}
                        </div>
                      )}

                      {actions.length > 0 && (
                        <div className="space-y-3 border-t pt-5">
                          <p className="text-sm font-semibold text-gray-600">
                            {t.nextAction}
                          </p>

                          {actions.map((action) => {
                            const colorClasses = {
                              green: "bg-green-600 hover:bg-green-700",
                              red: "bg-red-600 hover:bg-red-700",
                              blue: "bg-blue-600 hover:bg-blue-700",
                            };

                            return (
                              <button
                                key={action.status}
                                onClick={() => updateStatus(order, action.status)}
                                disabled={isUpdating}
                                className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${colorClasses[action.color]}`}
                              >
                                {isUpdating ? t.updating : action.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Orders;
