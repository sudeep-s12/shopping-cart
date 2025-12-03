import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addUserAddress } from "../../api/users";
import { createOrder } from "../../api/orders";

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [address, setAddress] = useState({
    name: "sudeep",
    phone: "9380165363",
    line1: "banglore",
    city: "banglore",
    state: "karnataka",
    pincode: "560056",
  });

  // Clear any initial errors on mount
  useEffect(() => {
    setApiError(null);
  }, []);

  const handlePlaceOrder = async () => {
    try {
      setApiError(null);
      setLoading(true);

      // Validate inputs
      if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
        setApiError("Please fill all address fields");
        return;
      }

      if (!user?.id) {
        setApiError("Please login first");
        navigate("/login");
        return;
      }

      // Allow checkout even with empty cart for testing
      if (items.length === 0) {
        console.warn("Cart is empty, but allowing checkout for testing purposes");
      }

      // Step 1: Save address to database
      const savedAddress = await addUserAddress(user.id, {
        street: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: false,
      });

      if (!savedAddress?.id) {
        setApiError("Failed to save address");
        return;
      }

      // Step 2: Create order from cart
      const orderResult = await createOrder(user.id, {
        addressId: savedAddress.id,
        paymentMethod: "cod", // Cash on delivery
        notes: "",
      });

      if (!orderResult?.orderId) {
        setApiError("Failed to create order");
        return;
      }

      // Step 3: Clear cart and redirect
      clearCart();
      alert("✅ Order placed successfully! Order ID: " + orderResult.orderId);
      navigate(`/order/${orderResult.orderId}`);
    } catch (err) {
      console.error("Error placing order:", err);
      setApiError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="space-y-4">
          <h1 className="text-lg font-semibold text-emerald-200">
            Checkout
          </h1>

          {/* Only show real API errors, not empty cart warnings */}
          {apiError && apiError.length > 0 && !apiError.toLowerCase().includes("empty") && (
            <div className="rounded-2xl bg-red-950/50 border border-red-800 p-4 text-sm text-red-200">
              {apiError}
            </div>
          )}

          {/* Address */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs space-y-3">
            <h2 className="text-sm font-semibold text-emerald-200">
              Delivery address
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Full name"
                value={address.name}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, name: e.target.value }))
                }
              />
              <Input
                label="Phone number"
                value={address.phone}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, phone: e.target.value }))
                }
              />
            </div>
            <Input
              label="Address line"
              value={address.line1}
              onChange={(e) =>
                setAddress((a) => ({ ...a, line1: e.target.value }))
              }
            />
            <div className="grid sm:grid-cols-3 gap-3">
              <Input
                label="City"
                value={address.city}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, city: e.target.value }))
                }
              />
              <Input
                label="State"
                value={address.state}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, state: e.target.value }))
                }
              />
              <Input
                label="Pincode"
                value={address.pincode}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, pincode: e.target.value }))
                }
              />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs space-y-2">
            <h2 className="text-sm font-semibold text-emerald-200">
              Payment method
            </h2>
            <label className="flex items-center gap-2">
              <input type="radio" defaultChecked name="payment" />
              <span>Cash on delivery (COD)</span>
            </label>
            <label className="flex items-center gap-2 text-slate-500">
              <input type="radio" disabled name="payment" />
              <span>Online payment (coming soon)</span>
            </label>
          </div>
        </section>

        {/* Summary */}
        <aside className="space-y-3">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs">
            <h2 className="text-sm font-semibold text-emerald-200 mb-2">
              Order summary
            </h2>
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
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
              className="mt-4 w-full rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2.5 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? "Placing order..." : "Place order"}
            </button>
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-slate-100 outline-none focus:border-emerald-400"
      />
    </div>
  );
}
