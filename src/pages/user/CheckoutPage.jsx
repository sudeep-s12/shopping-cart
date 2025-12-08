// src/pages/user/CheckoutPage.jsx

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useCart } from "../../context/CartContext";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { addUserAddress } from "../../api/users";
import { createOrder } from "../../api/orders";

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    shipping,
    total,
    discount,
    appliedCoupon,
    clearCart
  } = useCart();

  const { user } = useUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  // ---------------------- CHECK CART EMPTY ----------------------
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // ---------------------- PLACE ORDER ----------------------
  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setApiError(null);

      if (!user?.id) {
        navigate("/login");
        return;
      }

      // Validate address
      if (
        !address.name ||
        !address.phone ||
        !address.line1 ||
        !address.city ||
        !address.state ||
        !address.pincode
      ) {
        setApiError("Please fill all address fields");
        return;
      }

      // Save user address
      const savedAddress = await addUserAddress(user.id, {
        street: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone,
        is_default: true
      });

      if (!savedAddress?.id) {
        setApiError("Failed to save address.");
        return;
      }

      // ---------------------- Prepare Order Payload ----------------------
      const orderPayload = {
        addressId: savedAddress.id,
        paymentMethod,
        coupon: appliedCoupon?.code || null,
        discountAmount: discount || 0,
        subtotal,
        shippingCost: shipping,
        totalAmount: total,
        items: items.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          discount: i.discount || 0,
          quantity: i.qty || 1,
          image_url: i.image
        }))
      };

      // Create Order
      const orderResult = await createOrder(user.id, orderPayload);

      if (!orderResult?.orderId) {
        setApiError("Failed to create order.");
        return;
      }

      clearCart();
      navigate(`/order/${orderResult.orderId}`);

    } catch (err) {
      setApiError(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[2fr_1fr]">

        {/* ---------------------- ADDRESS FORM ---------------------- */}
        <section className="space-y-4">
          <h1 className="text-lg font-semibold text-emerald-200">Checkout</h1>

          {apiError && (
            <div className="rounded-xl bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
              {apiError}
            </div>
          )}

          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-3">
            <h2 className="text-sm text-emerald-200 font-semibold">
              Delivery address
            </h2>

            <Input
              label="Full Name"
              value={address.name}
              onChange={(e) =>
                setAddress((a) => ({ ...a, name: e.target.value }))
              }
            />

            <Input
              label="Phone"
              value={address.phone}
              onChange={(e) =>
                setAddress((a) => ({ ...a, phone: e.target.value }))
              }
            />

            <Input
              label="Address"
              value={address.line1}
              onChange={(e) =>
                setAddress((a) => ({ ...a, line1: e.target.value }))
              }
            />

            <div className="grid grid-cols-3 gap-3">
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

          {/* ---------------------- PAYMENT OPTIONS ---------------------- */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-3">
            <h2 className="text-sm text-emerald-200 font-semibold">
              Payment method
            </h2>

            {/* COD */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <span>Cash on delivery (COD)</span>
            </label>

            {/* UPI */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={() => setPaymentMethod("upi")}
              />
              <span>UPI Payment (GPay / PhonePe / Paytm)</span>
            </label>

            {paymentMethod === "upi" && (
              <div className="p-3 mt-2 rounded-xl bg-slate-800 border border-slate-700 text-[12px] space-y-2">
                <p className="text-slate-300">Send payment to:</p>
                <p className="text-emerald-400 font-semibold text-sm">
                  9380165363@ybl
                </p>
                <p className="text-slate-400 text-[11px]">
                  After sending the payment, click <b>Place order</b>.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ---------------------- ORDER SUMMARY ---------------------- */}
        <aside>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-2">
            <h2 className="text-sm text-emerald-200 font-semibold mb-2">
              Order summary
            </h2>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{shipping ? `₹${shipping}` : "Free"}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-emerald-300">
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-slate-700 pt-2 flex justify-between text-emerald-300 font-semibold">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="mt-3 w-full bg-emerald-500 rounded-full text-slate-900 text-xs font-semibold py-2.5"
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

// ---------------------- INPUT COMPONENT ----------------------
function Input({ label, ...props }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] text-slate-300">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-xs focus:border-emerald-400 outline-none"
      />
    </div>
  );
}
