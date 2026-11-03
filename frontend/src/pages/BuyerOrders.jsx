
import { useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
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

function BuyerOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const buyerEmail =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email");

  const loadOrders = useCallback(async (manual = false) => {
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
  }, [buyerEmail]);

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadOrders]);

  const normaliseStatus = (status) =>
    String(status || "Pending").trim().toLowerCase();

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
        return "The farmer accepted your order. It is being prepared.";
      case "shipped":
        return "Your order has been marked as shipped by the farmer.";
      case "delivered":
        return "Your order has been marked as delivered.";
      case "rejected":
        return "The farmer rejected this order. You can browse other crops.";
      default:
        return "Your order has been placed and is waiting for the farmer's response.";
    }
  };

  const trackingSteps = [
    {
      status: "Pending",
      label: "Order Placed",
      description: "Your order has been created.",
      icon: Package,
    },
    {
      status: "Accepted",
      label: "Order Accepted",
      description: "The farmer accepted your order.",
      icon: CheckCircle,
    },
    {
      status: "Shipped",
      label: "Order Shipped",
      description: "The farmer marked your order as shipped.",
      icon: Truck,
    },
    {
      status: "Delivered",
      label: "Delivered",
      description: "The order is marked as delivered.",
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
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white px-5 md:px-8 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="bg-white text-green-700 p-2 rounded-lg hover:bg-green-100 transition"
              aria-label="Back to buyer dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                My Orders
              </h1>
              <p className="text-green-100 mt-1">
                Track your purchases from farmers
              </p>
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
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Buyer information */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">
          <p className="text-gray-500 text-sm">Logged in as</p>
          <p className="font-bold text-green-700 text-lg break-all">
            {buyerEmail || "Email not available"}
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="bg-green-50 text-green-700 px-3 py-2 rounded-lg">
              Total orders: {orders.length}
            </span>
            <span className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg">
              Pending: {orders.filter(
                (o) => normaliseStatus(o.status) === "pending"
              ).length}
            </span>
            <span className="bg-purple-50 text-purple-700 px-3 py-2 rounded-lg">
              In transit: {orders.filter(
                (o) => normaliseStatus(o.status) === "shipped"
              ).length}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
            <p>{error}</p>
            <button
              onClick={() => loadOrders(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
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
              Loading Orders...
            </h2>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={60} className="mx-auto text-gray-400" />
            <h2 className="text-3xl font-bold text-gray-500 mt-5">
              No Orders Yet
            </h2>
            <p className="text-gray-400 mt-2">
              Your orders will appear here after you purchase a crop.
            </p>

            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="mt-6 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Browse Crops
            </button>
          </div>
        )}

        {/* Order cards */}
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
                  {/* Order heading */}
                  <div className="bg-green-50 px-5 md:px-6 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-green-800">
                        🌾 {order.crop_name || "Crop"}
                      </h2>
                      <p className="text-gray-500 mt-1">
                        Order #{order.id}
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
                      {status}
                    </span>
                  </div>

                  <div className="p-5 md:p-6">
                    {/* Order details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-green-100 p-3 rounded-xl">
                          <User size={23} className="text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-500 text-sm">Farmer</p>
                          <p className="font-semibold break-all">
                            {order.farmer_email || "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                          <Package size={23} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Quantity</p>
                          <p className="font-semibold">
                            {order.quantity} Kg
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-100 p-3 rounded-xl">
                          <IndianRupee size={23} className="text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Total Amount</p>
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
                          <p className="text-gray-500 text-sm">Order Date</p>
                          <p className="font-semibold">
                            {order.order_date
                              ? new Date(
                                  order.order_date
                                ).toLocaleString()
                              : "Date unavailable"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Delivery address */}
                    <div className="mt-6 bg-gray-50 border border-gray-200 p-4 rounded-xl">
                      <div className="flex items-start gap-3">
                        <MapPin
                          size={22}
                          className="text-green-700 mt-1 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-gray-800">
                            Delivery Address
                          </p>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                            {order.delivery_address ||
                              "Address not available for this order."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Payment information */}
                    <div className="mt-4 grid sm:grid-cols-2 gap-4">
                      <div className="border border-gray-200 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <CreditCard size={18} />
                          Payment Method
                        </div>
                        <p className="font-bold mt-2">
                          {String(paymentMethod).toUpperCase() === "COD"
                            ? "Cash on Delivery"
                            : paymentMethod}
                        </p>
                      </div>

                      <div className="border border-gray-200 p-4 rounded-xl">
                        <p className="text-gray-500 text-sm">
                          Payment Status
                        </p>
                        <p
                          className={`font-bold mt-2 ${
                            String(paymentStatus).toLowerCase() === "paid"
                              ? "text-green-700"
                              : "text-yellow-700"
                          }`}
                        >
                          {paymentStatus}
                        </p>
                        {String(paymentStatus).toLowerCase() !== "paid" && (
                          <p className="text-gray-500 text-sm mt-1">
                            Payment is not yet confirmed as received.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Current status message */}
                    <div className={`mt-6 p-5 rounded-xl ${getStatusStyle(status)}`}>
                      <p className="font-bold text-lg">
                        {rejected ? "Order Rejected" : `Order Status: ${status}`}
                      </p>
                      <p className="mt-1">{getStatusMessage(status)}</p>
                    </div>

                    {/* Tracking timeline */}
                    {!rejected && (
                      <div className="mt-7">
                        <h3 className="text-lg font-bold text-gray-800 mb-5">
                          Order Tracking
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
                                      Current stage
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
                          This order will not proceed further.
                        </p>
                        <button
                          onClick={() => navigate("/buyer-dashboard")}
                          className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          Browse Other Crops
                        </button>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs mt-6">
                      Order status refreshes automatically every 5 seconds.
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
