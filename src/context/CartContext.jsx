// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [shipping, setShipping] = useState(59);

  // Coupon State
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Load cart from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  // Save cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  // Safe calculations
  const subtotal = Number(
    items.reduce((total, item) => total + item.price * item.qty, 0)
  );

  const numericShipping = Number(shipping);
  const numericDiscount = Number(discount) || 0;

  const total = subtotal + numericShipping - numericDiscount;

  // -----------------------------
  // ADD TO CART
  // -----------------------------
  const addToCart = (product, qty = 1, variant = null) => {
    setItems((prev) => {
      const exists = prev.find(
        (i) => i.id === product.id && i.variant === variant
      );

      if (exists) {
        return prev.map((i) =>
          i.id === product.id && i.variant === variant
            ? { ...i, qty: i.qty + qty }
            : i
        );
      }

      return [...prev, { ...product, qty, variant }];
    });
  };

  // -----------------------------
  // UPDATE QTY
  // -----------------------------
  const updateQty = (id, variant, qty) => {
    if (qty < 1) return;
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.variant === variant ? { ...i, qty } : i
      )
    );
  };

  // -----------------------------
  // REMOVE FROM CART
  // -----------------------------
  const removeFromCart = (id, variant) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.variant === variant))
    );
  };

  // -----------------------------
  // APPLY COUPON
  // -----------------------------
  const applyDiscount = (couponData, discountValue) => {
    setAppliedCoupon(couponData);
    setDiscount(Number(discountValue)); // ALWAYS numeric
  };

  // -----------------------------
  // REMOVE COUPON
  // -----------------------------
  const removeDiscount = () => {
    setAppliedCoupon(null);
    setDiscount(0);
  };

  // -----------------------------
  // CLEAR CART
  // -----------------------------
  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        shipping,
        total,
        addToCart,
        updateQty,
        removeFromCart,

        appliedCoupon,
        discount,

        applyDiscount,
        removeDiscount,

        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
