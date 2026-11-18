
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
  const [speaking, setSpeaking] = useState(false);

  const languagePrompts = {
    "en-IN": {
      question: "Is this correct? Say yes to confirm or no to try again.",
      yes: ["yes", "yeah", "correct", "right", "confirm"],
      no: ["no", "wrong", "incorrect", "again", "retry"],
      confirmed: "Your information has been confirmed.",
      retry: "Okay. Please speak again.",
    },
    "hi-IN": {
      question:
        "क्या यह सही है? पुष्टि करने के लिए हाँ बोलें या दोबारा बोलने के लिए नहीं बोलें।",
      yes: ["हाँ", "हां", "सही", "जी", "ठीक"],
      no: ["नहीं", "गलत", "दोबारा"],
      confirmed: "आपकी जानकारी की पुष्टि हो गई है।",
      retry: "ठीक है। कृपया दोबारा बोलें।",
    },
    "kn-IN": {
      question:
        "ಇದು ಸರಿಯಾಗಿದೆಯೇ? ಖಚಿತಪಡಿಸಲು ಹೌದು ಎಂದು ಹೇಳಿ ಅಥವಾ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಲು ಇಲ್ಲ ಎಂದು ಹೇಳಿ.",
      yes: ["ಹೌದು", "ಸರಿ", "ಹೌದು ಸರಿ"],
      no: ["ಇಲ್ಲ", "ತಪ್ಪು", "ಮತ್ತೆ"],
      confirmed: "ನಿಮ್ಮ ಮಾಹಿತಿ ದೃಢೀಕರಿಸಲಾಗಿದೆ.",
      retry: "ಸರಿ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ.",
    },
  };

  // Read text aloud
  const speakText = (text, onFinished) => {
    if (!("speechSynthesis" in window)) {
      setVoiceMessage(
        "Audio reading is not supported in this browser. Please use the confirmation buttons."
      );

      if (onFinished) onFinished();
      return;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };

    utterance.onend = () => {
      setSpeaking(false);
      if (onFinished) onFinished();
    };

    utterance.onerror = () => {
      setSpeaking(false);
      if (onFinished) onFinished();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Read recognized speech and ask for confirmation
  const speakConfirmation = (recognizedText) => {
    const prompt =
      languagePrompts[language] || languagePrompts["en-IN"];

    const fullMessage = `${recognizedText}. ${prompt.question}`;

    setVoiceMessage(
      "Please listen to the recognized speech and confirmation question."
    );

    speakText(fullMessage);
  };

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

  // Start speech recognition for crop details or description
  const startVoiceEntry = (mode = "crop") => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice recognition is not supported. Please use Google Chrome."
      );
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();

    let recognizedText = "";

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
          ? "Listening. Speak your crop description."
          : "Listening. Speak your crop name, quantity and price."
      );
    };

    recognition.onresult = (event) => {
      recognizedText = event.results[0][0].transcript.trim();

      if (!recognizedText) {
        setVoiceMessage("No speech detected. Please try again.");
        return;
      }

      setPendingTranscript(recognizedText);

      setVoiceMessage(
        "Speech recognized. Please listen to the confirmation."
      );
    };

    recognition.onerror = (event) => {
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Microphone access was denied. Allow microphone access in your browser settings."
          : event.error === "no-speech"
          ? "No speech detected. Please try again."
          : "Could not recognize your speech. Please try again."
      );

      setListening(false);
    };

    // IMPORTANT: Wait until microphone recognition ends before speaking
    recognition.onend = () => {
      setListening(false);

      if (recognizedText) {
        setTimeout(() => {
          speakConfirmation(recognizedText);
        }, 350);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceMessage("Could not start voice recognition. Please try again.");
    }
  };

  // Identify common English crop categories
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

  // Apply confirmed speech to the form
  const confirmVoiceInput = () => {
    const confirmedText = pendingTranscript.trim();

    if (!confirmedText) {
      setVoiceMessage("Please speak something before confirming.");
      return;
    }

    if (voiceMode === "description") {
      setDescription(confirmedText);

      setVoiceMessage(
        "Description confirmed and added to the description field."
      );
    } else {
      const numbers = confirmedText.match(/\d+(?:\.\d+)?/g) || [];

      const cleanedName = confirmedText
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

      setVoiceMessage(
        "Crop details confirmed. Review the fields and fill in any missing information."
      );
    }

    setPendingTranscript("");

    const prompt =
      languagePrompts[language] || languagePrompts["en-IN"];

    speakText(prompt.confirmed);
  };

  // Reject speech and record again
  const rejectVoiceInput = () => {
    setPendingTranscript("");

    const prompt =
      languagePrompts[language] || languagePrompts["en-IN"];

    setVoiceMessage("Please speak again.");
    speakText(prompt.retry);
  };

  // Listen for spoken Yes or No
  const startVoiceConfirmation = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceMessage(
        "Voice recognition is not supported. Please use the Yes or No buttons."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    let afterRecognition = null;

    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage("Listening for your Yes or No answer...");
    };

    recognition.onresult = (event) => {
      const answer = event.results[0][0].transcript
        .trim()
        .toLowerCase();

      const prompt =
        languagePrompts[language] || languagePrompts["en-IN"];

      const isYes = prompt.yes.some((word) => answer.includes(word));
      const isNo = prompt.no.some((word) => answer.includes(word));

      if (isYes) {
        setVoiceMessage("You said yes. Confirming your information...");
        afterRecognition = () => confirmVoiceInput();
      } else if (isNo) {
        setVoiceMessage("You said no. Please try again.");
        afterRecognition = () => rejectVoiceInput();
      } else {
        setVoiceMessage(
          `I heard "${answer}". Please say Yes or No, or use the buttons.`
        );

        afterRecognition = () => {
          speakText(
            language === "hi-IN"
              ? "कृपया हाँ या नहीं बोलें।"
              : language === "kn-IN"
              ? "ದಯವಿಟ್ಟು ಹೌದು ಅಥವಾ ಇಲ್ಲ ಎಂದು ಹೇಳಿ."
              : "Please say yes or no."
          );
        };
      }
    };

    recognition.onerror = (event) => {
      setVoiceMessage(
        event.error === "not-allowed"
          ? "Microphone access was denied."
          : "Could not hear your answer. Please try again."
      );

      setListening(false);
    };

    // Process the spoken answer only after recognition has stopped
    recognition.onend = () => {
      setListening(false);

      if (afterRecognition) {
        setTimeout(() => {
          afterRecognition();
        }, 350);
      }
    };

    try {
      recognition.start();
    } catch (error) {
      setListening(false);
      setVoiceMessage("Could not start the microphone. Please try again.");
    }
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
            Speak your crop details or description. FarmConnect AI will read
            the recognized words aloud and ask you to confirm.
          </p>

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Voice Language
          </label>

          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className={`${inputClass} mb-4 bg-white`}
          >
            <option value="en-IN">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="kn-IN">Kannada</option>
          </select>

          <button
            type="button"
            onClick={() => startVoiceEntry("crop")}
            disabled={listening || speaking}
            className="w-full text-white py-4 rounded-xl font-semibold bg-green-700 hover:bg-green-800 disabled:opacity-60"
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

          {speaking && (
            <p className="mt-2 text-sm text-blue-700">
              🔊 FarmConnect AI is speaking...
            </p>
          )}

          {/* Confirmation area */}
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
                Listen carefully. You can edit the recognized words before
                confirming.
              </p>

              <button
                type="button"
                onClick={startVoiceConfirmation}
                disabled={listening || speaking}
                className="w-full mt-3 rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                🎤 Answer Yes or No by Voice
              </button>

              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <button
                  type="button"
                  onClick={confirmVoiceInput}
                  disabled={listening || speaking}
                  className="flex-1 rounded-xl bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60"
                >
                  ✓ Yes, Correct
                </button>

                <button
                  type="button"
                  onClick={rejectVoiceInput}
                  disabled={listening || speaking}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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

          {/* Description with separate voice input */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <label className="block text-lg font-semibold text-green-800 mb-3">
              📝 Crop Description
            </label>

            <p className="text-sm text-gray-600 mb-3">
              Type your description or speak it in English, Hindi or Kannada.
            </p>

            <button
              type="button"
              onClick={() => startVoiceEntry("description")}
              disabled={listening || speaking}
              className="w-full mb-3 rounded-xl py-3 font-semibold text-white bg-green-700 hover:bg-green-800 disabled:opacity-60"
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
