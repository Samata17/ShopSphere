import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SellerProtectedRoute({ children }) {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !hasRole("SELLER")) {
    return <Navigate to="/seller/login" replace />;
  }

  return children;
}

export default SellerProtectedRoute;
