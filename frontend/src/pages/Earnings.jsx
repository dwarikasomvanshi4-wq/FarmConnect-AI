
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

const translations = {
  en: {
    back: "← Go Back",
    title: "My Earnings",
    description: "Track completed sales, payment status, and orders placed for your crops.",
    loading: "Loading your earnings overview...",
    login: "Please log in to view your earnings overview.",
    error: "Could not load your orders. Please try again.",
    completed: "Completed Sales Value",
    delivered: "delivered order(s)",
    accepted: "Accepted Orders",
    pending: "Pending Orders",
    rejected: "Rejected Orders",
    shipped: "Shipped Orders",
    confirmed: "Confirmed Payments",
    paid: "paid order(s)",
    deliveredPending: "Delivered, Payment Pending",
    awaitingPayment: "order(s) awaiting payment confirmation",
    total: "Total Orders",
    allStatuses: "All order statuses",
    orderValue: "Order value:",
    excluded: "Excluded from completed sales",
    awaitingDelivery: "Awaiting delivery",
    history: "Order History",
    noOrders: "No orders found for your account yet.",
    crop: "Crop",
    quantity: "Quantity",
    value: "Order Value",
    date: "Date",
    status: "Status",
    paymentStatus: "Payment Status",
    paymentPending: "Pending",
    explanation: "Completed sales value includes delivered orders. Confirmed payments include only orders marked Paid in the backend. A delivered COD order is not counted as confirmed payment until the farmer confirms receipt of cash.",
    manage: "Manage Orders",
  },
  hi: {
    back: "← वापस जाएँ",
    title: "मेरी कमाई",
    description: "पूरी हुई बिक्री, भुगतान की स्थिति और आपकी फसलों के ऑर्डर देखें।",
    loading: "कमाई की जानकारी लोड हो रही है...",
    login: "कमाई देखने के लिए कृपया लॉग इन करें।",
    error: "आपके ऑर्डर लोड नहीं हो सके। कृपया फिर से प्रयास करें।",
    completed: "पूरी हुई बिक्री का मूल्य",
    delivered: "डिलीवर किए गए ऑर्डर",
    accepted: "स्वीकृत ऑर्डर",
    pending: "लंबित ऑर्डर",
    rejected: "अस्वीकृत ऑर्डर",
    shipped: "भेजे गए ऑर्डर",
    confirmed: "पुष्ट भुगतान",
    paid: "भुगतान किए गए ऑर्डर",
    deliveredPending: "डिलीवर हुए, भुगतान लंबित",
    awaitingPayment: "ऑर्डर के भुगतान की पुष्टि बाकी है",
    total: "कुल ऑर्डर",
    allStatuses: "सभी ऑर्डर स्थितियाँ",
    orderValue: "ऑर्डर का मूल्य:",
    excluded: "पूरी हुई बिक्री में शामिल नहीं",
    awaitingDelivery: "डिलीवरी बाकी है",
    history: "ऑर्डर इतिहास",
    noOrders: "अभी आपके खाते में कोई ऑर्डर नहीं मिला।",
    crop: "फसल",
    quantity: "मात्रा",
    value: "ऑर्डर का मूल्य",
    date: "तारीख",
    status: "स्थिति",
    paymentStatus: "भुगतान की स्थिति",
    paymentPending: "लंबित",
    explanation: "पूरी हुई बिक्री में डिलीवर किए गए ऑर्डर शामिल हैं। पुष्ट भुगतान में केवल वे ऑर्डर शामिल हैं जिन्हें बैकएंड में Paid चिह्नित किया गया है। डिलीवर किया गया COD ऑर्डर तब तक पुष्ट भुगतान नहीं माना जाता जब तक किसान नकद प्राप्ति की पुष्टि न करे।",
    manage: "ऑर्डर प्रबंधित करें",
  },
  kn: {
    back: "← ಹಿಂದಕ್ಕೆ ಹೋಗಿ",
    title: "ನನ್ನ ಆದಾಯ",
    description: "ಪೂರ್ಣಗೊಂಡ ಮಾರಾಟ, ಪಾವತಿ ಸ್ಥಿತಿ ಮತ್ತು ನಿಮ್ಮ ಬೆಳೆಗಳಿಗೆ ಬಂದ ಆರ್ಡರ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    loading: "ನಿಮ್ಮ ಆದಾಯದ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    login: "ನಿಮ್ಮ ಆದಾಯವನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ.",
    error: "ನಿಮ್ಮ ಆರ್ಡರ್‌ಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    completed: "ಪೂರ್ಣಗೊಂಡ ಮಾರಾಟದ ಮೌಲ್ಯ",
    delivered: "ವಿತರಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    accepted: "ಸ್ವೀಕರಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    pending: "ಬಾಕಿ ಇರುವ ಆರ್ಡರ್‌ಗಳು",
    rejected: "ತಿರಸ್ಕರಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    shipped: "ರವಾನಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    confirmed: "ದೃಢೀಕೃತ ಪಾವತಿಗಳು",
    paid: "ಪಾವತಿಸಿದ ಆರ್ಡರ್‌ಗಳು",
    deliveredPending: "ವಿತರಿಸಲಾಗಿದೆ, ಪಾವತಿ ಬಾಕಿ ಇದೆ",
    awaitingPayment: "ಆರ್ಡರ್‌ಗಳ ಪಾವತಿ ದೃಢೀಕರಣ ಬಾಕಿ ಇದೆ",
    total: "ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು",
    allStatuses: "ಎಲ್ಲಾ ಆರ್ಡರ್ ಸ್ಥಿತಿಗಳು",
    orderValue: "ಆರ್ಡರ್ ಮೌಲ್ಯ:",
    excluded: "ಪೂರ್ಣಗೊಂಡ ಮಾರಾಟದಲ್ಲಿ ಸೇರಿಸಲಾಗಿಲ್ಲ",
    awaitingDelivery: "ವಿತರಣೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ",
    history: "ಆರ್ಡರ್ ಇತಿಹಾಸ",
    noOrders: "ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    crop: "ಬೆಳೆ",
    quantity: "ಪ್ರಮಾಣ",
    value: "ಆರ್ಡರ್ ಮೌಲ್ಯ",
    date: "ದಿನಾಂಕ",
    status: "ಸ್ಥಿತಿ",
    paymentStatus: "ಪಾವತಿ ಸ್ಥಿತಿ",
    paymentPending: "ಬಾಕಿ ಇದೆ",
    explanation: "ಪೂರ್ಣಗೊಂಡ ಮಾರಾಟದಲ್ಲಿ ವಿತರಿಸಿದ ಆರ್ಡರ್‌ಗಳು ಸೇರಿವೆ. ದೃಢೀಕೃತ ಪಾವತಿಗಳಲ್ಲಿ ಬ್ಯಾಕೆಂಡ್‌ನಲ್ಲಿ Paid ಎಂದು ಗುರುತಿಸಿದ ಆರ್ಡರ್‌ಗಳು ಮಾತ್ರ ಸೇರಿವೆ. ರೈತರು ನಗದು ಸ್ವೀಕೃತಿಯನ್ನು ದೃಢೀಕರಿಸುವವರೆಗೆ ವಿತರಿಸಿದ COD ಆರ್ಡರ್ ದೃಢೀಕೃತ ಪಾವತಿಯಾಗಿ ಪರಿಗಣಿಸಲಾಗುವುದಿಲ್ಲ.",
    manage: "ಆರ್ಡರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ",
  },
};

function Earnings() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const lang = translations[language] ? language : "en";
  const t = translations[lang];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const farmerEmail =
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("email");

  useEffect(() => {
    const loadOrders = async () => {
      if (!farmerEmail) {
        setError(t.login);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/farmer-orders/${encodeURIComponent(farmerEmail)}`
        );
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load earnings:", err);
        setError(t.error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [farmerEmail, t.login, t.error]);

  const pendingOrders = orders.filter(
    (order) => ["Pending", "Accepted"].includes(order.status)
  );

  const acceptedOrders = orders.filter(
    (order) => order.status === "Accepted"
  );

  const rejectedOrders = orders.filter(
    (order) => order.status === "Rejected"
  );

  const shippedOrders = orders.filter(
    (order) => order.status === "Shipped"
  );

  const deliveredOrders = orders.filter(
    (order) => order.status === "Delivered"
  );

  const paidOrders = orders.filter(
    (order) => (order.payment_status || "").toLowerCase() === "paid"
  );

  const pendingPaymentOrders = orders.filter(
    (order) => (order.payment_status || "Pending").toLowerCase() !== "paid"
  );

  const completedSalesValue = deliveredOrders.reduce(
    (total, order) => total + Number(order.total_price || 0), 0
  );

  const acceptedOrderValue = acceptedOrders.reduce(
    (total, order) => total + Number(order.total_price || 0), 0
  );

  const pendingOrderValue = pendingOrders.reduce(
    (total, order) => total + Number(order.total_price || 0), 0
  );

  const confirmedPaymentsValue = paidOrders.reduce(
    (total, order) => total + Number(order.total_price || 0), 0
  );

  const pendingPaymentValue = pendingPaymentOrders.reduce(
    (total, order) => total + Number(order.total_price || 0), 0
  );

  const money = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const cardStyle = {
    background: "#fff",
    border: "1px solid #e1ebe2",
    borderRadius: "16px",
    padding: "22px",
    boxShadow: "0 5px 18px rgba(28, 74, 44, 0.05)",
  };

  if (loading) {
    return <div style={{ padding: 32 }}>{t.loading}</div>;
  }

  const cards = [
    {
      title: t.completed,
      value: money(completedSalesValue),
      detail: `${deliveredOrders.length} ${t.delivered}`,
      color: "#176b42",
    },
    {
      title: t.accepted,
      value: acceptedOrders.length,
      detail: `${t.orderValue} ${money(acceptedOrderValue)}`,
      color: "#2766a3",
    },
    {
      title: t.pending,
      value: pendingOrders.length,
      detail: `${t.orderValue} ${money(pendingOrderValue)}`,
      color: "#b7791f",
    },
    {
      title: t.rejected,
      value: rejectedOrders.length,
      detail: t.excluded,
      color: "#b83232",
    },
    {
      title: t.shipped,
      value: shippedOrders.length,
      detail: t.awaitingDelivery,
      color: "#805ad5",
    },
    {
      title: t.confirmed,
      value: money(confirmedPaymentsValue),
      detail: `${paidOrders.length} ${t.paid}`,
      color: "#176b42",
    },
    {
      title: t.deliveredPending,
      value: money(pendingPaymentValue),
      detail: `${pendingPaymentOrders.length} ${t.awaitingPayment}`,
      color: "#b7791f",
    },
    {
      title: t.total,
      value: orders.length,
      detail: t.allStatuses,
      color: "#203528",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "#f4f8f3",
        fontFamily: "Arial, sans-serif",
        color: "#203528",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 15px",
            border: "1px solid #dce8dc",
            borderRadius: 9,
            background: "#fff",
            cursor: "pointer",
            color: "#28553b",
          }}
        >
          {t.back}
        </button>

        <p style={{ color: "#398153", fontWeight: "bold", marginTop: 28 }}>
          FARMCONNECT AI
        </p>

        <h1 style={{ marginBottom: 8 }}>{t.title}</h1>

        <p style={{ color: "#718176", lineHeight: 1.7 }}>
          {t.description}
        </p>

        {error && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              background: "#fff1f0",
              color: "#a12b25",
              borderRadius: 10,
            }}
          >
            {error}
          </div>
        )}

        {!error && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 18,
                marginTop: 28,
              }}
            >
              {cards.map((card) => (
                <div style={cardStyle} key={card.title}>
                  <p style={{ color: "#718176", marginTop: 0 }}>
                    {card.title}
                  </p>
                  <h2 style={{ color: card.color, marginBottom: 8 }}>
                    {card.value}
                  </h2>
                  <p style={{ color: "#718176", fontSize: 13, marginBottom: 0 }}>
                    {card.detail}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, marginTop: 26, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>{t.history}</h2>

              {orders.length === 0 ? (
                <p style={{ color: "#718176" }}>{t.noOrders}</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    minWidth: 750,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f4f8f3" }}>
                      {[t.crop, t.quantity, t.value, t.date, t.status, t.paymentStatus].map(
                        (heading) => (
                          <th
                            key={heading}
                            style={{
                              padding: 13,
                              borderBottom: "1px solid #e1ebe2",
                            }}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {order.crop_name}
                        </td>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {order.quantity}
                        </td>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {money(Number(order.total_price || 0))}
                        </td>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {order.order_date}
                        </td>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {order.status}
                        </td>
                        <td style={{ padding: 13, borderBottom: "1px solid #edf1ed" }}>
                          {order.payment_status || t.paymentPending}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p style={{ marginTop: 18, color: "#718176", fontSize: 13, lineHeight: 1.6 }}>
              {t.explanation}
            </p>

            <button
              onClick={() => navigate("/orders")}
              style={{
                marginTop: 8,
                padding: "12px 18px",
                border: "none",
                borderRadius: 10,
                background: "#176b42",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {t.manage}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Earnings;
