import { Cable, Lock, Smartphone } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ mobile: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = async (event) => {
    event.preventDefault();
    if (!form.mobile.trim() || !form.password.trim()) {
      toast.error("Mobile and password are required");
      return;
    }

    setLoading(true);
    try {
      await login(form);
      toast.success("Logged in successfully");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500">
            <Cable size={24} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold">CablePro</p>
            <p className="text-sm text-slate-300">Cable TV Management System</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-4xl font-semibold leading-tight">Billing, dues, and collections in one clean control room.</p>
          <p className="mt-5 text-base leading-7 text-slate-300">
            Track customers by area, collect faster, and give admins and collectors the right level of access.
          </p>
        </div>

        <p className="text-sm text-slate-400">Production dashboard for cable operators.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Cable size={22} aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">CablePro</p>
              <p className="text-sm text-slate-500">Cable TV Management</p>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-950">Sign in</h1>
            <p className="mt-2 text-sm text-slate-500">Use your admin or collector credentials.</p>
          </div>

          <form className="mt-7 space-y-4" onSubmit={submit}>
            <div>
              <label className="label" htmlFor="mobile">
                Mobile number
              </label>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="mobile"
                  className="input pl-10"
                  value={form.mobile}
                  onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                  placeholder="9876543210"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  id="password"
                  type="password"
                  className="input pl-10"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
