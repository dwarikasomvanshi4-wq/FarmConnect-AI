
import { useState } from "react";
import api from "../services/api";

function AddCrop() {
  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [voiceMode, setVoiceMode] = useState("crop");
  const [pendingTranscript, setPendingTranscript] = useState("");

  // Capture farmer's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Location is not supported by this browser. You can still list your crop."
      );
      return;
    }

    setGettingLocation(true);
    setLocationMessage("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationMessage("Location captured successfully!");
        setGettingLocation(false);
      },
      (error) => {
        setLatitude(null);
        setLongitude(null);

        setLocationMessage(
          error.code === 1
            ? "Location permission denied. You can still list your crop."
            : "Unable to get location. You can still list your crop."
        );

        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Start voice recognition for crop details or description
  const startVoiceEntry = (mode = "crop") => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice recognition is not supported in this browser. Please try Google Chrome."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    setVoiceMode(mode);
    setPendingTranscript("");

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage(
        mode === "description"
          ? "Listening... Speak your crop description."
          : "Listening... Speak your crop name, quantity and price."
      );
    };

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim();

      if (!spokenText) {
        setVoiceMessage("No speech detected. Please try again.");
        return;
      }

      setPendingTranscript(spokenText);

      setVoiceMessage(
        "Speech recognized! Please review the text below and confirm whether it is correct."
      );
    };

    recognition.onerror = (event) => {
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access in your browser settings."
          : event.error === "no-speech"
          ? "No speech detected. Please try speaking again."
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

  // Identify crop category
  const getCropCategory = (name) => {
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
      cucumber: "Vegetables",
      mango: "Fruits",
      apple: "Fruits",
      banana: "Fruits",
      orange: "Fruits",
      grapes: "Fruits",
      papaya: "Fruits",
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

    return cropCategoryMap[name.toLowerCase()] || "";
  };

  // Confirm the recognized speech
  const confirmVoiceInput = () => {
    const confirmedText = pendingTranscript.trim();

    if (!confirmedText) {
      setVoiceMessage("Please speak something before confirming.");
      return;
    }

    // Description confirmation
    if (voiceMode === "description") {
      setDescription(confirmedText);
      setVoiceMessage("Description added successfully! You can edit it if needed.");
      setPendingTranscript("");
      return;
    }

    // Crop details confirmation
    const numbers = confirmedText.match(/\d+(?:\.\d+)?/g) || [];

    let cleanedName = confirmedText
      .toLowerCase()
      .replace(/^(add|list|sell|create|crop|please)\s+/i, "")
      .replace(/\b\d+(?:\.\d+)?\b/g, " ")
      .replace(
        /\b(kg|kgs|kilogram|kilograms|kilo|kilos|rupees|rupee|rs|inr|per|each|price|at|quantity|of|for|the)\b/gi,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

    const cropNameDetected = cleanedName.split(" ")[0] || "";

    if (cropNameDetected) {
      const formattedName =
        cropNameDetected.charAt(0).toUpperCase() +
        cropNameDetected.slice(1);

      setCropName(formattedName);

      const detectedCategory = getCropCategory(cropNameDetected);

      if (detectedCategory) {
        setCategory(detectedCategory);
      }
    }

    if (numbers.length >= 1) {
      setQuantity(numbers[0]);
    }

    if (numbers.length >= 2) {
      setPrice(numbers[1]);
    }

    if (cropNameDetected && numbers.length >= 2) {
      setVoiceMessage(
        "Crop details confirmed and filled! Review the fields before saving."
      );
    } else {
      setVoiceMessage(
        "Recognized details added. Please manually fill in any missing information."
      );
    }

    setPendingTranscript("");
  };

  // Reject recognized speech and try again
  const rejectVoiceInput = () => {
    setPendingTranscript("");
    setVoiceMessage(
      "No problem! Press the microphone button and speak again."
    );
  };

  // Save crop
  const saveCrop = async () => {
    if (!cropName.trim() || !category || !quantity || !price) {
      alert("Please fill in crop name, category, quantity and price.");
      return;
    }

    const farmerEmail =
      sessionStorage.getItem("userEmail") ||
      sessionStorage.getItem("email");

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
        latitude,
        longitude,
      });

      alert("🌾 Crop Added Successfully");

      setCropName("");
      setCategory("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setImage(null);

      setPendingTranscript("");
      setVoiceMessage("");

      setLatitude(null);
      setLongitude(null);
      setLocationMessage("");

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
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 flex justify-center items-center p-4 sm:p-8">
      <div className="bg-white shadow-2xl rounded-3xl p-5 sm:p-10 w-full max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-green-700 mb-6 text-center">
          🌾 Add New Crop
        </h1>

        {/* Voice input section */}
        <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-xl font-bold text-green-800 mb-2">
            🎙️ Add Crop Using Voice
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            Speak your crop details or description. Review the recognized
            speech and confirm before applying it.
          </p>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Voice Language
          </label>

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
            onClick={() => startVoiceEntry("crop")}
            disabled={listening}
            className={`w-full text-white py-4 rounded-xl font-semibold ${
              listening
                ? "bg-orange-500 cursor-wait"
                : "bg-green-700 hover:bg-green-800"
            }`}
          >
            {listening && voiceMode === "crop"
              ? "🎙️ Listening..."
              : "🎤 Speak Crop Details"}
          </button>

          {voiceMessage && (
            <p className="mt-4 text-sm text-green-900" role="status">
              {voiceMessage}
            </p>
          )}

          {/* Speech confirmation */}
          {pendingTranscript && (
            <div className="mt-4 rounded-xl border border-green-200 bg-white p-4">
              <h3 className="font-bold text-gray-800 mb-2">
                {voiceMode === "description"
                  ? "Recognized Description:"
                  : "Recognized Crop Details:"}
              </h3>

              <textarea
                rows="3"
                value={pendingTranscript}
                onChange={(event) =>
                  setPendingTranscript(event.target.value)
                }
                className={inputClass}
                placeholder="Recognized speech will appear here..."
              />

              <p className="text-xs text-gray-500 mt-2">
                Check the text carefully. You can correct it before confirming.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  type="button"
                  onClick={confirmVoiceInput}
                  className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800"
                >
                  ✓ Yes, Correct
                </button>

                <button
                  type="button"
                  onClick={rejectVoiceInput}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                >
                  ✕ No, Try Again
                </button>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-gray-500">
            Example: "Tomato 100 kg at 20 rupees per kg"
          </p>
        </div>

        <div className="space-y-5">
          {/* Farm location */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h2 className="mb-2 text-lg font-semibold text-green-800">
              📍 Farm Location
            </h2>

            <p className="mb-3 text-sm text-gray-600">
              Share your location so nearby buyers can discover your crops.
              This is optional.
            </p>

            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="rounded-lg bg-green-700 px-5 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
            >
              {gettingLocation
                ? "Getting Location..."
                : "📍 Use My Current Location"}
            </button>

            {locationMessage && (
              <p className="mt-3 text-sm text-green-900" role="status">
                {locationMessage}
              </p>
            )}

            {latitude !== null && longitude !== null && (
              <p className="mt-2 text-xs text-gray-600">
                Coordinates captured: {latitude.toFixed(5)},{" "}
                {longitude.toFixed(5)}
              </p>
            )}
          </div>

          {/* Crop name */}
          <input
            type="text"
            placeholder="Crop Name"
            value={cropName}
            onChange={(event) => setCropName(event.target.value)}
            className={inputClass}
          />

          {/* Category */}
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

          {/* Quantity */}
          <input
            type="number"
            placeholder="Quantity (Kg)"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className={inputClass}
          />

          {/* Price */}
          <input
            type="number"
            placeholder="Price per Kg (₹)"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className={inputClass}
          />

          {/* Description with voice input */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <label className="block text-lg font-semibold text-green-800 mb-3">
              📝 Crop Description
            </label>

            <p className="text-sm text-gray-600 mb-3">
              Type your description or use the microphone to speak it in
              English, Hindi or Kannada.
            </p>

            <button
              type="button"
              onClick={() => startVoiceEntry("description")}
              disabled={listening}
              className={`w-full mb-3 rounded-xl py-3 font-semibold text-white ${
                listening && voiceMode === "description"
                  ? "bg-orange-500 cursor-wait"
                  : "bg-green-700 hover:bg-green-800"
              }`}
            >
              {listening && voiceMode === "description"
                ? "🎙️ Listening to Description..."
                : "🎤 Speak Description"}
            </button>

            <textarea
              rows="4"
              placeholder="Example: Fresh organic tomatoes grown naturally without harmful chemicals."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={inputClass}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Crop Image
            </label>

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImage(event.target.files[0] || null)
              }
              className="w-full border border-gray-300 p-3 rounded-xl"
            />

            {image && (
              <p className="mt-2 text-sm text-green-700">
                Selected image: {image.name}
              </p>
            )}
          </div>

          {/* Save crop */}
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
