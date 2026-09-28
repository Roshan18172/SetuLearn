import { Navigate, useLocation } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";

export default function RequireStudent({ children }) {
  const { isAuthenticated, loading } = useStudentAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return children;
}
