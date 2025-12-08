import React, { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

import { pushActivity } from "../helpers";

export function CategoriesModule() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌿");

  useEffect(() => {
    const fetchCats = async () => {
      const { data, error } = await supabase.from("categories").select("*");

      if (!error) setCategories(data || []);
    };
    fetchCats();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;

    const newCat = {
      id: crypto.randomUUID(),
      name,
      emoji,
      icon: emoji,
    };

    const { data, error } = await supabase
      .from("categories")
      .insert(newCat)
      .select()
      .single();

    if (error) return alert("Failed to create category");

    setCategories((prev) => [...prev, data]);
    pushActivity(`Created category "${data.name}"`, "success");

    setName("");
    setEmoji("🌿");
  };

  const handleDelete = async (id) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (!window.confirm(`Delete "${cat.name}"?`)) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return alert("Delete failed");

    setCategories((prev) => prev.filter((c) => c.id !== id));
    pushActivity(`Deleted category "${cat.name}"`, "danger");
  };

  return (
    <div className="space-y-4">
      {/* Add Category */}
      <div className="rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-200 text-sm font-semibold">Add Category</h3>

        <div className="grid gap-3 grid-cols-2 mt-3">
          <div>
            <label className="text-[0.7rem] text-slate-400">Name</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Immunity"
            />
          </div>

          <div>
            <label className="text-[0.7rem] text-slate-400">Emoji</label>
            <input
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
              maxLength={2}
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="mt-3 px-4 py-2 bg-emerald-500 text-slate-900 rounded-lg text-xs font-semibold"
        >
          Add Category
        </button>
      </div>

      {/* List */}
      <div className="rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-200 text-sm font-semibold">
          Existing Categories
        </h3>

        {categories.length === 0 ? (
          <p className="text-xs text-slate-500 mt-2">No categories yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mt-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full text-xs"
              >
                <span>{c.emoji}</span>
                <span>{c.name}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-rose-400 hover:text-rose-300"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
