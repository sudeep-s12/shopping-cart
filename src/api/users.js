// src/api/users.js
// User-related API functions

import { supabase } from "../lib/supabaseClient";

/**
 * GET USER PROFILE
 * Fetch current logged-in user's profile
 */
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE USER PROFILE
 * Update user's profile information (name, phone, address, etc.)
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET USER ADDRESSES
 * Fetch all saved addresses for a user
 */
export const getUserAddresses = async (userId) => {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * ADD USER ADDRESS
 * Save a new delivery address
 */
export const addUserAddress = async (userId, addressData) => {
  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: userId,
      full_name: addressData.fullName,
      phone: addressData.phone,
      street: addressData.street,
      city: addressData.city,
      state: addressData.state,
      postal_code: addressData.postalCode,
      country: addressData.country || "India",
      is_default: addressData.isDefault || false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE USER ADDRESS
 * Modify an existing address
 */
export const updateUserAddress = async (addressId, updates) => {
  const { data, error } = await supabase
    .from("addresses")
    .update(updates)
    .eq("id", addressId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * DELETE USER ADDRESS
 */
export const deleteUserAddress = async (addressId) => {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId);

  if (error) throw new Error(error.message);
  return true;
};

/**
 * GET USER ORDERS
 * Fetch all orders for a user with pagination
 */
export const getUserOrders = async (userId, page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  
  return {
    orders: data || [],
    total: count || 0,
    page,
    limit,
  };
};

/**
 * GET ORDER DETAILS
 * Fetch detailed information about a specific order
 */
export const getOrderDetails = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        product_id,
        quantity,
        price,
        items (id, name, image_url, price)
      ),
      delivery_address: addresses (*)
      `
    )
    .eq("id", orderId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE ORDER STATUS
 * Admin function to update order status
 */
export const updateOrderStatus = async (orderId, status, trackingNumber = null) => {
  const updates = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (trackingNumber) {
    updates.tracking_number = trackingNumber;
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET WISHLIST
 * Fetch user's wishlist items
 */
export const getWishlist = async (userId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .select(
      `
      id,
      item_id,
      items (id, name, brand, price, mrp, discount, rating, image_url, category_id)
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * ADD TO WISHLIST
 */
export const addToWishlist = async (userId, itemId) => {
  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: userId,
      item_id: itemId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * REMOVE FROM WISHLIST
 */
export const removeFromWishlist = async (wishlistId) => {
  const { error } = await supabase
    .from("wishlist")
    .delete()
    .eq("id", wishlistId);

  if (error) throw new Error(error.message);
  return true;
};

/**
 * GET USER NOTIFICATIONS
 * Fetch order updates, offers, etc.
 */
export const getNotifications = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
};

/**
 * MARK NOTIFICATION AS READ
 */
export const markNotificationAsRead = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
  return true;
};
