
import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import { useLanguage } from "../i18n/LanguageContext";

function Landing() {
  const { language, setLanguage } = useLanguage();
  const location = useLocation();
  const hasSpoken = useRef(false);

  const content = {
    en: {
      welcome: "Welcome to FarmConnect AI!",
      subtitle: "Connecting Farmers and Buyers. Growing Together.",
      message:
        "Welcome to FarmConnect! If you are new here, please register. If you already have an account, please login.",
      newUser: "Are you new to FarmConnect?",
      registerText: "Create your account to get started.",
      register: "Register",
      oldUser: "Already have an account?",
      login: "Login",
      replay: "Listen to Welcome Message",
      featuresTitle: "Our Features",
      voiceTitle: "Voice Commands",
      voiceDescription: "Manage crops easily using voice.",
      weatherTitle: "Weather Updates",
      weatherDescription: "Real-time weather for better farming.",
      paymentTitle: "Secure Payments",
      paymentDescription: "Safe and transparent transactions.",
    },
    hi: {
      welcome: "FarmConnect AI में आपका स्वागत है!",
      subtitle: "किसानों और खरीदारों को जोड़ना। साथ मिलकर आगे बढ़ना।",
      message:
        "FarmConnect में आपका स्वागत है! अगर आप नए हैं, तो कृपया रजिस्टर करें। अगर आपका अकाउंट पहले से है, तो लॉगिन करें।",
      newUser: "क्या आप FarmConnect पर नए हैं?",
      registerText: "शुरू करने के लिए अपना अकाउंट बनाएं।",
      register: "रजिस्टर करें",
      oldUser: "क्या आपका पहले से अकाउंट है?",
      login: "लॉगिन करें",
      replay: "स्वागत संदेश फिर से सुनें",
      featuresTitle: "हमारी विशेषताएँ",
      voiceTitle: "आवाज़ से निर्देश",
      voiceDescription: "आवाज़ का उपयोग करके फसलों का प्रबंधन करें।",
      weatherTitle: "मौसम की जानकारी",
      weatherDescription: "बेहतर खेती के लिए वास्तविक समय का मौसम।",
      paymentTitle: "सुरक्षित भुगतान",
      paymentDescription: "सुरक्षित और पारदर्शी लेन-देन।",
    },
    kn: {
      welcome: "FarmConnect AI ಗೆ ಸ್ವಾಗತ!",
      subtitle: "ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರನ್ನು ಸಂಪರ್ಕಿಸೋಣ. ಒಟ್ಟಿಗೆ ಬೆಳೆಯೋಣ.",
      message:
        "FarmConnect ಗೆ ಸ್ವಾಗತ! ನೀವು ಹೊಸಬರಾಗಿದ್ದರೆ ದಯವಿಟ್ಟು ನೋಂದಾಯಿಸಿಕೊಳ್ಳಿ. ಈಗಾಗಲೇ ಖಾತೆ ಇದ್ದರೆ ಲಾಗಿನ್ ಮಾಡಿ.",
      newUser: "ನೀವು FarmConnect ಗೆ ಹೊಸಬರೇ?",
      registerText: "ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ.",
      register: "ನೋಂದಣಿ",
      oldUser: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
      login: "ಲಾಗಿನ್",
      replay: "ಸ್ವಾಗತ ಸಂದೇಶವನ್ನು ಮತ್ತೆ ಕೇಳಿ",
      featuresTitle: "ನಮ್ಮ ವೈಶಿಷ್ಟ್ಯಗಳು",
      voiceTitle: "ಧ್ವನಿ ಆಜ್ಞೆಗಳು",
      voiceDescription: "ಧ್ವನಿಯ ಮೂಲಕ ಬೆಳೆಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.",
      weatherTitle: "ಹವಾಮಾನ ಮಾಹಿತಿ",
      weatherDescription: "ಉತ್ತಮ ಕೃಷಿಗಾಗಿ ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮಾಹಿತಿ.",
      paymentTitle: "ಸುರಕ್ಷಿತ ಪಾವತಿಗಳು",
      paymentDescription: "ಸುರಕ್ಷಿತ ಮತ್ತು ಪಾರದರ್ಶಕ ವಹಿವಾಟುಗಳು.",
    },
  };

  const text = content[language] || content.en;

  const speechLanguage = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const speakWelcome = () => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support voice playback.");
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text.message);
    speech.lang = speechLanguage[language] || "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  useEffect(() => {
    if (!hasSpoken.current) {
      hasSpoken.current = true;

      const timer = setTimeout(() => {
        speakWelcome();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);
  useEffect(() => {
  const sectionId = location.state?.scrollTo;

  if (sectionId) {
    const timer = setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
    }, 300);

    return () => clearTimeout(timer);
  }
}, [location]);

  return (
    <>
      <Navbar />

      {/* Welcome Section */}
      <section id="welcome" className="bg-green-50 px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-4 text-center shadow-lg sm:p-6 md:p-8">

          <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">
            🌱
          </div>

          <h1 className="mb-3 text-2xl font-bold leading-tight text-green-800 sm:text-3xl md:text-4xl">
            {text.welcome}
          </h1>

          <p className="mb-5 text-base leading-relaxed text-gray-600 sm:mb-6 sm:text-lg">
            {text.subtitle}
          </p>

          {/* Language Selector */}
          <div className="mb-5 sm:mb-6">
            <label className="mb-2 block text-sm font-semibold text-gray-700 sm:text-base">
              {language === "hi"
                ? "अपनी भाषा चुनें"
                : language === "kn"
                ? "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ"
                : "Choose Your Language"}
            </label>

            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                window.speechSynthesis?.cancel();
              }}
              className="w-full max-w-xs rounded-lg border border-green-500 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          {/* Voice Welcome */}
          <button
            onClick={speakWelcome}
            className="mb-6 inline-flex w-full max-w-sm items-center justify-center rounded-full bg-yellow-400 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-yellow-500 sm:mb-8 sm:text-base"
          >
            🔊 {text.replay}
          </button>

          {/* Register and Login */}
          <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2 md:gap-6">

            {/* New User */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 sm:p-6">
              <h2 className="mb-3 text-lg font-bold leading-snug text-green-800 sm:text-xl">
                {text.newUser}
              </h2>

              <p className="mb-5 text-sm leading-relaxed text-gray-600 sm:text-base">
                {text.registerText}
              </p>

              <Link
                to="/register"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-green-700 px-6 py-3 font-bold text-white transition hover:bg-green-800 sm:w-auto"
              >
                {text.register}
              </Link>
            </div>

            {/* Existing User */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-6">
              <h2 className="mb-3 text-lg font-bold leading-snug text-blue-800 sm:text-xl">
                {text.oldUser}
              </h2>

              <p className="mb-5 text-sm leading-relaxed text-gray-600 sm:text-base">
                {language === "hi"
                  ? "अपने अकाउंट में आगे बढ़ें।"
                  : language === "kn"
                  ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಮುಂದುವರಿಯಿರಿ."
                  : "Continue to your account."}
              </p>

              <Link
                to="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-6 py-3 font-bold text-white transition hover:bg-blue-800 sm:w-auto"
              >
                {text.login}
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Hero Section */}
      <Hero />

      {/* Features */}
      <section id="features" className="bg-green-50 px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto w-full max-w-7xl">

          <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 sm:mb-10 sm:text-3xl md:mb-12 md:text-4xl">
            {text.featuresTitle}
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <FeatureCard
              icon="🎤"
              title={text.voiceTitle}
              description={text.voiceDescription}
            />

            <FeatureCard
              icon="🌦"
              title={text.weatherTitle}
              description={text.weatherDescription}
            />

            <FeatureCard
              icon="💳"
              title={text.paymentTitle}
              description={text.paymentDescription}
            />
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Landing;
