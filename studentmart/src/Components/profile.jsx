import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Logout from "./Logout.jsx";
import "./Profile.css";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function Profile() {
  const [student, setStudent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("student") || "null");
    } catch {
      return null;
    }
  });

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    usn: "",
    name: "",
    email: "",
    phone: "",
    college: "",
    course: "",
    year: "2nd Year",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // LOAD STUDENT PROFILE
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const data = await api("/student/me");

        if (active && data.student) {
          setStudent(data.student);

          setForm({
            usn: data.student.usn || "",
            name: data.student.name || "",
            email: data.student.email || "",
            phone: data.student.phone || "",
            college: data.student.college || "",
            course: data.student.course || "",
            year: data.student.year || "2nd Year",
          });

          localStorage.setItem("student", JSON.stringify(data.student));
        }
      } catch (err) {
        if (active) {
          setMessage({
            type: "error",
            text: err.message || "Unable to load profile.",
          });
        }
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  // UPDATE CART COUNT
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        setCartCount(
          cart.reduce((total, item) => total + Number(item.quantity || 1), 0),
        );
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

  // HANDLE INPUT CHANGES
  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // START EDITING
  function startEditing() {
    setForm({
      usn: student?.usn || "",
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      college: student?.college || "",
      course: student?.course || "",
      year: student?.year || "2nd Year",
    });

    setIsEditing(true);
    setMessage({ type: "", text: "" });
  }

  // CANCEL EDITING
  function cancelEditing() {
    setIsEditing(false);

    setForm({
      usn: student?.usn || "",
      name: student?.name || "",
      email: student?.email || "",
      phone: student?.phone || "",
      college: student?.college || "",
      course: student?.course || "",
      year: student?.year || "2nd Year",
    });

    setMessage({ type: "", text: "" });
  }

  // UPDATE PROFILE
  async function handleUpdateProfile(e) {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (!form.name.trim() || !form.email.trim()) {
      setMessage({
        type: "error",
        text: "Name and email are required.",
      });
      return;
    }

    setSaving(true);

    try {
      const data = await api("/student/me", {
        method: "PUT",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          college: form.college.trim(),
          course: form.course.trim(),
          year: form.year,
        }),
      });

      const updatedStudent = {
        ...student,
        ...data.student,
      };

      setStudent(updatedStudent);

      localStorage.setItem("student", JSON.stringify(updatedStudent));

      setIsEditing(false);

      setMessage({
        type: "success",
        text: data.message || "Profile updated successfully!",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  // CHANGE PASSWORD
  async function handleChangePassword(e) {
    e.preventDefault();

    setMessage({ type: "", text: "" });

    if (!currentPassword || !newPassword) {
      setMessage({
        type: "error",
        text: "Please enter both password fields.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must contain at least 6 characters.",
      });
      return;
    }

    setPasswordSaving(true);

    try {
      const data = await api("/student/change-password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setMessage({
        type: "success",
        text: data.message || "Password changed successfully!",
      });

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to change password.",
      });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="profile-workspace">
      {/* SIDEBAR */}
      <aside className="profile-sidebar">
        <div className="profile-sidebar-brand">
          <div className="profile-sidebar-logo">S</div>
          <h2>StudentMart</h2>
        </div>

        <p className="profile-sidebar-heading">STUDENT WORKSPACE</p>

        <nav className="profile-sidebar-nav">
          <Link to="/dashboard">📊 Dashboard</Link>

          <Link to="/profile" className="active">
            👤 My Profile
          </Link>

          <Link to="/products">📦 Available Products</Link>

          <Link to="/add-product">➕ Add Product</Link>

          <Link to="/cart">🛒 Shopping Cart ({cartCount})</Link>
        </nav>

        <div className="profile-sidebar-logout">
          <Logout />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="profile-content">
        {/* PAGE HEADER */}
        <div className="profile-topbar">
          <h1>My Profile</h1>

          {student?.usn && (
            <span className="profile-usn-badge">{student.usn}</span>
          )}
        </div>

        {/* SUCCESS / ERROR MESSAGE */}
        {message.text && (
          <div
            className={`profile-alert profile-alert-${message.type}`}
            role="status"
          >
            {message.text}
          </div>
        )}

        {/* STUDENT INFORMATION CARD */}
        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-student-heading">
              <div className="profile-avatar">
                {(student?.name || "S").charAt(0).toUpperCase()}
              </div>

              <div>
                <h2>{student?.name || "Student Name"}</h2>
                <p>Student Information</p>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-btn"
              onClick={isEditing ? cancelEditing : startEditing}
            >
              {isEditing ? "Cancel Editing" : "✏️ Edit Profile"}
            </button>
          </div>

          {/* EDIT PROFILE FORM */}
          {isEditing ? (
            <form onSubmit={handleUpdateProfile}>
              <div className="profile-form-grid">
                <div className="profile-form-group">
                  <label>USN</label>
                  <input type="text" name="usn" value={form.usn} disabled />
                </div>

                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="profile-form-group">
                  <label>College</label>
                  <input
                    type="text"
                    name="college"
                    value={form.college}
                    onChange={handleChange}
                    placeholder="Enter college name"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Course</label>
                  <input
                    type="text"
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="Example: Computer Science"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Academic Year</label>
                  <select name="year" value={form.year} onChange={handleChange}>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="profile-form-actions">
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={cancelEditing}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* DISPLAY STUDENT DETAILS */
            <div className="profile-grid">
              <div className="profile-item">
                <label>USN</label>
                <div>{student?.usn || "Not added"}</div>
              </div>

              <div className="profile-item">
                <label>Email Address</label>
                <div>{student?.email || "Not added"}</div>
              </div>

              <div className="profile-item">
                <label>Phone Number</label>
                <div>{student?.phone || "Not added"}</div>
              </div>

              <div className="profile-item">
                <label>College</label>
                <div>{student?.college || "Not added"}</div>
              </div>

              <div className="profile-item">
                <label>Course</label>
                <div>{student?.course || "Not added"}</div>
              </div>

              <div className="profile-item">
                <label>Academic Year</label>
                <div>{student?.year || "2nd Year"}</div>
              </div>
            </div>
          )}
        </section>

        {/* CHANGE PASSWORD CARD */}
        <section className="profile-card profile-password-card">
          <h2>Change Password</h2>

          <p className="profile-password-description">
            Update your account password securely.
          </p>

          <form
            onSubmit={handleChangePassword}
            className="profile-password-form"
          >
            <div className="profile-form-group">
              <label>Current Password</label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
                required
              />
            </div>

            <div className="profile-form-group">
              <label>New Password</label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="profile-password-actions">
              <button
                type="submit"
                className="profile-password-btn"
                disabled={passwordSaving}
              >
                {passwordSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
