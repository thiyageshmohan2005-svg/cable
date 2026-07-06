import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  mobile: "",
  address: "",
  area_id: "",
  plan_id: "",
  box_number: "",
  status: "active"
};

export default function AddCustomer() {
  const { isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [areas, setAreas] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(id);
  const selectedPlan = useMemo(() => plans.find((plan) => String(plan.id) === String(form.plan_id)), [form.plan_id, plans]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [areaRes, planRes] = await Promise.all([api.get("/areas"), api.get("/plans")]);
        setAreas(areaRes.data.data || []);
        setPlans(planRes.data.data || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load form options");
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    if (!id) return;
    async function loadCustomer() {
      try {
        const { data } = await api.get(`/customers/${id}`);
        const customer = data.data;
        setForm({
          name: customer.name || "",
          mobile: customer.mobile || "",
          address: customer.address || "",
          area_id: customer.area_id || "",
          plan_id: customer.plan_id || "",
          box_number: customer.box_number || "",
          status: customer.status || "active"
        });
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to load customer");
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [id]);

  if (!isAdmin) {
    return <Navigate to="/customers" replace />;
  }

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    const required = ["name", "mobile", "address", "area_id", "plan_id"];
    const missing = required.filter((key) => !String(form[key]).trim());
    if (missing.length) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        area_id: Number(form.area_id),
        plan_id: Number(form.plan_id)
      };

      if (isEdit) {
        await api.put(`/customers/${id}`, payload);
        toast.success("Customer updated");
      } else {
        await api.post("/customers", payload);
        toast.success("Customer added");
      }
      navigate("/customers");
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="panel p-6 text-sm text-slate-500">Loading customer...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">{isEdit ? "Edit Customer" : "Add Customer"}</h1>
        <p className="page-subtitle">Maintain accurate customer, area, plan, and box details.</p>
      </div>

      <form className="panel max-w-4xl p-5" onSubmit={submit}>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input id="name" className="input" value={form.name} onChange={(event) => setField("name", event.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="mobile">
              Mobile
            </label>
            <input id="mobile" className="input" value={form.mobile} onChange={(event) => setField("mobile", event.target.value)} />
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="address">
              Address
            </label>
            <textarea id="address" className="textarea" value={form.address} onChange={(event) => setField("address", event.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="area">
              Area
            </label>
            <select id="area" className="input" value={form.area_id} onChange={(event) => setField("area_id", event.target.value)}>
              <option value="">Select area</option>
              {areas.map((area) => (
                <option value={area.id} key={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="plan">
              Plan
            </label>
            <select id="plan" className="input" value={form.plan_id} onChange={(event) => setField("plan_id", event.target.value)}>
              <option value="">Select plan</option>
              {plans.map((plan) => (
                <option value={plan.id} key={plan.id}>
                  {plan.name} - Rs.{plan.monthly_price}
                </option>
              ))}
            </select>
            {selectedPlan && <p className="mt-1 text-xs text-slate-500">Monthly price: Rs.{selectedPlan.monthly_price}</p>}
          </div>

          <div>
            <label className="label" htmlFor="box">
              Box number
            </label>
            <input id="box" className="input" value={form.box_number} onChange={(event) => setField("box_number", event.target.value)} />
          </div>

          <div>
            <label className="label" htmlFor="status">
              Status
            </label>
            <select id="status" className="input" value={form.status} onChange={(event) => setField("status", event.target.value)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="btn-secondary" type="button" onClick={() => navigate("/customers")}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={saving}>
            <Save size={18} aria-hidden="true" />
            {saving ? "Saving..." : "Save Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
