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

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const res = await api.get("/crops");

      const email = localStorage.getItem("email");

      const myCrops = res.data.filter(
        (crop) => crop.farmer_email === email
      );

      setCrops(myCrops);

    } catch (err) {
      console.log(err);
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

      alert("✅ Crop Updated Successfully");

      setEditingId(null);

      loadCrops();

    } catch (err) {
      console.log(err);
      alert("Update Failed");
    }
  };

  const deleteCrop = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this crop?"
    );

    if (!confirmDelete) return;

    try {

      await api.delete(`/delete-crop/${id}`);

      alert("✅ Crop Deleted Successfully");

      loadCrops();

    } catch (err) {
      console.log(err);
      alert("Delete Failed");
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-10">

      <h1 className="text-4xl font-bold text-green-700 mb-8">
        🌾 My Crops
      </h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {crops.map((crop) => (

          <div
            key={crop.id}
            className="bg-white rounded-2xl shadow-lg p-6"
          >

            {editingId === crop.id ? (

              <>
                <input
                  placeholder="Crop Name"
                  value={editCropName}
                  onChange={(e) => setEditCropName(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  placeholder="Category"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  type="number"
                  placeholder="Quantity (Kg)"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <input
                  type="number"
                  placeholder="Price (₹/Kg)"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border p-2 rounded mb-2"
                />

                <textarea
                  placeholder="Description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                />

                <div className="flex gap-3">

                  <button
                    onClick={updateCrop}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    💾 Save
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    ❌ Cancel
                  </button>

                </div>

              </>

            ) : (

              <>

                <h2 className="text-2xl font-bold text-green-700">
                  {crop.crop_name}
                </h2>

                <p className="mt-3">
                  <b>Category:</b> {crop.category || "Not Added"}
                </p>

                <p>
                  <b>Quantity:</b> {crop.quantity || 0} Kg
                </p>

                <p>
                  <b>Price:</b> ₹{crop.price}/Kg
                </p>

                <p className="mt-2 text-gray-600">
                  {crop.description}
                </p>

                <div className="flex gap-3 mt-5">

                  <button
                    onClick={() => startEdit(crop)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    ✏ Edit
                  </button>

                  <button
                    onClick={() => deleteCrop(crop.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>

                </div>

              </>

            )}

          </div>

        ))}

      </div>

    </div>
  );
}

export default MyCrops;