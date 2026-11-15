
import { useEffect, useState } from "react";
import api from "../services/api";
import { useLanguage } from "../i18n/LanguageContext";

const translations = {
  en: {
    title: "🌾 My Crops",
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
    cropFallback: "Crop",
  },

  hi: {
    title: "🌾 मेरी फसलें",
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
    cropFallback: "फसल",
  },

  kn: {
    title: "🌾 ನನ್ನ ಬೆಳೆಗಳು",
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

  return (
    <div className="min-h-screen bg-green-50 p-5 md:p-10">
      <h1 className="mb-8 text-4xl font-bold text-green-700">
        {t.title}
      </h1>

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
