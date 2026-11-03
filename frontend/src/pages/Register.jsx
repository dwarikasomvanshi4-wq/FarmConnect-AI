
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";

function Register() {
  const { language } = useLanguage();
  const navigate = useNavigate();

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
      register: "Register",
      sendOtp: "Send Registration OTP",
      otpLabel: "Email Verification OTP",
      otpPlaceholder: "Enter the 6-digit OTP",
      verifyOtp: "Verify OTP & Register",
      success: "Registration successful!",
      failed: "Registration failed",
      back: "Back to Login",
      changeEmail: "Change details",
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
      register: "रजिस्टर करें",
      sendOtp: "पंजीकरण OTP भेजें",
      otpLabel: "ईमेल सत्यापन OTP",
      otpPlaceholder: "6 अंकों का OTP दर्ज करें",
      verifyOtp: "OTP सत्यापित करें और पंजीकरण करें",
      success: "पंजीकरण सफल रहा!",
      failed: "पंजीकरण विफल रहा",
      back: "लॉगिन पर वापस जाएँ",
      changeEmail: "विवरण बदलें",
    },
    kn: {
      title: "ಖಾತೆ ರಚಿಸಿ",
      subtitle: "FarmConnect AI ಗೆ ಸೇರಿ",
      name: "ಪೂರ್ಣ ಹೆಸರು",
      email: "ಇಮೇಲ್",
      phone: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
      city: "ನಗರ",
      address: "ವಿಳಾಸ",
      password: "ಪಾಸ್‌ವರ್ಡ್",
      farmer: "ರೈತ",
      buyer: "ಖರೀದಿದಾರ",
      register: "ನೋಂದಣಿ",
      sendOtp: "ನೋಂದಣಿ OTP ಕಳುಹಿಸಿ",
      otpLabel: "ಇಮೇಲ್ ಪರಿಶೀಲನೆ OTP",
      otpPlaceholder: "6 ಅಂಕಿಯ OTP ನಮೂದಿಸಿ",
      verifyOtp: "OTP ಪರಿಶೀಲಿಸಿ ಮತ್ತು ನೋಂದಾಯಿಸಿ",
      success: "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ!",
      failed: "ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ",
      back: "ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      changeEmail: "ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ",
    },
  };

  const text = content[language] || content.en;

  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    role: "Farmer",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:5000";

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/register`,
        {
          ...formData,
          email: formData.email.trim().toLowerCase(),
        }
      );

      setOtpSent(true);
      setOtp("");
      setMessage(
        response.data.message ||
          "Registration OTP sent to your email. Please check your inbox."
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
      setError("Please enter the OTP received in your email.");
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
        response.data.message ||
          "Registration successful! You can now log in."
      );

      setFormData(initialFormData);
      setOtp("");
      setOtpSent(false);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
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

  return (
    <div className="min-h-screen bg-green-50 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-green-700">
          {text.title}
        </h1>

        <p className="text-center text-gray-500 mt-2">
          {text.subtitle}
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

        {!otpSent ? (
          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <input
              type="text"
              name="name"
              placeholder={text.name}
              aria-label={text.name}
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

            <input
              type="email"
              name="email"
              placeholder={text.email}
              aria-label={text.email}
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

            <input
              type="tel"
              name="phone"
              placeholder={text.phone}
              aria-label={text.phone}
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              name="city"
              placeholder={text.city}
              aria-label={text.city}
              value={formData.city}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

            <textarea
              name="address"
              placeholder={text.address}
              aria-label={text.address}
              rows="3"
              value={formData.address}
              onChange={handleChange}
              disabled={loading}
              required
              className="w-full border rounded-lg p-3"
            />

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
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
            >
              {loading ? "Sending OTP..." : text.sendOtp}
            </button>
          </form>
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
              {loading ? "Verifying..." : text.verifyOtp}
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
