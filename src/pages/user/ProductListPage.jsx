// src/pages/user/ProductListPage.jsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabaseClient";

export default function ProductListPage() {
  const { categoryId } = useParams();

  const friendlyName =
    categoryId === "all"
      ? "All Ayurveda Products"
      : categoryId?.replace("-", " ");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------
  // FETCH PRODUCTS FROM SUPABASE
  // ---------------------------
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);

      let query = supabase.from("items").select("*");

      if (categoryId !== "all") {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load products.");
      } else {
        setProducts(data);
      }

      setLoading(false);
    }

    loadProducts();
  }, [categoryId]);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        {/* ------------------ FILTER SIDEBAR ------------------ */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold mb-2 text-emerald-200">
              Filters
            </h3>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Price</p>
              <input type="range" min={0} max={2000} className="w-full" />

              <p className="font-semibold mt-3 text-slate-200">Rating</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 4★ & above
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 3★ & above
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* ------------------ PRODUCT LIST ------------------ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-emerald-200 capitalize">
                {friendlyName}
              </h1>

              <p className="text-xs text-slate-400">
                Showing curated ayurvedic products for this category.
              </p>
            </div>

            <select className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs">
              <option>Sort: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {/* ------------------ LOADING STATE ------------------ */}
          {loading && (
            <p className="text-xs text-slate-400 mt-6">Loading products…</p>
          )}

          {/* ------------------ ERROR STATE ------------------ */}
          {error && (
            <p className="text-xs text-rose-400 mt-6">{error}</p>
          )}

          {/* ------------------ EMPTY STATE ------------------ */}
          {!loading && !error && products.length === 0 && (
            <p className="text-xs text-slate-500 mt-6">
              No products found for category:{" "}
              <span className="font-mono">{categoryId}</span>
            </p>
          )}

          {/* ------------------ PRODUCT GRID ------------------ */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    brand: p.brand,
                    price: p.price,
                    mrp: p.mrp,
                    discount: p.discount,
                    rating: p.rating,
                    image: p.image_url, // match your card component
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
