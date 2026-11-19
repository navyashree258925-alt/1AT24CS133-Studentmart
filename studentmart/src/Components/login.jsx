import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Login() {
  const [loginType, setLoginType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function selectLogin(type) {
    setLoginType(type);
    setEmail("");
    setPassword("");
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();

    if (!loginType) {
      setError("Please select Student or Admin.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const endpoint =
        loginType === "admin" ? "/auth/admin/login" : "/auth/login";

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!data?.token) {
        setError(data?.message || "Login failed.");
        return;
      }

      const loggedInUser = loginType === "admin" ? data.admin : data.student;

      if (!loggedInUser) {
        setError("Invalid account details received from server.");
        return;
      }

      const user = {
        ...loggedInUser,
        role: loginType,
      };

      // Store common login information
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", loginType);

      // Keep existing account storage compatible
      if (loginType === "student") {
        localStorage.setItem("student", JSON.stringify(data.student));
        localStorage.removeItem("admin");
      } else {
        localStorage.setItem("admin", JSON.stringify(data.admin));
        localStorage.removeItem("student");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setError(error.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div className="sidebar-logo-icon">S</div>

          <div>
            <div style={{ fontWeight: "700", fontSize: "20px" }}>
              StudentMart
            </div>
            <small style={{ color: "#888" }}>Your student space</small>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div
            style={{
              color: "#176F65",
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "3px",
              marginBottom: "12px",
            }}
          >
            WELCOME BACK
          </div>

          <h2 style={{ marginBottom: "8px" }}>Welcome back!</h2>

          <p>Sign in to continue to your portal.</p>
        </div>

        {!loginType && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <button
              type="button"
              className="btn-primary"
              onClick={() => selectLogin("student")}
            >
              Student Login
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={() => selectLogin("admin")}
            >
              Admin Login
            </button>
          </div>
        )}

        {loginType && (
          <>
            <div
              style={{
                textAlign: "center",
                color: "#176F65",
                fontWeight: "700",
                marginBottom: "20px",
              }}
            >
              {loginType === "student" ? "STUDENT LOGIN" : "ADMIN LOGIN"}
            </div>

            {error && (
              <div
                style={{
                  color: "#D9534F",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </form>

            {loginType === "student" && (
              <div className="auth-footer">
                Don't have an account?{" "}
                <Link to="/register">Create Account</Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => selectLogin("")}
              style={{
                display: "block",
                margin: "18px auto 0",
                background: "transparent",
                border: "none",
                color: "#176F65",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              ← Back to login options
            </button>
          </>
        )}
      </div>
    </div>
  );
}
