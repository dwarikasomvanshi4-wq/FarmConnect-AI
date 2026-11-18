
import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-[60] rounded-xl bg-green-800 p-3 text-white shadow-lg lg:hidden"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col bg-green-800 text-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="border-b border-green-700 p-6">
          <h1 className="text-3xl font-bold">
            🌾 FarmConnect AI
          </h1>
          <p className="mt-2 text-sm text-green-200">
            Smart Agriculture Platform
          </p>
        </div>

        {/* Menu */}
        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          <button
            onClick={() => goTo("/farmer-dashboard")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <LayoutDashboard size={22} />
            Dashboard
          </button>

          <button
            onClick={() => goTo("/my-crops")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <Sprout size={22} />
            My Crops
          </button>

          <button
            onClick={() => goTo("/add-crop")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <PlusCircle size={22} />
            Add Crop
          </button>

          <button
            onClick={() => goTo("/orders")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <ShoppingCart size={22} />
            Orders
          </button>

          <button
            onClick={() => goTo("/earnings")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <IndianRupee size={22} />
            Earnings
          </button>

          <button
            onClick={() => goTo("/weather")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <CloudSun size={22} />
            Weather
          </button>

          <button
            onClick={() => goTo("/voice")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <Mic size={22} />
            Voice Assistant
          </button>

          <button
            onClick={() => goTo("/profile")}
            className="flex w-full items-center gap-4 rounded-xl p-4 transition hover:bg-green-700"
          >
            <User size={22} />
            Profile
          </button>
        </nav>

        {/* Logout */}
        <div className="border-t border-green-700 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500 py-3 font-semibold transition hover:bg-red-600"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
