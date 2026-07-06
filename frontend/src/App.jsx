import { useState } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import AddCustomer from "./pages/AddCustomer";
import Customers from "./pages/Customers";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import PendingDues from "./pages/PendingDues";
import Reports from "./pages/Reports";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function CableProFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-950">CablePro Working</p>
        <p className="mt-2 text-sm text-slate-500">The app shell loaded successfully.</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<AddCustomer />} />
          <Route path="/customers/:id/edit" element={<AddCustomer />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/pending-dues" element={<PendingDues />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>
      <Route path="/working" element={<CableProFallback />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
