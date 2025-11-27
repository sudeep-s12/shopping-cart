import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function CartPage() {
  const { items, subtotal, shipping, total, updateQty, removeFromCart } =
    useCart();
  const navigate = useNavigate();

  const hasItems = items.length > 0;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section>
          <h1 className="text-lg font-semibold text-emerald-200 mb-3">
            Shopping cart
          </h1>

          {!hasItems ? (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 text-center text-sm text-slate-400">
              Your cart is empty.{" "}
              <button
                onClick={() => navigate("/home")}
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
                  <div className="w-20 h-20 rounded-xl bg-slate-800 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300">
                      {item.brand}
                    </p>
                    <p className="text-sm font-semibold">{item.name}</p>
                    {item.variant && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pack: {item.variant}
                      </p>
                    )}

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

        <aside className="space-y-3">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs">
            <h2 className="text-sm font-semibold text-emerald-200 mb-2">
              Order summary
            </h2>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Items subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between font-semibold text-emerald-300">
                <span>Order total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button
              disabled={!hasItems}
              onClick={() => navigate("/checkout")}
              className="mt-4 w-full rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2.5 disabled:opacity-40"
            >
              Proceed to checkout
            </button>
          </div>

          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-400/60 p-3 text-[11px] text-emerald-100">
            <p>Use coupon AYU20 at checkout for 20% off above ₹799.</p>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
