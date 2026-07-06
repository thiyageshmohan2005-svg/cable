import { Activity, CreditCard, IndianRupee, Users, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api/axios";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function StatCard({ title, value, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  };

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={21} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data } = await api.get("/dashboard/summary");
        if (active) setSummary(data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load dashboard");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const areaData = useMemo(() => summary?.area_analytics || [], [summary]);

  if (loading) {
    return <div className="panel p-6 text-sm text-slate-500">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Live collection, customer, and dues overview.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Customers" value={summary?.total_customers || 0} icon={Users} />
        <StatCard title="Active Customers" value={summary?.active_customers || 0} icon={Activity} tone="green" />
        <StatCard title="Pending Dues" value={money.format(summary?.pending_dues || 0)} icon={WalletCards} tone="amber" />
        <StatCard title="Today's Collection" value={money.format(summary?.today_collection || 0)} icon={CreditCard} />
        <StatCard title="Monthly Collection" value={money.format(summary?.monthly_collection || 0)} icon={IndianRupee} tone="green" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-slate-950">Area-wise analytics</h2>
            <p className="mt-1 text-sm text-slate-500">Customers and pending dues by service area.</p>
          </div>
          {areaData.length ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value, name) => [value, name.replace("_", " ")]} />
                  <Bar dataKey="total_customers" name="total customers" fill="#1f7ae0" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="pending_dues" name="pending dues" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
              No area data available
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-slate-950">Area summary</h2>
          {areaData.length ? (
            areaData.map((area) => (
              <div className="panel p-4" key={area.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{area.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{area.active_customers || 0} active customers</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-700">{money.format(area.pending_dues || 0)}</p>
                    <p className="mt-1 text-xs text-slate-500">pending</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="panel p-5 text-sm text-slate-500">No areas found.</div>
          )}
        </section>
      </div>
    </div>
  );
}
