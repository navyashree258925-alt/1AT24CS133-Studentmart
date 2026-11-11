import { useEffect, useState } from "react";
import { api } from "../api.js";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

const emptyProfile = {
  usn: "",
  name: "",
  email: "",
  phone: "",
  college: "",
  course: "",
  year: "1st Year",
};

export function EditProfile({ student, onSaved }) {
  const [form, setForm] = useState(emptyProfile);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (student) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        usn: student.usn || "",
        name: student.name || "",
        email: student.email || "",
        phone: student.phone || "",
        college: student.college || "",
        course: student.course || "",
        year: student.year || "1st Year",
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!form.usn.trim() || !form.email.trim()) {
      setMsg({
        type: "error",
        text: "USN and email are required",
      });
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      setMsg({
        type: "error",
        text: "Enter a valid email",
      });
      return;
    }

    const phonePattern = /^[0-9+\-\s]{7,15}$/;

    if (form.phone && !phonePattern.test(form.phone.trim())) {
      setMsg({
        type: "error",
        text: "Enter a valid phone number",
      });
      return;
    }

    setSaving(true);

    try {
      const data = await api("/student/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });

      setMsg({
        type: "success",
        text: data.message || "Profile updated successfully",
      });

      if (onSaved && data.student) {
        onSaved(data.student);
      }
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Unable to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Personal information</h2>

      <div className="field">
        <label htmlFor="usn">USN</label>
        <input
          id="usn"
          name="usn"
          placeholder="USN"
          value={form.usn}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="college">College</label>
        <input
          id="college"
          name="college"
          placeholder="College Name"
          value={form.college}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="course">Course</label>
        <input
          id="course"
          name="course"
          placeholder="e.g. Computer Science"
          value={form.course}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="year">Semester / Year</label>
        <select id="year" name="year" value={form.year} onChange={handleChange}>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save changes"}
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!form.currentPassword || !form.newPassword) {
      setMsg({
        type: "error",
        text: "Fill in both password fields",
      });
      return;
    }

    if (form.newPassword.length < 6) {
      setMsg({
        type: "error",
        text: "New password must be at least 6 characters",
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
        text: data.message || "Password updated successfully",
      });

      setForm({
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err.message || "Unable to change password",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Change password</h2>

      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          value={form.currentPassword}
          onChange={handleChange}
        />
      </div>

      <div className="field">
        <label htmlFor="newPassword">New password</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="Minimum 6 characters"
          value={form.newPassword}
          onChange={handleChange}
        />
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? "Updating..." : "Change password"}
      </button>
    </form>
  );
}
