import { Download, MessageCircle, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { downloadBlob, money, statusBadge } from "../utils/format";

export default function PendingDues() {
  const [rows, setRows] = useState([]);
  const [areas, setAreas] = useState([]);
  const [filters, setFilters] = useState({ search: "", area_id: "" });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState("");

  async function loadDues() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.area_id) params.set("area_id", filters.area_id);
      const { data } = await api.get(`/reports/pending-dues?${params.toString()}`);
      setRows(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load pending dues");
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
    loadDues();
  }, [filters.area_id]);

  const visibleRows = useMemo(() => {
    const needle = filters.search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      [row.customer_code, row.name, row.mobile, row.area_name, row.box_number]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [filters.search, rows]);

  const totalDue = visibleRows.reduce((sum, row) => sum + Number(row.due_amount || 0), 0);

  async function exportDues(format) {
    setExporting(format);
    try {
      const params = new URLSearchParams({ type: "dues", format });
      if (filters.area_id) params.set("area_id", filters.area_id);
      const response = await api.get(`/reports/export?${params.toString()}`, { responseType: "blob" });
      downloadBlob(
        response.data,
        `cablepro-pending-dues.${format === "pdf" ? "pdf" : "xlsx"}`,
        format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      toast.success(`${format.toUpperCase()} exported`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Export failed");
    } finally {
      setExporting("");
    }
  }

  async function queueReminder(channel) {
    try {
      const endpoint = channel === "sms" ? "/notifications/sms-reminders" : "/notifications/whatsapp-alerts";
      const { data } = await api.post(endpoint);
      toast.success(`${data.data.queued || 0} ${channel.toUpperCase()} reminders queued`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to queue reminders");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="page-title">Pending Dues</h1>
          <p className="page-subtitle">Track unpaid customers and queue reminders.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" onClick={() => queueReminder("sms")}>
            <Send size={17} aria-hidden="true" />
            SMS
          </button>
          <button className="btn-secondary" type="button" onClick={() => queueReminder("whatsapp")}>
            <MessageCircle size={17} aria-hidden="true" />
            WhatsApp
          </button>
          <button className="btn-secondary" type="button" disabled={Boolean(exporting)} onClick={() => exportDues("xlsx")}>
            <Download size={17} aria-hidden="true" />
            Excel
          </button>
          <button className="btn-secondary" type="button" disabled={Boolean(exporting)} onClick={() => exportDues("pdf")}>
            <Download size={17} aria-hidden="true" />
            PDF
          </button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="panel p-5">
          <p className="text-sm font-medium text-slate-500">Pending Customers</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">{visibleRows.length}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-medium text-slate-500">Total Pending Due</p>
          <p className="mt-3 text-2xl font-semibold text-amber-700">{money.format(totalDue)}</p>
        </div>
        <div className="panel p-5">
          <p className="text-sm font-medium text-slate-500">Selected Area</p>
          <p className="mt-3 text-2xl font-semibold text-slate-950">
            {areas.find((area) => String(area.id) === String(filters.area_id))?.name || "All"}
          </p>
        </div>
      </section>

      <section className="panel p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input pl-10"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search due customer"
            />
          </div>
          <select className="input" value={filters.area_id} onChange={(event) => setFilters((current) => ({ ...current, area_id: event.target.value }))}>
            <option value="">All areas</option>
            {areas.map((area) => (
              <option value={area.id} key={area.id}>
                {area.name}
              </option>
            ))}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan="7">
                    Loading pending dues...
                  </td>
                </tr>
              ) : visibleRows.length ? (
                visibleRows.map((row) => (
                  <tr className="hover:bg-slate-50" key={row.customer_code}>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-950">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.customer_code}</p>
                    </td>
                    <td className="table-cell">{row.mobile}</td>
                    <td className="table-cell">{row.area_name}</td>
                    <td className="table-cell">{row.plan_name}</td>
                    <td className="table-cell">{row.box_number || "-"}</td>
                    <td className="table-cell font-semibold text-amber-700">{money.format(row.due_amount || 0)}</td>
                    <td className="table-cell">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ring-1 ${statusBadge(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="7">
                    No pending dues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
