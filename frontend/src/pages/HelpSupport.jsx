
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  RefreshCw,
  Send,
  CircleHelp,
} from "lucide-react";
import api from "../services/api";

function HelpSupport() {
  const navigate = useNavigate();

  const userName = sessionStorage.getItem("userName") || "";
  const userEmail = sessionStorage.getItem("userEmail") || "";
  const userRole = sessionStorage.getItem("userRole") || "";

  const dashboardPath =
    userRole.toLowerCase() === "buyer"
      ? "/buyer-dashboard"
      : "/farmer-dashboard";

  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    userType:
      userRole.charAt(0).toUpperCase() +
      userRole.slice(1).toLowerCase(),
    category: "",
    description: "",
  });

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setRequestError("");

      const response = await api.get("/my-support-requests");

      setRequests(response.data.support_requests || []);
    } catch (error) {
      setRequestError(
        error.response?.data?.message ||
          "Unable to load your support requests."
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await api.post("/support", formData);

      setSuccess(true);
      setMessage(
        response.data.message ||
          "Your support request has been submitted successfully!"
      );

      setFormData((previous) => ({
        ...previous,
        category: "",
        description: "",
      }));

      await fetchRequests();
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.response?.data?.message ||
          "Unable to submit your support request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";

      case "In Progress":
        return "bg-blue-100 text-blue-800";

      case "Resolved":
        return "bg-green-100 text-green-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "Pending":
        return "Your request is waiting to be reviewed by our support team.";

      case "In Progress":
        return "Our support team is currently working on your request.";

      case "Resolved":
        return "Your request has been resolved.";

      default:
        return "";
    }
  };

  const contactEmails = [
    "dwarikasomvanshi4@gmail.com",
    "ambikaswamy9353@gmail.com",
    "aratijadhav710@gmail.com",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(dashboardPath)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-green-700 transition hover:text-green-900"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-100 p-3 text-green-800">
              <CircleHelp size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                Help & Support
              </h1>

              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                We're here to help you with FarmConnect AI.
              </p>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* Submit Support Request */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">

              <div className="mb-6 flex items-center gap-3">
                <MessageSquare className="text-green-700" size={24} />

                <h2 className="text-xl font-bold text-gray-800">
                  Submit a Support Request
                </h2>
              </div>

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
                    required
                    disabled={submitting}
                    placeholder="Enter your name"
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
                    required
                    disabled={submitting}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                {/* User Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    User Type
                  </label>

                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  >
                    <option value="">Select user type</option>
                    <option value="Farmer">Farmer</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Issue Category
                  </label>

                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={submitting}
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
                    required
                    disabled={submitting}
                    rows={5}
                    placeholder="Please explain your problem in detail..."
                    className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
                  />
                </div>

                {/* Message */}
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
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-3 font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  <Send size={18} />

                  {submitting
                    ? "Submitting..."
                    : "Submit Support Request"}
                </button>

              </form>
            </div>
          </div>

          {/* Contact Us */}
          <div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

              <div className="mb-5 flex items-center gap-3">
                <Mail className="text-green-700" size={24} />

                <h2 className="text-xl font-bold text-gray-800">
                  Contact Us
                </h2>
              </div>

              <p className="mb-5 text-sm leading-6 text-gray-600">
                You can also contact our team directly by email.
                We'll do our best to assist you.
              </p>

              <div className="space-y-4">
                {contactEmails.map((email) => (
                  <a
                    key={email}
                    href={`mailto:${email}`}
                    className="block break-all rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-medium text-green-800 transition hover:border-green-300 hover:bg-green-100"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Mail size={16} />
                      Email Support
                    </div>

                    {email}
                  </a>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-700">
                  💡 Tip
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Submit a support request to track your issue
                  directly from this page.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* My Support Requests */}
        <div className="mt-10">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                My Support Requests
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Track your queries and their latest status.
              </p>
            </div>

            <button
              onClick={fetchRequests}
              disabled={loadingRequests}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-medium text-white transition hover:bg-green-800 disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={loadingRequests ? "animate-spin" : ""}
              />

              {loadingRequests ? "Loading..." : "Refresh Requests"}
            </button>
          </div>

          {/* Loading */}
          {loadingRequests && (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-600">
                Loading your support requests...
              </p>
            </div>
          )}

          {/* Error */}
          {!loadingRequests && requestError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              <p>{requestError}</p>

              <button
                onClick={fetchRequests}
                className="mt-3 font-semibold underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty */}
          {!loadingRequests &&
            !requestError &&
            requests.length === 0 && (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <div className="mb-4 text-5xl">📩</div>

                <h3 className="text-lg font-semibold text-gray-800">
                  No Support Requests Yet
                </h3>

                <p className="mt-2 text-gray-500">
                  Any support requests you submit will appear here.
                </p>
              </div>
            )}

          {/* Request Cards */}
          {!loadingRequests &&
            !requestError &&
            requests.length > 0 && (
              <div className="space-y-5">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6"
                  >
                    {/* Request Header */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">
                          Request #{request.id}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {request.category}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                      <p className="mb-2 text-sm font-semibold text-gray-700">
                        Your Message
                      </p>

                      <div className="rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-600 whitespace-pre-wrap">
                        {request.description}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          Submitted On
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {request.created_at
                            ? new Date(
                                request.created_at
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          Last Updated
                        </p>

                        <p className="mt-1 text-sm font-medium text-gray-700">
                          {request.updated_at
                            ? new Date(
                                request.updated_at
                              ).toLocaleString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Status Explanation */}
                    <div className="mt-5 border-t pt-4">
                      <p className="text-sm text-gray-600">
                        {getStatusMessage(request.status)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

        </div>

      </div>
    </div>
  );
}

export default HelpSupport;
