// src/pages/user/HomePage.jsx

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

// Demo categories
const demoCategories = [
  { id: "immunity", label: "Immunity", emoji: "🛡" },
  { id: "stress-sleep", label: "Stress & Sleep", emoji: "😴" },
  { id: "digestion", label: "Digestion", emoji: "🌿" },
  { id: "skin-hair", label: "Skin & Hair", emoji: "💆‍♀" },
  { id: "women", label: "Women’s Health", emoji: "🌸" },
  { id: "kids", label: "Kids Care", emoji: "🧸" },
];

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);

        // -------------------------
        // FETCH PRODUCTS
        // -------------------------
        const { data: products, error: prodErr } = await supabase
          .from("items")
          .select("id, name, brand, price, created_at, image_url, image_data");

        if (prodErr) {
          console.error("Error loading products:", prodErr);
          setLoading(false);
          return;
        }

        // -------------------------
        // FETCH ORDERS (to detect bestsellers)
        // -------------------------
        const { data: orders, error: orderErr } = await supabase
          .from("orders")
          .select("items");

        if (orderErr) {
          console.error("Error loading orders:", orderErr);
          setLoading(false);
          return;
        }

        // -------------------------
        // COUNT PRODUCT QUANTITIES
        // -------------------------
        const countMap = {};

        orders?.forEach((order) => {
          order?.items?.forEach((item) => {
            if (!countMap[item.productId]) countMap[item.productId] = 0;
            countMap[item.productId] += item.qty;
          });
        });

        // -------------------------
        // BESTSELLERS = SORT BY QTY
        // -------------------------
        const topBestsellers = [...products]
          .sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0))
          .slice(0, 4);

        // -------------------------
        // NEW ARRIVALS = LATEST CREATED
        // -------------------------
        const latestProducts = [...products]
          .sort(
            (a, b) =>
              new Date(b.created_at || 0) - new Date(a.created_at || 0)
          )
          .slice(0, 4);

        setBestsellers(topBestsellers);
        setNewArrivals(latestProducts);
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* HERO BANNER */}
        <section className="grid md:grid-cols-[1.6fr_1fr] gap-5 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-amber-300/10 border border-emerald-400/30 p-6 sm:p-8 shadow-[0_22px_60px_rgba(0,0,0,0.8)]">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200 mb-3">
              Ayurveda • Daily Rituals
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
              Healthy choices for{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                happier living
              </span>
              .
            </h1>

            <p className="mt-3 text-sm text-emerald-50/80 max-w-lg">
              Explore curated Ayurveda essentials for immunity, stress relief,
              better sleep and everyday wellness.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <Link
                to="/categories"
                className="rounded-full bg-emerald-500 text-slate-950 px-4 py-2 font-semibold hover:bg-emerald-400"
              >
                Shop by category
              </Link>

              <Link
                to="/products/all"
                className="rounded-full border border-emerald-400/60 px-4 py-2 text-emerald-200 hover:bg-emerald-500/10"
              >
                Browse all products
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">
                Highlights
              </p>

              <ul className="space-y-3 text-sm text-slate-200">
                <li>• 100% Ayurvedic formulations</li>
                <li>• Handpicked herbs & classical recipes</li>
                <li>• Quality tested ingredients</li>
                <li>• Made for Indian lifestyle & climate</li>
              </ul>

              <p className="text-[11px] text-slate-500 mt-4">
                Always consult your physician for chronic conditions.
              </p>
            </div>
          </div>
        </section>

        {/* CATEGORY GRID */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-emerald-200">
              Shop by concern
            </h2>

            <Link
              to="/categories"
              className="text-xs text-emerald-300 hover:text-emerald-100"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {demoCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products/${cat.id}`}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 
                  hover:border-emerald-400/70 hover:bg-slate-900/90 
                  p-3 flex flex-col items-center gap-2 text-center text-xs transition"
              >
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                  {cat.emoji}
                </div>
                <span className="text-slate-100">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* BESTSELLERS & NEW ARRIVALS */}
        <section className="space-y-6">
          <Row title="Bestsellers in Ayurveda" loading={loading} products={bestsellers} />
          <Row title="New arrivals" loading={loading} products={newArrivals} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------
   ROW COMPONENT
------------------------------ */
function Row({ title, products, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-emerald-200">{title}</h3>

        <Link
          to="/products/all"
          className="text-[11px] text-slate-400 hover:text-emerald-200"
        >
          View more
        </Link>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-xs text-slate-500">No products available.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                ...p,
                image: p.image_url || p.image_data || "/fallback-product.png",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
