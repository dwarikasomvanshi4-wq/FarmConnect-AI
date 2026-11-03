
import { useNavigate } from "react-router-dom";

function Voice() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "36px 20px",
        boxSizing: "border-box",
        background: "linear-gradient(145deg, #f2f8f1, #f7faf7)",
        fontFamily: "Arial, sans-serif",
        color: "#203528",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            border: "1px solid #d8e5d9",
            background: "#fff",
            color: "#28553b",
            cursor: "pointer",
          }}
        >
          ← Go Back
        </button>

        <div style={{ marginTop: "30px" }}>
          <p style={{ color: "#398153", fontWeight: "bold" }}>
            FARMCONNECT AI
          </p>
          <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
            Voice Assistant
          </h1>
          <p style={{ color: "#718176", lineHeight: 1.7 }}>
            Interact with FarmConnect using voice to make farming tasks
            simpler and more accessible.
          </p>
        </div>

        <div
          style={{
            marginTop: "28px",
            padding: "30px",
            borderRadius: "18px",
            background: "#176b42",
            color: "#fff",
            textAlign: "center",
            boxShadow: "0 12px 30px #176b421c",
          }}
        >
          <div style={{ fontSize: "48px" }}>🎙️</div>
          <h2>Talk to FarmConnect</h2>
          <p style={{ lineHeight: 1.7, opacity: 0.9 }}>
            Voice commands can help you navigate the marketplace and manage
            farming tasks.
          </p>
          <div
            style={{
              display: "inline-block",
              marginTop: "10px",
              padding: "8px 13px",
              borderRadius: "20px",
              background: "#ffffff20",
              fontSize: "13px",
            }}
          >
            Voice interface setup pending
          </div>
        </div>

        <div
          style={{
            marginTop: "22px",
            padding: "22px",
            borderRadius: "16px",
            background: "#fff",
            border: "1px solid #e0eae0",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Planned voice features</h3>
          <ul style={{ lineHeight: 2, color: "#607266", paddingLeft: "22px" }}>
            <li>Voice-based navigation</li>
            <li>Crop and marketplace assistance</li>
            <li>Support for Indian languages</li>
            <li>Hands-free interaction</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Voice;
