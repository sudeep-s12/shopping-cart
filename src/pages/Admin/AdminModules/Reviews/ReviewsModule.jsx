import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function ReviewsModule() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setReviews(data || []);
    };
    fetch();
  }, []);

  const toggleApprove = async (id) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return;

    const newStatus = !r.approved;

    const { data, error } = await supabase
      .from("reviews")
      .update({ approved: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (!error) {
      setReviews((p) => p.map((rv) => (rv.id === id ? data : rv)));

      pushActivity(
        `${newStatus ? "Approved" : "Unapproved"} review from ${r.user_name ?? r.userName ?? "User"} (${r.rating}★)`,
        newStatus ? "success" : "danger"
      );
    }
  };

  const remove = async (id) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return;

    if (!window.confirm(`Delete review from ${r.user_name ?? r.userName}?`)) return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (!error) {
      setReviews((p) => p.filter((rv) => rv.id !== id));
      pushActivity(
        `Deleted review from ${r.user_name ?? r.userName} (${r.rating}★)`,
        "danger"
      );
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Reviews moderation</h3>

      {reviews.length === 0 ? (
        <p className="text-xs text-slate-500">No reviews yet.</p>
      ) : (
        <div className="space-y-2 text-xs">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-slate-700 p-3 bg-slate-950/80"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">
                    {r.user_name ?? r.userName ?? "User"} •{" "}
                    <span className="text-amber-300">{r.rating}★</span>
                  </p>
                  <p className="text-[0.7rem] text-slate-400">
                    {r.product_name ?? r.productName ?? "Product"}
                  </p>
                </div>

                <button
                  onClick={() => toggleApprove(r.id)}
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                    r.approved
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-slate-700 text-slate-200"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </button>
              </div>

              <p className="mt-2 text-[0.75rem] text-slate-200">{r.comment}</p>

              <button
                onClick={() => remove(r.id)}
                className="mt-2 text-rose-400 text-[0.65rem]"
              >
                Delete review
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
