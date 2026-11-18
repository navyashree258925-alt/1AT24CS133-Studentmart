import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const [cartCount, setCartCount] = useState(0);

  const [student] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const count = cart.reduce(
          (total, item) => total + Number(item.quantity || 1),
          0,
        );
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

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
          <Link to="/dashboard" className="active">
            <span>⌂</span>
            Dashboard
          </Link>

          {/* SECOND: MY PROFILE */}
          <Link to="/profile">
            <span>♙</span>
            My Profile
          </Link>

          {/* THIRD: VIEW PRODUCTS */}
          <Link to="/products">
            <span>▣</span>
            View Products
          </Link>

          <Link to="/add-product">
            <span>＋</span>
            Add Product
          </Link>

          <Link to="/cart">
            <span>🛒</span>
            Shopping Cart
            <span className="cart-count">{cartCount}</span>
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-message">
            <span>✦</span>
            <p>Your student marketplace, all in one place.</p>
          </div>

          <div className="sidebar-logout">
            <Logout />
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD */}
      <main className="workspace-content dashboard-content">
        {/* HEADER */}
        <header className="dashboard-header">
          <div>
            <p className="header-small">STUDENTMART / OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="header-subtitle">
              Your personal student shopping space.
            </p>
          </div>

          {student?.usn && (
            <div className="student-usn">
              <span className="usn-circle">S</span>
              <div>
                <small>STUDENT USN</small>
                <strong>{student.usn}</strong>
              </div>
            </div>
          )}
        </header>

        {/* WELCOME BANNER */}
        <section className="welcome-banner">
          <div className="welcome-content">
            <span className="welcome-label">✦ YOUR SPACE. YOUR JOURNEY.</span>

            <h2>Hello, {student?.name || "Student"}!</h2>

            <p>
              Welcome to StudentMart. Manage your student profile, explore
              useful products and enjoy your shopping experience.
            </p>

            <Link to="/profile" className="welcome-button">
              View My Profile <span>→</span>
            </Link>
          </div>

          <div className="welcome-art">
            <div className="art-circle art-circle-one"></div>
            <div className="art-circle art-circle-two"></div>
            <div className="art-center">
              <span>✦</span>
            </div>
            <span className="art-star star-one">✧</span>
            <span className="art-star star-two">✦</span>
          </div>

          <div className="banner-bottom-text">
            MAKE EVERY STUDENT DAY EASIER
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="quick-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">YOUR ACTIVITIES</span>
              <h2>Your Workspace</h2>
              <p>Everything you need, just one click away.</p>
            </div>
            <span className="section-decoration">✦</span>
          </div>

          <div className="quick-cards">
            <Link to="/profile" className="quick-card">
              <div className="quick-card-top">
                <div className="quick-icon">♙</div>
                <span className="quick-number">01</span>
              </div>

              <h3>My Profile</h3>

              <p>
                View your student information and keep your personal details
                updated.
              </p>

              <div className="quick-card-link">
                Manage Profile <span>→</span>
              </div>
            </Link>

            <Link to="/add-product" className="quick-card">
              <div className="quick-card-top">
                <div className="quick-icon">＋</div>
                <span className="quick-number">02</span>
              </div>

              <h3>Add Product</h3>

              <p>
                Share a new product with the StudentMart student marketplace.
              </p>

              <div className="quick-card-link">
                Add Product <span>→</span>
              </div>
            </Link>

            <Link to="/cart" className="quick-card">
              <div className="quick-card-top">
                <div className="quick-icon">🛍</div>
                <span className="quick-number">03</span>
              </div>

              <h3>Shopping Cart</h3>

              <p>
                You currently have {cartCount} item(s) in your shopping cart.
              </p>

              <div className="quick-card-link">
                View Cart <span>→</span>
              </div>
            </Link>
          </div>
        </section>

        {/* BOTTOM MESSAGE */}
        <footer className="dashboard-footer">
          <span>✦</span>
          <p>StudentMart — A smarter marketplace for students.</p>
          <span className="footer-right">STUDENT EDITION</span>
        </footer>
      </main>
    </div>
  );
}
