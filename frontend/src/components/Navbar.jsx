import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <button className="btn-secondary h-10 w-10 p-0 md:hidden" type="button" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={20} aria-hidden="true" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-950">CablePro Admin</p>
          <p className="hidden text-xs text-slate-500 sm:block">Manage customers, collections, and dues</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium capitalize text-slate-600 sm:flex">
          <ShieldCheck size={16} aria-hidden="true" />
          {user?.role || "user"}
        </div>
        <button className="btn-secondary" type="button" onClick={() => logout()}>
          <LogOut size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
