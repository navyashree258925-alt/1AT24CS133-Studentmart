import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) {
      return;
    }

    localStorage.removeItem("token");
    localStorage.removeItem("student");
    localStorage.removeItem("cart");

    navigate("/", { replace: true });
  }

  return (
    <button type="button" className="btn-logout" onClick={handleLogout}>
      Logout
    </button>
  );
}
