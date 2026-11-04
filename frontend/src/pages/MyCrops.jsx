
import { useEffect, useState } from "react";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

const translations = {
  en: {
    title: "🌾 My Crops",
    diseaseTitle: "🔬 AI Plant Disease Detection",
    diseaseDescription:
      "Upload a clear picture of a plant leaf to get an AI-generated disease screening result.",
    chooseImage: "Choose a leaf image",
    imagePreview: "Image preview",
    analyzing: "Analyzing image...",
    detectDisease: "🔍 Detect Plant Disease",
    clear: "Clear",
    screeningResult: "AI Screening Result",
    predictedCondition: "Predicted condition:",
    predictionUnavailable: "Prediction unavailable",
    confidence: "Confidence:",
    status: "Status:",
    listedCrops: "My Listed Crops",
    noCrops: "No crops found for your account yet.",
    cropName: "Crop Name",
    category: "Category",
    quantity: "Quantity (Kg)",
    price: "Price (₹/Kg)",
    description: "Description",
    save: "💾 Save",
    cancel: "❌ Cancel",
    notAdded: "Not Added",
    edit: "✏ Edit",
    delete: "🗑 Delete",
    loginError: "Please log in again to view your crops.",
    loadError: "Failed to load crops. Please try again.",
    updateSuccess: "Crop updated successfully.",
    updateError: "Update failed. Please try again.",
    deleteConfirm: "Are you sure you want to delete this crop?",
    deleteSuccess: "Crop deleted successfully.",
    deleteError: "Delete failed. Please try again.",
    selectImage: "Please select a clear image of a plant leaf.",
    analyzeError:
      "Unable to analyze the image. Check that the backend is running and try again.",
    cropFallback: "Crop",
  },

  hi: {
    title: "🌾 मेरी फसलें",
    diseaseTitle: "🔬 AI पौधों की बीमारी की जाँच",
    diseaseDescription:
      "AI द्वारा बीमारी की जाँच करने के लिए पौधे की पत्ती की साफ तस्वीर अपलोड करें।",
    chooseImage: "पत्ती की तस्वीर चुनें",
    imagePreview: "तस्वीर का पूर्वावलोकन",
    analyzing: "तस्वीर का विश्लेषण हो रहा है...",
    detectDisease: "🔍 पौधों की बीमारी जाँचें",
    clear: "हटाएँ",
    screeningResult: "AI जाँच का परिणाम",
    predictedCondition: "अनुमानित बीमारी:",
    predictionUnavailable: "परिणाम उपलब्ध नहीं",
    confidence: "विश्वास स्तर:",
    status: "स्थिति:",
    listedCrops: "मेरी सूचीबद्ध फसलें",
    noCrops: "आपके खाते में अभी कोई फसल नहीं मिली।",
    cropName: "फसल का नाम",
    category: "श्रेणी",
    quantity: "मात्रा (किलो)",
    price: "कीमत (₹/किलो)",
    description: "विवरण",
    save: "💾 सेव करें",
    cancel: "❌ रद्द करें",
    notAdded: "नहीं जोड़ा गया",
    edit: "✏ संपादित करें",
    delete: "🗑 हटाएँ",
    loginError: "अपनी फसलें देखने के लिए कृपया दोबारा लॉग इन करें।",
    loadError: "फसलें लोड नहीं हो पाईं। कृपया फिर से प्रयास करें।",
    updateSuccess: "फसल सफलतापूर्वक अपडेट हो गई।",
    updateError: "अपडेट नहीं हो पाया। कृपया फिर से प्रयास करें।",
    deleteConfirm: "क्या आप वाकई इस फसल को हटाना चाहते हैं?",
    deleteSuccess: "फसल सफलतापूर्वक हटा दी गई।",
    deleteError: "फसल हटाई नहीं जा सकी। कृपया फिर से प्रयास करें।",
    selectImage: "कृपया पौधे की पत्ती की साफ तस्वीर चुनें।",
    analyzeError:
      "तस्वीर का विश्लेषण नहीं हो पाया। बैकएंड चालू होने की जाँच करें और फिर प्रयास करें।",
    cropFallback: "फसल",
  },

  kn: {
    title: "🌾 ನನ್ನ ಬೆಳೆಗಳು",
    diseaseTitle: "🔬 AI ಸಸ್ಯ ರೋಗ ಪತ್ತೆ",
    diseaseDescription:
      "AI ಮೂಲಕ ರೋಗದ ಪ್ರಾಥಮಿಕ ಪರಿಶೀಲನೆಗಾಗಿ ಸಸ್ಯದ ಎಲೆಯ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    chooseImage: "ಎಲೆಯ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    imagePreview: "ಚಿತ್ರದ ಪೂರ್ವವೀಕ್ಷಣೆ",
    analyzing: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    detectDisease: "🔍 ಸಸ್ಯ ರೋಗವನ್ನು ಪತ್ತೆಹಚ್ಚಿ",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    screeningResult: "AI ಪರಿಶೀಲನೆಯ ಫಲಿತಾಂಶ",
    predictedCondition: "ಅಂದಾಜಿಸಿದ ರೋಗ:",
    predictionUnavailable: "ಫಲಿತಾಂಶ ಲಭ್ಯವಿಲ್ಲ",
    confidence: "ವಿಶ್ವಾಸದ ಮಟ್ಟ:",
    status: "ಸ್ಥಿತಿ:",
    listedCrops: "ನಾನು ಪಟ್ಟಿ ಮಾಡಿದ ಬೆಳೆಗಳು",
    noCrops: "ನಿಮ್ಮ ಖಾತೆಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಬೆಳೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
    cropName: "ಬೆಳೆಯ ಹೆಸರು",
    category: "ವರ್ಗ",
    quantity: "ಪ್ರಮಾಣ (ಕೆಜಿ)",
    price: "ಬೆಲೆ (₹/ಕೆಜಿ)",
    description: "ವಿವರಣೆ",
    save: "💾 ಉಳಿಸಿ",
    cancel: "❌ ರದ್ದುಮಾಡಿ",
    notAdded: "ಸೇರಿಸಲಾಗಿಲ್ಲ",
    edit: "✏ ತಿದ್ದುಪಡಿ",
    delete: "🗑 ಅಳಿಸಿ",
    loginError: "ನಿಮ್ಮ ಬೆಳೆಗಳನ್ನು ನೋಡಲು ದಯವಿಟ್ಟು ಮತ್ತೆ ಲಾಗಿನ್ ಮಾಡಿ.",
    loadError: "ಬೆಳೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    updateSuccess: "ಬೆಳೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ.",
    updateError: "ನವೀಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    deleteConfirm: "ಈ ಬೆಳೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?",
    deleteSuccess: "ಬೆಳೆ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.",
    deleteError: "ಅಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    selectImage: "ದಯವಿಟ್ಟು ಸಸ್ಯದ ಎಲೆಯ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    analyzeError:
      "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ಬ್ಯಾಕೆಂಡ್ ಚಾಲನೆಯಲ್ಲಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    cropFallback: "ಬೆಳೆ",
  },
};

function MyCrops() {
  const { language } = useLanguage();
  const lang = translations[language] ? language : "en";
  const t = translations[lang];

  const [crops, setCrops] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [editCropName, setEditCropName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const [leafImage, setLeafImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [diseaseError, setDiseaseError] = useState("");

  useEffect(() => {
    loadCrops();

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadCrops();
      }
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadCrops();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  useEffect(() => {
    if (!leafImage) {
      setPreviewUrl("");
      return;
    }

    const imageUrl = URL.createObjectURL(leafImage);
    setPreviewUrl(imageUrl);

    return () => URL.revokeObjectURL(imageUrl);
  }, [leafImage]);

  const loadCrops = async () => {
    try {
      const res = await api.get("/crops");
      const email =
        sessionStorage.getItem("userEmail") ||
        sessionStorage.getItem("email");

      const myCrops = (Array.isArray(res.data) ? res.data : []).filter(
        (crop) =>
          crop.farmer_email?.trim().toLowerCase() ===
          email?.trim().toLowerCase()
      );

      setCrops(myCrops);
    } catch (err) {
      console.error("Failed to load crops:", err);
    }
  };

  const startEdit = (crop) => {
    setEditingId(crop.id);
    setEditCropName(crop.crop_name);
    setEditCategory(crop.category || "");
    setEditQuantity(crop.quantity || "");
    setEditPrice(crop.price || "");
    setEditDescription(crop.description || "");
  };

  const updateCrop = async () => {
    try {
      await api.put(`/update-crop/${editingId}`, {
        crop_name: editCropName,
        category: editCategory,
        quantity: editQuantity,
        price: editPrice,
        description: editDescription,
      });

      alert(t.updateSuccess);
      setEditingId(null);
      await loadCrops();
    } catch (err) {
      console.error("Update failed:", err);
      alert(t.updateError);
    }
  };

  const deleteCrop = async (id) => {
    const confirmDelete = window.confirm(t.deleteConfirm);

    if (!confirmDelete) return;

    try {
      await api.delete(`/delete-crop/${id}`);
      alert(t.deleteSuccess);
      await loadCrops();
    } catch (err) {
      console.error("Delete failed:", err);
      alert(t.deleteError);
    }
  };

  const detectDisease = async (event) => {
    event.preventDefault();

    if (!leafImage) {
      setDiseaseError(t.selectImage);
      return;
    }

    setDetecting(true);
    setDiseaseError("");
    setDiseaseResult(null);

    try {
      const formData = new FormData();
      formData.append("image", leafImage);

      const response = await api.post("/detect-disease", formData);
      setDiseaseResult(response.data);
    } catch (err) {
      console.error("Disease detection failed:", err);

      setDiseaseError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          t.analyzeError
      );
    } finally {
      setDetecting(false);
    }
  };

  const clearDiseaseCheck = () => {
    setLeafImage(null);
    setDiseaseResult(null);
    setDiseaseError("");
  };

  const prediction =
    diseaseResult?.prediction &&
    typeof diseaseResult.prediction === "object"
      ? diseaseResult.prediction
      : null;

  const predictionLabel =
    prediction?.label ??
    (typeof diseaseResult?.prediction === "string"
      ? diseaseResult.prediction
      : null) ??
    (typeof diseaseResult?.disease === "string"
      ? diseaseResult.disease
      : null) ??
    (typeof diseaseResult?.class_name === "string"
      ? diseaseResult.class_name
      : null);

  const confidence = prediction?.confidence ?? diseaseResult?.confidence;

  const confidenceNumber =
    confidence !== undefined &&
    confidence !== null &&
    Number.isFinite(Number(confidence))
      ? Number(confidence)
      : null;

  const confidencePercent =
    confidenceNumber === null
      ? null
      : confidenceNumber <= 1
        ? confidenceNumber * 100
        : confidenceNumber;

  const status =
    typeof diseaseResult?.status === "string"
      ? diseaseResult.status
      : null;

  const message =
    typeof diseaseResult?.message === "string"
      ? diseaseResult.message
      : null;

  return (
    <div className="min-h-screen bg-green-50 p-5 md:p-10">
      <h1 className="mb-8 text-4xl font-bold text-green-700">
        {t.title}
      </h1>

      <section className="mb-10 rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <h2 className="mb-2 text-2xl font-bold text-green-800">
          {t.diseaseTitle}
        </h2>

        <p className="mb-5 text-gray-600">
          {t.diseaseDescription}
        </p>

        <form onSubmit={detectDisease} className="space-y-4">
          <label className="block font-medium text-gray-700">
            {t.chooseImage}

            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(event) => {
                setLeafImage(event.target.files?.[0] || null);
                setDiseaseResult(null);
                setDiseaseError("");
              }}
              className="mt-2 block w-full rounded-lg border border-gray-300 p-3"
            />
          </label>

          {previewUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-600">
                {t.imagePreview}
              </p>

              <img
                src={previewUrl}
                alt="Selected plant leaf"
                className="max-h-72 max-w-full rounded-xl border border-gray-200 object-contain"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!leafImage || detecting}
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {detecting ? t.analyzing : t.detectDisease}
            </button>

            {(leafImage || diseaseResult || diseaseError) && (
              <button
                type="button"
                onClick={clearDiseaseCheck}
                className="rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300"
              >
                {t.clear}
              </button>
            )}
          </div>
        </form>

        {diseaseError && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {diseaseError}
          </div>
        )}

        {diseaseResult && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 className="mb-3 text-xl font-bold text-green-800">
              {t.screeningResult}
            </h3>

            <p className="mb-2 text-lg">
              <strong>{t.predictedCondition}</strong>{" "}
              {predictionLabel || t.predictionUnavailable}
            </p>

            {confidencePercent !== null && (
              <p className="mb-2">
                <strong>{t.confidence}</strong>{" "}
                {confidencePercent.toFixed(2)}%
              </p>
            )}

            {status && (
              <p className="mb-2">
                <strong>{t.status}</strong> {status}
              </p>
            )}

            {message && (
              <p className="mt-3 text-gray-700">{message}</p>
            )}
          </div>
        )}
      </section>

      <h2 className="mb-5 text-2xl font-bold text-green-800">
        {t.listedCrops}
      </h2>

      {crops.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow">
          {t.noCrops}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="rounded-2xl bg-white p-6 shadow-lg"
            >
              {editingId === crop.id ? (
                <>
                  <input
                    placeholder={t.cropName}
                    value={editCropName}
                    onChange={(e) => setEditCropName(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    placeholder={t.category}
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    type="number"
                    placeholder={t.quantity}
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    type="number"
                    placeholder={t.price}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <textarea
                    placeholder={t.description}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={updateCrop}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      {t.save}
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                    >
                      {t.cancel}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-green-700">
                    {crop.crop_name || t.cropFallback}
                  </h3>

                  <p className="mt-3">
                    <strong>{t.category}:</strong>{" "}
                    {crop.category || t.notAdded}
                  </p>

                  <p>
                    <strong>{t.quantity}:</strong> {crop.quantity || 0} Kg
                  </p>

                  <p>
                    <strong>{t.price}:</strong> ₹{crop.price}/Kg
                  </p>

                  <p className="mt-2 text-gray-600">
                    {crop.description}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => startEdit(crop)}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      {t.edit}
                    </button>

                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      {t.delete}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCrops;
