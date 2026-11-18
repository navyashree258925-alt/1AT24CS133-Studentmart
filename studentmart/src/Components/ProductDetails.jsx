import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, API_URL } from "../api.js";
import Logout from "./Logout.jsx";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [cartCount, setCartCount] = useState(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      return cart.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0,
      );
    } catch {
      return 0;
    }
  });

  const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

  const student = (() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "null");
    } catch {
      return null;
    }
  })();

  // CONVERT IMAGE PATH INTO COMPLETE URL
  function getProductImage() {
    if (!product?.imageUrl) {
      return "";
    }

    const savedImage = product.imageUrl.trim();

    if (/^https?:\/\//i.test(savedImage)) {
      return savedImage;
    }

    const imagePath = savedImage.startsWith("/")
      ? savedImage
      : `/${savedImage}`;

    return `${BACKEND_URL}${imagePath}`;
  }

  // UPDATE CART COUNT WHEN CART CHANGES IN ANOTHER TAB
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

    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  // FETCH PRODUCT DETAILS
  useEffect(() => {
    let active = true;

    async function fetchProduct() {
      try {
        setError("");

        const data = await api(`/products/${id}`);

        if (active) {
          setProduct(data.product || data);
        }
      } catch (err) {
        if (active) {
          setProduct(null);
          setError(err.message || "Unable to load product details.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => {
      active = false;
    };
  }, [id]);

  // ADD TO CART
  function addToCart() {
    if (!product || Number(product.stock) <= 0) {
      return;
    }

    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const cart = Array.isArray(savedCart) ? savedCart : [];

      const existing = cart.find((item) => item._id === product._id);

      if (existing) {
        if (Number(existing.quantity) >= Number(product.stock)) {
          setError("Maximum available stock reached.");
          setMessage("");
          return;
        }

        existing.quantity = Number(existing.quantity || 1) + 1;
        existing.imageUrl = getProductImage();
        existing.price = Number(product.price);
        existing.stock = Number(product.stock);
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          stock: Number(product.stock),
          imageUrl: getProductImage(),
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      window.dispatchEvent(new Event("storage"));

      setCartCount(
        cart.reduce((total, item) => total + Number(item.quantity || 1), 0),
      );

      setError("");
      setMessage("Product added to cart successfully!");
    } catch {
      setError("Unable to add product to cart.");
      setMessage("");
    }
  }

  const imageUrl = getProductImage();

  return (
    <div className="workspace">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand-box">
          <div className="sidebar-logo-icon">S</div>
          <h2 className="sidebar-brand">StudentMart</h2>
        </div>

        <p className="sidebar-heading">STUDENT WORKSPACE</p>

        <nav className="sidebar-nav">
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/profile">👤 My Profile</Link>

          <Link to="/products" className="active">
            📦 Available Products
          </Link>

          <Link to="/add-product">➕ Add Product</Link>

          <Link to="/cart">🛒 Shopping Cart ({cartCount})</Link>
        </nav>

        <div className="sidebar-logout">
          <Logout />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="workspace-content">
        <div className="topbar">
          <div>
            <h1>Product Details</h1>
            <p>View complete product information.</p>
          </div>

          {student?.usn && <span className="usn-badge">{student.usn}</span>}
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        {error && <div className="alert alert-error">{error}</div>}

        <section className="workspace-card">
          {loading ? (
            <p>Loading product details...</p>
          ) : !product ? (
            <div className="empty-state">
              <h3>Product not found</h3>
              <p>This product may have been removed or is unavailable.</p>
            </div>
          ) : (
            <div className="product-info">
              {/* PRODUCT IMAGE */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="product-image-placeholder">
                  No Image Available
                </div>
              )}

              <h2>{product.name}</h2>

              <p className="product-price">
                ₹{Number(product.price).toFixed(2)}
              </p>

              <p>
                <strong>Category:</strong> {product.category}
              </p>

              <p>
                <strong>Description:</strong>{" "}
                {product.description || "No description available."}
              </p>

              <p className="product-stock">
                {Number(product.stock) > 0
                  ? `Available Stock: ${product.stock}`
                  : "Out of Stock"}
              </p>

              <button
                type="button"
                className="btn-workspace"
                disabled={Number(product.stock) <= 0}
                onClick={addToCart}
              >
                {Number(product.stock) > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          )}

          <div style={{ marginTop: "20px" }}>
            <Link to="/products">← Back to Products</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
