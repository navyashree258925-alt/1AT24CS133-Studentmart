import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Components/login.jsx";
import Register from "./Components/register.jsx";
import Dashboard from "./Components/dashboard.jsx";
import Profile from "./Components/profile.jsx";
import Products from "./Components/products.jsx";
import ProductForm from "./Components/ProductForm.jsx";
import ProductDetails from "./Components/ProductDetails.jsx";
import Cart from "./Components/Cart.jsx";

function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

function getUserRole() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.role || localStorage.getItem("role") || "";
  } catch {
    return localStorage.getItem("role") || "";
  }
}

// Protect pages that require login
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Prevent logged-in users from opening Login/Register
function PublicRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Only Admin can access Add Product
function AdminRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  if (getUserRole() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      {/* ADMIN ONLY */}
      <Route
        path="/add-product"
        element={
          <AdminRoute>
            <ProductForm />
          </AdminRoute>
        }
      />

      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
