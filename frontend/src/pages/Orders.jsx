import { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);

  const farmerEmail = localStorage.getItem("email");

  const loadOrders = async () => {
    try {
      console.log("Fetching Orders for:", farmerEmail);

      const res = await api.get(`/farmer-orders/${farmerEmail}`);

      console.log("Orders Received:", res.data);

      setOrders(res.data);

    } catch (err) {
      console.log("Error loading orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      console.log("Updating order:", id, status);

      await api.put(`/update-order/${id}`, {
        status: status,
      });

      alert(
        status === "Accepted"
          ? "✅ Order Accepted"
          : "❌ Order Rejected"
      );

      // Update immediately on screen
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === id
            ? {
                ...order,
                status: status,
              }
            : order
        )
      );

    } catch (err) {
      console.log("Update Error:", err);
      alert("Failed to update order");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      {/* Header */}

      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white rounded-2xl p-8 shadow-lg">

          <h1 className="text-4xl font-bold">
            📦 Farmer Orders
          </h1>

          <p className="mt-2 text-green-100">
            Manage orders received from buyers
          </p>

        </div>

        {/* Farmer Email */}

        <div className="bg-white rounded-xl shadow-md p-5 mt-6">

          <p className="text-gray-600">
            Logged in as:
          </p>

          <p className="font-semibold text-green-700">
            {farmerEmail}
          </p>

        </div>

        {/* Orders */}

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow-lg p-12 text-center mt-8">

            <div className="text-6xl">
              📦
            </div>

            <h2 className="text-2xl font-bold text-gray-700 mt-4">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Orders placed by buyers will appear here.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">

            {orders.map((order) => {

              const status = String(order.status || "Pending")
              .trim()
              .toLowerCase();

              const isPending =
              status === "pending" ||
              status === "";

               const isAccepted = status === "accepted";

               const isRejected = status === "rejected";
              return (

                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition"
                >

                  {/* Card Header */}

                  <div className="bg-green-50 p-6">

                    <div className="flex justify-between items-center">

                      <h2 className="text-2xl font-bold text-green-700">
                        {order.crop_name}
                      </h2>

                      <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">
                        #{order.id}
                      </span>

                    </div>

                  </div>

                  {/* Order Details */}

                  <div className="p-6">

                    <div className="space-y-3">

                      <p>
                        <span className="text-gray-500">
                          Buyer
                        </span>

                        <br />

                        <span className="font-semibold">
                          👤 {order.buyer_email}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">
                          Quantity
                        </span>

                        <br />

                        <span className="font-semibold">
                          📦 {order.quantity} Kg
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">
                          Total Amount
                        </span>

                        <br />

                        <span className="text-xl font-bold text-green-600">
                          ₹{order.total_price}
                        </span>
                      </p>

                      <p>
                        <span className="text-gray-500">
                          Order Date
                        </span>

                        <br />

                        <span className="font-semibold">
                          📅 {order.order_date}
                        </span>
                      </p>

                    </div>

                    {/* Status */}

                    <div className="mt-6">

                      <p className="text-gray-500 mb-2">
                        Order Status
                      </p>

                      {isPending && (

                        <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-semibold">
                          🟡 Pending
                        </span>

                      )}

                      {isAccepted && (

                        <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                          ✅ Accepted
                        </span>

                      )}

                      {isRejected && (

                        <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">
                          ❌ Rejected
                        </span>

                      )}

                    </div>

                    {/* ACTION BUTTONS */}

                    {isPending && (

                      <div className="grid grid-cols-2 gap-3 mt-6">

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Accepted"
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                        >
                          ✅ Accept
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              order.id,
                              "Rejected"
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition"
                        >
                          ❌ Reject
                        </button>

                      </div>

                    )}

                    {/* Accepted Message */}

                    {isAccepted && (

                      <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-xl text-center font-semibold">
                        ✅ You accepted this order
                      </div>

                    )}

                    {/* Rejected Message */}

                    {isRejected && (

                      <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl text-center font-semibold">
                        ❌ You rejected this order
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

export default Orders;