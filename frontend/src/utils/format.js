export const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

export function dateOnly(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function downloadBlob(data, filename, type) {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function statusBadge(status) {
  if (status === "active") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (status === "inactive") return "bg-slate-100 text-slate-700 ring-slate-200";
  return "bg-amber-50 text-amber-700 ring-amber-200";
}
