
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = "http://127.0.0.1:5000";

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
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
        throw new Error(data.message || "Unable to send OTP.");
      }

      setOtpSent(true);
      setMessage(data.message || "OTP sent to your email.");
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP received in your email.");
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
        throw new Error(data.message || "OTP verification failed.");
      }

      // Clear any previous user's session data before saving the new login

      // Clear previous session details in this tab
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userRole");

      // Save the currently logged-in user's details in this tab
      sessionStorage.setItem("userEmail", data.email);
      sessionStorage.setItem("userName", data.name);
      sessionStorage.setItem("userRole", data.role);


      setMessage("Login successful! Redirecting...");

      if (data.role?.toLowerCase() === "farmer") {
        navigate("/farmer-dashboard");
      } else if (data.role?.toLowerCase() === "buyer") {
        navigate("/buyer-dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>FarmConnect AI</h1>
        <h2>Login</h2>
        <p>Connect directly with farmers and buyers.</p>

        <form onSubmit={handleSendOtp}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={otpSent || loading}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={otpSent || loading}
            required
          />

          {!otpSent && (
            <button type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send Login OTP"}
            </button>
          )}
        </form>

        {otpSent && (
          <form onSubmit={handleVerifyOtp}>
            <label htmlFor="otp">Email OTP</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter the 6-digit OTP"
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              maxLength={6}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP & Login"}
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
              Back
            </button>
          </form>
        )}

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        <p>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="link-button"
          >
            Register here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
