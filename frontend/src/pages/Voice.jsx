
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Voice() {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState("");
  const [message, setMessage] = useState(
    "Press the microphone and speak a command."
  );
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en-IN");

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessage(
        "Voice recognition is not supported in this browser. Try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setMessage("Listening... speak now.");
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleCommand(text);
    };

    recognition.onerror = () => {
      setMessage(
        "Could not recognize your voice. Please try again."
      );
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleCommand = (text) => {
    const command = text.toLowerCase().trim();

    if (
      command.includes("my crops") ||
      command.includes("crops") ||
      command.includes("मेरी फसल") ||
      command.includes("ಬೆಳೆಗಳು")
    ) {
      setMessage("Opening My Crops...");
      navigate("/my-crops");
    } else if (
      command.includes("weather") ||
      command.includes("मौसम") ||
      command.includes("ಹವಾಮಾನ")
    ) {
      setMessage("Opening Weather...");
      navigate("/weather");
    } else if (
      command.includes("marketplace") ||
      command.includes("market") ||
      command.includes("बाजार") ||
      command.includes("ಮಾರುಕಟ್ಟೆ")
    ) {
      setMessage("Opening Marketplace...");
      navigate("/add-crop");
    } else if (command.includes("profile")) {
      setMessage("Opening your Profile...");
      navigate("/profile");
    } else if (
      command.includes("earnings") ||
      command.includes("income")
    ) {
      setMessage("Opening Earnings...");
      navigate("/earnings");
    } else if (
      command.includes("orders") ||
      command.includes("ऑर्डर")
    ) {
      setMessage("Opening Orders...");
      navigate("/orders");
    } else {
      setMessage(
        "Command not recognized. Try: Open My Crops, Weather, Marketplace, Profile, Earnings or Orders."
      );
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f2f8f1",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
        color: "#203528",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "#fff",
          padding: "32px",
          borderRadius: 20,
          boxShadow: "0 8px 30px rgba(20,70,40,0.08)",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#398153", fontWeight: "bold" }}>
          FARMCONNECT AI
        </p>

        <h1>Voice Assistant</h1>

        <p style={{ color: "#718176", lineHeight: 1.7 }}>
          Manage your farming dashboard using your voice.
        </p>

        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #dce8dc",
            margin: "18px 0",
            width: "100%",
            maxWidth: 300,
          }}
        >
          <option value="en-IN">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="kn-IN">Kannada</option>
        </select>

        <div style={{ margin: "25px 0" }}>
          <button
            onClick={startListening}
            disabled={listening}
            aria-label="Start voice recognition"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "none",
              background: listening ? "#d97706" : "#176b42",
              color: "#fff",
              fontSize: 38,
              cursor: listening ? "wait" : "pointer",
              boxShadow: "0 8px 20px rgba(23,107,66,0.2)",
            }}
          >
            {listening ? "…" : "🎙️"}
          </button>
        </div>

        <p style={{ fontWeight: "bold" }}>{message}</p>

        {transcript && (
          <div
            style={{
              marginTop: 20,
              padding: 18,
              background: "#f4f8f3",
              borderRadius: 12,
              textAlign: "left",
            }}
          >
            <strong>You said:</strong>
            <p>{transcript}</p>
          </div>
        )}

        <div
          style={{
            marginTop: 28,
            padding: 20,
            background: "#f8faf7",
            borderRadius: 12,
            textAlign: "left",
          }}
        >
          <h3>Try saying</h3>
          <ul style={{ lineHeight: 2 }}>
            <li>Open My Crops</li>
            <li>Open Weather</li>
            <li>Open Marketplace</li>
            <li>Open Profile</li>
            <li>Open Earnings</li>
            <li>Open Orders</li>
          </ul>
        </div>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 24,
            padding: "12px 20px",
            border: "1px solid #dce8dc",
            borderRadius: 10,
            background: "#fff",
            color: "#28553b",
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default Voice;
