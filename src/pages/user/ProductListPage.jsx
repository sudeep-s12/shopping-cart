// src/pages/user/ProductListPage.jsx

import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { supabase } from "../../lib/supabaseClient";

export default function ProductListPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = useMemo(() => (searchParams.get("q") || "").toLowerCase().trim(), [searchParams]);

  const friendlyName =
    categoryId === "all"
      ? "All Ayurveda Products"
      : categoryId?.replace("-", " ");

  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState(null);

  // ---------------------------
  // FETCH PRODUCTS FROM SUPABASE
  // ---------------------------
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("items")
        .select("id, name, brand, price, mrp, discount, image_url, image_data, rating, category, created_at");

      if (categoryId !== "all") {
        query = query.eq("category", categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        setError("Failed to load products.");
      } else {
        setProducts(data);
        setFiltered(data);
      }

      setLoading(false);
    }

    loadProducts();
  }, [categoryId]);

  // ---------------------------
  // SORTING LOGIC
  // ---------------------------
  useEffect(() => {
    if (!products) return;

    let sorted = [...products];

    if (sortBy === "low-high") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "high-low") {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      sorted.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }
    // default = popular (no change)

    // Apply search filter if present
    const searched = searchQuery
      ? sorted.filter((p) =>
          `${p.name} ${p.brand || ""}`.toLowerCase().includes(searchQuery)
        )
      : sorted;

    const priceFiltered = searched.filter((p) =>
      typeof p.price === "number" ? p.price <= maxPrice : true
    );

    const ratingFiltered = minRating
      ? priceFiltered.filter((p) => (p.rating || 0) >= minRating)
      : priceFiltered;

    setFiltered(ratingFiltered);
  }, [sortBy, products, searchQuery, maxPrice, minRating]);

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
              <input
                type="range"
                min={0}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <p className="text-[11px] text-slate-400">Up to ₹{maxPrice}</p>

              <p className="font-semibold mt-3 text-slate-200">Rating</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={minRating === 4}
                    onChange={(e) => setMinRating(e.target.checked ? 4 : null)}
                  />
                  4★ & above
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={minRating === 3}
                    onChange={(e) => setMinRating(e.target.checked ? 3 : null)}
                  />
                  3★ & above
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

            <select
              className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popular">Sort: Popular</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* ------------------ LOADING STATE ------------------ */}
          {loading && (
            <p className="text-xs text-slate-400 mt-6">Loading products…</p>
          )}

          {/* ------------------ ERROR STATE ------------------ */}
          {error && <p className="text-xs text-rose-400 mt-6">{error}</p>}

          {/* ------------------ EMPTY STATE ------------------ */}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-xs text-slate-500 mt-6">
              No products found for category:{" "}
              <span className="font-mono">{categoryId}</span>
            </p>
          )}

          {/* ------------------ PRODUCT GRID ------------------ */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((p) => (
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
                    image:
                      p.image_url ||
                      p.image_data ||
                      "/fallback-product.png",
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
