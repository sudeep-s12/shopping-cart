// src/api/cart.js
// Shopping cart API functions

import { supabase } from "../lib/supabaseClient";

/**
 * GET USER'S CART
 */
export const getUserCart = async (userId) => {
  const { data, error } = await supabase
    .from("cart")
    .select(
      `
      *,
      items(id, name, brand, price, mrp, discount, image_url, stock, category_id)
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * ADD ITEM TO CART
 */
export const addToCart = async (userId, itemId, quantity = 1) => {
  // Check if item already in cart
  const { data: existing } = await supabase
    .from("cart")
    .select("*")
    .eq("user_id", userId)
    .eq("item_id", itemId)
    .single();

  if (existing) {
    // Update quantity
    return updateCartItem(existing.id, existing.quantity + quantity);
  }

  // Add new item
  const { data, error } = await supabase
    .from("cart")
    .insert({
      user_id: userId,
      item_id: itemId,
      quantity,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE CART ITEM QUANTITY
 */
export const updateCartItem = async (cartItemId, quantity) => {
  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { data, error } = await supabase
    .from("cart")
    .update({ quantity, updated_at: new Date() })
    .eq("id", cartItemId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * REMOVE ITEM FROM CART
 */
export const removeFromCart = async (cartItemId) => {
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("id", cartItemId);

  if (error) throw new Error(error.message);
  return true;
};

/**
 * CLEAR ENTIRE CART
 */
export const clearCart = async (userId) => {
  const { error } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return true;
};

/**
 * GET CART TOTAL
 */
export const getCartTotal = async (userId) => {
  const { data, error } = await supabase
    .from("cart")
    .select(
      `
      quantity,
      items(price, mrp, discount)
      `
    )
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  let subtotal = 0;
  let discount = 0;

  data?.forEach((item) => {
    const itemPrice = item.items?.price || 0;
    const itemDiscount = item.items?.discount || 0;
    const itemQuantity = item.quantity || 1;

    subtotal += itemPrice * itemQuantity;
    discount += (itemPrice * itemDiscount * itemQuantity) / 100;
  });

  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500
  const total = subtotal - discount + tax + shipping;

  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    itemCount: data?.length || 0,
  };
};

/**
 * VALIDATE CART (Check stock availability)
 */
export const validateCart = async (userId) => {
  const { data: cartItems, error: cartError } = await supabase
    .from("cart")
    .select(
      `
      id,
      item_id,
      quantity,
      items(id, name, stock)
      `
    )
    .eq("user_id", userId);

  if (cartError) throw new Error(cartError.message);

  const issues = [];

  cartItems?.forEach((item) => {
    if (item.items?.stock === null || item.items?.stock === undefined) {
      issues.push({
        itemId: item.item_id,
        name: item.items?.name,
        issue: "Product not found",
      });
    } else if (item.quantity > item.items.stock) {
      issues.push({
        itemId: item.item_id,
        name: item.items?.name,
        issue: `Only ${item.items.stock} in stock, but ${item.quantity} in cart`,
        maxQuantity: item.items.stock,
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
};
