import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { money, statusBadge } from "../utils/format";

export default function Customers() {
  const { isAdmin } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [areas, setAreas] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", area_id: "", status: "" });
  const [loading, setLoading] = useState(true);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(meta.page || 1), limit: "20" });
    if (filters.search) params.set("search", filters.search);
    if (filters.area_id) params.set("area_id", filters.area_id);
    if (filters.status) params.set("status", filters.status);
    return params.toString();
  }, [filters, meta.page]);

  async function loadCustomers() {
    setLoading(true);
    try {
      const { data } = await api.get(`/customers?${query}`);
      setCustomers(data.data || []);
      setMeta(data.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api
      .get("/areas")
      .then(({ data }) => setAreas(data.data || []))
      .catch(() => setAreas([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadCustomers, 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  async function deleteCustomer(customer) {
    const ok = window.confirm(`Delete ${customer.name}? This customer will be removed from active records.`);
    if (!ok) return;

    try {
      await api.delete(`/customers/${customer.id}`);
      toast.success("Customer deleted");
      loadCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  }

  const updateFilter = (key, value) => {
    setMeta((current) => ({ ...current, page: 1 }));
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Search, filter, and manage cable customer records.</p>
        </div>
        {isAdmin && (
          <Link className="btn-primary" to="/customers/new">
            <Plus size={18} aria-hidden="true" />
            Add Customer
          </Link>
        )}
      </div>

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input pl-10"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search name, mobile, customer ID, box number"
            />
          </div>
          <select className="input" value={filters.area_id} onChange={(event) => updateFilter("area_id", event.target.value)}>
            <option value="">All areas</option>
            {areas.map((area) => (
              <option value={area.id} key={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          <select className="input" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Box</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Status</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={isAdmin ? 8 : 7}>
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length ? (
                customers.map((customer) => (
                  <tr className="hover:bg-slate-50" key={customer.id}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-950">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.customer_code}</p>
                    </td>
                    <td className="table-cell">{customer.mobile}</td>
                    <td className="table-cell">{customer.area_name}</td>
                    <td className="table-cell">{customer.plan_name}</td>
                    <td className="table-cell">{customer.box_number || "-"}</td>
                    <td className="table-cell font-medium text-amber-700">{money.format(customer.due_amount || 0)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ring-1 ${statusBadge(customer.status)}`}>
                        {customer.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="table-cell text-right">
                        <div className="flex justify-end gap-2">
                          <Link className="btn-secondary h-9 w-9 p-0" to={`/customers/${customer.id}/edit`} title="Edit">
                            <Edit size={16} aria-hidden="true" />
                          </Link>
                          <button className="btn-secondary h-9 w-9 p-0 text-red-600" type="button" onClick={() => deleteCustomer(customer)} title="Delete">
                            <Trash2 size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={isAdmin ? 8 : 7}>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{meta.total || 0} customers</span>
          <div className="flex gap-2">
            <button
              className="btn-secondary h-9"
              type="button"
              disabled={(meta.page || 1) <= 1}
              onClick={() => setMeta((current) => ({ ...current, page: current.page - 1 }))}
            >
              Previous
            </button>
            <button
              className="btn-secondary h-9"
              type="button"
              disabled={(meta.page || 1) >= (meta.totalPages || 1)}
              onClick={() => setMeta((current) => ({ ...current, page: current.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
