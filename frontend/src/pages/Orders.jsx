
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
  RefreshCw
} from "lucide-react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const farmerEmail =
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email");

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
      alert(
        err.response?.data?.error ||
          "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [farmerEmail]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, newStatus) => {
    if (!farmerEmail) {
      alert("Please log in again.");
      return;
    }

    const confirmation = window.confirm(
      `Change order #${order.id} to "${newStatus}"?`
    );

    if (!confirmation) return;

    try {
      setUpdatingOrderId(order.id);

      await api.put(`/update-order/${order.id}`, {
        status: newStatus,
        farmer_email: farmerEmail
      });

      await loadOrders();

      alert(`Order #${order.id} updated to ${newStatus}.`);
    } catch (err) {
      console.error("Update order error:", err);
      alert(
        err.response?.data?.error ||
          "Unable to update order. Please try again."
      );
      await loadOrders();
    } finally {
      setUpdatingOrderId(null);
    }
  };
  
const confirmCODPayment = async (order) => {
  if (!farmerEmail) {
    alert("Please log in again.");
    return;
  }

  const confirmation = window.confirm(
    `Confirm that you received ₹${Number(order.total_price || 0).toFixed(2)} in cash for order #${order.id}?`
  );

  if (!confirmation) return;

  try {
    setUpdatingOrderId(order.id);

    await api.put(`/confirm-cod-payment/${order.id}`, {
      farmer_email: farmerEmail,
    });

    await loadOrders();

    alert(`Payment for order #${order.id} marked as Paid.`);
  } catch (err) {
    console.error("COD payment confirmation error:", err);

    alert(
      err.response?.data?.error ||
        "Unable to confirm payment. Please try again."
    );

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
          { label: "Accept Order", status: "Accepted", color: "green" },
          { label: "Reject Order", status: "Rejected", color: "red" }
        ];
      case "accepted":
        return [
          { label: "Mark as Shipped", status: "Shipped", color: "blue" }
        ];
      case "shipped":
        return [
          { label: "Mark as Delivered", status: "Delivered", color: "green" }
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

  const progressSteps = ["Pending", "Accepted", "Shipped", "Delivered"];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-gradient-to-r from-green-800 to-green-600 p-6 text-white shadow-lg md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                📦 Farmer Orders
              </h1>
              <p className="mt-2 text-green-100">
                Manage orders and update delivery progress.
              </p>
            </div>

            <button
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white/15 px-4 py-3 font-semibold hover:bg-white/25 disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-5 shadow">
          <p className="text-sm text-gray-500">Logged in as</p>
          <p className="mt-1 break-all font-semibold text-green-700">
            {farmerEmail || "Not logged in"}
          </p>
        </div>

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow">
            <Package size={52} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold text-gray-700">
              No Orders Yet
            </h2>
            <p className="mt-2 text-gray-500">
              Orders placed by buyers will appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                {
                  label: "Total Orders",
                  count: orders.length,
                  style: "text-gray-800"
                },
                {
                  label: "Pending",
                  count: orders.filter(
                    (o) => (o.status || "Pending").toLowerCase() === "pending"
                  ).length,
                  style: "text-yellow-700"
                },
                {
                  label: "In Progress",
                  count: orders.filter((o) =>
                    ["accepted", "shipped"].includes(
                      (o.status || "").toLowerCase()
                    )
                  ).length,
                  style: "text-blue-700"
                },
                {
                  label: "Delivered",
                  count: orders.filter(
                    (o) => (o.status || "").toLowerCase() === "delivered"
                  ).length,
                  style: "text-green-700"
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl bg-white p-5 shadow"
                >
                  <p className="text-sm text-gray-500">{item.label}</p>
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
                          {status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="flex gap-3">
                        <UserRound className="mt-1 shrink-0 text-gray-400" size={19} />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Buyer</p>
                          <p className="break-all font-medium">
                            {order.buyer_email || "Not available"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Package className="mt-1 shrink-0 text-gray-400" size={19} />
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-semibold">
                            {order.quantity} kg
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-green-700">
                          ₹{Number(order.total_price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <CalendarDays className="mt-1 shrink-0 text-gray-400" size={19} />
                        <div>
                          <p className="text-sm text-gray-500">Order Date</p>
                          <p className="font-medium">
                            {order.order_date || "Date unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <MapPin className="mt-1 shrink-0 text-gray-400" size={19} />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-500">Delivery Address</p>
                          <p className="whitespace-pre-wrap break-words font-medium">
                            {order.delivery_address || "Address unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <CreditCard className="mt-1 shrink-0 text-gray-400" size={19} />
                        <div>
                          <p className="text-sm text-gray-500">Payment</p>
                          <p className="font-semibold">
                            {order.payment_method === "COD"
                              ? "Cash on Delivery"
                              : order.payment_method || "COD"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment status: {order.payment_status || "Pending"}
                          </p>
                        </div>
                      </div>

                      {normalizedStatus !== "rejected" && (
                        <div className="border-t pt-5">
                          <p className="mb-4 text-sm font-semibold text-gray-600">
                            Order Progress
                          </p>

                          <div className="space-y-3">
                            {progressSteps.map((step, index) => {
                              const stepNumber = index + 1;
                              const complete = progressStep >= stepNumber;

                              return (
                                <div key={step} className="flex items-center gap-3">
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
                                    {step}
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
                          This order was rejected.
                        </div>
                      )}

                      
{normalizedStatus === "delivered" && (
  <div className="space-y-3">
    <div className="rounded-xl bg-green-50 p-4 text-center font-semibold text-green-700">
      <Truck className="mx-auto mb-2" size={25} />
      Order delivered successfully.
    </div>

    {String(order.payment_method || "COD").trim().toUpperCase() === "COD" &&
      String(order.payment_status || "Pending").trim().toLowerCase() !== "paid" && (
        <button
          onClick={() => confirmCODPayment(order)}
          disabled={isUpdating}
          className="w-full rounded-xl bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUpdating
            ? "Confirming Payment..."
            : "Confirm COD Payment Received"}
        </button>
      )}

    {String(order.payment_status || "").trim().toLowerCase() === "paid" && (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700">
        ✓ Cash payment confirmed
      </div>
    )}
  </div>
)}

                      {actions.length > 0 && (
                        <div className="space-y-3 border-t pt-5">
                          <p className="text-sm font-semibold text-gray-600">
                            Next Action
                          </p>

                          {actions.map((action) => {
                            const colorClasses = {
                              green:
                                "bg-green-600 hover:bg-green-700",
                              red:
                                "bg-red-600 hover:bg-red-700",
                              blue:
                                "bg-blue-600 hover:bg-blue-700"
                            };

                            return (
                              <button
                                key={action.status}
                                onClick={() => updateStatus(order, action.status)}
                                disabled={isUpdating}
                                className={`w-full rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${colorClasses[action.color]}`}
                              >
                                {isUpdating
                                  ? "Updating..."
                                  : action.label}
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
