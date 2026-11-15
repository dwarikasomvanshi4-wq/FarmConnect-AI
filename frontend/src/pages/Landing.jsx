
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import { useLanguage } from "../i18n/LanguageContext";

function Landing() {
  const { language, setLanguage } = useLanguage();
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

  return (
    <>
      <Navbar />

      {/* Multilingual Welcome Section */}
      <section className="bg-green-50 px-6 py-12">
        <div className="max-w-4xl mx-auto text-center bg-white rounded-2xl shadow-lg p-8">

          <div className="text-5xl mb-4">🌱</div>

          <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-3">
            {text.welcome}
          </h1>

          <p className="text-gray-600 text-lg mb-6">
            {text.subtitle}
          </p>

          <div className="mb-6">
            <label className="block font-semibold text-gray-700 mb-2">
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
              className="border border-green-500 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <button
            onClick={speakWelcome}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-full mb-8"
          >
            🔊 {text.replay}
          </button>

          <div className="grid md:grid-cols-2 gap-6 text-left">

            {/* New User */}
            <div className="border border-green-200 rounded-xl p-6 bg-green-50 text-center">
              <h2 className="text-xl font-bold text-green-800 mb-3">
                {text.newUser}
              </h2>

              <p className="text-gray-600 mb-5">
                {text.registerText}
              </p>

              <Link
                to="/register"
                className="inline-block bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-3 rounded-lg"
              >
                {text.register}
              </Link>
            </div>

            {/* Existing User */}
            <div className="border border-blue-200 rounded-xl p-6 bg-blue-50 text-center">
              <h2 className="text-xl font-bold text-blue-800 mb-3">
                {text.oldUser}
              </h2>

              <p className="text-gray-600 mb-5">
                {language === "hi"
                  ? "अपने अकाउंट में आगे बढ़ें।"
                  : language === "kn"
                  ? "ನಿಮ್ಮ ಖಾತೆಗೆ ಮುಂದುವರಿಯಿರಿ."
                  : "Continue to your account."}
              </p>

              <Link
                to="/login"
                className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg"
              >
                {text.login}
              </Link>
            </div>

          </div>
        </div>
      </section>

      <Hero />

      {/* Features */}
      <section className="bg-green-50 py-16">
        <div className="max-w-7xl mx-auto px-8">

          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            {text.featuresTitle}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
