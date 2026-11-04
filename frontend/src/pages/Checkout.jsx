import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Package,
  ShoppingCart,
  Banknote,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  const crop = location.state?.crop;
  const quantity = Number(location.state?.quantity);

  const [address, setAddress] = useState({
    full_name: localStorage.getItem("name") || "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    instructions: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  const buyerEmail =
    sessionStorage.getItem("userEmail") ||
  sessionStorage.getItem("email");
    "";

  const price = Number(crop?.price);
  const total = price * quantity;

  const updateAddress = (event) => {
    const { name, value } = event.target;
    setAddress((previous) => ({ ...previous, [name]: value }));
  };

  if (!crop || !Number.isFinite(quantity) || quantity <= 0) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Checkout unavailable
          </h1>
          <p className="mt-3 text-gray-600">
            Please return to the marketplace and select a crop first.
          </p>
          <button
            onClick={() => navigate("/buyer-dashboard")}
            className="mt-6 rounded-xl bg-green-700 px-5 py-3 font-semibold text-white"
          >
            Back to marketplace
          </button>
        </div>
      </div>
    );
  }

  const placeOrder = async (event) => {
    event.preventDefault();
    setError("");

    if (!buyerEmail.trim()) {
      setError("Please log in again before placing your order.");
      return;
    }

    if (!address.full_name.trim() || !/^\d{10}$/.test(address.phone.trim())) {
      setError("Enter your full name and a valid 10-digit phone number.");
      return;
    }

    if (
      !address.house.trim() ||
      !address.street.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !/^\d{6}$/.test(address.pincode.trim())
    ) {
      setError("Complete the required delivery address fields.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      setError("The crop price is invalid. Please contact the farmer.");
      return;
    }

    const deliveryAddress = [
      address.full_name.trim(),
      `Phone: ${address.phone.trim()}`,
      address.house.trim(),
      address.street.trim(),
      address.city.trim(),
      address.state.trim(),
      `PIN: ${address.pincode.trim()}`,
      address.instructions.trim()
        ? `Instructions: ${address.instructions.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    setLoading(true);

    try {
      await api.post("/place-order", {
        buyer_email: buyerEmail.trim(),
        farmer_email: crop.farmer_email,
        crop_id: crop.id,
        crop_name: crop.crop_name,
        quantity,
        total_price: total,
        delivery_address: deliveryAddress,
        payment_method: "COD",
        payment_status: "Pending",
      });

      setPlaced(true);
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Could not place your order. Please check the stock and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow">
          <CheckCircle className="mx-auto text-green-600" size={64} />

          <h1 className="mt-4 text-3xl font-bold text-green-800">
            Order placed successfully!
          </h1>

          <p className="mt-3 text-gray-600">
            Your order for {crop.crop_name} has been placed.
          </p>

          <div className="mt-6 rounded-xl bg-green-50 p-5 text-left">
            <p>
              <strong>Quantity:</strong> {quantity} Kg
            </p>
            <p className="mt-2">
              <strong>Total:</strong> ₹{total.toFixed(2)}
            </p>
            <p className="mt-2">
              <strong>Payment:</strong> Cash on Delivery
            </p>
            <p className="mt-2">
              <strong>Payment status:</strong> Pending
            </p>
            <p className="mt-2">
              <strong>Order status:</strong> Pending
            </p>
          </div>

          <button
            onClick={() => navigate("/buyer-orders")}
            className="mt-6 w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800"
          >
            Track my order
          </button>

          <button
            onClick={() => navigate("/buyer-dashboard")}
            className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100";

  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      <header className="bg-gradient-to-r from-green-800 to-green-600 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-green-100">
              Review your order and delivery details
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 grid max-w-5xl gap-6 px-6 lg:grid-cols-3">
        <form onSubmit={placeOrder} className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <MapPin className="text-green-700" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                Delivery address
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Full name *
                </label>
                <input
                  name="full_name"
                  value={address.full_name}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Phone number *
                </label>
                <input
                  name="phone"
                  value={address.phone}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  inputMode="numeric"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  House / Flat number *
                </label>
                <input
                  name="house"
                  value={address.house}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  placeholder="House or flat number"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-semibold">
                  Street / Area *
                </label>
                <input
                  name="street"
                  value={address.street}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  placeholder="Street, locality, or area"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  City *
                </label>
                <input
                  name="city"
                  value={address.city}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  placeholder="City"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  State *
                </label>
                <input
                  name="state"
                  value={address.state}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  placeholder="State"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  PIN code *
                </label>
                <input
                  name="pincode"
                  value={address.pincode}
                  onChange={updateAddress}
                  className={inputClass}
                  required
                  inputMode="numeric"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="6-digit PIN code"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">
                  Delivery instructions
                </label>
                <input
                  name="instructions"
                  value={address.instructions}
                  onChange={updateAddress}
                  className={inputClass}
                  placeholder="Optional"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <Banknote className="text-green-700" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                Payment method
              </h2>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 p-4">
              <input
                type="radio"
                checked
                readOnly
                aria-label="Cash on Delivery"
                className="mt-1 accent-green-700"
              />
              <div>
                <p className="font-semibold text-gray-800">
                  Cash on Delivery (COD)
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Pay when your order is delivered. Payment status will remain
                  Pending until payment is collected.
                </p>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-700 px-5 py-4 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Placing order..." : "Place order"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <ShoppingCart className="text-green-700" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Order summary</h2>
          </div>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-green-50 p-3">
              <Package className="text-green-700" size={28} />
            </div>
            <div className="min-w-0">
              <p className="break-words font-bold text-gray-800">
                {crop.crop_name}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Farmer: {crop.farmer_name || crop.farmer_email || "Local Farmer"}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Quantity: {quantity} Kg
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Price: ₹{price.toFixed(2)} / Kg
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t pt-4">
            <div className="flex justify-between gap-3 text-gray-600">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <div className="flex justify-between gap-3 text-gray-600">
              <span>Delivery</span>
              <span>As arranged with farmer</span>
            </div>

            <div className="flex justify-between gap-3 border-t pt-4 text-lg font-bold text-green-800">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
              Payment: <strong>Cash on Delivery</strong>
              <br />
              Status: <strong>Pending</strong>
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Checkout;