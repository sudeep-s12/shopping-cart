// src/pages/user/ProductDetailPage.jsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RatingStars from "../../components/RatingStars";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { supabase } from "../../lib/supabaseClient";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

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

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[1.3fr_minmax(0,1fr)]">

        {/* ---------------- IMAGE + INFO ---------------- */}
        <section>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-xs rounded-2xl bg-slate-800 overflow-hidden">
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                {product.brand}
              </p>

              <h1 className="text-lg font-semibold">{product.name}</h1>

              <RatingStars rating={product.rating} />

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-semibold text-emerald-300">
                  ₹{product.price}
                </span>

                {product.mrp && (
                  <span className="text-xs text-slate-500 line-through">
                    ₹{product.mrp}
                  </span>
                )}

                {product.discount && (
                  <span className="text-xs text-emerald-300">
                    {product.discount}% off
                  </span>
                )}
              </div>

              <p className="text-xs text-emerald-200 mt-2">
                Inclusive of all taxes • In stock
              </p>

              {/* ------------ Variants ------------- */}
              {Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-300 mb-1">Choose pack</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {product.variants.map((v) => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1 rounded-full border ${
                          selectedVariant === v
                            ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 bg-slate-900"
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
                    className="ml-2 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1 text-xs"
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
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() =>
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
                    )
                  }
                  className="flex-1 min-w-[130px] rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2.5 hover:bg-emerald-400"
                >
                  Add to cart
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
                  className="px-4 py-2.5 rounded-full border border-slate-700 bg-slate-900 text-xs hover:border-emerald-400"
                >
                  {inWish ? "♥ In wishlist" : "♡ Add to wishlist"}
                </button>
              </div>
            </div>
          </div>

          {/* ---------------- DESCRIPTION & HIGHLIGHTS ---------------- */}
          <div className="mt-5 grid md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <h2 className="text-sm font-semibold text-emerald-200 mb-2">
                Product description
              </h2>
              <p className="text-slate-300">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
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
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs">
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

          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/60 p-4 text-xs">
            <h3 className="text-sm font-semibold text-emerald-200 mb-2">
              Offers & coupons
            </h3>
            <ul className="space-y-1 text-emerald-100">
              <li>• Use AYU20 for flat 20% off above ₹799</li>
              <li>• Extra 5% off on prepaid orders</li>
            </ul>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
