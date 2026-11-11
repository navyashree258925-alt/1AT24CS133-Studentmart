import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { EditProfile, ChangePassword } from "./Edit.jsx";
import Logout from "./Logout.jsx";

export default function Profile() {
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

  return (
    <>
      <header className="profile-nav">
        <div className="profile-nav-inner">
          <span className="logo-text">StudentMart</span>

          <nav>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Logout />
          </nav>
        </div>
      </header>

      <main className="profile-page">
        <p className="eyebrow">Account</p>
        <h1>Your Profile</h1>
        <p className="lead">
          View and manage your StudentMart account information.
        </p>

        {!student ? (
          <div className="loading">{error || "Loading profile..."}</div>
        ) : (
          <div className="profile-grid">
            <EditProfile student={student} onSaved={setStudent} />
            <ChangePassword />
          </div>
        )}
      </main>
    </>
  );
}
