import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Register() {
  const [usn, setUsn] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          usn: usn.trim().toUpperCase(),
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (data.student) {
        alert("Registration successful! Please login.");
        navigate("/", { replace: true });
      } else {
        setError(data.message || "Registration failed.");
      }
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
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          <div className="sidebar-logo-icon">S</div>

          <span style={{ fontWeight: "700", fontSize: "18px" }}>
            StudentMart
          </span>
        </div>

        <h2>Create your account</h2>
        <p>Register with your student details.</p>

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

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>USN</label>

            <input
              type="text"
              placeholder="e.g. 1AT24CS133"
              value={usn}
              onChange={(e) => setUsn(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

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
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/">Login</Link>
        </div>
      </div>
    </div>
  );
}
