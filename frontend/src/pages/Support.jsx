
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import api from "../services/api";

function Support() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    userType: "",
    category: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await api.post("/support", formData);

      setSuccess(true);

      setMessage(
        response.data.message ||
          "Your support request has been submitted successfully!"
      );

      // Clear the form after successful submission
      setFormData({
        name: "",
        email: "",
        userType: "",
        category: "",
        description: "",
      });
    } catch (error) {
      console.error("Support submission error:", error);

      setSuccess(false);

      setMessage(
        error.response?.data?.message ||
          "Unable to submit your support request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">

        {/* Heading */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl">🛠️</div>

          <h1 className="text-2xl font-bold text-gray-800 sm:text-4xl">
            Support Center
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
            Need help using FarmConnect AI? Report a problem, ask a
            question, or share your suggestions with us.
          </p>
        </div>

        {/* Support Form */}
        <div className="rounded-2xl bg-white p-5 shadow-lg sm:p-8">

          <h2 className="mb-6 text-xl font-semibold text-gray-800">
            Submit a Support Request
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            {/* User Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                I am a
              </label>

              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              >
                <option value="">Select user type</option>
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Issue Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Issue Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              >
                <option value="">Select an issue</option>
                <option value="Login/Register">
                  Login / Registration Issues
                </option>
                <option value="Crop Listing">
                  Crop Listing Issues
                </option>
                <option value="Payment">
                  Payment Problems
                </option>
                <option value="Orders">
                  Order Related Issues
                </option>
                <option value="Technical">
                  Technical Issues
                </option>
                <option value="Feedback">
                  Suggestions / Feedback
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Describe Your Issue
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please explain your problem in detail..."
                rows={5}
                required
                disabled={loading}
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`rounded-lg border p-4 text-sm ${
                  success
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading
                ? "Submitting..."
                : "Submit Support Request"}
            </button>

          </form>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mt-5 w-full rounded-lg border border-gray-300 py-3 font-medium text-gray-600 transition hover:bg-gray-100"
          >
            ← Go Back
          </button>

        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Support;
