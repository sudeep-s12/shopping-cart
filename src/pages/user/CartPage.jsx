// src/pages/user/CartPage.jsx

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function CartPage() {
  const {
    items,
    subtotal,
    shipping,
    updateQty,
    removeFromCart,
    appliedCoupon,
    discount,
    applyDiscount,
    removeDiscount,
  } = useCart();

  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState("");
  const [couponList, setCouponList] = useState([]);

  const hasItems = items.length > 0;

  // -------------------------------
  // Load Active Coupons from DB
  // -------------------------------
  useEffect(() => {
    async function loadCoupons() {
      const { data } = await supabase
        .from("coupons")
        .select("*")
        .eq("active", true);

      setCouponList(data || []);
    }
    loadCoupons();
  }, []);

  // -------------------------------
  // APPLY COUPON
  // -------------------------------
  const applyCouponHandler = async () => {
    if (!couponCode.trim()) return alert("Enter a coupon code");

    const cleanCode = couponCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("active", true)
      .single();

    if (error || !data) return alert("Invalid or expired coupon ❌");

    if (subtotal < data.min_amount)
      return alert(`Coupon valid only for orders above ₹${data.min_amount}`);

    const discountValue = ((subtotal * data.discount) / 100).toFixed(2);

    applyDiscount(data, discountValue);
    alert(`🎉 Coupon applied! ${data.discount}% OFF`);
  };

  // -------------------------------
  // REMOVE COUPON
  // -------------------------------
  const removeCouponHandler = () => {
    removeDiscount();
    setCouponCode("");
  };

  const total = subtotal + shipping - discount;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[2fr_1fr]">

        {/* -------------------- CART ITEMS -------------------- */}
        <section>
          <h1 className="text-lg font-semibold text-emerald-200 mb-3">
            Shopping cart
          </h1>

          {!hasItems ? (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 text-center text-sm text-slate-400">
              Your cart is empty.
              <button
                onClick={() => navigate("/shop")}
                className="text-emerald-300 hover:text-emerald-100 underline ml-1"
              >
                Start shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id + (item.variant || "")}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 flex gap-3 text-xs"
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <p className="text-[10px] uppercase text-emerald-300">
                      {item.brand}
                    </p>

                    <p className="text-sm font-semibold">{item.name}</p>

                    {item.variant && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pack: {item.variant}
                      </p>
                    )}

                    {/* Price + Qty */}
                    <div className="mt-2 flex items-center gap-4">
                      <p className="text-sm font-semibold text-emerald-300">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQty(item.id, item.variant, item.qty - 1)
                          }
                          className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center"
                        >
                          -
                        </button>

                        <span>{item.qty}</span>

                        <button
                          onClick={() =>
                            updateQty(item.id, item.variant, item.qty + 1)
                          }
                          className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="mt-2 text-[11px] text-rose-400 hover:text-rose-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* -------------------- COUPON + SUMMARY -------------------- */}
        <aside className="space-y-3">
          {/* Coupon Box */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs">
            <h2 className="text-sm font-semibold text-emerald-200 mb-2">
              Apply Coupon
            </h2>

            {couponList.length > 0 && (
              <div className="mb-1 text-[10px] text-slate-400">
                Available:
                <div className="flex gap-2 mt-1 flex-wrap">
                  {couponList.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCouponCode(c.code)}
                      className="px-2 py-1 bg-slate-800 rounded-full text-[10px] border border-slate-700 hover:border-emerald-400"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter coupon"
                value={couponCode}
                disabled={Boolean(appliedCoupon)}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-[11px]"
              />

              {!appliedCoupon ? (
                <button
                  onClick={applyCouponHandler}
                  className="rounded-xl bg-emerald-500 px-3 py-2 text-slate-950 font-semibold text-[11px]"
                >
                  Apply
                </button>
              ) : (
                <button
                  onClick={removeCouponHandler}
                  className="rounded-xl bg-rose-500 px-3 py-2 text-white font-semibold text-[11px]"
                >
                  Remove
                </button>
              )}
            </div>

            {appliedCoupon && (
              <p className="text-emerald-300 text-[11px] mt-2">
                Applied: {appliedCoupon.code} ({appliedCoupon.discount}% OFF)
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs space-y-2">
            <h2 className="text-sm font-semibold text-emerald-200 mb-1">
              Order summary
            </h2>

            <div className="flex justify-between">
              <span>Items subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Discount</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-slate-700 pt-2 flex justify-between font-semibold text-emerald-300">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              disabled={!hasItems}
              onClick={() => navigate("/checkout")}
              className="mt-3 w-full rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2.5 disabled:opacity-40"
            >
              Proceed to checkout
            </button>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
