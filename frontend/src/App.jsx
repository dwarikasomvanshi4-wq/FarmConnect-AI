
import { Routes, Route } from "react-router-dom";

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

import GlobalChatWidget from "./components/GlobalChatWidget";
import { LanguageProvider } from "./i18n/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />

        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/my-crops" element={<MyCrops />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/checkout" element={<Checkout />} />

        <Route path="/orders" element={<Orders />} />
        <Route path="/buyer-orders" element={<BuyerOrders />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/support" element={<Support />} />
        <Route path="/support" element={<Support />} />
        {/* Chat routes */}
        <Route path="/buyer-chat/:orderId" element={<BuyerChat />} />
        <Route path="/farmer-chat/:orderId" element={<FarmerChat />} />
      </Routes>

      {/* Global chat available throughout the app */}
      <GlobalChatWidget />
    </LanguageProvider>
  );
}

export default App;
