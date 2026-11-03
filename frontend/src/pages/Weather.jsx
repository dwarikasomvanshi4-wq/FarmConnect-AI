
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

function Weather() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("Bangalore");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { language } = useLanguage();

  const messages = {
    en: {
      title: "Live Weather",
      placeholder: "Enter city",
      search: "Search",
      speak: "🔊 Speak Weather",
      loading: "Fetching weather information...",
      error: "Unable to fetch weather. Please check your city or try again.",
      humidity: "Humidity",
      wind: "Wind Speed",
      degrees: "degrees Celsius",
      conditions: "Weather conditions are",
      humiditySpoken: "Humidity is",
      windSpoken: "Wind speed is",
      percent: "percent",
      meters: "meters per second",
      cityRequired: "Please enter a city name.",
    },
    hi: {
      title: "मौसम की जानकारी",
      placeholder: "शहर का नाम लिखें",
      search: "खोजें",
      speak: "🔊 मौसम सुनें",
      loading: "मौसम की जानकारी प्राप्त हो रही है...",
      error: "मौसम की जानकारी नहीं मिल सकी। शहर का नाम जाँचें और दोबारा कोशिश करें।",
      humidity: "नमी",
      wind: "हवा की गति",
      degrees: "डिग्री सेल्सियस",
      conditions: "मौसम की स्थिति है",
      humiditySpoken: "नमी है",
      windSpoken: "हवा की गति है",
      percent: "प्रतिशत",
      meters: "मीटर प्रति सेकंड",
      cityRequired: "कृपया शहर का नाम लिखें।",
    },
    kn: {
      title: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
      placeholder: "ನಗರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      search: "ಹುಡುಕಿ",
      speak: "🔊 ಹವಾಮಾನ ಕೇಳಿ",
      loading: "ಹವಾಮಾನದ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
      error: "ಹವಾಮಾನ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ನಗರದ ಹೆಸರನ್ನು ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      humidity: "ಆರ್ದ್ರತೆ",
      wind: "ಗಾಳಿಯ ವೇಗ",
      degrees: "ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್",
      conditions: "ಹವಾಮಾನದ ಸ್ಥಿತಿ",
      humiditySpoken: "ಆರ್ದ್ರತೆ",
      windSpoken: "ಗಾಳಿಯ ವೇಗ",
      percent: "ಶೇಕಡಾ",
      meters: "ಮೀಟರ್ ಪ್ರತಿ ಸೆಕೆಂಡ್",
      cityRequired: "ದಯವಿಟ್ಟು ನಗರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
    },
  };

  const t = messages[language] || messages.en;

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support voice announcements.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      language === "hi"
        ? "hi-IN"
        : language === "kn"
        ? "kn-IN"
        : "en-IN";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }, [language]);

  const getWeather = useCallback(async (cityName = city, shouldSpeak = false) => {
    const trimmedCity = cityName.trim();

    if (!trimmedCity) {
      setError(t.cityRequired);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.get(
        `/weather/${encodeURIComponent(trimmedCity)}`
      );

      setWeather(res.data);

      if (shouldSpeak) {
        const data = res.data;
        const spokenText = `${data.city}. ${t.conditions} ${data.weather}. Temperature is ${data.temperature} ${t.degrees}. ${t.humiditySpoken} ${data.humidity} ${t.percent}. ${t.windSpoken} ${data.wind_speed} ${t.meters}.`;
        speak(spokenText);
      }
    } catch (err) {
      console.error("Weather fetch failed:", err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }, [city, language, speak, t]);

  useEffect(() => {
    getWeather("Bangalore", false);

    return () => {
      stopSpeaking();
    };
  }, []);

  const handleSpeakWeather = () => {
    if (!weather) {
      getWeather(city, true);
      return;
    }

    const spokenText = `${weather.city}. ${t.conditions} ${weather.weather}. Temperature is ${weather.temperature} ${t.degrees}. ${t.humiditySpoken} ${weather.humidity} ${t.percent}. ${t.windSpoken} ${weather.wind_speed} ${t.meters}.`;
    speak(spokenText);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />

      <main className="ml-72 p-6 md:p-10">
        <h1 className="mb-8 text-3xl font-bold text-green-700 md:text-4xl">
          🌦 {t.title}
        </h1>

        <div className="mb-8 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder={t.placeholder}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") getWeather(city, true);
            }}
            className="w-72 rounded-lg border bg-white p-3"
          />

          <button
            onClick={() => getWeather(city, true)}
            disabled={loading}
            className="rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "..." : t.search}
          </button>

          <button
            onClick={handleSpeakWeather}
            disabled={!weather || loading}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {t.speak}
          </button>
        </div>

        {loading && (
          <p className="mb-5 text-gray-600">{t.loading}</p>
        )}

        {error && (
          <div className="mb-6 max-w-xl rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {weather && (
          <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-green-700">
              📍 {weather.city}
            </h2>

            <p className="mt-5 text-5xl font-semibold text-gray-800">
              🌡️ {weather.temperature}°C
            </p>

            <p className="mt-4 text-xl capitalize text-gray-700">
              ☁️ {weather.weather}
            </p>

            <div className="mt-6 space-y-3 text-lg text-gray-700">
              <p>
                💧 {t.humidity}: {weather.humidity}%
              </p>

              <p>
                🌬️ {t.wind}: {weather.wind_speed} m/s
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Weather;
