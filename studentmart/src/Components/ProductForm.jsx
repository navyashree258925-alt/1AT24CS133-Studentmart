import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Logout from "./Logout.jsx";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");
  const navigate = useNavigate();

  const student = (() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "null");
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(
          cart.reduce((total, item) => total + Number(item.quantity || 1), 0),
        );
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => window.removeEventListener("storage", updateCartCount);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleUrlChange(e) {
    const url = e.target.value.trim();

    setImageUrl(e.target.value);
    setError("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setImageFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setImagePreview(url);
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    setError("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    if (!file) {
      setImageFile(null);
      setImagePreview(imageUrl);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP or GIF image.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    previewUrlRef.current = preview;

    setImageFile(file);
    setImageUrl("");
    setImagePreview(preview);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim() || !category.trim() || !description.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Enter a valid price greater than zero.");
      return;
    }

    if (
      stock.trim() === "" ||
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      setError("Stock must be a non-negative whole number.");
      return;
    }

    if (!imageFile && !imageUrl.trim()) {
      setError("Please paste an image URL or select an image file.");
      return;
    }

    if (imageUrl.trim()) {
      try {
        const parsedUrl = new URL(imageUrl.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error();
        }
      } catch {
        setError(
          "Please enter a valid image URL starting with http:// or https://.",
        );
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("price", numericPrice);
      formData.append("category", category.trim());
      formData.append("stock", numericStock);
      formData.append("description", description.trim());

      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        formData.append("imageUrl", imageUrl.trim());
      }

      const data = await api("/products", {
        method: "POST",
        body: formData,
      });

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }

      navigate("/products", {
        state: {
          message: data.message || "Product added successfully!",
        },
      });
    } catch (err) {
      setError(err.message || "Unable to add product.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="sidebar-brand-box">
          <div className="sidebar-logo-icon">S</div>
          <h2 className="sidebar-brand">StudentMart</h2>
        </div>

        <p className="sidebar-heading">STUDENT WORKSPACE</p>

        <nav className="sidebar-nav">
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/profile">👤 My Profile</Link>
          <Link to="/products">📦 Available Products</Link>
          <Link to="/add-product" className="active">
            ➕ Add Product
          </Link>
          <Link to="/cart">🛒 Shopping Cart ({cartCount})</Link>
        </nav>

        <div className="sidebar-logout">
          <Logout />
        </div>
      </aside>

      <main className="workspace-content">
        <div className="topbar">
          <h1>Add New Product</h1>
          {student?.usn && <span className="usn-badge">{student.usn}</span>}
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="workspace-card" style={{ maxWidth: "700px" }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="Enter price"
                required
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Example: books, stationery"
                required
              />
            </div>

            <div className="form-group">
              <label>Stock Available *</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                min="0"
                step="1"
                placeholder="Enter available quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Paste Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/product-image.jpg"
              />
              <small style={{ color: "#64748b" }}>
                Paste a direct link to an image.
              </small>
            </div>

            <div style={{ textAlign: "center", margin: "12px 0" }}>
              <strong>OR</strong>
            </div>

            <div className="form-group">
              <label>Choose Image From Computer</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
              />
              <small style={{ color: "#64748b" }}>
                JPG, PNG, WEBP or GIF. Maximum 5 MB.
              </small>
            </div>

            {imagePreview && (
              <div style={{ margin: "15px 0" }}>
                <p>Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Product preview"
                  onError={() =>
                    setError(
                      "This image URL cannot be displayed. Please check the link.",
                    )
                  }
                  style={{
                    width: "180px",
                    height: "150px",
                    objectFit: "contain",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                />
              </div>
            )}

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product"
                rows="3"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: "10px 24px" }}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
