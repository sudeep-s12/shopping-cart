import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const inWish = isInWishlist(product.id);

  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-950/80 hover:border-emerald-400/70 hover:shadow-[0_18px_40px_rgba(0,0,0,0.7)] transition overflow-hidden flex flex-col">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative h-40 bg-slate-900 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.badge && (
            <span className="absolute top-2 left-2 text-[10px] px-2 py-[2px] rounded-full bg-emerald-500 text-black font-semibold">
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">
          {product.brand}
        </p>
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold line-clamp-2 text-slate-50"
        >
          {product.name}
        </Link>

        <RatingStars rating={product.rating || 4.5} />

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-semibold text-emerald-300">
            ₹{product.price}
          </span>
          {product.mrp && (
            <span className="text-[11px] text-slate-500 line-through">
              ₹{product.mrp}
            </span>
          )}
          {product.discount && (
            <span className="text-[11px] text-emerald-300">
              {product.discount}% off
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <button
            onClick={() => addToCart(product, 1)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
          >
            Add to cart
          </button>

          <button
            onClick={() => toggleWishlist(product)}
            className={`text-[14px] ${
              inWish ? "text-rose-400" : "text-slate-500"
            } hover:text-rose-300`}
          >
            {inWish ? "♥" : "♡"}
          </button>
        </div>
      </div>
    </div>
  );
}
