
import { Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";
import Earnings from "./pages/Earnings";
import Voice from "./pages/Voice";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import FarmerDashboard from "./pages/FarmerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AddCrop from "./pages/AddCrop";
import MyCrops from "./pages/MyCrops";
import Weather from "./pages/Weather";
import Orders from "./pages/Orders";
import BuyerOrders from "./pages/BuyerOrders";

import { LanguageProvider } from "./i18n/LanguageContext";

function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/earnings" element={<Earnings />} />
        <Route path="/voice" element={<Voice />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
        <Route path="/add-crop" element={<AddCrop />} />
        <Route path="/my-crops" element={<MyCrops />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/buyer-orders" element={<BuyerOrders />} />
      </Routes>
    </LanguageProvider>
  );
}

export default App;
