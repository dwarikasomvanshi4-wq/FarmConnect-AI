import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Package, User, Calendar, IndianRupee } from "lucide-react";

function BuyerOrders() {

  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const buyerEmail = localStorage.getItem("email");

  // ---------------- LOAD ORDERS ----------------

  const loadOrders = async () => {

    try {

      setLoading(true);

      const res = await api.get(`/buyer-orders/${buyerEmail}`);

      console.log("Buyer Orders:", res.data);

      setOrders(res.data);

    } catch (err) {

      console.log("Error loading buyer orders:", err);

    } finally {

      setLoading(false);

    }

  };

  // ---------------- INITIAL LOAD ----------------

  useEffect(() => {

    loadOrders();

  }, []);

  // ---------------- AUTO REFRESH ----------------

  useEffect(() => {

    const interval = setInterval(() => {

      loadOrders();

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  // ---------------- STATUS COLOR ----------------

  const badgeColor = (status) => {

    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "accepted") {

      return "bg-green-100 text-green-700";

    }

    if (value === "rejected") {

      return "bg-red-100 text-red-700";

    }

    return "bg-yellow-100 text-yellow-700";

  };

  // ---------------- STATUS ICON ----------------

  const statusIcon = (status) => {

    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "accepted") {

      return "✅";

    }

    if (value === "rejected") {

      return "❌";

    }

    return "🟡";

  };

  // ---------------- STATUS MESSAGE ----------------

  const statusMessage = (status) => {

    const value = String(status || "")
      .trim()
      .toLowerCase();

    if (value === "accepted") {

      return "Your order has been accepted by the farmer.";

    }

    if (value === "rejected") {

      return "Your order has been rejected by the farmer.";

    }

    return "Waiting for the farmer to accept your order.";

  };

  // ---------------- PAGE ----------------

  return (

    <div className="min-h-screen bg-gray-100">

      {/* ================= NAVBAR ================= */}

      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white px-8 py-5 shadow-lg">

        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/buyer-dashboard")}
              className="bg-white text-green-700 p-2 rounded-lg hover:bg-green-100 transition"
            >

              <ArrowLeft size={20} />

            </button>

            <div>

              <h1 className="text-3xl font-bold">
                🛒 My Orders
              </h1>

              <p className="text-green-100 mt-1">
                Track your orders and their status
              </p>

            </div>

          </div>

          <button
            onClick={loadOrders}
            className="bg-white text-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold hover:bg-green-100 transition"
          >

            <RefreshCw size={18} />

            Refresh

          </button>

        </div>

      </div>


      {/* ================= CONTENT ================= */}

      <div className="max-w-6xl mx-auto p-8">


        {/* Buyer Information */}

        <div className="bg-white rounded-2xl shadow-md p-5 mb-8">

          <p className="text-gray-500">
            Logged in as
          </p>

          <p className="font-bold text-green-700 text-lg">
            {buyerEmail}
          </p>

        </div>


        {/* Loading */}

        {loading && (

          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

            <div className="text-5xl">
              ⏳
            </div>

            <h2 className="text-xl font-bold text-gray-600 mt-4">
              Loading Orders...
            </h2>

          </div>

        )}


        {/* No Orders */}

        {!loading && orders.length === 0 && (

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">

            <Package
              size={60}
              className="mx-auto text-gray-400"
            />

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


        {/* ================= ORDERS ================= */}

        {!loading && orders.length > 0 && (

          <div className="space-y-6">

            {orders.map((order) => {

              const status = String(order.status || "Pending")
                .trim();

              return (

                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >

                  {/* Order Header */}

                  <div className="bg-green-50 px-6 py-5 flex justify-between items-center">

                    <div>

                      <h2 className="text-2xl font-bold text-green-700">
                        🌾 {order.crop_name}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        Order #{order.id}
                      </p>

                    </div>

                    <span
                      className={`px-5 py-2 rounded-full font-bold ${badgeColor(status)}`}
                    >

                      {statusIcon(status)} {status}

                    </span>

                  </div>


                  {/* Order Details */}

                  <div className="p-6">

                    <div className="grid md:grid-cols-2 gap-6">


                      {/* Farmer */}

                      <div className="flex items-center gap-4">

                        <div className="bg-green-100 p-3 rounded-xl">

                          <User
                            size={25}
                            className="text-green-600"
                          />

                        </div>

                        <div>

                          <p className="text-gray-500">
                            Farmer
                          </p>

                          <p className="font-semibold">
                            {order.farmer_email}
                          </p>

                        </div>

                      </div>


                      {/* Quantity */}

                      <div className="flex items-center gap-4">

                        <div className="bg-blue-100 p-3 rounded-xl">

                          <Package
                            size={25}
                            className="text-blue-600"
                          />

                        </div>

                        <div>

                          <p className="text-gray-500">
                            Quantity
                          </p>

                          <p className="font-semibold">
                            {order.quantity} Kg
                          </p>

                        </div>

                      </div>


                      {/* Total */}

                      <div className="flex items-center gap-4">

                        <div className="bg-yellow-100 p-3 rounded-xl">

                          <IndianRupee
                            size={25}
                            className="text-yellow-600"
                          />

                        </div>

                        <div>

                          <p className="text-gray-500">
                            Total Amount
                          </p>

                          <p className="text-xl font-bold text-green-600">
                            ₹{order.total_price}
                          </p>

                        </div>

                      </div>


                      {/* Date */}

                      <div className="flex items-center gap-4">

                        <div className="bg-purple-100 p-3 rounded-xl">

                          <Calendar
                            size={25}
                            className="text-purple-600"
                          />

                        </div>

                        <div>

                          <p className="text-gray-500">
                            Order Date
                          </p>

                          <p className="font-semibold">
                            {order.order_date}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* ================= STATUS MESSAGE ================= */}

                    <div
                      className={`mt-7 p-5 rounded-xl ${badgeColor(status)}`}
                    >

                      <p className="font-bold text-lg">

                        {statusIcon(status)} Order Status: {status}

                      </p>

                      <p className="mt-1">

                        {statusMessage(status)}

                      </p>

                    </div>


                    {/* Pending Information */}

                    {status.toLowerCase() === "pending" && (

                      <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-xl">

                        <p className="text-yellow-700 font-semibold">

                          ⏳ Waiting for farmer response...

                        </p>

                        <p className="text-yellow-600 text-sm mt-1">

                          This page automatically checks for status updates.

                        </p>

                      </div>

                    )}


                    {/* Accepted Information */}

                    {status.toLowerCase() === "accepted" && (

                      <div className="mt-4 bg-green-50 border border-green-200 p-4 rounded-xl">

                        <p className="text-green-700 font-semibold">

                          🎉 Great! Your order has been accepted.

                        </p>

                        <p className="text-green-600 text-sm mt-1">

                          The farmer has accepted your order.

                        </p>

                      </div>

                    )}


                    {/* Rejected Information */}

                    {status.toLowerCase() === "rejected" && (

                      <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-xl">

                        <p className="text-red-700 font-semibold">

                          ❌ Unfortunately, your order was rejected.

                        </p>

                        <p className="text-red-600 text-sm mt-1">

                          You can browse other available crops from farmers.

                        </p>

                      </div>

                    )}

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