import { useState } from "react";
import { api } from "../api.js";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export function EditProfile({ student, onSaved }) {
  const [form, setForm] = useState({
    usn: student?.usn || "",
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    college: student?.college || "",
    course: student?.course || "",
    year: student?.year || "2nd Year",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMsg({ type: "", text: "" });

    if (!form.usn.trim() || !form.name.trim() || !form.email.trim()) {
      setMsg({
        type: "error",
        text: "USN, name and email are required.",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      setMsg({
        type: "error",
        text: "Enter a valid email address.",
      });
      return;
    }

    const phonePattern = /^[0-9+\-\s]{7,15}$/;

    if (form.phone.trim() && !phonePattern.test(form.phone.trim())) {
      setMsg({
        type: "error",
        text: "Enter a valid phone number.",
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
        usn: student?.usn || form.usn.trim().toUpperCase(),
      };

      localStorage.setItem("student", JSON.stringify(updatedStudent));

      onSaved?.(updatedStudent);

      setMsg({
        type: "success",
        text: data.message || "Profile updated successfully!",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Unable to update profile.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h2>Personal Information</h2>

      <div className="field">
        <label htmlFor="usn">USN</label>
        <input
          id="usn"
          name="usn"
          value={form.usn}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="college">College</label>
        <input
          id="college"
          name="college"
          value={form.college}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="course">Course</label>
        <input
          id="course"
          name="course"
          value={form.course}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="year">Year</label>
        <select id="year" name="year" value={form.year} onChange={handleChange}>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <button className="btn-workspace" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}

// CHANGE PASSWORD
export function ChangePassword() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setMsg({ type: "", text: "" });

    if (!form.currentPassword || !form.newPassword) {
      setMsg({
        type: "error",
        text: "Fill in both password fields.",
      });
      return;
    }

    if (form.newPassword.length < 6) {
      setMsg({
        type: "error",
        text: "New password must contain at least 6 characters.",
      });
      return;
    }

    setSaving(true);

    try {
      const data = await api("/student/change-password", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setMsg({
        type: "success",
        text: data.message || "Password changed successfully!",
      });

      setForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Unable to change password.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="edit-form" onSubmit={handleSubmit}>
      <h2>Change Password</h2>

      <div className="field">
        <label htmlFor="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="newPassword">New Password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.newPassword}
          onChange={handleChange}
          minLength={6}
          required
        />
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <button className="btn-workspace" type="submit" disabled={saving}>
        {saving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}
