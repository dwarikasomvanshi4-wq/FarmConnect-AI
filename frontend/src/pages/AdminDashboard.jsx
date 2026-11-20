import { useState, useEffect } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [supportRequests, setSupportRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSupportRequests = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/support-requests");

      setSupportRequests(response.data.support_requests || []);
      setError("");
    } catch (err) {
      console.error("Support requests error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load support requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportRequests();
  }, []);

  const updateStatus = async (requestId, newStatus) => {
    try {
      await api.patch(
        `/admin/support-requests/${requestId}/status`,
        { status: newStatus }
      );

      setSupportRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update ticket status."
      );
    }
  };

  const getStatusColor = (status) => {
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

  const pendingCount = supportRequests.filter(
    (request) => request.status === "Pending"
  ).length;

  const inProgressCount = supportRequests.filter(
    (request) => request.status === "In Progress"
  ).length;

  const resolvedCount = supportRequests.filter(
    (request) => request.status === "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Admin Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            FarmConnect AI Support Management
          </p>
        </div>

        <button
          onClick={fetchSupportRequests}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg transition"
        >
          Refresh Requests
        </button>

      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">Total Requests</p>

          <h2 className="text-3xl font-bold mt-2">
            {supportRequests.length}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-yellow-600">Pending</p>

          <h2 className="text-3xl font-bold mt-2">
            {pendingCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-blue-600">In Progress</p>

          <h2 className="text-3xl font-bold mt-2">
            {inProgressCount}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-green-600">Resolved</p>

          <h2 className="text-3xl font-bold mt-2">
            {resolvedCount}
          </h2>
        </div>

      </div>

      {/* Support Requests */}
      <div className="bg-white rounded-xl shadow overflow-hidden">

        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Support Requests
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading support requests...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-red-600">
            {error}
          </div>
        ) : supportRequests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No support requests found.
          </div>
        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-gray-50 text-gray-600 text-sm">

                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>

              </thead>

              <tbody>

                {supportRequests.map((request) => (

                  <tr
                    key={request.id}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 font-medium">
                      #{request.id}
                    </td>

                    <td className="p-4">
                      <div className="font-medium">
                        {request.name}
                      </div>

                      <div className="text-sm text-gray-500">
                        {request.email}
                      </div>

                      <div className="text-xs text-gray-400">
                        {request.user_type}
                      </div>
                    </td>

                    <td className="p-4">
                      {request.category}
                    </td>

                    <td className="p-4 min-w-[250px] max-w-[350px]">
                      <p className="whitespace-pre-wrap break-words">
                        {request.description}
                      </p>
                    </td>

                    <td className="p-4 text-sm whitespace-nowrap">
                      {request.created_at
                        ? new Date(request.created_at).toLocaleString()
                        : "N/A"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(request.status)}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <select
                        value={request.status}
                        onChange={(e) =>
                          updateStatus(request.id, e.target.value)
                        }
                        className="border rounded-lg p-2 text-sm bg-white"
                      >
                        <option value="Pending">
                          Pending
                        </option>

                        <option value="In Progress">
                          In Progress
                        </option>

                        <option value="Resolved">
                          Resolved
                        </option>
                      </select>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;