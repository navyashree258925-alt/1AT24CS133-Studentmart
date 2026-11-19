import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Logout from "./Logout.jsx";
import "./Dashboard.css";

// Safely read saved user information
function getSavedUser(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

// Get product stock
function getStock(product) {
  const stock = Number(product.stock);
  return Number.isFinite(stock) ? stock : 0;
}

// Get product price
function getPrice(product) {
  const price = Number(product.price);
  return Number.isFinite(price) ? price : 0;
}

// Product table component
function ProductTable({ items, showPrice = true }) {
  if (!items || items.length === 0) {
    return <div className="stat-detail-empty">No products found.</div>;
  }

  return (
    <div className="stat-detail-table-wrapper">
      <table className="stat-detail-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Category</th>
            {showPrice && <th>Price</th>}
            <th>Stock</th>
          </tr>
        </thead>

        <tbody>
          {items.map((product, index) => (
            <tr key={product._id || index}>
              <td>{product.name || "Unnamed Product"}</td>
              <td>{product.category || "Uncategorized"}</td>

              {showPrice && <td>₹{getPrice(product).toFixed(2)}</td>}

              <td>{getStock(product)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStat, setSelectedStat] = useState("");

  // Get saved login information
  const student = getSavedUser("student");
  const admin = getSavedUser("admin");

  // Identify the logged-in account
  const role = String(
    localStorage.getItem("role") ||
      admin.role ||
      student.role ||
      (Object.keys(admin).length > 0 ? "admin" : "student"),
  ).toLowerCase();

  const isAdmin = role === "admin";

  // Fetch products from MongoDB
  useEffect(() => {
    let active = true;

    async function fetchProducts() {
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

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  // Total number of products
  const totalProducts = products.length;

  // Total available units
  const unitsInStock = products.reduce(
    (total, product) => total + getStock(product),
    0,
  );

  // Group products by category
  const categoryGroups = useMemo(() => {
    const groups = {};

    products.forEach((product) => {
      const category = product.category || "Uncategorized";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(product);
    });

    return groups;
  }, [products]);

  const categoriesCount = Object.keys(categoryGroups).length;

  // Products having stock of 5 or less
  const lowStockProducts = products.filter((product) => getStock(product) <= 5);

  // Cart count
  const [cartCount, setCartCount] = useState(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      return cart.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      );
    } catch {
      return 0;
    }
  });

  // Update cart count when cart changes
  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        setCartCount(
          cart.reduce((total, item) => total + Number(item.quantity || 0), 0),
        );
      } catch {
        setCartCount(0);
      }
    }

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  // Dashboard statistics
  const statistics = [
    {
      id: "total",
      title: "Total Products",
      value: totalProducts,
      description: "View all products",
    },
    {
      id: "stock",
      title: "Units in Stock",
      value: unitsInStock,
      description: "View product stock",
    },
    {
      id: "categories",
      title: "Categories",
      value: categoriesCount,
      description: "View product categories",
    },
    {
      id: "low",
      title: "Low Stock Items",
      value: lowStockProducts.length,
      description: "Products with stock 5 or less",
    },
  ];

  // Display selected statistic details
  function renderStatDetails() {
    if (selectedStat === "total") {
      return <ProductTable items={products} />;
    }

    if (selectedStat === "stock") {
      return <ProductTable items={products} showPrice={false} />;
    }

    if (selectedStat === "low") {
      return <ProductTable items={lowStockProducts} />;
    }

    if (selectedStat === "categories") {
      return (
        <div className="stat-details-list">
          {Object.entries(categoryGroups).map(([category, items]) => (
            <div className="stat-detail-item" key={category}>
              <div>
                <strong>{category}</strong>
                <p>{items.length} product(s)</p>
              </div>

              <div className="stat-detail-value">
                {items.map((product, index) => (
                  <div key={product._id || index}>
                    {product.name || "Unnamed Product"} — Stock:{" "}
                    {getStock(product)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  const selectedTitle =
    statistics.find((item) => item.id === selectedStat)?.title || "";

  return (
    <div className="workspace">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>StudentMart</h2>
          <p>Campus Shopping</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="active">
            Dashboard
          </Link>

          <Link to="/profile">My Profile</Link>

          <Link to="/products">Products</Link>

          {isAdmin && <Link to="/add-product">Add Product</Link>}

          {!isAdmin && <Link to="/cart">Shopping Cart ({cartCount})</Link>}
        </nav>

        <div className="sidebar-logout">
          <Logout />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* WELCOME BANNER */}
        <section className="welcome-banner">
          <h1>Welcome to StudentMart!</h1>

          <p>Manage your campus shopping activities from one place.</p>
        </section>

        {/* FIRST ROW: FOUR STATISTICS CARDS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Dashboard Overview</h2>

            <p>Click a card to view its details.</p>
          </div>

          {loading ? (
            <p>Loading dashboard statistics...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="stats-grid">
              {statistics.map((stat) => (
                <button
                  type="button"
                  key={stat.id}
                  className={`stat-card ${
                    selectedStat === stat.id ? "selected" : ""
                  }`}
                  onClick={() =>
                    setSelectedStat(selectedStat === stat.id ? "" : stat.id)
                  }
                >
                  <h3>{stat.title}</h3>

                  <div className="stat-number">{stat.value}</div>

                  <p>{stat.description}</p>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* SELECTED STATISTIC DETAILS */}
        {selectedStat && !loading && !error && (
          <section className="stat-details">
            <div className="stat-details-header">
              <h2>{selectedTitle}</h2>

              <button
                type="button"
                className="stat-details-close"
                onClick={() => setSelectedStat("")}
              >
                Close
              </button>
            </div>

            {renderStatDetails()}
          </section>
        )}

        {/* SECOND ROW: THREE QUICK ACTION CARDS */}
        <section className="dashboard-section">
          <div className="section-heading">
            <h2>Quick Actions</h2>

            <p>Choose what you want to do next.</p>
          </div>

          <div className="actions-grid">
            <Link to="/products" className="action-card">
              <h3>Browse Products</h3>
              <p>Explore available products.</p>
            </Link>

            {isAdmin ? (
              <Link to="/add-product" className="action-card">
                <h3>Add a Product</h3>
                <p>Add new products to StudentMart.</p>
              </Link>
            ) : (
              <Link to="/cart" className="action-card">
                <h3>Shopping Cart</h3>
                <p>View your selected products ({cartCount}).</p>
              </Link>
            )}

            <Link to="/profile" className="action-card">
              <h3>My Profile</h3>
              <p>View and update your profile.</p>
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} StudentMart. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
