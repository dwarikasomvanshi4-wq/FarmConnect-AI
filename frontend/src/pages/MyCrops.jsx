
import { useEffect, useState } from "react";
import api from "../services/api";

function MyCrops() {
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
      const email = localStorage.getItem("userEmail");

      console.log("Logged-in email:", email);
      console.log("Crops from backend:", res.data);

      const myCrops = res.data.filter(
        (crop) =>
          crop.farmer_email?.trim().toLowerCase() ===
          email?.trim().toLowerCase()
      );

      console.log("My filtered crops:", myCrops);
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

      alert("Crop updated successfully.");
      setEditingId(null);
      await loadCrops();
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed. Please try again.");
    }
  };

  const deleteCrop = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this crop?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/delete-crop/${id}`);
      alert("Crop deleted successfully.");
      await loadCrops();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    }
  };

  const detectDisease = async (event) => {
    event.preventDefault();

    if (!leafImage) {
      setDiseaseError("Please select a clear image of a plant leaf.");
      return;
    }

    setDetecting(true);
    setDiseaseError("");
    setDiseaseResult(null);

    try {
      const formData = new FormData();
      formData.append("image", leafImage);

      const response = await api.post("/detect-disease", formData);
      console.log("Disease detection response:", response.data);
      setDiseaseResult(response.data);
    } catch (err) {
      console.error("Disease detection failed:", err);

      setDiseaseError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to analyze the image. Check that the backend is running and try again."
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

  // Handle prediction objects such as { label: "...", confidence: 0.49 }
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

  const confidence =
    prediction?.confidence ?? diseaseResult?.confidence;

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
        🌾 My Crops
      </h1>

      {/* AI Plant Disease Detection */}
      <section className="mb-10 rounded-2xl bg-white p-6 shadow-lg md:p-8">
        <h2 className="mb-2 text-2xl font-bold text-green-800">
          🔬 AI Plant Disease Detection
        </h2>

        <p className="mb-5 text-gray-600">
          Upload a clear picture of a plant leaf to get an AI-generated
          disease screening result.
        </p>

        <form onSubmit={detectDisease} className="space-y-4">
          <label className="block font-medium text-gray-700">
            Choose a leaf image
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
                Image preview
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
              {detecting ? "Analyzing image..." : "🔍 Detect Plant Disease"}
            </button>

            {(leafImage || diseaseResult || diseaseError) && (
              <button
                type="button"
                onClick={clearDiseaseCheck}
                className="rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300"
              >
                Clear
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
              AI Screening Result
            </h3>

            <p className="mb-2 text-lg">
              <strong>Predicted condition:</strong>{" "}
              {predictionLabel || "Prediction unavailable"}
            </p>

            {confidencePercent !== null && (
              <p className="mb-2">
                <strong>Confidence:</strong>{" "}
                {confidencePercent.toFixed(2)}%
              </p>
            )}

            {status && (
              <p className="mb-2">
                <strong>Status:</strong> {status}
              </p>
            )}

            {message && (
              <p className="mt-3 text-gray-700">{message}</p>
            )}
          </div>
        )}
      </section>

      {/* Existing crop management */}
      <h2 className="mb-5 text-2xl font-bold text-green-800">
        My Listed Crops
      </h2>

      {crops.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-gray-600 shadow">
          No crops found for your account yet.
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
                    placeholder="Crop Name"
                    value={editCropName}
                    onChange={(e) => setEditCropName(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    placeholder="Category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    type="number"
                    placeholder="Quantity (Kg)"
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <input
                    type="number"
                    placeholder="Price (₹/Kg)"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="mb-2 w-full rounded border p-2"
                  />

                  <textarea
                    placeholder="Description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="mb-3 w-full rounded border p-2"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={updateCrop}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                      💾 Save
                    </button>

                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-green-700">
                    {crop.crop_name}
                  </h3>

                  <p className="mt-3">
                    <strong>Category:</strong>{" "}
                    {crop.category || "Not Added"}
                  </p>

                  <p>
                    <strong>Quantity:</strong> {crop.quantity || 0} Kg
                  </p>

                  <p>
                    <strong>Price:</strong> ₹{crop.price}/Kg
                  </p>

                  <p className="mt-2 text-gray-600">
                    {crop.description}
                  </p>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => startEdit(crop)}
                      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() => deleteCrop(crop.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                    >
                      🗑 Delete
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
