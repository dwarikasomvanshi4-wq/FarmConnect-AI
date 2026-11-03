
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureCard from "../components/FeatureCard";
import { useLanguage } from "../i18n/LanguageContext";

function Landing() {
  const { language } = useLanguage();

  const content = {
    en: {
      featuresTitle: "Our Features",
      voiceTitle: "Voice Commands",
      voiceDescription: "Manage crops easily using voice.",
      weatherTitle: "Weather Updates",
      weatherDescription: "Real-time weather for better farming.",
      diseaseTitle: "AI Disease Detection",
      diseaseDescription: "Detect crop diseases using AI.",
      paymentTitle: "Secure Payments",
      paymentDescription: "Safe and transparent transactions.",
    },
    hi: {
      featuresTitle: "हमारी विशेषताएँ",
      voiceTitle: "आवाज़ से निर्देश",
      voiceDescription: "आवाज़ का उपयोग करके फसलों का प्रबंधन करें।",
      weatherTitle: "मौसम की जानकारी",
      weatherDescription: "बेहतर खेती के लिए वास्तविक समय का मौसम।",
      diseaseTitle: "AI से फसल रोग पहचान",
      diseaseDescription: "AI की मदद से फसलों के रोग पहचानें।",
      paymentTitle: "सुरक्षित भुगतान",
      paymentDescription: "सुरक्षित और पारदर्शी लेन-देन।",
    },
    kn: {
      featuresTitle: "ನಮ್ಮ ವೈಶಿಷ್ಟ್ಯಗಳು",
      voiceTitle: "ಧ್ವನಿ ಆಜ್ಞೆಗಳು",
      voiceDescription: "ಧ್ವನಿಯ ಮೂಲಕ ಬೆಳೆಗಳನ್ನು ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸಿ.",
      weatherTitle: "ಹವಾಮಾನ ಮಾಹಿತಿ",
      weatherDescription: "ಉತ್ತಮ ಕೃಷಿಗಾಗಿ ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಮಾಹಿತಿ.",
      diseaseTitle: "AI ಬೆಳೆ ರೋಗ ಪತ್ತೆ",
      diseaseDescription: "AI ಬಳಸಿ ಬೆಳೆ ರೋಗಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ.",
      paymentTitle: "ಸುರಕ್ಷಿತ ಪಾವತಿಗಳು",
      paymentDescription: "ಸುರಕ್ಷಿತ ಮತ್ತು ಪಾರದರ್ಶಕ ವಹಿವಾಟುಗಳು.",
    },
  };

  const text = content[language] || content.en;

  return (
    <>
      <Navbar />
      <Hero />

      <section className="bg-green-50 py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            {text.featuresTitle}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              icon="🤖"
              title={text.diseaseTitle}
              description={text.diseaseDescription}
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
