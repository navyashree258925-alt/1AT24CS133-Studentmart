import { useState } from "react";
import { Link } from "react-router-dom";
import Logout from "./Logout.jsx";
import "./Cart.css";

export default function Cart() {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      return Array.isArray(savedCart) ? savedCart : [];
    } catch {
      return [];
    }
  });

  const student = (() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "null");
    } catch {
      return null;
    }
  })();

  // SAVE UPDATED CART
  function saveCart(updatedCart) {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("storage"));
  }

  // INCREASE OR DECREASE QUANTITY
  function updateQty(id, delta) {
    const updated = cart.map((item) => {
      if (item._id !== id) return item;

      const currentQty = Number(item.quantity) || 1;
      const availableStock = Number(item.stock);
      const newQty = currentQty + delta;

      if (newQty < 1) return item;

      if (Number.isFinite(availableStock) && newQty > availableStock) {
        return item;
      }

      return {
        ...item,
        quantity: newQty,
      };
    });

    saveCart(updated);
  }

  // REMOVE PRODUCT
  function removeItem(id) {
    const updated = cart.filter((item) => item._id !== id);
    saveCart(updated);
  }

  // IMAGE ERROR HANDLER
  function handleImageError(event) {
    event.currentTarget.style.display = "none";
    const placeholder = event.currentTarget.parentElement.querySelector(
      ".cart-img-placeholder",
    );

    if (placeholder) {
      placeholder.style.display = "flex";
    }
  }

  // TOTAL QUANTITY
  const cartCount = cart.reduce(
    (total, item) => total + (Number(item.quantity) || 1),
    0,
  );

  // TOTAL PRICE
  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1),
    0,
  );

  return (
    <div className="workspace cart-workspace">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand-box">
          <div className="sidebar-logo-icon">S</div>

          <div>
            <h2 className="sidebar-brand">StudentMart</h2>
            <p>Your student space</p>
          </div>
        </div>

        <p className="sidebar-heading">STUDENT WORKSPACE</p>

        <nav className="sidebar-nav">
          <Link to="/dashboard">📊 Dashboard</Link>
          <Link to="/profile">👤 My Profile</Link>
          <Link to="/products">📦 View Products</Link>
          <Link to="/add-product">➕ Add Product</Link>

          <Link to="/cart" className="active">
            🛒 Shopping Cart ({cartCount})
          </Link>
        </nav>

        <div className="sidebar-logout">
          <Logout />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="workspace-content cart-content">
        <div className="topbar">
          <div>
            <span className="cart-eyebrow">STUDENT MARKETPLACE</span>
            <h1>Shopping Cart</h1>
            <p>Review your selected products.</p>
          </div>

          {student?.usn && <span className="usn-badge">{student.usn}</span>}
        </div>

        <div className="workspace-card cart-card">
          <h2 className="cart-section-title">Your Shopping Cart</h2>

          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>

              <h3>Your cart is empty</h3>

              <p>Explore products and add your favourite items.</p>

              <Link to="/products" className="btn-banner">
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => {
                  const quantity = Number(item.quantity) || 1;
                  const price = Number(item.price) || 0;
                  const stock = Number(item.stock);

                  return (
                    <div className="cart-row" key={item._id}>
                      {/* PRODUCT INFORMATION */}
                      <div className="cart-item-info">
                        <div className="cart-image-box">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="cart-img"
                              onError={handleImageError}
                            />
                          ) : null}

                          <div
                            className="cart-img-placeholder"
                            style={{
                              display: item.imageUrl ? "none" : "flex",
                            }}
                          >
                            📦
                          </div>
                        </div>

                        <div className="cart-product-details">
                          <h3>{item.name}</h3>

                          <p className="cart-unit-price">
                            ₹{price.toFixed(2)} × {quantity}
                          </p>

                          <p className="cart-subtotal">
                            Subtotal: ₹{(price * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* QUANTITY AND REMOVE */}
                      <div className="cart-item-actions">
                        <div className="qty-controls">
                          <button
                            type="button"
                            onClick={() => updateQty(item._id, -1)}
                            disabled={quantity <= 1}
                          >
                            -
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            onClick={() => updateQty(item._id, 1)}
                            disabled={
                              Number.isFinite(stock) && quantity >= stock
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="cart-remove-button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TOTAL */}
              <div className="cart-total">
                <span>Total Price:</span>
                <strong>₹{total.toFixed(2)}</strong>
              </div>

              <p className="cart-total-items">Total items: {cartCount}</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
