import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function CustomerProtectedRoute({ children }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !hasRole("CUSTOMER")) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default CustomerProtectedRoute;
