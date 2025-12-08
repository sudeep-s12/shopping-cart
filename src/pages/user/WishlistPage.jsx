// src/pages/user/WishlistPage.jsx

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-lg font-semibold text-emerald-200">Wishlist</h1>

        {/* ---------------- EMPTY STATE ---------------- */}
        {wishlist.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400 text-center animate-fadeIn">
            Your wishlist is empty.
            <Link
              to="/shop"
              className="text-emerald-300 hover:text-emerald-100 underline ml-1"
            >
              Discover products
            </Link>
          </div>
        ) : (
          /* ---------------- PRODUCT GRID ---------------- */
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {wishlist.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  image: p.image || p.image_url || p.image_data || "/fallback-product.png",
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
