import {
  BarChart3,
  CreditCard,
  FileText,
  LayoutDashboard,
  PlusCircle,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "collector"] },
  { to: "/customers", label: "Customers", icon: Users, roles: ["admin", "collector"] },
  { to: "/customers/new", label: "Add Customer", icon: PlusCircle, roles: ["admin"] },
  { to: "/payments", label: "Payments", icon: CreditCard, roles: ["admin", "collector"] },
  { to: "/pending-dues", label: "Pending Dues", icon: WalletCards, roles: ["admin", "collector"] },
  { to: "/reports", label: "Reports", icon: FileText, roles: ["admin", "collector"] }
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/30 transition md:hidden ${open ? "block" : "hidden"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 transform flex-col border-r border-slate-200 bg-white transition md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BarChart3 size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-950">CablePro</p>
              <p className="text-xs text-slate-500">Cable TV Billing</p>
            </div>
          </div>
          <button className="btn-secondary h-9 w-9 p-0 md:hidden" type="button" onClick={onClose} aria-label="Close menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`
                }
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{user?.name || "CablePro User"}</p>
            <p className="mt-1 text-xs capitalize text-slate-500">{user?.role || "staff"}</p>
          </div>
        </div>
      </aside>
    </>
  );
}
