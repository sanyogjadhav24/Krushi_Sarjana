import React, { useEffect, useState } from "react";
import { getAllProducts } from "../api/product.js";
import { AuthAPI } from "../api/api.js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AddProductForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "Grains",
    price: initialData?.price || "",
    quantity: initialData?.stock || "",
    details: initialData?.details || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 border-2 border-black relative">
        <h2 className="text-xl font-bold text-center text-red-700">
          {initialData ? "Edit Product" : "Add Product"}
        </h2>
        <div className="mt-4 space-y-3">
          <label className="block text-gray-600">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <label className="block text-gray-600">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="Grains">Grains</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
          </select>
          <label className="block text-gray-600">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <label className="block text-gray-600">Stock Available</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          <label className="block text-gray-600">More Details</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          ></textarea>
        </div>
        <div className="flex justify-between mt-6">
          <button className="px-4 py-2 bg-gray-600 text-white rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 bg-[#112b1c] text-white rounded" onClick={handleSubmit}>
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300 text-center flex flex-col items-center">
      <img
        src={product.image}
        alt={product.name}
        className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
        onError={(e) => (e.target.src = "/fallback-image.jpg")}
      />
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-gray-600 font-medium">{product.category}</p>
      <p className="text-sm text-gray-500">₹{product.price}</p>
      <p className="text-sm text-gray-500">
        {product.stock} {product.unit}
      </p>
      <p className="text-xs text-gray-400 italic mt-2">{product.details}</p>
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm" onClick={() => onEdit(product)}>
          Edit
        </button>
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm" onClick={() => onDelete(product._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const decoded = jwtDecode(token);
        const userData = await AuthAPI.getUserById(decoded.id);
        if (!userData) return;

        setUserId(userData._id);
        setUserRole(userData.role);

        if (userData.role === "Farmer") {
          const fetchedProducts = await getAllProducts();
          setProducts(fetchedProducts.filter((product) => product.seller === userData._id));
        }
      } catch (error) {
        console.error("❌ Error fetching user or products:", error);
      }
    };
    fetchUserAndProducts();
  }, []);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("❌ Error deleting product:", err);
    }
  };
const handleSave = async (formData) => {
  try {
    if (selectedProduct) {
      // TEMPORARY: Update only UI (local state), skip backend PUT call
      const updatedProduct = {
        ...selectedProduct,
        ...formData,
        stock: formData.quantity,
      };
      setProducts((prev) =>
        prev.map((p) => (p._id === selectedProduct._id ? updatedProduct : p))
      );
    } else {
      // Real API call for new product
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...formData, seller: userId }),
      });
      const newProduct = await res.json();
      setProducts((prev) => [...prev, newProduct]);
    }
    setShowForm(false);
    setSelectedProduct(null);
  } catch (err) {
    console.error("❌ Error saving product:", err);
  }
};


  return (
    <div className="flex">
      <aside className="w-64 h-screen bg-[#112b1c] text-white p-4">
        <h1 className="text-lg font-bold">KrishiSarjana</h1>
        <button
          className="w-full bg-white text-[#112b1c] py-2 mt-4 rounded-lg"
          onClick={() => {
            setShowForm(true);
            setSelectedProduct(null);
          }}
        >
          + Add Product
        </button>
      </aside>
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
      {showForm && (
        <AddProductForm
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(null);
          }}
          onSave={handleSave}
          initialData={selectedProduct}
        />
      )}
    </div>
  );
};

export default Dashboard;
