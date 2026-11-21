
import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AddCrop from "./pages/AddCrop";
import MyCrops from "./pages/MyCrops";
import Weather from "./pages/Weather";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import BuyerOrders from "./pages/BuyerOrders";
import Profile from "./pages/Profile";
import Earnings from "./pages/Earnings";
import Voice from "./pages/Voice";
import BuyerChat from "./pages/BuyerChat";
import FarmerChat from "./pages/FarmerChat";
import Support from "./pages/Support";
import AdminDashboard from "./pages/AdminDashboard";
import MySupportRequests from "./pages/MySupportRequests";

import GlobalChatWidget from "./components/GlobalChatWidget";
import { LanguageProvider } from "./i18n/LanguageContext";

// Admin Route Protection
function AdminRoute({ children }) {
  const token = sessionStorage.getItem("authToken");
  const role = sessionStorage.getItem("userRole");

  if (!token || role?.toLowerCase() !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// User Authentication Protection
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <LanguageProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes */}
        <Route
          path="/farmer-dashboard"
          element={<FarmerDashboard />}
        />

        <Route
          path="/buyer-dashboard"
          element={<BuyerDashboard />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* My Support Requests - Protected */}
        <Route
          path="/my-support-requests"
          element={
            <ProtectedRoute>
              <MySupportRequests />
            </ProtectedRoute>
          }
        />

        {/* Crop Routes */}
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/my-crops" element={<MyCrops />} />

        {/* Other Routes */}
        <Route path="/weather" element={<Weather />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/buyer-orders" element={<BuyerOrders />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/support" element={<Support />} />

        {/* Chat Routes */}
        <Route
          path="/buyer-chat/:orderId"
          element={<BuyerChat />}
        />

        <Route
          path="/farmer-chat/:orderId"
          element={<FarmerChat />}
        />
      </Routes>

      {/* Global Chat */}
      <GlobalChatWidget />
    </LanguageProvider>
  );
}

export default App;
