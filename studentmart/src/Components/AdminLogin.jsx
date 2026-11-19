import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api.js";

export default function AdminLogin() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/admin/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      if (data.token && data.admin) {
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("admin", JSON.stringify(data.admin));

        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Admin login failed");
      }
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#050b14",
      fontFamily: "Segoe UI, sans-serif",
      padding: "20px",
    },
    card: {
      width: "400px",
      maxWidth: "100%",
      padding: "35px",
      background: "#0a1128",
      border: "1px solid #00cfe8",
      borderRadius: "16px",
      boxShadow: "0 0 25px rgba(0,242,254,0.15)",
      color: "white",
    },
    title: {
      color: "#00f2fe",
      textAlign: "center",
      marginBottom: "8px",
    },
    subtitle: {
      color: "#94a3b8",
      textAlign: "center",
      marginBottom: "25px",
      fontSize: "14px",
    },
    label: {
      display: "block",
      marginBottom: "7px",
      color: "#cbd5e1",
      fontSize: "14px",
    },
    input: {
      width: "100%",
      boxSizing: "border-box",
      padding: "12px",
      marginBottom: "18px",
      borderRadius: "7px",
      border: "1px solid #334155",
      background: "#0f172a",
      color: "white",
      outline: "none",
    },
    button: {
      width: "100%",
      padding: "12px",
      border: "none",
      borderRadius: "7px",
      background: "linear-gradient(90deg, #00f2fe, #4facfe)",
      color: "#0a1128",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
    },
    error: {
      color: "#f87171",
      textAlign: "center",
      fontSize: "13px",
      marginBottom: "15px",
    },
    link: {
      display: "block",
      textAlign: "center",
      marginTop: "20px",
      color: "#00f2fe",
      textDecoration: "none",
      fontSize: "13px",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>StudentMart Admin</h2>

        <p style={styles.subtitle}>Sign in to your Admin account</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Admin Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter Admin email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <label style={styles.label}>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter Admin password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Signing in..." : "Admin Sign In"}
          </button>
        </form>

        <Link to="/login" style={styles.link}>
          Back to Student Login
        </Link>
      </div>
    </div>
  );
}
