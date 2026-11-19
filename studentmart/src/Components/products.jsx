import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, API_URL } from "../api.js";
import Logout from "./Logout.jsx";
import "./Products.css";

const BACKEND_URL = API_URL.replace(/\/api\/?$/, "");

// Backup images for products
function getFallbackImage(product) {
  const name = String(product.name || "").toLowerCase();

  if (name.includes("scientific calculator")) {
    return "https://ik.imagekit.io/fepy/cdn/catalog/product/7/0/70707-pcs-1.jpg";
  }

  if (name.includes("calculator")) {
    return "https://i5-images.massmart.co.za/asr/e0505684-d4c1-40b1-949b-3b18b3c82034.282513c7e5f8f6440689aa0c2b341cb0.jpeg?odnBg=FFFFFF&odnHeight=636&odnWidth=694";
  }

  if (
    name.includes("graph book") ||
    name.includes("notebook") ||
    name.includes("study book")
  ) {
    return "https://s.alicdn.com/@sc04/kf/He5c22793e6d242ba96dedaf2e5bbf4ad3/China-Stationery-Cheap-Bulk-Wholesale-Custom-School-Student-Classmate-Notebooks.jpg";
  }

  return "";
}

// Get product image
function getProductImage(product) {
  const savedImage = String(product.imageUrl || "").trim();

  if (/^https?:\/\//i.test(savedImage)) {
    return savedImage;
  }

  if (savedImage) {
    const imagePath = savedImage.startsWith("/")
      ? savedImage
      : `/${savedImage}`;

    return `${BACKEND_URL}${imagePath}`;
  }

  return getFallbackImage(product);
}

// Use actual MongoDB price
function getProductPrice(product) {
  const price = Number(product.price);
  return Number.isFinite(price) ? price : 0;
}

export default function Products() {
  const location = useLocation();

  // Identify logged-in user
  const [userRole] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.role || localStorage.getItem("role") || "";
    } catch {
      return localStorage.getItem("role") || "";
    }
  });

  const isAdmin = userRole === "admin";

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // Load ALL products from MongoDB
  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const data = await api("/products");

        const allProducts = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        if (active) {
          setProducts(allProducts);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load products.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [location.key]);

  // Get categories
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
  }, [products]);

  // Search, filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      result = result.filter((product) =>
        String(product.name || "")
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
      );
    }

    if (category !== "All") {
      result = result.filter((product) => product.category === category);
    }

    if (sort === "low") {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sort === "high") {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return result;
  }, [products, search, category, sort]);

  // Add product to cart
  function addToCart(product) {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      const existingItem = cart.find((item) => item._id === product._id);

      if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
        existingItem.price = getProductPrice(product);
        existingItem.imageUrl = getProductImage(product);
      } else {
        cart.push({
          _id: product._id,
          name: product.name,
          price: getProductPrice(product),
          stock: product.stock,
          quantity: 1,
          imageUrl: getProductImage(product),
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));

      setMessage(`${product.name} added to cart successfully!`);

      window.dispatchEvent(new Event("cartUpdated"));

      setTimeout(() => setMessage(""), 2500);
    } catch {
      setMessage("Unable to add product to cart.");
    }
  }

  // DELETE PRODUCT - ADMIN ONLY
  async function handleDeleteProduct(product) {
    if (!isAdmin) {
      setError("Only Admin users can delete products.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product._id);
      setError("");
      setMessage("");

      const data = await api(`/products/${product._id}`, {
        method: "DELETE",
      });

      setProducts((previousProducts) =>
        previousProducts.filter((item) => item._id !== product._id),
      );

      setMessage(data.message || "Product deleted successfully!");
    } catch (err) {
      setError(err.message || "Unable to delete product.");
    } finally {
      setDeletingId("");
    }
  }

  // Handle broken images
  function handleImageError(event, product) {
    const image = event.currentTarget;

    if (!image.dataset.fallbackAttempted) {
      image.dataset.fallbackAttempted = "true";

      const fallback = getFallbackImage(product);

      if (fallback && fallback !== image.src) {
        image.src = fallback;
        return;
      }
    }

    image.style.display = "none";

    const placeholder = image.parentElement?.querySelector(
      ".product-placeholder",
    );

    if (placeholder) {
      placeholder.style.display = "flex";
    }
  }

  return (
    <div className="workspace products-workspace">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand-box">
          <div className="sidebar-logo-icon">S</div>

          <div>
            <h2 className="sidebar-brand">StudentMart</h2>
          </div>
        </div>

        <p className="sidebar-heading">MENU</p>

        <nav className="sidebar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">My Profile</Link>
          <Link to="/edit-profile">Edit Profile</Link>

          <Link to="/products" className="active">
            Products
          </Link>

          {isAdmin && <Link to="/add-product">Add Product</Link>}

          <Link to="/cart">Shopping Cart</Link>
        </nav>

        <div className="sidebar-logout">
          <Logout />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="workspace-content products-content">
        <header className="products-header">
          <div>
            <span className="products-eyebrow">STUDENTMART</span>

            <h1>Available Products</h1>

            <p>Find the stationery and study products you need.</p>
          </div>

          {isAdmin && (
            <Link
              to="/add-product"
              className="product-cart-button"
              style={{
                textDecoration: "none",
                padding: "12px 18px",
                display: "inline-block",
              }}
            >
              + Add Product
            </Link>
          )}
        </header>

        {/* SEARCH AND FILTERS */}
        <div className="products-toolbar">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Categories" : item}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="default">Sort by Price</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {message && (
          <div className="products-alert success-alert">{message}</div>
        )}

        {error && <div className="products-alert error-alert">{error}</div>}

        {/* PRODUCT COUNT */}
        <div className="products-list-heading">
          <div>
            <h2>Our Products</h2>
            <p>Browse our available products.</p>
          </div>

          <span>{filteredProducts.length} PRODUCTS</span>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : error && products.length === 0 ? (
          <p>Unable to display products.</p>
        ) : filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((product) => {
              const imageUrl = getProductImage(product);
              const inStock = Number(product.stock) > 0;

              return (
                <article className="product-card" key={product._id}>
                  <div className="product-image-wrapper">
                    <div
                      className="product-placeholder"
                      style={{
                        display: imageUrl ? "none" : "flex",
                      }}
                    >
                      <span>📦</span>
                      <small>Image unavailable</small>
                    </div>

                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
                        onError={(event) => handleImageError(event, product)}
                      />
                    )}

                    {product.category && (
                      <span className="product-category-label">
                        {product.category}
                      </span>
                    )}
                  </div>

                  <div className="product-card-body">
                    <h3 className="product-name">{product.name}</h3>

                    <div className="product-price">
                      ₹{getProductPrice(product).toFixed(2)}
                    </div>

                    <div className="product-stock-row">
                      {inStock ? (
                        <span className="in-stock">In Stock</span>
                      ) : (
                        <span className="out-stock">Out of Stock</span>
                      )}
                    </div>

                    <div className="product-actions">
                      <Link
                        to={`/products/${product._id}`}
                        className="product-details-button"
                      >
                        View Details
                      </Link>

                      <button
                        className="product-cart-button"
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                      >
                        Add to Cart
                      </button>
                    </div>

                    {/* DELETE BUTTON - ADMIN ONLY */}
                    {isAdmin && (
                      <button
                        type="button"
                        className="product-delete-button"
                        onClick={() => handleDeleteProduct(product)}
                        disabled={deletingId === product._id}
                        style={{
                          width: "100%",
                          marginTop: "10px",
                          padding: "10px",
                          backgroundColor: "#c0392b",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        {deletingId === product._id
                          ? "Deleting..."
                          : "Delete Product"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
