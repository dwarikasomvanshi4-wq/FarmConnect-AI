import { useState } from "react";
import api from "../services/api";

function AddCrop() {
  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);

  const saveCrop = async () => {
    try {
      let imagePath = "";

      // Upload Image
      if (image) {
        const formData = new FormData();
        formData.append("image", image);

        const uploadRes = await api.post(
          "/upload-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        imagePath = uploadRes.data.file_path;
      }

      // Save Crop
      await api.post("/add-crop", {
        farmer_email:
               localStorage.getItem("userEmail") ||
               localStorage.getItem("email"),

        crop_name: cropName,
        category: category,
        quantity: quantity,
        price: price,
        description: description,
        image: imagePath,
      });

      alert("🌾 Crop Added Successfully");

      setCropName("");
      setCategory("");
      setQuantity("");
      setPrice("");
      setDescription("");
      setImage(null);

      document.getElementById("imageInput").value = "";
    } catch (err) {
      console.log(err);
      alert("Failed to Add Crop");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-50 flex justify-center items-center p-8">

      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-2xl">

        <h1 className="text-4xl font-bold text-green-700 mb-8 text-center">
          🌾 Add New Crop
        </h1>

        <div className="space-y-5">

          <input
            type="text"
            placeholder="Crop Name"
            value={cropName}
            onChange={(e) => setCropName(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
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
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

          <input
            type="number"
            placeholder="Price per Kg (₹)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

          <textarea
            rows="4"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 p-4 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
          />

          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full border border-gray-300 p-3 rounded-xl"
          />

          <button
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