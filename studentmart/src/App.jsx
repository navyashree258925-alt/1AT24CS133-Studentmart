import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login.jsx";
import Register from "./components/register.jsx";
import Dashboard from "./components/dashboard.jsx";
import Profile from "./components/profile.jsx";
import Products from "./components/products.jsx";
import ProductForm from "./components/ProductForm.jsx";
import ProductDetails from "./components/ProductDetails.jsx";
import Cart from "./components/Cart.jsx";

// Check whether student is logged in
function isLoggedIn() {
  return Boolean(localStorage.getItem("token"));
}

// Protected pages
function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Login and Register pages
function PublicRoute({ children }) {
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* LOGIN PAGE - FIRST PAGE */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* CREATE ACCOUNT PAGE */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* MY PROFILE */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* VIEW PRODUCTS */}
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />

      {/* ADD PRODUCT */}
      <Route
        path="/add-product"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />

      {/* PRODUCT DETAILS */}
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute>
            <ProductDetails />
          </ProtectedRoute>
        }
      />

      {/* SHOPPING CART */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      {/* INVALID URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
