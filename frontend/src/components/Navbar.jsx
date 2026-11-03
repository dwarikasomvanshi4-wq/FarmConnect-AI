
import { Wheat, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Navbar() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const navText = {
    en: {
      tagline: "Voice Enabled Direct Market Access",
      features: "Features",
      about: "About",
      contact: "Contact",
    },
    hi: {
      tagline: "आवाज़ से सीधे बाज़ार तक पहुँच",
      features: "विशेषताएँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
    },
    kn: {
      tagline: "ಧ್ವನಿ ಆಧಾರಿತ ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      about: "ನಮ್ಮ ಬಗ್ಗೆ",
      contact: "ಸಂಪರ್ಕ",
    },
  };

  const currentText = navText[language] || navText.en;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-green-600 p-2 rounded-xl">
            <Wheat size={24} color="white" />
          </div>

          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              FarmConnect AI
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              {currentText.tagline}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="hidden lg:flex gap-6 font-medium text-gray-700">
          <button
            onClick={() => navigate("/")}
            className="hover:text-green-600 transition"
          >
            {t("home")}
          </button>

          <button className="hover:text-green-600 transition">
            {currentText.features}
          </button>

          <button className="hover:text-green-600 transition">
            {currentText.about}
          </button>

          <button className="hover:text-green-600 transition">
            {currentText.contact}
          </button>
        </div>

        {/* Language and Account Buttons */}
        <div className="flex items-center gap-2 md:gap-4">
          <select
            aria-label="Choose language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="max-w-28 rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-800"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          <div className="hidden md:flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="border border-green-600 px-4 py-2 rounded-xl text-green-600 hover:bg-green-50 transition"
            >
              {t("login")}
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition"
            >
              {t("register")}
            </button>
          </div>

          <button
            onClick={() => navigate("/login")}
            aria-label="Open login"
            className="md:hidden"
          >
            <Menu />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
