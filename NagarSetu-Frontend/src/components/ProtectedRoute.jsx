import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../api";

function ProtectedRoute({ children, adminOnly = false }) {
  const token = getToken();
  const user  = getUser();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
}

export default ProtectedRoute;