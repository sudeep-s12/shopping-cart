// src/pages/AdminModules.jsx
// src/pages/AdminModules.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

/* ------------ Helpers for localStorage ------------ */
const readLS = (key, fallback) => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLS = (key, value) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
};

const pushActivity = async (message, type = "info") => {
  const entry = {
    id: Date.now(),
    message,
    type,
    createdAt: new Date().toISOString(),
  };

  // 1) Save to localStorage (for fast UI)
  const log = readLS("ss_activityLog", []);
  const updated = [entry, ...log].slice(0, 200);
  writeLS("ss_activityLog", updated);

  // 2) Also save to Supabase activity_log table
  const { error } = await supabase.from("activity_log").insert({
    message,
    type,
    created_at: entry.createdAt,
  });
  if (error) console.error("Error writing activity log:", error);
};

/* ------------ Dashboard Module ------------ */
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
      // products count + low stock
      const [{ data: lowStockData }, { count: productsCount }] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .lte("stock", 10)
          .not("stock", "is", null),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true }),
      ]);

      // orders count + revenue sum
      const [{ data: orders }, { count: ordersCount }] = await Promise.all([
        supabase.from("orders").select("total"),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true }),
      ]);

      const revenue = (orders || []).reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
      );

      // users count
      const { count: usersCount } = await supabase
        .from("profiles") // or your users table
        .select("*", { count: "exact", head: true });

      setStats({
        products: productsCount || 0,
        orders: ordersCount || 0,
        users: usersCount || 0,
        revenue,
        lowStock: lowStockData || [],
      });
    };

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Products" value={stats.products} accent="emerald" />
        <StatCard label="Total Orders" value={stats.orders} accent="amber" />
        <StatCard label="Registered Users" value={stats.users} accent="sky" />
        <StatCard
          label="Total Revenue"
          value={`₹${stats.revenue.toFixed(2)}`}
          accent="violet"
        />
      </div>

      {/* Low stock & summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            Low stock alerts
          </h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-xs text-slate-500">
              All good. No products under critical stock.
            </p>
          ) : (
            <ul className="space-y-1 text-xs">
              {stats.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-slate-900/80 px-2 py-1"
                >
                  <span className="truncate text-slate-100">{p.name}</span>
                  <span className="text-amber-300 font-semibold">
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-100">
            Quick notes
          </h3>
          <ul className="space-y-1 text-xs text-slate-400 list-disc pl-4">
            <li>Add new Ayurveda products in the Products section.</li>
            <li>
              Use Coupons to create festival offers for Seva Sanjeevani users.
            </li>
            <li>
              Manage reviews, SEO meta, and bulk imports from the side
              navigation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const accentMap = {
    emerald: "from-emerald-400/70 to-emerald-500/40",
    amber: "from-amber-400/70 to-amber-500/40",
    sky: "from-sky-400/70 to-sky-500/40",
    violet: "from-violet-400/70 to-violet-500/40",
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-lg">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-50">{value}</p>
      <div
        className={`mt-3 h-1.5 w-full rounded-full bg-gradient-to-r ${accentMap[accent]}`}
      />
    </div>
  );
}

/* ------------ Categories Module ------------ */
export function CategoriesModule() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🌿");

  // Load from Supabase once
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading categories:", error);
        return;
      }
      setCategories(data || []);
    };

    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return;

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: name.trim(), icon: icon || "🌿" })
      .select()
      .single(); // return inserted row [web:56]

    if (error) {
      console.error("Error creating category:", error);
      return;
    }

    setCategories((prev) => [...prev, data]);
    pushActivity(`Created category "${data.name}"`, "success");
    setName("");
    setIcon("🌿");
  };

  const handleDelete = async (id) => {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    if (!window.confirm(`Delete category "${c.name}"?`)) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Error deleting category:", error);
      return;
    }

    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    pushActivity(`Deleted category "${c.name}"`, "danger");
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">
          Add new category
        </h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="space-y-1">
            <label className="text-[0.7rem] text-slate-400">Category name</label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
              placeholder="Immunity Boosters"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[0.7rem] text-slate-400">
              Icon (emoji)
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          className="mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-300 px-4 py-2 text-xs font-semibold text-slate-900 shadow-md hover:opacity-90"
        >
          Add category
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-100">
          Existing categories
        </h3>
        {categories.length === 0 ? (
          <p className="text-xs text-slate-500">
            No categories yet. Add your first one above.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1"
              >
                <span>{c.icon}</span>
                <span>{c.name}</span>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-rose-400 hover:text-rose-300 text-[0.65rem]"
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


/* ------------ Products Module (with variants & image upload) ------------ */
export function ProductsModule() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    tags: "",
    variants: "",
    imageUrl: "",
    imageData: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

  // Load from Supabase instead of localStorage
  useEffect(() => {
    const fetchAll = async () => {
      const [{ data: prodData, error: prodErr }, { data: catData, error: catErr }] =
        await Promise.all([
          supabase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("categories")
            .select("*")
            .order("name", { ascending: true }),
        ]);

      if (prodErr) console.error("Error loading products", prodErr);
      if (catErr) console.error("Error loading categories", catErr);

      setProducts(prodData || []);
      setCategories(catData || []);
    };

    fetchAll();
  }, []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateForm("imageData", ev.target.result);
      updateForm("imageUrl", ""); // clear external url
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.brand.trim()) e.brand = "Brand is required.";
    if (!form.price.trim()) e.price = "Price is required.";
    if (form.price && Number.isNaN(Number(form.price))) {
      e.price = "Price must be a number.";
    }
    if (!form.category) e.category = "Category is required.";
    if (!form.imageUrl && !form.imageData)
      e.imageUrl = "Either upload image or provide URL.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      name: "",
      brand: "",
      price: "",
      category: "",
      description: "",
      stock: "",
      tags: "",
      variants: "",
      imageUrl: "",
      imageData: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const tags = form.tags
      ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const variants = form.variants
      ? form.variants
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    // Map to Supabase column names (adjust to your table)
    const base = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      price: Number(form.price),
      category_id: form.category, // store selected category id
      description: form.description.trim() || null,
      stock: form.stock ? Number(form.stock) : null,
      tags,
      variants,
      image_url: form.imageUrl || null,
      image_data: form.imageData || null,
    };

    if (editingId) {
      // update
      const { data, error } = await supabase
        .from("products")
        .update({ ...base, updated_at: new Date().toISOString() })
        .eq("id", editingId)
        .select()
        .single();

      if (error) {
        console.error("Error updating product", error);
        return;
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? data : p))
      );
      pushActivity(`Updated product "${data.name}"`, "info");
    } else {
      // insert
      const { data, error } = await supabase
        .from("products")
        .insert({
          ...base,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating product", error);
        return;
      }

      setProducts((prev) => [data, ...prev]);
      pushActivity(`Created product "${data.name}"`, "success");
    }

    resetForm();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      category: p.category_id || p.category || "",
      description: p.description || "",
      stock: p.stock != null ? String(p.stock) : "",
      tags: p.tags ? p.tags.join(", ") : "",
      variants: p.variants ? p.variants.join(", ") : "",
      imageUrl: p.image_url || p.imageUrl || "",
      imageData: p.image_data || p.imageData || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const prod = products.find((p) => p.id === id);
    if (!window.confirm(`Delete product "${prod?.name}"?`)) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product", error);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    pushActivity(`Deleted product "${prod?.name}"`, "danger");
    if (editingId === id) {
      resetForm();
    }
  };

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  const getCategoryName = (val) =>
    categories.find((c) => c.id === val || c.name === val)?.name || val;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_2fr]">
      {/* Form */}
      <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/80 p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            {editingId ? "Edit product" : "Add new product"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-[0.7rem] text-emerald-300 hover:text-emerald-100 underline"
            >
              + New product
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Name *"
              error={errors.name}
              value={form.name}
              onChange={(e) => updateForm("name", e.target.value)}
              placeholder="Ashwagandha Capsules"
            />
            <Field
              label="Brand *"
              error={errors.brand}
              value={form.brand}
              onChange={(e) => updateForm("brand", e.target.value)}
              placeholder="Seva Sanjeevani"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label="Price (₹) *"
              error={errors.price}
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              placeholder="499"
            />
            <Field
              label="Stock"
              value={form.stock}
              onChange={(e) => updateForm("stock", e.target.value)}
              placeholder="100"
            />
            <div className="space-y-1">
              <label className="text-[0.7rem] text-slate-400">
                Category *
              </label>
              <select
                className={`w-full rounded-xl border bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60 ${
                  errors.category ? "border-rose-500" : "border-slate-700"
                }`}
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
              >
                <option value="">Choose…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-[0.65rem] text-rose-400">
                  {errors.category}
                </p>
              )}
            </div>
          </div>

          <Field
            label="Variants (comma separated)"
            value={form.variants}
            onChange={(e) => updateForm("variants", e.target.value)}
            placeholder="60 capsules, 120 capsules"
          />

          <Field
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => updateForm("tags", e.target.value)}
            placeholder="immunity, stress relief, organic"
          />

          <div className="space-y-1">
            <label className="text-[0.7rem] text-slate-400">
              Description
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
              rows={3}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              placeholder="Key benefits, herbs used, usage, etc."
            />
          </div>

          {/* Image section */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[0.7rem] text-slate-400">
                Upload image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-[0.7rem] file:mr-2 file:rounded-lg file:border-none file:bg-emerald-500/80 file:px-3 file:py-1 file:text-[0.7rem] file:font-semibold file:text-slate-950"
              />
              <p className="text-[0.65rem] text-slate-500">
                Image will be stored with this product record.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[0.7rem] text-slate-400">
                OR Image URL
              </label>
              <input
                className={`w-full rounded-xl border bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60 ${
                  errors.imageUrl ? "border-rose-500" : "border-slate-700"
                }`}
                value={form.imageUrl}
                onChange={(e) => updateForm("imageUrl", e.target.value)}
                placeholder="https://…"
              />
              {errors.imageUrl && (
                <p className="text-[0.65rem] text-rose-400">
                  {errors.imageUrl}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-700 px-4 py-2 text-[0.7rem] text-slate-200 hover:bg-slate-800/80"
            >
              Clear
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 px-5 py-2 text-[0.7rem] font-semibold text-slate-900 shadow-md hover:opacity-90"
            >
              {editingId ? "Update product" : "Add product"}
            </button>
          </div>
        </form>
      </div>

      {/* Product list */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Product catalogue
            </h3>
            <p className="text-[0.7rem] text-slate-400">
              These will be shown in the user shop page.
            </p>
          </div>
          <input
            className="w-full max-w-xs rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
            placeholder="Search by name, brand or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500">
            No products yet. Add your first Ayurveda product on the left.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/80 p-3 text-xs shadow-md hover:border-emerald-400/70 transition"
              >
                <div className="relative mb-2 h-28 w-full overflow-hidden rounded-xl bg-slate-800">
                  <img
                    src={p.image_data || p.image_url || p.imageData || p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-[0.6rem] font-semibold text-slate-950">
                    {getCategoryName(p.category_id || p.category) || "Ayurveda"}
                  </span>
                </div>

                <p className="text-[0.65rem] uppercase tracking-[0.16em] text-emerald-300">
                  {p.brand}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[0.8rem] font-semibold">
                  {p.name}
                </p>

                {p.description && (
                  <p className="mt-1 line-clamp-2 text-[0.7rem] text-slate-400">
                    {p.description}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-300">
                    ₹{Number(p.price).toFixed(2)}
                  </span>
                  {p.stock != null && (
                    <span
                      className={`text-[0.65rem] ${
                        p.stock <= 10 ? "text-amber-300" : "text-emerald-300"
                      }`}
                    >
                      Stock: {p.stock}
                    </span>
                  )}
                </div>

                {p.variants && p.variants.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.variants.map((v) => (
                      <span
                        key={v}
                        className="rounded-full bg-slate-800 px-2 py-0.5 text-[0.6rem] text-slate-200"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}

                {p.tags && p.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] text-emerald-200"
                      >
                        #{t}
                      </span>
                    ))}
                    {p.tags.length > 3 && (
                      <span className="text-[0.6rem] text-slate-500">
                        +{p.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 rounded-xl bg-slate-800 px-2 py-1 text-[0.65rem] font-medium text-emerald-200 hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-xl bg-rose-500/90 px-2 py-1 text-[0.65rem] font-medium text-slate-50 hover:bg-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, error }) {
  return (
    <div className="space-y-1">
      <label className="text-[0.7rem] text-slate-400">{label}</label>
      <input
        className={`w-full rounded-xl border bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60 ${
          error ? "border-rose-500" : "border-slate-700"
        }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="text-[0.65rem] text-rose-400">{error}</p>}
    </div>
  );
}

/* ------------ Orders Module ------------ */
export function OrdersModule() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  // Load from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading orders", error);
        return;
      }
      setOrders(data || []);
    };

    fetchOrders();
  }, []);

  // Update status in Supabase
  const updateStatus = async (id, status) => {
    const { data, error } = await supabase
      .from("orders")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status", error);
      return;
    }

    const updatedOrder = data;
    const updated = orders.map((o) =>
      o.id === id ? updatedOrder : o
    );
    setOrders(updated);
    pushActivity(`Order #${id} marked as ${status}`, "info");
  };

  const filtered = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          Orders management
        </h3>
        <select
          className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-1.5 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500">
          No orders yet. When users place orders from the shop, they will
          appear here.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 text-xs shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">
                    Order #{o.id}
                  </p>
                  <p className="text-[0.65rem] text-slate-400">
                    {o.user_name || o.userName} • {o.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-300">
                    ₹{Number(o.total).toFixed(2)}
                  </p>
                  <p className="text-[0.65rem] text-slate-500">
                    {new Date(o.created_at || o.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {(o.items || []).map((it) => (
                  <p
                    key={it.productId + (it.variant || "")}
                    className="flex justify-between text-[0.7rem] text-slate-300"
                  >
                    <span className="truncate">
                      {it.name}
                      {it.variant ? ` (${it.variant})` : ""}
                    </span>
                    <span>
                      x{it.qty} • ₹{(it.qty * it.price).toFixed(2)}
                    </span>
                  </p>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-1 text-[0.7rem]">
                  <StatusPill status={o.status} />
                </div>
                <div className="flex gap-1">
                  {["pending", "packed", "shipped", "delivered", "cancelled"].map(
                    (s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o.id, s)}
                        className={`rounded-full px-2 py-0.5 text-[0.6rem] ${
                          o.status === s
                            ? "bg-emerald-500/90 text-slate-950"
                            : "bg-slate-800 text-slate-200"
                        }`}
                      >
                        {s}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: "bg-amber-500/20 text-amber-200",
    packed: "bg-sky-500/20 text-sky-200",
    shipped: "bg-blue-500/20 text-blue-200",
    delivered: "bg-emerald-500/20 text-emerald-200",
    cancelled: "bg-rose-500/20 text-rose-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] ${map[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

//* ------------ Coupons Module ------------ */
export function CouponsModule() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minAmount: "",
    active: true,
    expiresAt: "",
  });

  // Load coupons from Supabase
  useEffect(() => {
    const fetchCoupons = async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading coupons", error);
        return;
      }
      setCoupons(data || []);
    };

    fetchCoupons();
  }, []);

  const updateForm = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.value) return;

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
      .single(); // return inserted row [web:56][web:72]

    if (error) {
      console.error("Error creating coupon", error);
      return;
    }

    setCoupons((prev) => [data, ...prev]);
    pushActivity(`Created coupon ${data.code}`, "success");
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minAmount: "",
      active: true,
      expiresAt: "",
    });
  };

  const toggleActive = async (id) => {
    const c = coupons.find((x) => x.id === id);
    if (!c) return;

    const { data, error } = await supabase
      .from("coupons")
      .update({ active: !c.active })
      .eq("id", id)
      .select()
      .single(); // [web:51]

    if (error) {
      console.error("Error toggling coupon", error);
      return;
    }

    setCoupons((prev) => prev.map((cp) => (cp.id === id ? data : cp)));
  };

  const removeCoupon = async (id) => {
    const c = coupons.find((x) => x.id === id);
    if (!c || !window.confirm(`Delete coupon "${c.code}"?`)) return;

    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      console.error("Error deleting coupon", error);
      return;
    }

    setCoupons((prev) => prev.filter((cp) => cp.id !== id));
    pushActivity(`Deleted coupon ${c.code}`, "danger");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.3fr_1.7fr]">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">
          Create coupon
        </h3>
        <form onSubmit={handleAdd} className="space-y-3 text-xs">
          <Field
            label="Code"
            value={form.code}
            onChange={(e) => updateForm("code", e.target.value)}
            placeholder="AYU20"
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[0.7rem] text-slate-400">Type</label>
              <select
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
              >
                <option value="percentage">Percentage %</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <Field
              label="Value"
              value={form.value}
              onChange={(e) => updateForm("value", e.target.value)}
              placeholder="20"
            />
            <Field
              label="Min. order amount"
              value={form.minAmount}
              onChange={(e) => updateForm("minAmount", e.target.value)}
              placeholder="999"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[0.7rem] text-slate-400">
                Expiry date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
                value={form.expiresAt}
                onChange={(e) => updateForm("expiresAt", e.target.value)}
              />
            </div>
            <label className="mt-5 flex items-center gap-2 text-[0.7rem] text-slate-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => updateForm("active", e.target.checked)}
              />
              Active
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-400 px-4 py-2 text-[0.7rem] font-semibold text-slate-900 shadow hover:opacity-90"
          >
            Add coupon
          </button>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-100">
          Existing coupons
        </h3>
        {coupons.length === 0 ? (
          <p className="text-xs text-slate-500">
            No coupons created yet. Create one on the left.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {coupons.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
              >
                <div>
                  <p className="font-semibold text-emerald-100">{c.code}</p>
                  <p className="text-[0.7rem] text-slate-400">
                    {c.type === "percentage"
                      ? `${c.value}% off`
                      : `₹${c.value} off`}
                    {c.min_amount || c.minAmount
                      ? ` • min order ₹${c.min_amount ?? c.minAmount}`
                      : " • no min"}
                    {c.expires_at || c.expiresAt
                      ? ` • Expires ${c.expires_at ?? c.expiresAt}`
                      : " • No expiry"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggleActive(c.id)}
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                      c.active
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {c.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => removeCoupon(c.id)}
                    className="text-[0.65rem] text-rose-400 hover:text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------ Users Module ------------ */
export function UsersModule() {
  const [users, setUsers] = useState([]);

  // Load users from Supabase (profiles or users table)
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles") // or "users" if that is your table name
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading users", error);
        return;
      }
      setUsers(data || []);
    };

    fetchUsers();
  }, []);

  const toggleBlock = async (id) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;

    const { data, error } = await supabase
      .from("profiles") // same table as above
      .update({ blocked: !u.blocked })
      .eq("id", id)
      .select()
      .single(); // return updated row [web:51]

    if (error) {
      console.error("Error updating user block status", error);
      return;
    }

    setUsers((prev) => prev.map((usr) => (usr.id === id ? data : usr)));
    pushActivity(
      `${data.email} has been ${data.blocked ? "blocked" : "unblocked"}`,
      "info"
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">Users</h3>
      {users.length === 0 ? (
        <p className="text-xs text-slate-500">
          No users yet. When people sign up / log in, they will appear here
          from Supabase.
        </p>
      ) : (
        <div className="space-y-2 text-xs">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2"
            >
              <div>
                <p className="font-semibold text-slate-100">
                  {u.name || u.full_name || u.email}
                </p>
                <p className="text-[0.7rem] text-slate-400">
                  {u.email}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[0.65rem] text-slate-400">
                  Joined:{" "}
                  {u.created_at || u.createdAt
                    ? new Date(u.created_at || u.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
                <button
                  onClick={() => toggleBlock(u.id)}
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                    u.blocked
                      ? "bg-rose-500/20 text-rose-200"
                      : "bg-emerald-500/20 text-emerald-200"
                  }`}
                >
                  {u.blocked ? "Blocked" : "Active"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* ------------ Reviews Module ------------ */
export function ReviewsModule() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading reviews", error);
        return;
      }
      setReviews(data || []);
    };

    fetchReviews();
  }, []);

  const toggleApprove = async (id) => {
    const r = reviews.find((x) => x.id === id);
    if (!r) return;

    const { data, error } = await supabase
      .from("reviews")
      .update({ approved: !r.approved })
      .eq("id", id)
      .select()
      .single(); // [web:51]

    if (error) {
      console.error("Error updating review", error);
      return;
    }

    setReviews((prev) => prev.map((rv) => (rv.id === id ? data : rv)));
  };

  const removeReview = async (id) => {
    const r = reviews.find((x) => x.id === id);
    if (!r || !window.confirm(`Delete review from ${r.user_name ?? r.userName}?`))
      return;

    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      console.error("Error deleting review", error);
      return;
    }

    setReviews((prev) => prev.filter((rv) => rv.id !== id));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">
        Reviews moderation
      </h3>
      {reviews.length === 0 ? (
        <p className="text-xs text-slate-500">
          No reviews yet. Product reviews from the shop will appear here.
        </p>
      ) : (
        <div className="space-y-2 text-xs">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">
                    {r.user_name || r.userName || "User"} •{" "}
                    <span className="text-amber-300">{r.rating}★</span>
                  </p>
                  <p className="text-[0.7rem] text-slate-400">
                    {r.product_name || r.productName}
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
              <p className="mt-2 text-[0.75rem] text-slate-200">
                {r.comment}
              </p>
              <button
                onClick={() => removeReview(r.id)}
                className="mt-2 text-[0.65rem] text-rose-400 hover:text-rose-300"
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
/* ------------ SEO Meta Module ------------ */
export function SeoModule() {
  const [meta, setMeta] = useState({
    title: "Seva Sanjeevani • Ayurveda for everyday wellness",
    description:
      "Shop Ayurveda products, herbal supplements, oils, and wellness essentials curated by Seva Sanjeevani.",
    keywords: "ayurveda, herbal, wellness, immunity, seva sanjeevani",
  });
  const [loaded, setLoaded] = useState(false);

  const update = (field, value) =>
    setMeta((prev) => ({ ...prev, [field]: value }));

  // Load from Supabase once
  useEffect(() => {
    const fetchMeta = async () => {
      const { data, error } = await supabase
        .from("seo_meta")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.warn("SEO meta not found, using defaults", error);
        setLoaded(true);
        return;
      }

      setMeta({
        title: data.title || meta.title,
        description: data.description || meta.description,
        keywords: data.keywords || meta.keywords,
      });
      setLoaded(true);
    };

    fetchMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to Supabase whenever meta changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    const saveMeta = async () => {
      const payload = {
        id: 1,
        title: meta.title,
        description: meta.description,
        keywords: meta.keywords,
      };

      const { error } = await supabase
        .from("seo_meta")
        .upsert(payload, { onConflict: "id" }); // insert or update [web:51]

      if (error) {
        console.error("Error saving SEO meta", error);
      }
    };

    saveMeta();
  }, [meta, loaded]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-100">
        SEO & Meta settings
      </h3>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
        <Field
          label="Site title"
          value={meta.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <div className="mt-3 space-y-1">
          <label className="text-[0.7rem] text-slate-400">
            Meta description
          </label>
          <textarea
            className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/60"
            rows={3}
            value={meta.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>
        <Field
          label="Keywords (comma separated)"
          value={meta.keywords}
          onChange={(e) => update("keywords", e.target.value)}
        />
        <p className="mt-2 text-[0.65rem] text-slate-500">
          These values can be applied to your HTML &lt;head&gt; tags or used
          for SEO meta tags on the server later.
        </p>
      </div>
    </div>
  );

}

/* /* ------------ Bulk Upload Module ------------ */
export function BulkUploadModule() {
  const [result, setResult] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target.result;
      try {
        const lines = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);

        if (lines.length <= 1) {
          setResult("CSV appears empty.");
          return;
        }

        const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const newProducts = [];
        let added = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim());
          const row = {};
          header.forEach((h, idx) => {
            row[h] = cols[idx] || "";
          });

          if (!row.name) continue;

          const tags = row.tags
            ? row.tags.split("|").map((t) => t.trim()).filter(Boolean)
            : [];
          const variants = row.variants
            ? row.variants.split("|").map((v) => v.trim()).filter(Boolean)
            : [];

          const now = new Date().toISOString();

          newProducts.push({
            name: row.name,
            brand: row.brand || "Seva Sanjeevani",
            price: row.price ? Number(row.price) : 0,
            // stock must never be null because of NOT NULL constraint
            stock: row.stock ? Number(row.stock) : 0,
            description: row.description || "",
            // category is a uuid FK; keep null for now until you map names -> ids
            category: null,
            tags,      // text[]
            variants,  // text[]
            image_url: row["image url"] || row.imageurl || row.imageUrl || "",
            image_data: "",
            created_at: now,
            updated_at: now,
          });
          added++;
        }

        if (added === 0) {
          setResult("No valid product rows found.");
          return;
        }

        const { error } = await supabase.from("products").insert(newProducts);
        if (error) {
          console.error("Bulk insert error:", error);
          setResult("Failed to insert into database.");
          return;
        }

        pushActivity(`Bulk uploaded ${added} product(s) via CSV`, "success");
        setResult(`Successfully added ${added} product(s).`);
      } catch (err) {
        console.error(err);
        setResult("Failed to parse CSV file.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-100">
        Bulk upload products (CSV)
      </h3>
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs">
        <p className="mb-2 text-slate-400">
          Upload a CSV file with columns like:
        </p>
        <pre className="mb-3 rounded-xl bg-slate-900/90 p-2 text-[0.65rem] text-emerald-100 overflow-x-auto">
name,brand,price,category,description,stock,tags,variants,imageUrl
Ashwagandha Capsules,Seva Sanjeevani,499,Immunity Boosters,Stress support,100,"immunity|stress","60 capsules|120 capsules",https://...
        </pre>
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-[0.7rem]"
        />
        {result && (
          <p className="mt-2 text-[0.7rem] text-emerald-300">{result}</p>
        )}
      </div>
    </div>
  );
}

/* ------------ Activity Log Module ------------ */
export function ActivityLogModule() {
  const [log, setLog] = useState([]);

  useEffect(() => {
    const fetchLog = async () => {
      const { data, error } = await supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading activity log", error);
        return;
      }
      setLog(data || []);
    };

    fetchLog();
  }, []);

  const clearLog = async () => {
    if (!window.confirm("Clear entire activity log?")) return;

    const { error } = await supabase.from("activity_log").delete().neq("id", 0);
    // simple full delete; adjust condition if needed
    if (error) {
      console.error("Error clearing activity log", error);
      return;
    }
    setLog([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Activity log</h3>
        {log.length > 0 && (
          <button
            onClick={clearLog}
            className="text-[0.7rem] text-rose-300 hover:text-rose-200"
          >
            Clear log
          </button>
        )}
      </div>

      {log.length === 0 ? (
        <p className="text-xs text-slate-500">
          No activity yet. Actions like creating products, coupons, etc. will
          appear here.
        </p>
      ) : (
        <div className="space-y-1 text-xs max-h-[420px] overflow-y-auto pr-1">
          {log.map((e) => (
            <div
              key={e.id}
              className="flex items-start gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2"
            >
              <span className="mt-[2px] text-[0.65rem]">
                {e.type === "success"
                  ? "✅"
                  : e.type === "danger"
                  ? "⚠️"
                  : "•"}
              </span>
              <div>
                <p className="text-[0.75rem] text-slate-100">
                  {e.message}
                </p>
                <p className="text-[0.65rem] text-slate-500">
                  {new Date(e.created_at || e.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
