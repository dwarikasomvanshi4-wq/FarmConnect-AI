
import { useState } from "react";
import api from "../services/api";

function AddCrop() {
  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [voiceTranscript, setVoiceTranscript] = useState("");

  const startVoiceEntry = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice recognition is not supported in this browser. Please try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage("Listening... Speak your crop details.");
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setVoiceTranscript(spokenText);

      const text = spokenText.toLowerCase();
      const numbers = text.match(/\d+(?:\.\d+)?/g) || [];

      // Identify crop name from the beginning of the spoken command.
      let name = text
        .replace(/^(add|list|sell|create|crop|please)\s+/i, "")
        .replace(/\b\d+(?:\.\d+)?\b/g, " ")
        .replace(
          /\b(kg|kgs|kilogram|kilograms|kilo|kilos|rupees|rupee|rs|inr|per|each|price|at|quantity|of|for|the)\b/gi,
          " "
        )
        .replace(/\s+/g, " ")
        .trim();

      // Remove common trailing speech about units/prices.
      name = name.replace(
        /\b(vegetables|fruits|grains|pulses|spices)\b.*$/i,
        (match) => match
      );

      if (name) {
        const firstWord = name.split(" ")[0];
        setCropName(firstWord.charAt(0).toUpperCase() + firstWord.slice(1));
      }

      // Expected spoken format: "Tomato 100 kg at 20 rupees per kg"
      if (numbers.length >= 1) {
        setQuantity(numbers[0]);
      }

      if (numbers.length >= 2) {
        setPrice(numbers[1]);
      }

      const cropCategoryMap = {
        tomato: "Vegetables",
        potato: "Vegetables",
        onion: "Vegetables",
        carrot: "Vegetables",
        cabbage: "Vegetables",
        cauliflower: "Vegetables",
        chilli: "Vegetables",
        chili: "Vegetables",
        brinjal: "Vegetables",
        spinach: "Vegetables",
        mango: "Fruits",
        apple: "Fruits",
        banana: "Fruits",
        orange: "Fruits",
        grapes: "Fruits",
        rice: "Grains",
        wheat: "Grains",
        maize: "Grains",
        corn: "Grains",
        ragi: "Grains",
        gram: "Pulses",
        lentils: "Pulses",
        beans: "Pulses",
        turmeric: "Spices",
        pepper: "Spices",
        cardamom: "Spices",
      };

      const detectedCrop = name.split(" ")[0];
      const detectedCategory = cropCategoryMap[detectedCrop];

      if (detectedCategory) {
        setCategory(detectedCategory);
      }

      if (numbers.length >= 2 && name) {
        setVoiceMessage(
          "Crop details filled. Please review the crop name, quantity and price before saving."
        );
      } else {
        setVoiceMessage(
          "Speech recognized. Please check the fields and enter any missing quantity or price."
        );
      }
    };

    recognition.onerror = (event) => {
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access in your browser settings."
          : "Could not recognize your speech. Please try again."
      );
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceMessage("Could not start voice recognition. Please try again.");
    }
  };

  const saveCrop = async () => {
    if (!cropName.trim() || !category || !quantity || !price) {
      alert("Please fill in crop name, category, quantity and price.");
      return;
    }

    const farmerEmail =
      localStorage.getItem("userEmail") ||
      localStorage.getItem("email");

    if (!farmerEmail) {
      alert("Please log in before adding a crop.");
      return;
    }

    try {
      let imagePath = "";

      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await api.post("/upload-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        imagePath = uploadRes.data.file_path;
      }

      await api.post("/add-crop", {
        farmer_email: farmerEmail,
        crop_name: cropName,
        category,
        quantity,
        price,
        description,
        image: imagePath,
      });

      alert("🌾 Crop Added Successfully");

      setCropName("");
      setCategory("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setImage(null);
      setVoiceTranscript("");
      setVoiceMessage("");

      const imageInput = document.getElementById("imageInput");
      if (imageInput) imageInput.value = "";
    } catch (err) {
      console.error("Failed to add crop:", err);
      alert("Failed to Add Crop");
    }
  };

  const inputClass =
    "w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 flex justify-center items-center p-8">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-green-700 mb-6 text-center">
          🌾 Add New Crop
        </h1>

        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            🎙️ Add Crop Using Voice
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Speak the crop name, quantity and price. Check the filled fields
            before saving.
          </p>

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={`${inputClass} mb-4 bg-white`}
            aria-label="Voice recognition language"
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="kn-IN">Kannada</option>
          </select>

          <button
            type="button"
            onClick={startVoiceEntry}
            disabled={listening}
            className={`w-full text-white py-4 rounded-xl font-semibold ${
              listening
                ? "bg-orange-500 cursor-wait"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {listening ? "🎙️ Listening..." : "🎤 Speak Crop Details"}
          </button>

          {voiceMessage && (
            <p className="mt-4 text-sm text-green-900" role="status">
              {voiceMessage}
            </p>
          )}

          {voiceTranscript && (
            <div className="mt-3 rounded-xl bg-white border border-green-100 p-3">
              <p className="text-sm font-semibold text-gray-700">
                Recognized speech:
              </p>
              <p className="text-gray-600">{voiceTranscript}</p>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Example: “Tomato 100 kg at 20 rupees per kg”
          </p>
        </div>

        <div className="space-y-5">
          <input
            type="text"
            placeholder="Crop Name"
            value={cropName}
            onChange={(event) => setCropName(event.target.value)}
            className={inputClass}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select Category</option>
            <option>Vegetables</option>
            <option>Fruits</option>
            <option>Grains</option>
            <option>Pulses</option>
            <option>Spices</option>
          </select>

          <input
            type="number"
            placeholder="Quantity (Kg)"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className={inputClass}
          />

          <input
            type="number"
            placeholder="Price per Kg (₹)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClass}
          />

          <textarea
            rows="4"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className={inputClass}
          />

          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files[0] || null)}
            className="w-full border border-gray-300 p-3 rounded-xl"
          />

          <button
            type="button"
            onClick={saveCrop}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-semibold transition"
          >
            🌾 Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddCrop;
