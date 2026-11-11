import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import Logout from "./Logout.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/student/me")
      .then((data) => setStudent(data.student || data))
      .catch((err) => {
        setError(err.message);

        if (!localStorage.getItem("token")) {
          navigate("/", { replace: true });
        }
      });
  }, [navigate]);

  const show = (value) => value || <span className="empty">Not added yet</span>;

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-logo">S</div>
            <div>
              <div className="brand-name">StudentMart</div>
              <div className="brand-sub">Student Portal</div>
            </div>
          </div>

          <nav>
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
            <NavLink to="/profile" className="nav-link">
              Profile
            </NavLink>
            <Logout />
          </nav>
        </div>
      </header>

      {!student ? (
        <div className="loading">{error || "Loading your dashboard..."}</div>
      ) : (
        <main className="dash">
          <div className="dash-head">
            <div>
              <p className="eyebrow">Student Dashboard</p>
              <h1>Welcome back{student.name ? `, ${student.name}` : "!"}</h1>
              <p>Manage your student account from one place.</p>
            </div>

            <Link to="/profile" className="mini-card">
              <div className="avatar">{student.usn?.charAt(0) || "S"}</div>
              <div>
                <strong>{show(student.usn)}</strong>
                <small>Edit Profile</small>
              </div>
              <span className="arrow">→</span>
            </Link>
          </div>

          <div className="dash-grid">
            <section className="hero-card">
              <p className="eyebrow">StudentMart</p>
              <h2>Your student account</h2>
              <p>
                Your profile is successfully connected to StudentMart. You can
                manage your account information from the profile section.
              </p>
              <Link to="/profile" className="btn-small">
                Edit Profile
              </Link>
            </section>

            <section className="stat-list">
              <div className="stat-card">
                <div className="stat-label">USN</div>
                <div className="stat-value">{show(student.usn)}</div>
                <div className="stat-hint">Student identification number</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">EMAIL</div>
                <div className="stat-value">{show(student.email)}</div>
                <div className="stat-hint">Registered email address</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">ACCOUNT</div>
                <div className="stat-value status-active">
                  {student.isActive ? "Active" : "Inactive"}
                </div>
                <div className="stat-hint">
                  Your account is {student.isActive ? "active" : "inactive"}
                </div>
              </div>
            </section>
          </div>

          <section className="details-card">
            <p className="eyebrow">Academic details</p>
            <h3>Profile information</h3>

            <div className="details-grid">
              <div>
                <div className="stat-label">NAME</div>
                <div className="stat-value">{show(student.name)}</div>
              </div>

              <div>
                <div className="stat-label">PHONE</div>
                <div className="stat-value">{show(student.phone)}</div>
              </div>

              <div>
                <div className="stat-label">COLLEGE</div>
                <div className="stat-value">{show(student.college)}</div>
              </div>

              <div>
                <div className="stat-label">COURSE</div>
                <div className="stat-value">{show(student.course)}</div>
              </div>

              <div>
                <div className="stat-label">SEMESTER / YEAR</div>
                <div className="stat-value">{show(student.year)}</div>
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  );
}
