import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    usn: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.usn || !form.email || !form.password || !form.confirm) {
      return setError("Please fill in all fields");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);

    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          usn: form.usn,
          email: form.email,
          password: form.password,
        }),
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="blob blob-blue" />
      <div className="blob blob-grey" />

      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <div className="brand-name">StudentMart</div>
            <div className="brand-sub">Student Profile Management</div>
          </div>
        </div>

        <p className="eyebrow">Get started</p>
        <h1>Create your account</h1>
        <p className="lead">Register with your USN and email.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="usn">USN</label>
            <input
              id="usn"
              name="usn"
              placeholder="e.g. 1AT24CS10"
              value={form.usn}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              placeholder="Re-enter your password"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
