import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function DashboardModule() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    users: 0,
    lowStock: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // ------------------------------
        // RUN ALL QUERIES PARALLEL
        // ------------------------------
        const [
          lowStockRes,
          productCountRes,
          ordersRes,
          orderCountRes,
          usersCountRes,
        ] = await Promise.all([
          supabase.from("items").select("*").lte("stock", 10), // Low stock
          supabase.from("items").select("*", { head: true, count: "exact" }), // Product count

          supabase.from("orders").select("total_amount"), // Order list for revenue
          supabase.from("orders").select("*", { head: true, count: "exact" }), // Order count

          supabase.from("profiles").select("*", { head: true, count: "exact" }), // User count
        ]);

        // ------------------------------
        // SAFE VALUES
        // ------------------------------
        const lowStock = lowStockRes?.data || [];
        const productCount = productCountRes?.count || 0;

        const orders = ordersRes?.data || [];
        const ordersCount = orderCountRes?.count || 0;

        const usersCount = usersCountRes?.count || 0;

        // ------------------------------
        // CALCULATE REVENUE SAFELY
        // ------------------------------
        const revenue = orders.reduce((sum, o) => {
          const val = Number(o.total_amount);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        // Sort low-stock items ascending by stock
        const sortedLowStock = [...lowStock].sort((a, b) => a.stock - b.stock);

        setStats({
          products: productCount,
          orders: ordersCount,
          revenue,
          users: usersCount,
          lowStock: sortedLowStock,
        });

      } catch (err) {
        console.error("Dashboard load error →", err);
        pushActivity("Dashboard failed to load stats", "danger");
      }
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card label="Total Products" value={stats.products} accent="emerald" />
        <Card label="Total Orders" value={stats.orders} accent="amber" />
        <Card label="Users" value={stats.users} accent="sky" />
        <Card
          label="Revenue"
          value={`₹${stats.revenue.toFixed(2)}`}
          accent="violet"
        />
      </div>

      {/* Low Stock + Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* LOW STOCK */}
        <div className="rounded-xl border border-slate-700 p-4">
          <h3 className="text-slate-200 text-sm font-semibold">Low Stock</h3>

          {stats.lowStock.length === 0 ? (
            <p className="text-xs text-slate-400 mt-1">
              All products have sufficient stock.
            </p>
          ) : (
            <ul className="text-xs space-y-1 mt-2">
              {stats.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between py-1"
                >
                  <span>{p.name}</span>
                  <span className="text-amber-300">{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* NOTES */}
        <div className="rounded-xl border border-slate-700 p-4">
          <h3 className="text-slate-200 text-sm font-semibold">Notes</h3>
          <ul className="text-xs text-slate-400 list-disc pl-4 mt-2">
            <li>Add new Ayurveda products.</li>
            <li>Use coupons for festival offers.</li>
            <li>Manage reviews & SEO regularly.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, accent }) {
  const colors = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-amber-600",
    sky: "from-sky-400 to-sky-600",
    violet: "from-violet-400 to-violet-600",
  };

  return (
    <div className="rounded-xl border border-slate-700 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg text-slate-100 font-semibold">{value}</p>

      <div
        className={`h-1.5 mt-3 rounded-full bg-gradient-to-r ${
          colors[accent]
        }`}
      />
    </div>
  );
}
