import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { booting, isAuthenticated } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
          Loading CablePro...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
