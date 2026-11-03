
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import { useLanguage } from "../i18n/LanguageContext";

function Footer() {
  const { language } = useLanguage();

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
      connect: "Connect With Us",
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
      connect: "हमसे जुड़ें",
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
      connect: "ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ",
      copyright: "© 2026 FarmConnect AI | Dwarika ಅವರಿಂದ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ",
    },
  };

  const text = content[language] || content.en;

  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Logo and Description */}
          <div>
            <h2 className="text-2xl font-bold text-green-400">
              {text.brand}
            </h2>

            <p className="mt-4 text-gray-300 leading-7">
              {text.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {text.quickLinks}
            </h3>

            <ul className="space-y-3 text-gray-300">
              <li className="hover:text-green-400 cursor-pointer">
                {text.home}
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                {text.features}
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                {text.about}
              </li>
              <li className="hover:text-green-400 cursor-pointer">
                {text.contact}
              </li>
            </ul>
          </div>

          {/* Social Icons */}
          <div>
            <h3 className="text-xl font-semibold mb-4">
              {text.connect}
            </h3>

            <div className="flex gap-5 text-2xl">
              <FaFacebookF className="hover:text-green-400 cursor-pointer" />
              <FaInstagram className="hover:text-green-400 cursor-pointer" />
              <FaLinkedinIn className="hover:text-green-400 cursor-pointer" />
              <FaGithub className="hover:text-green-400 cursor-pointer" />
            </div>
          </div>
        </div>

        <hr className="my-8 border-gray-700" />

        <p className="text-center text-gray-400">
          {text.copyright}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
