// src/pages/Admin/AdminModules/Products/ProductsModule.jsx

import React, { useEffect, useState } from "react";
import Field from "../../../../components/admin/Field";
import { supabase } from "../../../../lib/supabaseClient";
import { pushActivity } from "../helpers";

export function ProductsModule() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");

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
  });

  useEffect(() => {
    const load = async () => {
      const [{ data: prod }, { data: cats }] = await Promise.all([
        supabase.from("items").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*"),
      ]);

      setProducts(prod || []);
      setCategories(cats || []);
    };

    load();
  }, []);

  const updateForm = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Normalize a user-provided image URL (add https:// if missing, trim spaces)
  const normalizeImageUrl = (raw) => {
    if (!raw) return "";
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    return `https://${trimmed}`; // fallback: assume https if protocol omitted
  };

  // Upload image to Supabase Storage
  const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
      return null;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // When admin selects an image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImageToSupabase(file);
    if (url) {
      updateForm("imageUrl", url);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.brand.trim()) e.brand = "Brand required";
    if (!form.price) e.price = "Price required";
    if (isNaN(Number(form.price))) e.price = "Invalid price";
    if (!form.category) e.category = "Select category";
    const normalizedUrl = normalizeImageUrl(form.imageUrl);
    if (!normalizedUrl) e.imageUrl = "Please upload an image or provide a URL";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const reset = () => {
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
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedUrl = normalizeImageUrl(form.imageUrl);

    const tags = form.tags.split(",").map((x) => x.trim()).filter(Boolean);
    const variants = form.variants.split(",").map((x) => x.trim()).filter(Boolean);

    const payload = {
      name: form.name,
      brand: form.brand,
      price: Number(form.price),
      stock: form.stock ? Number(form.stock) : null,
      category_id: form.category,
      description: form.description,
      tags,
      variants,
      image_url: normalizedUrl, // URL only
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { data, error } = await supabase
        .from("items")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();

      if (!error) {
        setProducts((prev) => prev.map((p) => (p.id === editingId ? data : p)));
        pushActivity(`Updated product "${data.name}"`);
        reset();
      }
    } else {
      const { data, error } = await supabase
        .from("items")
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single();

      if (!error) {
        setProducts((prev) => [data, ...prev]);
        pushActivity(`Created product "${data.name}"`, "success");
        reset();
      }
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: p.price,
      stock: p.stock ?? "",
      category: p.category_id,
      description: p.description,
      tags: (p.tags || []).join(", "),
      variants: (p.variants || []).join(", "),
      imageUrl: p.image_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const p = products.find((x) => x.id === id);
    if (!window.confirm(`Delete "${p?.name}"?`)) return;

    const { error } = await supabase.from("items").delete().eq("id", id);
    if (!error) {
      setProducts((prev) => prev.filter((x) => x.id !== id));
      pushActivity(`Deleted product "${p?.name}"`, "danger");
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_2fr]">
      {/* FORM */}
      <div className="rounded-xl border border-slate-700 p-4">
        <h3 className="text-slate-100 text-sm font-semibold">
          {editingId ? "Edit Product" : "Add Product"}
        </h3>

        <form className="space-y-3 text-xs" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name" error={errors.name} value={form.name}
              onChange={(e) => updateForm("name", e.target.value)} />
            <Field label="Brand" error={errors.brand} value={form.brand}
              onChange={(e) => updateForm("brand", e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price ₹" error={errors.price} value={form.price}
              onChange={(e) => updateForm("price", e.target.value)} />

            <Field label="Stock" value={form.stock}
              onChange={(e) => updateForm("stock", e.target.value)} />

            <div>
              <label className="text-[0.7rem] text-slate-400">Category</label>
              <select
                value={form.category}
                onChange={(e) => updateForm("category", e.target.value)}
                className={`w-full rounded-lg bg-slate-900 border px-3 py-2 text-xs ${
                  errors.category ? "border-rose-500" : "border-slate-700"
                }`}
              >
                <option value="">Choose…</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="text-[0.65rem] text-rose-400">{errors.category}</p>
              )}
            </div>
          </div>

          <Field label="Variants" value={form.variants}
            onChange={(e) => updateForm("variants", e.target.value)} />

          <Field label="Tags" value={form.tags}
            onChange={(e) => updateForm("tags", e.target.value)} />

          <div>
            <label className="text-[0.7rem] text-slate-400">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => updateForm("description", e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 p-2 text-xs"
            />
          </div>

          {/* Image Upload */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[0.7rem] text-slate-400">Upload Image</label>
              <input type="file" accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-xs" />
            </div>

            <Field label="Image URL" error={errors.imageUrl}
              value={form.imageUrl}
              onChange={(e) => updateForm("imageUrl", e.target.value)} />
          </div>

          {/* Image Preview */}
          {form.imageUrl && (
            <div className="rounded-lg bg-slate-800 p-3 flex flex-col gap-2">
              <p className="text-[0.7rem] text-slate-400">Preview</p>
              <div className="h-40 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                <img
                  src={normalizeImageUrl(form.imageUrl)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/fallback-product.png";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={reset} type="button"
              className="px-4 py-2 border rounded-lg text-xs">
              Clear
            </button>

            <button type="submit"
              className="px-5 py-2 bg-emerald-500 text-slate-900 rounded-lg text-xs">
              {editingId ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="rounded-xl border border-slate-700 p-4">
        <div className="flex justify-between mb-3">
          <h3 className="text-slate-100 text-sm font-semibold">Products</h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500">No products found</p>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((p) => {
              const isValidUrl = p.image_url && p.image_url.startsWith("http") && !p.image_url.includes("placeholder.com");
              const imageSrc = isValidUrl ? p.image_url : "/fallback-product.png";
              return (
              <div key={p.id}
                className="rounded-xl bg-slate-900 border border-slate-700 p-3 text-xs">
                
                <div className="h-28 rounded-lg overflow-hidden bg-slate-800">
                  <img
                    src={imageSrc}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/fallback-product.png";
                    }}
                  />
                </div>

                <p className="mt-2 text-emerald-300 uppercase text-[0.6rem]">{p.brand}</p>
                <p className="font-semibold text-[0.8rem]">{p.name}</p>
                <p className="text-[0.7rem] text-slate-400">
                  {p.description?.slice(0, 60)}...
                </p>

                <div className="flex justify-between mt-2">
                  <span className="text-emerald-300 font-semibold">₹{p.price}</span>
                  <span className="text-slate-300 text-[0.65rem]">
                    Stock: {p.stock}
                  </span>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(p)}
                    className="flex-1 bg-slate-800 px-2 py-1 rounded-lg text-emerald-300"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-rose-500 px-2 py-1 rounded-lg text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}
