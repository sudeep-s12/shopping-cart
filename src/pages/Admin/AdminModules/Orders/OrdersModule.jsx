import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

import { pushActivity } from "../helpers";



export function OrdersModule() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  // ---------------------------------------------------------
  // Fetch Orders + Order Items + User Info
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          order_status,
          total_amount,
          user_id,
          profiles:profiles!orders_user_id_fkey (display_name, email),
          order_items (
            id,
            quantity,
            price_at_purchase,
            discount_at_purchase,
            item_id,
            items:item_id (id, name, brand)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders:", error);
        return;
      }

      setOrders(data || []);
    };

    fetchOrders();
  }, []);

  // ---------------------------------------------------------
  // UPDATE ORDER STATUS
  // ---------------------------------------------------------
  const updateStatus = async (id, status) => {
    const { data, error } = await supabase
      .from("orders")
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating status:", error);
      return;
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
    pushActivity(`Order #${id} → ${status.toUpperCase()}`, "info");
  };

  // ---------------------------------------------------------
  // FILTER ORDERS
  // ---------------------------------------------------------
  const filtered =
    filter === "all"
      ? orders
      : orders.filter((o) => o.order_status === filter);

  // Status color system
  const statusColor = (s) =>
    ({
      pending_payment: "bg-yellow-500/20 text-yellow-200",
      confirmed: "bg-blue-500/20 text-blue-200",
      dispatched: "bg-purple-500/20 text-purple-200",
      delivered: "bg-emerald-500/20 text-emerald-200",
      cancelled: "bg-rose-500/20 text-rose-200",
    }[s] || "bg-slate-700 text-slate-300");

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Orders</h3>

        <select
          className="rounded-lg bg-slate-900 border border-slate-700 px-3 py-1 text-xs"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending_payment">Pending Payment</option>
          <option value="confirmed">Confirmed</option>
          <option value="dispatched">Dispatched</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* EMPTY */}
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500">No orders found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-slate-700 p-3 bg-slate-950/80 text-xs"
            >
              {/* Top Row */}
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-slate-100">
                    Order #{o.id}
                  </p>
                  <p className="text-slate-400 text-[0.7rem]">
                    {o.profiles?.display_name || "Unknown User"} •{" "}
                    {o.profiles?.email || "no-email"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-emerald-300">
                    ₹{Number(o.total_amount).toFixed(2)}
                  </p>
                  <p className="text-[0.7rem] text-slate-500">
                    {new Date(o.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* ITEMS */}
              <div className="mt-3 space-y-1">
                {o.order_items?.map((it) => (
                  <div
                    key={it.id}
                    className="flex justify-between text-[0.75rem] text-slate-300"
                  >
                    <span className="truncate">
                      {it.items?.name || 'Unknown Item'}
                      {it.items?.brand ? ` - ${it.items.brand}` : ""}
                    </span>

                    <span>
                      x{it.quantity} • ₹{it.price_at_purchase}
                    </span>
                  </div>
                ))}
              </div>

              {/* STATUS + ACTIONS */}
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] ${statusColor(
                    o.order_status
                  )}`}
                >
                  {o.order_status.toUpperCase()}
                </span>

                <div className="flex gap-1">
                  {[
                    "pending_payment",
                    "confirmed",
                    "dispatched",
                    "delivered",
                    "cancelled",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(o.id, s)}
                      className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                        o.order_status === s
                          ? "bg-emerald-500/90 text-slate-950"
                          : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
