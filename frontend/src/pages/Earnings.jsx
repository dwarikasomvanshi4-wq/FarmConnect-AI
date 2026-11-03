
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Earnings() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const farmerEmail =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email");

  useEffect(() => {
    const loadOrders = async () => {
      if (!farmerEmail) {
        setError("Please log in to view your earnings overview.");
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
        setError("Could not load your orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [farmerEmail]);

  const pendingOrders = orders.filter(
    (order) => order.status === "Pending"
  );

  const acceptedOrders = orders.filter(
    (order) => order.status === "Accepted"
  );

  const rejectedOrders = orders.filter(
    (order) => order.status === "Rejected"
  );

  const acceptedOrderValue = acceptedOrders.reduce(
    (total, order) => total + Number(order.total_price || 0),
    0
  );

  const pendingOrderValue = pendingOrders.reduce(
    (total, order) => total + Number(order.total_price || 0),
    0
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
    return <div style={{ padding: 32 }}>Loading your earnings overview...</div>;
  }

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
          ← Go Back
        </button>

        <p style={{ color: "#398153", fontWeight: "bold", marginTop: 28 }}>
          FARMCONNECT AI
        </p>

        <h1 style={{ marginBottom: 8 }}>My Earnings</h1>

        <p style={{ color: "#718176", lineHeight: 1.7 }}>
          Track the value and status of orders placed for your crops.
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
              <div style={cardStyle}>
                <p style={{ color: "#718176", marginTop: 0 }}>
                  Accepted Order Value
                </p>
                <h2 style={{ color: "#176b42", marginBottom: 8 }}>
                  {money(acceptedOrderValue)}
                </h2>
                <p style={{ color: "#718176", fontSize: 13, marginBottom: 0 }}>
                  {acceptedOrders.length} accepted order(s)
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#718176", marginTop: 0 }}>
                  Pending Orders
                </p>
                <h2 style={{ color: "#b7791f", marginBottom: 8 }}>
                  {pendingOrders.length}
                </h2>
                <p style={{ color: "#718176", fontSize: 13, marginBottom: 0 }}>
                  Order value: {money(pendingOrderValue)}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#718176", marginTop: 0 }}>
                  Rejected Orders
                </p>
                <h2 style={{ color: "#b83232", marginBottom: 8 }}>
                  {rejectedOrders.length}
                </h2>
                <p style={{ color: "#718176", fontSize: 13, marginBottom: 0 }}>
                  Not included in accepted order value
                </p>
              </div>

              <div style={cardStyle}>
                <p style={{ color: "#718176", marginTop: 0 }}>
                  Total Orders
                </p>
                <h2 style={{ marginBottom: 8 }}>{orders.length}</h2>
                <p style={{ color: "#718176", fontSize: 13, marginBottom: 0 }}>
                  All order statuses
                </p>
              </div>
            </div>

            <div style={{ ...cardStyle, marginTop: 26, overflowX: "auto" }}>
              <h2 style={{ marginTop: 0 }}>Order History</h2>

              {orders.length === 0 ? (
                <p style={{ color: "#718176" }}>
                  No orders found for your account yet.
                </p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    textAlign: "left",
                    minWidth: 650,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f4f8f3" }}>
                      {["Crop", "Quantity", "Order Value", "Date", "Status"].map(
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p style={{ marginTop: 18, color: "#718176", fontSize: 13, lineHeight: 1.6 }}>
              Note: Accepted order value is not confirmed income or proof of
              payment. Actual earnings require payment tracking in the backend.
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
              Manage Orders
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Earnings;
