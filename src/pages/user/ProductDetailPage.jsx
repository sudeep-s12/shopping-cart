// src/pages/user/ProductDetailPage.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RatingStars from "../../components/RatingStars";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { supabase } from "../../lib/supabaseClient";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedCount, setAddedCount] = useState(0);

  // ------------------------------
  // FETCH PRODUCT FROM SUPABASE
  // ------------------------------
  useEffect(() => {
    async function loadProduct() {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Product fetch error:", error);
      }

      setProduct(data);
      setSelectedVariant(
        Array.isArray(data?.variants) && data.variants.length > 0
          ? data.variants[0]
          : null
      );

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  const inWish = isInWishlist(product?.id);

  // Normalize variants: support array or comma/space separated string
  const variantsList = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.variants)) return product.variants.filter(Boolean);
    if (typeof product.variants === "string" && product.variants.trim()) {
      return product.variants
        .split(/[,\n]|\s{2,}|\s-\s/)
        .map((v) => v.trim())
        .filter(Boolean);
    }
    return [];
  }, [product]);

  if (loading) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-50 flex items-center justify-center">
        <p>Loading product…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-slate-950 min-h-screen text-slate-50 flex items-center justify-center">
        <p className="text-red-400">Product not found.</p>
      </div>
    );
  }

  const imageSrc =
    product.image_url ||
    product.image_data ||
    "/fallback-product.png";

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="relative max-w-6xl mx-auto px-4 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-24 left-4 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-24 right-4 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/80 hover:border-emerald-400 transition"
          >
            ← Back
          </button>

          <div className="grid gap-6 md:grid-cols-[1.3fr_minmax(0,1fr)]">

            {/* ---------------- IMAGE + INFO ---------------- */}
            <section>
              <div className="card-surface rounded-3xl border border-slate-800/80 p-4 md:p-6 flex flex-col md:flex-row gap-5 shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-3 text-sm">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300/90">
                    {product.brand}
                  </p>

                  <h1 className="text-xl font-semibold leading-tight text-slate-50">
                    {product.name}
                  </h1>

                  <RatingStars rating={product.rating} />

                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="text-3xl font-semibold text-emerald-300">
                      ₹{product.price}
                    </span>

                    {product.mrp && (
                      <span className="text-xs text-slate-500 line-through">
                        ₹{product.mrp}
                      </span>
                    )}

                    {product.discount && (
                      <span className="text-xs text-emerald-300 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        {product.discount}% off
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="pill bg-emerald-500/10 text-emerald-100 border-emerald-400/30">
                      Fast dispatch
                    </span>
                    <span className="pill">Easy returns</span>
                    <span className="pill">Secure payments</span>
                  </div>

                  <p className="text-xs text-emerald-200">
                    Inclusive of all taxes • In stock
                  </p>

                  {/* ------------ Variants ------------- */}
                  {variantsList.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-slate-300 mb-1">Choose pack</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {variantsList.map((v) => (
                          <button
                            key={v}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-3 py-1 rounded-full border transition ${
                              selectedVariant === v
                                ? "border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_8px_25px_rgba(16,185,129,0.18)]"
                                : "border-slate-700 bg-slate-900 hover:border-emerald-400/60"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ------------ Quantity ------------- */}
                  <div className="mt-4 flex items-center gap-3">
                    <label className="text-xs text-slate-300">
                      Qty:
                      <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="ml-2 rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs focus:border-emerald-400 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* ------------ ACTION BUTTONS ------------- */}
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        addToCart(
                          {
                            id: product.id,
                            name: product.name,
                            brand: product.brand,
                            price: product.price,
                            variant: selectedVariant,
                            image: imageSrc,
                          },
                          qty
                        );
                        setAddedCount((c) => c + qty);
                        setTimeout(() => setAddedCount(0), 1500);
                      }}
                      className="flex-1 min-w-[140px] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 text-sm font-semibold px-4 py-[11px] shadow-[0_14px_36px_rgba(16,185,129,0.35)] transition hover:translate-y-[1px]"
                    >
                      Add to cart
                      {addedCount > 0 && (
                        <span className="ml-2 text-[11px] text-slate-900 bg-emerald-200 rounded-full px-2 py-[1px]">
                          +{addedCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        toggleWishlist({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: imageSrc,
                        })
                      }
                      className="px-4 py-[11px] rounded-full border border-slate-700 bg-slate-900 text-xs hover:border-emerald-400/80 transition"
                    >
                      {inWish ? "♥ In wishlist" : "♡ Add to wishlist"}
                    </button>
                  </div>
                </div>
              </div>

          {/* ---------------- DESCRIPTION & HIGHLIGHTS ---------------- */}
          <div className="mt-6 grid md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl card-surface border border-slate-800/70 p-5">
              <h2 className="text-sm font-semibold text-emerald-200 mb-2">
                Product description
              </h2>
              <p className="text-slate-300">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="rounded-2xl card-surface border border-slate-800/70 p-5">
              <h2 className="text-sm font-semibold text-emerald-200 mb-2">
                Highlights
              </h2>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                {Array.isArray(product.highlights) &&
                product.highlights.length > 0 ? (
                  product.highlights.map((h, i) => <li key={i}>{h}</li>)
                ) : (
                  <li>No highlights listed.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------- RIGHT INFO BOXES ---------------- */}
        <aside className="space-y-4">
          <div className="rounded-2xl card-surface border border-slate-800/70 p-5 text-xs">
            <h3 className="text-sm font-semibold text-emerald-200 mb-2">
              Delivery
            </h3>
            <p className="text-slate-300">
              Usually delivered in <span className="font-semibold">3–5 days.</span>
            </p>
            <p className="text-slate-400 mt-2">
              Free delivery on orders above ₹999, otherwise ₹59.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/10 to-teal-400/10 border border-emerald-400/60 p-5 text-xs shadow-[0_14px_40px_rgba(16,185,129,0.25)]">
            <h3 className="text-sm font-semibold text-emerald-100 mb-2">
              Offers & coupons
            </h3>
            <ul className="space-y-1 text-emerald-50">
              <li>• Use AYU20 for flat 20% off above ₹799</li>
              <li>• Extra 5% off on prepaid orders</li>
            </ul>
          </div>
        </aside>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
