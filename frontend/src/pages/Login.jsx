
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const translations = {
  en: {
    login: "Login",
    tagline: "Connect directly with farmers and buyers.",
    email: "Email Address",
    emailPlaceholder: "Enter your registered email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    sendOtp: "Send Login OTP",
    sendingOtp: "Sending OTP...",
    emailOtp: "Email OTP",
    otpPlaceholder: "Enter the 6-digit OTP",
    verify: "Verify OTP & Login",
    verifying: "Verifying...",
    back: "Back",
    forgot: "Forgot Password?",
    noAccount: "Don't have an account?",
    register: "Register here",
    enterDetails: "Please enter your email and password.",
    enterOtp: "Please enter the OTP received in your email.",
    otpSent: "OTP sent to your email.",
    loginSuccess: "Login successful! Redirecting...",
    sendError: "Unable to send OTP. Please try again.",
    verifyError: "OTP verification failed. Please try again.",
    serverError: "Could not connect to the server.",
    language: "Select Language",
    speak: "Speak Email",
    listening: "Listening...",
    voiceError: "Voice input is not supported in this browser.",
    voicePermission: "Please allow microphone access.",
    confirmPrompt: "I heard your email address as",
    isCorrect: "Is this correct?",
    yes: "Yes, Confirm",
    no: "No, Try Again",
    listenInstructions: "Listen to Login Instructions",
    instructions:
      "Welcome to FarmConnect AI. Enter your registered email address and password. You can also speak your email using the microphone button. Confirm the email and select Send Login OTP. Enter the OTP received in your email to log in.",
  },

  hi: {
    login: "लॉगिन करें",
    tagline: "किसानों और खरीदारों से सीधे जुड़ें।",
    email: "ईमेल पता",
    emailPlaceholder: "अपना रजिस्टर्ड ईमेल दर्ज करें",
    password: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    sendOtp: "लॉगिन OTP भेजें",
    sendingOtp: "OTP भेजा जा रहा है...",
    emailOtp: "ईमेल OTP",
    otpPlaceholder: "6 अंकों का OTP दर्ज करें",
    verify: "OTP सत्यापित करें और लॉगिन करें",
    verifying: "सत्यापित किया जा रहा है...",
    back: "वापस",
    forgot: "पासवर्ड भूल गए?",
    noAccount: "क्या आपका अकाउंट नहीं है?",
    register: "यहाँ रजिस्टर करें",
    enterDetails: "कृपया अपना ईमेल और पासवर्ड दर्ज करें।",
    enterOtp: "कृपया अपने ईमेल पर प्राप्त OTP दर्ज करें।",
    otpSent: "आपके ईमेल पर OTP भेज दिया गया है।",
    loginSuccess: "लॉगिन सफल! रीडायरेक्ट किया जा रहा है...",
    sendError: "OTP नहीं भेजा जा सका। कृपया फिर से प्रयास करें।",
    verifyError: "OTP सत्यापन विफल हुआ। कृपया फिर से प्रयास करें।",
    serverError: "सर्वर से कनेक्ट नहीं हो सका।",
    language: "भाषा चुनें",
    speak: "ईमेल बोलें",
    listening: "सुन रही हूँ...",
    voiceError: "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।",
    voicePermission: "कृपया माइक्रोफ़ोन की अनुमति दें।",
    confirmPrompt: "आपका ईमेल है",
    isCorrect: "क्या यह सही है?",
    yes: "हाँ, सही है",
    no: "नहीं, फिर से बोलें",
    listenInstructions: "लॉगिन निर्देश सुनें",
    instructions:
      "FarmConnect AI में आपका स्वागत है। अपना रजिस्टर्ड ईमेल और पासवर्ड दर्ज करें। आप माइक्रोफ़ोन से अपना ईमेल भी बोल सकते हैं। ईमेल की पुष्टि करें और लॉगिन OTP भेजें चुनें। लॉगिन करने के लिए अपने ईमेल पर प्राप्त OTP दर्ज करें।",
  },

  kn: {
    login: "ಲಾಗಿನ್",
    tagline: "ರೈತರು ಮತ್ತು ಖರೀದಿದಾರರೊಂದಿಗೆ ನೇರವಾಗಿ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
    email: "ಇಮೇಲ್ ವಿಳಾಸ",
    emailPlaceholder: "ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    password: "ಪಾಸ್‌ವರ್ಡ್",
    passwordPlaceholder: "ನಿಮ್ಮ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ",
    sendOtp: "ಲಾಗಿನ್ OTP ಕಳುಹಿಸಿ",
    sendingOtp: "OTP ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ...",
    emailOtp: "ಇಮೇಲ್ OTP",
    otpPlaceholder: "6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
    verify: "OTP ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ",
    verifying: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...",
    back: "ಹಿಂದಕ್ಕೆ",
    forgot: "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    noAccount: "ನಿಮಗೆ ಖಾತೆ ಇಲ್ಲವೇ?",
    register: "ಇಲ್ಲಿ ನೋಂದಾಯಿಸಿ",
    enterDetails: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.",
    enterOtp: "ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಬಂದ OTP ನಮೂದಿಸಿ.",
    otpSent: "ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ OTP ಕಳುಹಿಸಲಾಗಿದೆ.",
    loginSuccess: "ಲಾಗಿನ್ ಯಶಸ್ವಿಯಾಗಿದೆ! ಮುಂದುವರಿಯುತ್ತಿದೆ...",
    sendError: "OTP ಕಳುಹಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    verifyError: "OTP ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    serverError: "ಸರ್ವರ್‌ಗೆ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
    language: "ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    speak: "ಇಮೇಲ್ ಹೇಳಿ",
    listening: "ಕೇಳುತ್ತಿದೆ...",
    voiceError: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಇನ್‌ಪುಟ್ ಲಭ್ಯವಿಲ್ಲ.",
    voicePermission: "ದಯವಿಟ್ಟು ಮೈಕ್ರೋಫೋನ್ ಅನುಮತಿಸಿ.",
    confirmPrompt: "ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸ",
    isCorrect: "ಇದು ಸರಿಯಾಗಿದೆಯೇ?",
    yes: "ಹೌದು, ದೃಢೀಕರಿಸಿ",
    no: "ಇಲ್ಲ, ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    listenInstructions: "ಲಾಗಿನ್ ಸೂಚನೆಗಳನ್ನು ಕೇಳಿ",
    instructions:
      "FarmConnect AI ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ನೋಂದಾಯಿತ ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ. ಮೈಕ್ರೋಫೋನ್ ಬಳಸಿ ಇಮೇಲ್ ಹೇಳಬಹುದು. ಇಮೇಲ್ ದೃಢೀಕರಿಸಿ ಮತ್ತು ಲಾಗಿನ್ OTP ಕಳುಹಿಸಿ ಆಯ್ಕೆಮಾಡಿ. ಲಾಗಿನ್ ಮಾಡಲು ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಬಂದ OTP ನಮೂದಿಸಿ.",
  },
};

function Login() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("en");
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");

  const recognitionRef = useRef(null);

  const API_URL = "http://127.0.0.1:5000";

  const voiceLanguage = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const speakText = (value) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(value);
    speech.lang = voiceLanguage[language] || "en-IN";
    speech.rate = 0.9;

    window.speechSynthesis.speak(speech);
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setVoiceError("");
    setError("");

    if (!SpeechRecognition) {
      setVoiceError(t.voiceError);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();

    recognition.lang = voiceLanguage[language] || "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();

      const recognizedEmail = spokenText
        .replace(/\s+at\s+/gi, "@")
        .replace(/\s+dot\s+/gi, ".")
        .replace(/\s+/g, "")
        .toLowerCase();

      setPendingEmail(recognizedEmail);

      speakText(
        `${t.confirmPrompt} ${recognizedEmail}. ${t.isCorrect}`
      );
    };

    recognition.onerror = (event) => {
      console.error("LOGIN VOICE ERROR:", event.error);

      if (event.error === "not-allowed") {
        setVoiceError(t.voicePermission);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceError(t.voiceError);
      }
    };

    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error(err);
      setListening(false);
      setVoiceError(t.voiceError);
    }
  };

  const confirmEmail = () => {
    setEmail(pendingEmail);
    setPendingEmail("");
    setVoiceError("");
  };

  const rejectEmail = () => {
    setPendingEmail("");
    setVoiceError("");
    startVoiceInput();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim() || !password) {
      setError(t.enterDetails);
      return;
    }

    if (pendingEmail) {
      setError("Please confirm your voice-entered email first.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/request-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.sendError);
      }

      setOtpSent(true);
      setMessage(t.otpSent);
      speakText(t.otpSent);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? t.serverError
          : err.message || t.sendError
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!otp.trim()) {
      setError(t.enterOtp);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/verify-login-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.verifyError);
      }

      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userRole");

      sessionStorage.setItem("userEmail", data.email);
      sessionStorage.setItem("userName", data.name);
      sessionStorage.setItem("userRole", data.role);

      setMessage(t.loginSuccess);
      speakText(t.loginSuccess);

      if (data.role?.toLowerCase() === "farmer") {
        navigate("/farmer-dashboard");
      } else if (data.role?.toLowerCase() === "buyer") {
        navigate("/buyer-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? t.serverError
          : err.message || t.verifyError
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>FarmConnect AI</h1>
        <h2>{t.login}</h2>
        <p>{t.tagline}</p>

        <label htmlFor="language">{t.language}</label>
        <select
          id="language"
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value);
            setPendingEmail("");
            setVoiceError("");
            window.speechSynthesis?.cancel();
          }}
          disabled={loading}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>

        <button
          type="button"
          onClick={() => speakText(t.instructions)}
          disabled={loading}
          className="voice-instructions-button"
        >
          🔊 {t.listenInstructions}
        </button>

        <form onSubmit={handleSendOtp}>
          <label htmlFor="email">{t.email}</label>

          <input
            id="email"
            type="email"
            placeholder={t.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={otpSent || loading}
            required
          />

          {!otpSent && (
            <>
              <button
                type="button"
                onClick={
                  listening
                    ? () => recognitionRef.current?.stop()
                    : startVoiceInput
                }
                disabled={loading}
              >
                {listening ? `🎙 ${t.listening}` : `🎤 ${t.speak}`}
              </button>

              {pendingEmail && (
                <div className="voice-confirmation">
                  <p>{t.confirmPrompt}:</p>
                  <strong>{pendingEmail}</strong>
                  <p>{t.isCorrect}</p>

                  <button type="button" onClick={confirmEmail}>
                    {t.yes}
                  </button>

                  <button type="button" onClick={rejectEmail}>
                    {t.no}
                  </button>
                </div>
              )}
            </>
          )}

          <label htmlFor="password">{t.password}</label>
          <input
            id="password"
            type="password"
            placeholder={t.passwordPlaceholder}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={otpSent || loading}
            required
          />

          {!otpSent && (
            <button type="submit" disabled={loading || Boolean(pendingEmail)}>
              {loading ? t.sendingOtp : t.sendOtp}
            </button>
          )}
        </form>

        {otpSent && (
          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="otp">{t.emailOtp}</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={t.otpPlaceholder}
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? t.verifying : t.verify}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
                setError("");
              }}
              disabled={loading}
            >
              {t.back}
            </button>
          </form>
        )}

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        {voiceError && <p className="error-message">{voiceError}</p>}

        <div className="forgot-password-link">
          <Link to="/forgot-password">{t.forgot}</Link>
        </div>

        <p>
          {t.noAccount}{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="link-button"
          >
            {t.register}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
