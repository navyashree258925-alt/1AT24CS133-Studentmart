import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);

  const [form, setForm] = useState({
    usn: "",
    name: "",
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
      // api.js already includes /api in its base URL
      const endpoint = isRegister ? "/auth/register" : "/auth/login";

      const data = await api(endpoint, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (data.token && data.student) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("student", JSON.stringify(data.student));

        navigate("/dashboard");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError(err.message || "Server not connected");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: "100vh",
      backgroundColor: "#050b14",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Segoe UI, sans-serif",
      padding: "20px",
    },

    cardContainer: {
      width: "880px",
      maxWidth: "100%",
      minHeight: "520px",
      padding: "4px",
      background: "linear-gradient(135deg, #00f2fe, #4facfe, #0a192f)",
      borderRadius: "18px",
      boxShadow: "0 0 35px rgba(0, 242, 254, 0.25)",
    },

    glowCard: {
      width: "100%",
      minHeight: "520px",
      backgroundColor: "#0a1128",
      borderRadius: "16px",
      display: "flex",
      overflow: "hidden",
    },

    formSection: {
      flex: 1,
      minWidth: 0,
      padding: "36px",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },

    brandHeader: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "10px",
    },

    logoIcon: {
      width: "28px",
      height: "28px",
      background: "linear-gradient(135deg, #00f2fe, #4facfe)",
      color: "#0a1128",
      fontWeight: "bold",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    brandTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      color: "#00f2fe",
    },

    title: {
      fontSize: "22px",
      marginBottom: "16px",
      fontWeight: "600",
    },

    form: {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    },

    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      fontSize: "13px",
      color: "#cbd5e1",
    },

    input: {
      padding: "10px 12px",
      borderRadius: "8px",
      border: "1px solid #1e293b",
      backgroundColor: "#0f172a",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box",
    },

    submitBtn: {
      marginTop: "8px",
      padding: "11px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(90deg, #00f2fe, #4facfe)",
      color: "#0a1128",
      fontWeight: "bold",
      fontSize: "15px",
      cursor: "pointer",
    },

    switchText: {
      marginTop: "16px",
      fontSize: "13px",
      color: "#94a3b8",
      textAlign: "center",
    },

    switchLink: {
      color: "#00f2fe",
      cursor: "pointer",
      fontWeight: "600",
    },

    welcomeSection: {
      flex: 1,
      minWidth: 0,
      background:
        "linear-gradient(135deg, rgba(0,242,254,0.08), rgba(79,172,254,0.18))",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "40px",
      textAlign: "center",
      color: "#fff",
      clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
    },

    welcomeTitle: {
      fontSize: "26px",
      fontWeight: "bold",
      letterSpacing: "1.5px",
      color: "#00f2fe",
      marginBottom: "10px",
    },

    welcomeSub: {
      fontSize: "14px",
      color: "#94a3b8",
      maxWidth: "220px",
    },

    errorText: {
      color: "#ef4444",
      fontSize: "13px",
      marginBottom: "8px",
    },
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.cardContainer}>
        <div style={styles.glowCard}>
          <div style={styles.formSection}>
            <div style={styles.brandHeader}>
              <span style={styles.logoIcon}>S</span>
              <h2 style={styles.brandTitle}>StudentMart</h2>
            </div>

            <h3 style={styles.title}>
              {isRegister ? "Create Account" : "Welcome Back"}
            </h3>

            {error && <p style={styles.errorText}>{error}</p>}

            <form onSubmit={handleSubmit} style={styles.form}>
              {isRegister && (
                <>
                  <div style={styles.inputGroup}>
                    <label>USN</label>
                    <input
                      type="text"
                      name="usn"
                      placeholder="e.g. 1AT24CS133"
                      value={form.usn}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.inputGroup}>
                    <label>Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      style={styles.input}
                    />
                  </div>
                </>
              )}

              <div style={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                  style={styles.input}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
              </button>
            </form>

            <p style={styles.switchText}>
              {isRegister
                ? "Already have an account? "
                : "Don't have an account? "}

              <span
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                style={styles.switchLink}
              >
                {isRegister ? "Login" : "Sign up"}
              </span>
            </p>
          </div>

          <div style={styles.welcomeSection}>
            <h1 style={styles.welcomeTitle}>STUDENTMART</h1>

            <p style={styles.welcomeSub}>
              Your space. Your campus marketplace & profile hub.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
