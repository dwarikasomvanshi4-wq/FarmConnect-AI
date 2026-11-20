
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
    <section className="overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Left Side */}
          <div className="min-w-0 text-center lg:text-left">

            <span className="inline-block rounded-full bg-green-100 px-3 py-2 text-xs font-medium text-green-700 sm:px-4 sm:text-sm">
              {text.badge}
            </span>

            <h1 className="mt-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-6xl">
              {text.title}
              <span className="block text-green-600">
                {text.highlight}
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-600 sm:mt-6 sm:text-lg sm:leading-8 lg:mx-0">
              {text.description}
            </p>

            {/* Login Buttons */}
            <div className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4 lg:mx-0">

              <button
                onClick={() => navigate("/login?role=farmer")}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 sm:flex-1"
              >
                {text.farmerLogin}
                <ArrowRight size={20} />
              </button>

              <button
                onClick={() => navigate("/login?role=buyer")}
                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-green-600 px-5 py-3 font-semibold text-green-600 transition hover:bg-green-50 sm:flex-1"
              >
                {text.buyerLogin}
              </button>

            </div>
          </div>

          {/* Right Side - Illustration */}
          <div className="flex justify-center">
            <div className="flex aspect-square w-full max-w-[280px] items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-300 shadow-xl sm:max-w-[360px] lg:max-w-[420px]">
              <span className="text-7xl sm:text-8xl lg:text-9xl">
                👨‍🌾
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;
