// src/pages/Admin/AdminModules/Coupons/CouponsModule.jsx

import React, { useEffect, useState } from "react";
import Field from "../../../../components/admin/Field"; 
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function CouponsModule() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minAmount: "",
    active: true,
    expiresAt: "",
  });

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // LOAD COUPONS
  const loadCoupons = async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setCoupons(data || []);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // VALIDATION
  const validateForm = () => {
    if (!form.code.trim()) return "Coupon code cannot be empty.";
    if (!form.value || Number(form.value) <= 0)
      return "Enter a valid discount value.";

    if (form.type === "percentage" && Number(form.value) > 100)
      return "Percentage discount cannot exceed 100%.";

    if (form.expiresAt && new Date(form.expiresAt) < new Date())
      return "Expiry date cannot be in the past.";

    const duplicate = coupons.find(
      (c) => c.code.toUpperCase() === form.code.trim().toUpperCase()
    );
    if (duplicate) return "Coupon code already exists.";

    return null;
  };

  // ADD COUPON
  const add = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) return alert(errorMsg);

    setLoading(true);

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      min_amount: form.minAmount ? Number(form.minAmount) : 0,
      active: form.active,
      expires_at: form.expiresAt || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("coupons")
      .insert(payload)
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Failed to create coupon.");
      return;
    }

    pushActivity(`Created coupon ${data.code}`, "success");
    setCoupons((prev) => [data, ...prev]);

    // Reset form
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minAmount: "",
      active: true,
      expiresAt: "",
    });
  };

  // TOGGLE ACTIVE
  const toggle = async (id) => {
    const c = coupons.find((x) => x.id === id);
    if (!c) return;

    const { data, error } = await supabase
      .from("coupons")
      .update({ active: !c.active })
      .eq("id", id)
      .select()
      .single();

    if (!error) {
      setCoupons((prev) => prev.map((cp) => (cp.id === id ? data : cp)));
      pushActivity(
        `${data.code} marked as ${data.active ? "active" : "inactive"}`,
        "info"
      );
    }
  };

  // DELETE COUPON
  const remove = async (id) => {
    const c = coupons.find((x) => x.id === id);
    if (!c) return;

    if (!window.confirm(`Delete coupon ${c.code}?`)) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (!error) {
      setCoupons((prev) => prev.filter((x) => x.id !== id));
      pushActivity(`Deleted coupon ${c.code}`, "danger");
    }
  };

  // UI
  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1.7fr]">
      {/* ADD COUPON */}
      <div className="rounded-xl border border-slate-700 p-4 bg-slate-950/70">
        <h3 className="text-slate-100 text-sm font-semibold">Create coupon</h3>

        <form onSubmit={add} className="space-y-3 text-xs mt-3">
          <Field
            label="Code"
            value={form.code}
            placeholder="AYU20"
            onChange={(e) => updateForm("code", e.target.value)}
          />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[0.7rem] text-slate-400">Type</label>
              <select
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
              >
                <option value="percentage">Percentage %</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>

            <Field
              label="Value"
              value={form.value}
              onChange={(e) => updateForm("value", e.target.value)}
            />

            <Field
              label="Min. order amount"
              value={form.minAmount}
              onChange={(e) => updateForm("minAmount", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.7rem] text-slate-400">Expiry date</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => updateForm("expiresAt", e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
              />
            </div>

            <label className="flex items-center gap-2 text-[0.7rem]">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
              />
              Active
            </label>
          </div>

          <button
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 rounded-lg text-slate-900 text-xs font-semibold disabled:opacity-40"
          >
            {loading ? "Adding..." : "Add coupon"}
          </button>
        </form>
      </div>

      {/* COUPON LIST */}
      <div className="rounded-xl border border-slate-700 p-4 bg-slate-950/70">
        <h3 className="text-slate-100 text-sm font-semibold">Existing coupons</h3>

        <div className="space-y-2 mt-3 text-xs">
          {coupons.length === 0 ? (
            <p className="text-slate-500">No coupons yet.</p>
          ) : (
            coupons.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-700 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-emerald-100">{c.code}</p>
                  <p className="text-[0.7rem] text-slate-400">
                    {c.type === "percentage"
                      ? `${c.value}% off`
                      : `₹${c.value} off`}{" "}
                    {c.min_amount ? `• min ₹${c.min_amount}` : "• no min"}{" "}
                    {c.expires_at ? `• Expires ${c.expires_at}` : "• No expiry"}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggle(c.id)}
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                      c.active
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </button>

                  <button
                    onClick={() => remove(c.id)}
                    className="text-rose-400 text-[0.65rem]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
