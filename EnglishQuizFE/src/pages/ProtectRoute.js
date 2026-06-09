import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function ProtectRoute() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null; // or a loading spinner

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectRoute;
