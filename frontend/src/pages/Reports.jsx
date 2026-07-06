import { CalendarDays, Download, FileSpreadsheet, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { downloadBlob, money } from "../utils/format";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function thisMonth() {
  return new Date().toISOString().slice(0, 7);
}

function valueFor(row, key) {
  const value = row[key];
  if (key.includes("amount") || key.includes("due") || key.includes("collection")) {
    return money.format(Number(value || 0));
  }
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export default function Reports() {
  const [type, setType] = useState("daily");
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(thisMonth());
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState("");

  const endpoint = useMemo(() => {
    if (type === "daily") return `/reports/daily?date=${date}`;
    if (type === "monthly") return `/reports/monthly?month=${month}`;
    return "/reports/pending-dues";
  }, [date, month, type]);

  async function loadReport() {
    setLoading(true);
    try {
      const { data } = await api.get(endpoint);
      setRows(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, [endpoint]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      Object.values(row)
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    );
  }, [rows, search]);

  const columns = useMemo(() => Object.keys(filteredRows[0] || rows[0] || {}), [filteredRows, rows]);

  async function exportReport(format) {
    setExporting(format);
    try {
      const params = new URLSearchParams({ type, format });
      if (type === "daily") params.set("date", date);
      if (type === "monthly") params.set("month", month);
      const response = await api.get(`/reports/export?${params.toString()}`, { responseType: "blob" });
      downloadBlob(
        response.data,
        `cablepro-${type}-report.${format === "pdf" ? "pdf" : "xlsx"}`,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Daily collection, monthly collection, and pending dues reports.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" type="button" disabled={Boolean(exporting)} onClick={() => exportReport("xlsx")}>
            <FileSpreadsheet size={17} aria-hidden="true" />
            Excel
          </button>
          <button className="btn-secondary" type="button" disabled={Boolean(exporting)} onClick={() => exportReport("pdf")}>
            <Download size={17} aria-hidden="true" />
            PDF
          </button>
        </div>
      </div>

      <section className="panel p-4">
        <div className="grid gap-3 lg:grid-cols-[320px_1fr_280px]">
          <div className="grid grid-cols-3 rounded-md border border-slate-200 bg-slate-100 p-1">
            {[
              ["daily", "Daily"],
              ["monthly", "Monthly"],
              ["dues", "Dues"]
            ].map(([key, label]) => (
              <button
                className={`h-9 rounded-md text-sm font-medium transition ${
                  type === key ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                }`}
                key={key}
                type="button"
                onClick={() => setType(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {type === "daily" && (
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-10" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>
            )}
            {type === "monthly" && (
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-10" type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search report" />
          </div>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold capitalize text-slate-950">{type === "dues" ? "Pending dues" : `${type} report`}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                {columns.length ? (
                  columns.map((column) => (
                    <th className="px-4 py-3" key={column}>
                      {column.replace(/_/g, " ")}
                    </th>
                  ))
                ) : (
                  <th className="px-4 py-3">Report</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={Math.max(columns.length, 1)}>
                    Loading report...
                  </td>
                </tr>
              ) : filteredRows.length ? (
                filteredRows.map((row, index) => (
                  <tr className="hover:bg-slate-50" key={`${type}-${index}`}>
                    {columns.map((column) => (
                      <td className="table-cell" key={column}>
                        {valueFor(row, column)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={Math.max(columns.length, 1)}>
                    No report data found.
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
