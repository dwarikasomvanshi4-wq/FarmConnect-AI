
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Hero() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const content = {
    en: {
      badge: "🌾 Smart Agriculture Platform",
      title: "Voice Enabled",
      highlight: " Farmer Market",
      description:
        "Connect farmers directly with buyers using voice commands, weather updates, AI crop disease detection and secure payments.",
      farmerLogin: "Farmer Login",
      buyerLogin: "Buyer Login",
    },
    hi: {
      badge: "🌾 स्मार्ट कृषि प्लेटफ़ॉर्म",
      title: "आवाज़ से संचालित",
      highlight: " किसान बाज़ार",
      description:
        "आवाज़ के निर्देशों, मौसम की जानकारी, AI से फसल रोग पहचान और सुरक्षित भुगतान के माध्यम से किसानों को सीधे खरीदारों से जोड़ें।",
      farmerLogin: "किसान लॉगिन",
      buyerLogin: "खरीदार लॉगिन",
    },
    kn: {
      badge: "🌾 ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆ",
      title: "ಧ್ವನಿ ಆಧಾರಿತ",
      highlight: " ರೈತರ ಮಾರುಕಟ್ಟೆ",
      description:
        "ಧ್ವನಿ ಆಜ್ಞೆಗಳು, ಹವಾಮಾನ ಮಾಹಿತಿ, AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಸುರಕ್ಷಿತ ಪಾವತಿಗಳ ಮೂಲಕ ರೈತರನ್ನು ನೇರವಾಗಿ ಖರೀದಿದಾರರೊಂದಿಗೆ ಸಂಪರ್ಕಿಸಿ.",
      farmerLogin: "ರೈತರ ಲಾಗಿನ್",
      buyerLogin: "ಖರೀದಿದಾರರ ಲಾಗಿನ್",
    },
  };

  const text = content[language] || content.en;

  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side */}
          <div>
            <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-medium">
              {text.badge}
            </span>

            <h1 className="mt-6 text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {text.title}
              <span className="text-green-600">{text.highlight}</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-8">
              {text.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-5">
              <button
                onClick={() => navigate("/login?role=farmer")}
                className="bg-green-600 text-white px-7 py-4 rounded-xl hover:bg-green-700 transition flex items-center gap-2"
              >
                {text.farmerLogin}
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => navigate("/login?role=buyer")}
                className="border border-green-600 text-green-600 px-7 py-4 rounded-xl hover:bg-green-50 transition"
              >
                {text.buyerLogin}
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex justify-center">
            <div className="w-[420px] h-[420px] max-w-full rounded-full bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center shadow-xl">
              <span className="text-9xl">👨‍🌾</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
