import { Download, History, Receipt, Search, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { dateOnly, money } from "../utils/format";

export default function Payments() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [payment, setPayment] = useState({
    amount: "",
    method: "cash",
    transaction_ref: "",
    note: ""
  });

  async function loadRecent() {
    try {
      const { data } = await api.get("/payments/recent?limit=8");
      setRecent(data.data || []);
    } catch (_error) {
      setRecent([]);
    }
  }

  async function loadHistory(customerId) {
    if (!customerId) {
      setHistory([]);
      return;
    }
    try {
      const { data } = await api.get(`/payments/customer/${customerId}`);
      setHistory(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load payment history");
    }
  }

  useEffect(() => {
    loadRecent();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "12", pending: "true" });
        if (search) params.set("search", search);
        const { data } = await api.get(`/customers?${params.toString()}`);
        setCustomers(data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to search customers");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  function chooseCustomer(customer) {
    setSelected(customer);
    setPayment((current) => ({ ...current, amount: customer.due_amount || "" }));
    loadHistory(customer.id);
  }

  async function markPaid(event) {
    event.preventDefault();
    if (!selected) {
      toast.error("Select a customer first");
      return;
    }

    const amount = Number(payment.amount || selected.due_amount || 0);
    if (amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post("/payments/mark-paid", {
        customer_id: selected.id,
        amount,
        method: payment.method,
        transaction_ref: payment.transaction_ref || null,
        note: payment.note || null
      });
      toast.success("Payment marked as paid");
      setPayment({ amount: "", method: "cash", transaction_ref: "", note: "" });
      setSelected((current) =>
        current ? { ...current, due_amount: data.data.remaining_due } : current
      );
      await Promise.all([loadHistory(selected.id), loadRecent()]);
      await openReceipt(data.data.id, false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
    } finally {
      setSaving(false);
    }
  }

  async function openReceipt(paymentId, notify = true) {
    try {
      const response = await api.get(`/payments/${paymentId}/receipt.pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => window.URL.revokeObjectURL(url), 30000);
      if (notify) toast.success("Receipt opened");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to open receipt");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Find customers, collect dues, and generate receipts.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <div className="panel p-4">
            <label className="label" htmlFor="payment-search">
              Search pending customer
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                id="payment-search"
                className="input pl-10"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Name, mobile, customer ID, or box number"
              />
            </div>
          </div>

          <div className="panel overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-semibold text-slate-950">Pending customers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="table-head">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Area</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3 text-right">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan="4">
                        Searching customers...
                      </td>
                    </tr>
                  ) : customers.length ? (
                    customers.map((customer) => (
                      <tr className={selected?.id === customer.id ? "bg-brand-50" : "hover:bg-slate-50"} key={customer.id}>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-950">{customer.name}</p>
                          <p className="text-xs text-slate-500">{customer.customer_code} | {customer.mobile}</p>
                        </td>
                        <td className="table-cell">{customer.area_name}</td>
                        <td className="table-cell font-semibold text-amber-700">{money.format(customer.due_amount || 0)}</td>
                        <td className="table-cell text-right">
                          <button className="btn-secondary h-9" type="button" onClick={() => chooseCustomer(customer)}>
                            Select
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan="4">
                        No pending customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <form className="panel p-5" onSubmit={markPaid}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Mark payment</h2>
                <p className="mt-1 text-sm text-slate-500">{selected ? selected.name : "Select a customer to collect payment"}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Wallet size={21} aria-hidden="true" />
              </div>
            </div>

            {selected && (
              <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm text-amber-800">Current due</p>
                <p className="mt-1 text-2xl font-semibold text-amber-900">{money.format(selected.due_amount || 0)}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="label" htmlFor="amount">
                  Amount
                </label>
                <input
                  id="amount"
                  className="input"
                  type="number"
                  min="1"
                  value={payment.amount}
                  onChange={(event) => setPayment((current) => ({ ...current, amount: event.target.value }))}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="label" htmlFor="method">
                  Method
                </label>
                <select
                  id="method"
                  className="input"
                  value={payment.method}
                  onChange={(event) => setPayment((current) => ({ ...current, method: event.target.value }))}
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="ref">
                  Transaction reference
                </label>
                <input
                  id="ref"
                  className="input"
                  value={payment.transaction_ref}
                  onChange={(event) => setPayment((current) => ({ ...current, transaction_ref: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="label" htmlFor="note">
                  Note
                </label>
                <textarea
                  id="note"
                  className="textarea"
                  value={payment.note}
                  onChange={(event) => setPayment((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>

            <button className="btn-primary mt-5 w-full" type="submit" disabled={saving || !selected}>
              <Receipt size={18} aria-hidden="true" />
              {saving ? "Collecting..." : "Mark Paid"}
            </button>
          </form>

          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
              <History size={18} className="text-slate-500" aria-hidden="true" />
              <h2 className="text-base font-semibold text-slate-950">Payment history</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {history.length ? (
                history.map((item) => (
                  <div className="flex items-center justify-between gap-4 px-4 py-3" key={item.id}>
                    <div>
                      <p className="text-sm font-medium text-slate-950">{money.format(item.amount || 0)} via {item.method}</p>
                      <p className="mt-1 text-xs text-slate-500">{item.receipt_no} | {dateOnly(item.payment_date)}</p>
                    </div>
                    <button className="btn-secondary h-9 w-9 p-0" type="button" onClick={() => openReceipt(item.id)} title="Open receipt">
                      <Download size={16} aria-hidden="true" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="px-4 py-8 text-center text-sm text-slate-500">No payment history selected.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-950">Recent payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="table-head">
              <tr>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Area</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length ? (
                recent.map((item) => (
                  <tr key={item.id}>
                    <td className="table-cell">{item.receipt_no}</td>
                    <td className="table-cell">{item.customer_name}</td>
                    <td className="table-cell">{item.area_name}</td>
                    <td className="table-cell font-medium text-emerald-700">{money.format(item.amount || 0)}</td>
                    <td className="table-cell capitalize">{item.method}</td>
                    <td className="table-cell">{dateOnly(item.payment_date)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-slate-500" colSpan="6">
                    No recent payments yet.
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
