import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import RatingStars from "../../components/RatingStars";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useState } from "react";

// TEMP product
const demoProduct = {
  id: "1",
  name: "Ashwagandha Stress Relief Capsules",
  brand: "Seva Sanjeevani",
  price: 499,
  mrp: 699,
  discount: 28,
  rating: 4.6,
  image:
    "https://images.pexels.com/photos/3735762/pexels-photo-3735762.jpeg?auto=compress&cs=tinysrgb&w=600",
  description:
    "Classical Ashwagandha formulation to support stress management, energy and restful sleep.",
  highlights: [
    "Supports stress adaptation",
    "Helps promote sound sleep",
    "Made with high-quality Ashwagandha root",
  ],
  variants: ["60 capsules", "120 capsules"],
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState(
    demoProduct.variants?.[0] || null
  );
  const [qty, setQty] = useState(1);

  const inWish = isInWishlist(demoProduct.id);

  // later: fetch product by id from backend

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[1.3fr_minmax(0,1fr)]">
        {/* Left: Image + info */}
        <section>
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-xs rounded-2xl bg-slate-800 overflow-hidden">
                <img
                  src={demoProduct.image}
                  alt={demoProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                {demoProduct.brand}
              </p>
              <h1 className="text-lg font-semibold">{demoProduct.name}</h1>
              <RatingStars rating={demoProduct.rating} />

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-semibold text-emerald-300">
                  ₹{demoProduct.price}
                </span>
                <span className="text-xs text-slate-500 line-through">
                  ₹{demoProduct.mrp}
                </span>
                <span className="text-xs text-emerald-300">
                  {demoProduct.discount}% off
                </span>
              </div>

              <p className="text-xs text-emerald-200 mt-2">
                Inclusive of all taxes • In stock
              </p>

              {demoProduct.variants && (
                <div className="mt-3">
                  <p className="text-xs text-slate-300 mb-1">Choose pack</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {demoProduct.variants.map((v) => (
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

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() =>
                    addToCart({ ...demoProduct, variant: selectedVariant }, qty)
                  }
                  className="flex-1 min-w-[130px] rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2.5 hover:bg-emerald-400"
                >
                  Add to cart
                </button>
                <button
                  onClick={() => toggleWishlist(demoProduct)}
                  className="px-4 py-2.5 rounded-full border border-slate-700 bg-slate-900 text-xs hover:border-emerald-400"
                >
                  {inWish ? "♥ In wishlist" : "♡ Add to wishlist"}
                </button>
              </div>
            </div>
          </div>

          {/* Description & highlights */}
          <div className="mt-5 grid md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <h2 className="text-sm font-semibold text-emerald-200 mb-2">
                Product description
              </h2>
              <p className="text-slate-300">{demoProduct.description}</p>
            </div>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <h2 className="text-sm font-semibold text-emerald-200 mb-2">
                Highlights
              </h2>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                {demoProduct.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Right: shipping / offers / info */}
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
