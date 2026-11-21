import { useEffect, useState } from "react";
import api from "../services/api";

function MySupportRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/my-support-requests");

      setRequests(response.data.support_requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your support requests."
      );
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-800">
            My Support Requests
          </h1>

          <p className="text-gray-600 mt-2">
            Track your queries and view the latest status of your requests.
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={fetchSupportRequests}
            disabled={loading}
            className="bg-green-700 text-white px-5 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <p className="text-gray-600">
              Loading your support requests...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
            <p>{error}</p>

            <button
              onClick={fetchSupportRequests}
              className="mt-3 underline font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <div className="text-5xl mb-4">📩</div>

            <h2 className="text-xl font-semibold text-gray-800">
              No Support Requests Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Any support requests you submit will appear here.
            </p>
          </div>
        )}

        {/* Requests */}
        {!loading && !error && requests.length > 0 && (
          <div className="space-y-5">

            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6"
              >

                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">

                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Request #{request.id}
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                      {request.category}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${getStatusStyle(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>

                </div>

                {/* Description */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Your Message
                  </h3>

                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>

                {/* Dates */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Submitted On
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {request.created_at
                        ? new Date(request.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Last Updated
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {request.updated_at
                        ? new Date(request.updated_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                </div>

                {/* Status Message */}
                <div className="mt-5 border-t pt-4">

                  {request.status === "Pending" && (
                    <p className="text-yellow-700 text-sm">
                      ⏳ Your request is waiting to be reviewed by our support team.
                    </p>
                  )}

                  {request.status === "In Progress" && (
                    <p className="text-blue-700 text-sm">
                      🔧 Our support team is currently working on your request.
                    </p>
                  )}

                  {request.status === "Resolved" && (
                    <p className="text-green-700 text-sm">
                      ✅ Your request has been resolved.
                    </p>
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </div>
  );
}

export default MySupportRequests;