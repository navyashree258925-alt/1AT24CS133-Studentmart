import { useNavigate } from "react-router-dom";

// Reusable logout button: clears the saved token and returns to the login page
export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <button className="btn-logout" onClick={handleLogout}>
      Logout
    </button>
  );
}
