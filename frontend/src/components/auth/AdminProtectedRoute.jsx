import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AdminProtectedRoute({ children }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !hasRole("ADMIN")) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
