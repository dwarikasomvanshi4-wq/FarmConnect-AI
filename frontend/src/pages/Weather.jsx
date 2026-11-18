
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
      subtitle: "Check current weather conditions in your city.",
      placeholder: "Enter city",
      search: "Search Weather",
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
      temperature: "Temperature",
      currentWeather: "Current Weather",
    },
    hi: {
      title: "मौसम की जानकारी",
      subtitle: "अपने शहर के वर्तमान मौसम की जानकारी देखें।",
      placeholder: "शहर का नाम लिखें",
      search: "मौसम खोजें",
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
      temperature: "तापमान",
      currentWeather: "वर्तमान मौसम",
    },
    kn: {
      title: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
      subtitle: "ನಿಮ್ಮ ನಗರದ ಪ್ರಸ್ತುತ ಹವಾಮಾನವನ್ನು ಪರಿಶೀಲಿಸಿ.",
      placeholder: "ನಗರದ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
      search: "ಹವಾಮಾನ ಹುಡುಕಿ",
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
      temperature: "ತಾಪಮಾನ",
      currentWeather: "ಪ್ರಸ್ತುತ ಹವಾಮಾನ",
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
  }, [city, speak, t]);

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
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-100">
      <Sidebar />

      <main className="w-full min-w-0 px-4 py-6 sm:px-6 md:ml-72 md:w-[calc(100%-18rem)] md:px-8 md:py-10">
        {/* Page heading */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold text-green-700 sm:text-3xl md:text-4xl">
            🌦 {t.title}
          </h1>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Search section */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder={t.placeholder}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") getWeather(city, true);
              }}
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 p-4 text-base outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={() => getWeather(city, true)}
                disabled={loading}
                className="rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50 sm:px-6"
              >
                {loading ? "..." : t.search}
              </button>

              <button
                type="button"
                onClick={handleSpeakWeather}
                disabled={!weather || loading}
                className="rounded-xl bg-blue-600 px-3 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 sm:px-5"
              >
                {t.speak}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mb-5 flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            {t.loading}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Weather display */}
        {weather && (
          <section className="w-full">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 to-emerald-800 p-5 text-white shadow-xl sm:p-8 md:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-3 text-sm font-medium text-green-100 sm:text-base">
                    {t.currentWeather}
                  </p>

                  <h2 className="break-words text-2xl font-bold sm:text-3xl md:text-4xl">
                    📍 {weather.city}
                  </h2>

                  <p className="mt-3 text-base capitalize text-green-50 sm:text-lg">
                    {weather.weather}
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-5xl sm:text-6xl">🌤️</span>

                  <div>
                    <p className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
                      {weather.temperature}°
                    </p>

                    <p className="mt-1 text-sm text-green-100">
                      {t.temperature} (°C)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather details */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                  💧
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    {t.humidity}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {weather.humidity}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-3xl">
                  🌬️
                </div>

                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    {t.wind}
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-800">
                    {weather.wind_speed} m/s
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Weather;
