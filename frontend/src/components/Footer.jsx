import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Footer() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const content = {
    en: {
      brand: "🌾 FarmConnect AI",
      description:
        "Voice Enabled Direct Market Access connecting farmers directly with buyers using modern technology.",
      quickLinks: "Quick Links",
      home: "Home",
      features: "Features",
      about: "About",
      contact: "Contact",
      supportTitle: "Support",
      support: "Support & Report an Issue",
      helpText: "Need help? Have a question or facing a problem?",
      copyright: "© 2026 FarmConnect AI | Developed by Dwarika",
    },
    hi: {
      brand: "🌾 FarmConnect AI",
      description:
        "आधुनिक तकनीक और आवाज़ के माध्यम से किसानों को सीधे खरीदारों से जोड़ने वाला प्लेटफ़ॉर्म।",
      quickLinks: "त्वरित लिंक",
      home: "होम",
      features: "विशेषताएँ",
      about: "हमारे बारे में",
      contact: "संपर्क",
      supportTitle: "सहायता",
      support: "सहायता और समस्या रिपोर्ट करें",
      helpText: "मदद चाहिए? कोई प्रश्न है या समस्या आ रही है?",
      copyright: "© 2026 FarmConnect AI | Dwarika द्वारा विकसित",
    },
    kn: {
      brand: "🌾 FarmConnect AI",
      description:
        "ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಧ್ವನಿಯ ಮೂಲಕ ರೈತರನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುವ ವೇದಿಕೆ.",
      quickLinks: "ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು",
      home: "ಮುಖಪುಟ",
      features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
      about: "ನಮ್ಮ ಬಗ್ಗೆ",
      contact: "ಸಂಪರ್ಕ",
      supportTitle: "ಸಹಾಯ",
      support: "ಸಹಾಯ ಮತ್ತು ಸಮಸ್ಯೆ ವರದಿ",
      helpText: "ಸಹಾಯ ಬೇಕೇ? ಪ್ರಶ್ನೆ ಇದೆಯೇ ಅಥವಾ ಸಮಸ್ಯೆ ಎದುರಿಸುತ್ತಿದ್ದೀರಾ?",
      copyright: "© 2026 FarmConnect AI | Dwarika ಅವರಿಂದ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ",
    },
  };

  const text = content[language] || content.en;

  const scrollToSection = (sectionId) => {
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="mt-10 bg-gray-900 text-white sm:mt-16">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-10">

          {/* Brand and Description */}
          <div>
            <h2 className="text-xl font-bold text-green-400 sm:text-2xl">
              {text.brand}
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-7 text-gray-300 sm:text-base">
              {text.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold sm:text-xl">
              {text.quickLinks}
            </h3>

            <ul className="space-y-3 text-sm text-gray-300 sm:text-base">
              <li>
                <button
                  onClick={goHome}
                  className="transition hover:text-green-400"
                >
                  {text.home}
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="transition hover:text-green-400"
                >
                  {text.features}
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="transition hover:text-green-400"
                >
                  {text.about}
                </button>
              </li>

              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="transition hover:text-green-400"
                >
                  {text.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold sm:text-xl">
              {text.supportTitle}
            </h3>

            <p className="mb-4 text-sm leading-6 text-gray-300">
              {text.helpText}
            </p>

            <button
              onClick={() => navigate("/support")}
              className="inline-flex items-center rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-green-700"
            >
              🛠️ {text.support}
            </button>
          </div>

        </div>

        <hr className="my-6 border-gray-700 sm:my-8" />

        <p className="text-center text-xs leading-relaxed text-gray-400 sm:text-sm">
          {text.copyright}
        </p>

      </div>
    </footer>
  );
}

export default Footer;