import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../controllers/AuthController";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        navigate("/login");
      } catch (errorMessage) {
        console.error(errorMessage);
      }
    };

    performLogout();
  }, [navigate]);

  return null;
}

export default Logout;
