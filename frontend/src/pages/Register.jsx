
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Register() {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    role: "Farmer",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [listeningField, setListeningField] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const recognitionRef = useRef(null);

  const API_URL = "http://127.0.0.1:5000";

  const content = {
    en: {
      title: "Create Account",
      subtitle: "Join FarmConnect AI",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      city: "City",
      address: "Address",
      password: "Password",
      farmer: "Farmer",
      buyer: "Buyer",
      sendOtp: "Review Registration Details",
      otpLabel: "Email Verification OTP",
      otpPlaceholder: "Enter the 6-digit OTP",
      verifyOtp: "Verify OTP & Register",
      back: "Back to Login",
      changeEmail: "Change Details",
      speak: "Speak",
      listening: "Listening...",
      voiceError: "Voice input is not supported in this browser.",
      voicePermission: "Please allow microphone access and try again.",
      sending: "Sending OTP...",
      verifying: "Verifying...",
      confirmPrompt: "I heard",
      isCorrect: "Is this correct?",
      yes: "Yes, Confirm",
      no: "No, Try Again",
      summaryTitle: "Review Your Details",
      summarySubtitle: "Please check your registration information.",
      confirmSend: "Confirm & Send OTP",
      editDetails: "Edit Details",
      role: "Account Type",
      passwordHidden: "Password entered",
      voiceFailed: "Voice input failed. Please try again.",
      startFailed: "Unable to start voice input. Please try again.",
      otpSentMessage: "Registration OTP sent to your email. Please check your inbox.",
      otpSuccess: "Registration successful! You can now log in.",
      otpRequired: "Please enter the OTP received in your email.",
      confirmationLabel: "Voice Confirmation",
    },
    hi: {
      title: "खाता बनाएँ",
      subtitle: "FarmConnect AI से जुड़ें",
      name: "पूरा नाम",
      email: "ईमेल",
      phone: "फ़ोन नंबर",
      city: "शहर",
      address: "पता",
      password: "पासवर्ड",
      farmer: "किसान",
      buyer: "खरीदार",
      sendOtp: "पंजीकरण विवरण देखें",
      otpLabel: "ईमेल सत्यापन OTP",
      otpPlaceholder: "6 अंकों का OTP दर्ज करें",
      verifyOtp: "OTP सत्यापित करें और पंजीकरण करें",
      back: "लॉगिन पर वापस जाएँ",
      changeEmail: "विवरण बदलें",
      speak: "बोलें",
      listening: "सुन रही हूँ...",
      voiceError: "इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।",
      voicePermission: "माइक्रोफ़ोन की अनुमति दें और फिर कोशिश करें।",
      sending: "OTP भेजा जा रहा है...",
      verifying: "सत्यापित किया जा रहा है...",
      confirmPrompt: "मैंने सुना",
      isCorrect: "क्या यह सही है?",
      yes: "हाँ, सही है",
      no: "नहीं, फिर से बोलें",
      summaryTitle: "अपने विवरण जाँचें",
      summarySubtitle: "कृपया पंजीकरण की जानकारी जाँचें।",
      confirmSend: "पुष्टि करें और OTP भेजें",
      editDetails: "विवरण बदलें",
      role: "खाते का प्रकार",
      passwordHidden: "पासवर्ड दर्ज किया गया",
      voiceFailed: "वॉइस इनपुट विफल हुआ। फिर से कोशिश करें।",
      startFailed: "वॉइस इनपुट शुरू नहीं हो पाया। फिर से कोशिश करें।",
      otpSentMessage: "पंजीकरण OTP आपके ईमेल पर भेज दिया गया है।",
      otpSuccess: "पंजीकरण सफल रहा! अब आप लॉगिन कर सकते हैं।",
      otpRequired: "कृपया ईमेल पर प्राप्त OTP दर्ज करें।",
      confirmationLabel: "आवाज़ की पुष्टि",
    },
  };

  const text = content[language] || content.en;

  const voiceLanguage = {
    en: "en-IN",
    hi: "hi-IN",
    kn: "kn-IN",
  };

  const fieldLabels = {
    name: text.name,
    email: text.email,
    phone: text.phone,
    city: text.city,
    address: text.address,
  };

  const speakText = (value) => {
    if (!("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = voiceLanguage[language] || "en-IN";
    utterance.rate = 0.9;

    window.speechSynthesis.speak(utterance);
  };

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const startVoiceInput = (field) => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    setVoiceError("");
    setError("");

    if (!SpeechRecognition) {
      setVoiceError(text.voiceError);
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
    setListeningField(field);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();

      const recognizedText =
        field === "email"
          ? spokenText
              .replace(/\s+at\s+/gi, "@")
              .replace(/\s+dot\s+/gi, ".")
              .replace(/\s+/g, "")
          : spokenText;

      setPendingConfirmation({
        field,
        value: recognizedText,
      });

      speakText(
        `${text.confirmPrompt} ${fieldLabels[field]}: ${recognizedText}. ${text.isCorrect}`
      );
    };

    recognition.onerror = (event) => {
      console.error("VOICE INPUT ERROR:", event.error);

      if (event.error === "not-allowed") {
        setVoiceError(text.voicePermission);
      } else if (event.error !== "no-speech" && event.error !== "aborted") {
        setVoiceError(text.voiceFailed);
      }
    };

    recognition.onend = () => {
      setListeningField("");
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (err) {
      console.error(err);
      setListeningField("");
      setVoiceError(text.startFailed);
    }
  };

  const confirmVoiceInput = () => {
    if (!pendingConfirmation) return;

    const { field, value } = pendingConfirmation;

    setFormData((previous) => ({
      ...previous,
      [field]:
        field === "address" && previous.address.trim()
          ? previous.address + " " + value
          : field !== "address" && previous[field].trim()
          ? previous[field] + " " + value
          : value,
    }));

    setPendingConfirmation(null);
    setVoiceError("");
  };

  const rejectVoiceInput = () => {
    setPendingConfirmation(null);
    setVoiceError("");
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

  // First show the summary instead of sending OTP immediately.
  const handleRegister = (e) => {
    e.preventDefault();

    if (pendingConfirmation) {
      setError(
        "Please confirm or reject the pending voice input first."
      );
      return;
    }

    setError("");
    setMessage("");
    setShowSummary(true);
  };

  // Send OTP only after the user confirms the summary.
  const handleSendOtp = async () => {
    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(`${API_URL}/register`, {
        ...formData,
        email: formData.email.trim().toLowerCase(),
      });

      setOtpSent(true);
      setShowSummary(false);
      setOtp("");

      setMessage(
        response.data.message || text.otpSentMessage
      );
    } catch (err) {
      console.error("REGISTRATION OTP ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to send registration OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!otp.trim()) {
      setError(text.otpRequired);
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/verify-registration-otp`,
        {
          email: formData.email.trim().toLowerCase(),
          otp: otp.trim(),
        }
      );

      setMessage(
        response.data.message || text.otpSuccess
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        password: "",
        role: "Farmer",
      });

      setOtp("");
      setOtpSent(false);

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("REGISTRATION OTP VERIFICATION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "OTP verification failed. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVoiceField = (
    field,
    placeholder,
    multiline = false,
    inputType = "text"
  ) => {
    const commonProps = {
      name: field,
      placeholder,
      "aria-label": placeholder,
      value: formData[field],
      onChange: handleChange,
      disabled: loading || showSummary,
      required: true,
      className: "w-full border rounded-lg p-3",
    };

    return (
      <div>
        {multiline ? (
          <textarea {...commonProps} rows={3} />
        ) : (
          <input {...commonProps} type={inputType} />
        )}

        <button
          type="button"
          disabled={
            loading ||
            showSummary ||
            Boolean(listeningField && listeningField !== field)
          }
          onClick={() =>
            listeningField === field
              ? recognitionRef.current?.stop()
              : startVoiceInput(field)
          }
          className="mt-2 text-sm bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 disabled:opacity-50"
        >
          {listeningField === field
            ? `🎙 ${text.listening}`
            : `🎤 ${text.speak}`}
        </button>

        {pendingConfirmation?.field === field && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <p className="font-medium text-blue-800">
              {text.confirmationLabel}
            </p>

            <p className="text-gray-700 mt-1 break-words">
              {pendingConfirmation.value}
            </p>

            <p className="text-sm text-gray-600 mt-2">
              {text.isCorrect}
            </p>

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={confirmVoiceInput}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                {text.yes}
              </button>

              <button
                type="button"
                onClick={rejectVoiceInput}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
              >
                {text.no}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10 w-full max-w-lg">

        <div className="flex justify-end mb-5">
          <select
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setVoiceError("");
              setPendingConfirmation(null);
            }}
            className="border rounded-lg p-2"
            aria-label="Choose language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="kn">ಕನ್ನಡ (Kannada)</option>
          </select>
        </div>

        <h1 className="text-3xl font-bold text-center text-green-700">
          {showSummary ? text.summaryTitle : text.title}
        </h1>

        <p className="text-center text-gray-500 mt-2">
          {showSummary ? text.summarySubtitle : text.subtitle}
        </p>

        {message && (
          <div
            role="status"
            className="mt-5 p-3 rounded-lg bg-green-100 text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-5 p-3 rounded-lg bg-red-100 text-red-700"
          >
            {error}
          </div>
        )}

        {voiceError && (
          <div
            role="alert"
            className="mt-5 p-3 rounded-lg bg-yellow-100 text-yellow-800"
          >
            {voiceError}
          </div>
        )}

        {!otpSent && !showSummary ? (
          <form onSubmit={handleRegister} className="mt-8 space-y-4">

            {renderVoiceField("name", text.name)}

            {renderVoiceField("email", text.email, false, "email")}

            {renderVoiceField("phone", text.phone)}

            {renderVoiceField("city", text.city)}

            {renderVoiceField("address", text.address, true)}

            <input
              type="password"
              name="password"
              placeholder={text.password}
              aria-label={text.password}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              minLength={8}
              autoComplete="new-password"
              required
              className="w-full border rounded-lg p-3"
            />

            <select
              name="role"
              aria-label="Account type"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full border rounded-lg p-3"
            >
              <option value="Farmer">{text.farmer}</option>
              <option value="Buyer">{text.buyer}</option>
            </select>

            <button
              type="submit"
              disabled={loading || Boolean(pendingConfirmation)}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
            >
              {text.sendOtp}
            </button>
          </form>
        ) : showSummary && !otpSent ? (
          <div className="mt-8 space-y-4">

            <div className="bg-green-50 rounded-lg p-4 space-y-3">
              {[
                [text.name, formData.name],
                [text.email, formData.email],
                [text.phone, formData.phone],
                [text.city, formData.city],
                [text.address, formData.address],
                [text.role, formData.role === "Farmer" ? text.farmer : text.buyer],
                [text.password, text.passwordHidden],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-green-100 pb-2">
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-medium text-gray-800 break-words">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
            >
              {loading ? text.sending : text.confirmSend}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSummary(false);
                setError("");
              }}
              disabled={loading}
              className="w-full border border-green-600 text-green-700 py-3 rounded-lg hover:bg-green-50 disabled:opacity-60 transition"
            >
              {text.editDetails}
            </button>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">

            <p className="text-sm text-gray-600">
              Enter the verification code sent to{" "}
              <strong>{formData.email}</strong>.
            </p>

            <label
              htmlFor="registration-otp"
              className="block text-gray-700 font-medium"
            >
              {text.otpLabel}
            </label>

            <input
              id="registration-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={text.otpPlaceholder}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
            >
              {loading ? text.verifying : text.verifyOtp}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setMessage("");
                setError("");
              }}
              className="w-full border border-green-600 text-green-700 py-3 rounded-lg hover:bg-green-50 disabled:opacity-60 transition"
            >
              {text.changeEmail}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link
            to="/login"
            className="text-green-700 font-semibold hover:underline"
          >
            {text.back}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
