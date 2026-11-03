import {
  LayoutDashboard,
  Sprout,
  PlusCircle,
  ShoppingCart,
  IndianRupee,
  CloudSun,
  Mic,
  User,
  LogOut,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Sidebar() {

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-72 bg-green-800 text-white h-screen fixed left-0 top-0 shadow-2xl">

      {/* Logo */}
      <div className="p-6 border-b border-green-700">
        <h1 className="text-3xl font-bold">
          🌾 FarmConnect AI
        </h1>

        <p className="text-green-200 text-sm mt-2">
          Smart Agriculture Platform
        </p>
      </div>

      {/* Menu */}
      <div className="mt-6 space-y-2 px-4">

        <button
          onClick={() => navigate("/farmer-dashboard")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <LayoutDashboard size={22} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/my-crops")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <Sprout size={22} />
          My Crops
        </button>

        <button
          onClick={() => navigate("/add-crop")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <PlusCircle size={22} />
          Add Crop
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <ShoppingCart size={22} />
          Orders
        </button>

        <button
          onClick={() => navigate("/earnings")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <IndianRupee size={22} />
          Earnings
        </button>

        <button
          onClick={() => navigate("/weather")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <CloudSun size={22} />
          Weather
        </button>

        <button
          onClick={() => navigate("/voice")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <Mic size={22} />
          Voice Assistant
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-4 w-full p-4 rounded-xl hover:bg-green-700 transition"
        >
          <User size={22} />
          Profile
        </button>

      </div>

      {/* Logout */}
      <div className="absolute bottom-8 left-4 right-4">

        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 w-full py-3 rounded-xl font-semibold transition"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;