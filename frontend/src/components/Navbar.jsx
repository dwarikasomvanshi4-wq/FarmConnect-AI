
import { useState } from "react";
import { Wheat, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const [menuOpen, setMenuOpen] = useState(false);

  const navText = {
    en: {
      tagline: "Voice Enabled Direct Market Access",
      home: "Home",
      features: "Features",
      about: "About",
      contact: "Contact",
      login: "Login",
      register: "Register",
    },
    hi: {
      tagline: "आवाज़ से सीधे बाज़ार तक पहुँच",
      home: "होम",
      features: "विशेषताएँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      login: "लॉगिन",
      register: "रजिस्टर",
    },
    kn: {
      tagline: "ಧ್ವನಿ ಆಧಾರಿತ ನೇರ ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ",
      home: "ಮುಖಪುಟ",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      about: "ನಮ್ಮ ಬಗ್ಗೆ",
      contact: "ಸಂಪರ್ಕ",
      login: "ಲಾಗಿನ್",
      register: "ನೋಂದಣಿ",
    },
  };

  const currentText = navText[language] || navText.en;

  const goToSection = (sectionId) => {
  setMenuOpen(false);

  if (location.pathname !== "/") {
    navigate("/", { state: { scrollTo: sectionId } });
  } else {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
    });
  }
};

  const goHome = () => {
    setMenuOpen(false);
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToLogin = () => {
    setMenuOpen(false);
    navigate("/login");
  };

  const goToRegister = () => {
    setMenuOpen(false);
    navigate("/register");
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:px-8">

        {/* Logo */}
        <button
          onClick={goHome}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <div className="rounded-xl bg-green-600 p-2">
            <Wheat size={24} color="white" />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">
              FarmConnect AI
            </h1>

            <p className="max-w-[180px] text-[10px] leading-tight text-gray-500 sm:max-w-none sm:text-xs">
              {currentText.tagline}
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 font-medium text-gray-700 lg:flex">
          <button onClick={goHome} className="transition hover:text-green-600">
            {currentText.home}
          </button>

          <button
            onClick={() => goToSection("features")}
            className="transition hover:text-green-600"
          >
            {currentText.features}
          </button>

          <button
            onClick={() => goToSection("about")}
            className="transition hover:text-green-600"
          >
            {currentText.about}
          </button>

          <button
            onClick={() => goToSection("contact")}
            className="transition hover:text-green-600"
          >
            {currentText.contact}
          </button>
        </div>

        {/* Language + Desktop Account Buttons + Mobile Menu */}
        <div className="flex shrink-0 items-center gap-2">

          <select
            aria-label="Choose language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="max-w-[100px] rounded-lg border border-gray-300 bg-white px-2 py-2 text-xs text-gray-800 sm:max-w-28 sm:text-sm"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="kn">ಕನ್ನಡ</option>
          </select>

          {/* Desktop Login and Register */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={goToLogin}
              className="rounded-xl border border-green-600 px-4 py-2 text-green-600 transition hover:bg-green-50"
            >
              {t("login")}
            </button>

            <button
              onClick={goToRegister}
              className="rounded-xl bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
            >
              {t("register")}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="rounded-lg p-2 text-gray-800 transition hover:bg-gray-100 md:hidden"
          >
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1">

            <button
              onClick={goHome}
              className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
            >
              🏠 {currentText.home}
            </button>

            <button
              onClick={() => goToSection("features")}
              className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
            >
              ✨ {currentText.features}
            </button>

            <button
              onClick={() => goToSection("about")}
              className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
            >
              ℹ️ {currentText.about}
            </button>

            <button
              onClick={() => goToSection("contact")}
              className="w-full rounded-lg px-4 py-3 text-left font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700"
            >
              📞 {currentText.contact}
            </button>

            <div className="my-2 border-t border-gray-200" />

            <button
              onClick={goToLogin}
              className="w-full rounded-lg border border-green-600 px-4 py-3 font-semibold text-green-700 transition hover:bg-green-50"
            >
              {currentText.login}
            </button>

            <button
              onClick={goToRegister}
              className="w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              {currentText.register}
            </button>

          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
