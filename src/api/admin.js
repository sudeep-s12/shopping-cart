// src/api/admin.js
// Admin-only API functions for order and product management

import { supabase } from "../lib/supabaseClient";

// ============ ORDER MANAGEMENT ============

/**
 * GET ALL ORDERS (Admin only)
 */
export const getAllOrders = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  const { status, dateFrom, dateTo, userId } = filters;

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      profiles(display_name, email),
      addresses(city, state),
      order_items(quantity, items(name, price))
      `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  // Apply filters
  if (status) query = query.eq("order_status", status);
  if (userId) query = query.eq("user_id", userId);
  if (dateFrom) query = query.gte("created_at", dateFrom);
  if (dateTo) query = query.lte("created_at", dateTo);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    orders: data,
    total: count,
    page,
    pages: Math.ceil(count / limit),
  };
};

/**
 * GET ORDER STATISTICS
 */
export const getOrderStats = async () => {
  // Get all orders
  const { data: orders, error } = await supabase
    .from("orders")
    .select("order_status, total_amount, created_at");

  if (error) throw new Error(error.message);

  const stats = {
    totalOrders: orders?.length || 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  };

  orders?.forEach((order) => {
    stats.totalRevenue += order.total_amount || 0;

    if (order.order_status === "pending_payment") stats.pendingOrders++;
    if (order.order_status === "confirmed") stats.confirmedOrders++;
    if (order.order_status === "dispatched") stats.dispatchedOrders++;
    if (order.order_status === "delivered") stats.deliveredOrders++;
    if (order.order_status === "cancelled") stats.cancelledOrders++;
  });

  stats.avgOrderValue =
    stats.totalOrders > 0
      ? Math.round(stats.totalRevenue / stats.totalOrders)
      : 0;

  return stats;
};

/**
 * BULK UPDATE ORDER STATUS
 */
export const bulkUpdateOrderStatus = async (orderIds, newStatus) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: newStatus })
    .in("id", orderIds)
    .select();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GENERATE INVOICE
 */
export const generateInvoiceData = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      profiles(display_name, email, phone),
      addresses(street, city, state, pincode, phone),
      order_items(
        quantity,
        price_at_purchase,
        discount_at_purchase,
        items(name, brand)
      )
      `
    )
    .eq("id", orderId)
    .single();

  if (error) throw new Error(error.message);

  // Format invoice data
  return {
    invoiceNumber: `INV-${data.id.slice(0, 8).toUpperCase()}`,
    invoiceDate: new Date(data.created_at).toLocaleDateString(),
    orderDate: new Date(data.created_at).toLocaleDateString(),
    orderStatus: data.order_status,
    customer: {
      name: data.profiles?.display_name,
      email: data.profiles?.email,
      phone: data.profiles?.phone,
    },
    deliveryAddress: {
      street: data.addresses?.street,
      city: data.addresses?.city,
      state: data.addresses?.state,
      pincode: data.addresses?.pincode,
      phone: data.addresses?.phone,
    },
    items: data.order_items,
    subtotal: data.subtotal,
    discountAmount: data.discount_amount,
    taxAmount: data.tax_amount,
    shippingCost: data.shipping_cost,
    totalAmount: data.total_amount,
    paymentMethod: data.payment_method,
    trackingNumber: data.tracking_number,
  };
};

// ============ PRODUCT MANAGEMENT ============

/**
 * GET ALL PRODUCTS (Admin view with more details)
 */
export const getAllProducts = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("items")
    .select(
      `
      *,
      categories(name)
      `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return {
    products: data,
    total: count,
    page,
    pages: Math.ceil(count / limit),
  };
};

/**
 * CREATE NEW PRODUCT (Admin only)
 */
export const createProduct = async (productData) => {
  const {
    name,
    brand,
    categoryId,
    price,
    mrp,
    discount,
    description,
    imageUrl,
    stock,
  } = productData;

  const { data, error } = await supabase
    .from("items")
    .insert({
      name,
      brand,
      category_id: categoryId,
      price,
      mrp,
      discount,
      description: description || null,
      image_url: imageUrl,
      stock,
      rating: 0,
      review_count: 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE PRODUCT (Admin only)
 */
export const updateProduct = async (productId, updates) => {
  const { data, error } = await supabase
    .from("items")
    .update(updates)
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * DELETE PRODUCT (Admin only - soft delete or hard delete)
 */
export const deleteProduct = async (productId, hardDelete = false) => {
  if (hardDelete) {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", productId);

    if (error) throw new Error(error.message);
  } else {
    // Soft delete - update is_active flag
    const { data, error } = await supabase
      .from("items")
      .update({ is_active: false })
      .eq("id", productId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  return true;
};

/**
 * UPDATE PRODUCT STOCK
 */
export const updateProductStock = async (productId, newStock) => {
  const { data, error } = await supabase
    .from("items")
    .update({ stock: newStock })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * BULK UPDATE PRODUCT PRICES
 */
export const bulkUpdatePrices = async (productUpdates) => {
  // productUpdates = [{ id, price, mrp, discount }, ...]
  const { data, error } = await supabase
    .from("items")
    .upsert(productUpdates, { onConflict: "id" })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET LOW STOCK PRODUCTS
 */
export const getLowStockProducts = async (threshold = 10) => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .lte("stock", threshold)
    .order("stock", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET PRODUCT PERFORMANCE STATS
 */
export const getProductStats = async () => {
  const { data: products, error: productsError } = await supabase
    .from("items")
    .select("id, name, rating, review_count, stock, price");

  if (productsError) throw new Error(productsError.message);

  // Get sales data
  const { data: orderItems, error: ordersError } = await supabase
    .from("order_items")
    .select("item_id, quantity");

  if (ordersError) throw new Error(ordersError.message);

  // Aggregate sales by product
  const salesByProduct = {};
  orderItems?.forEach((item) => {
    salesByProduct[item.item_id] = (salesByProduct[item.item_id] || 0) + item.quantity;
  });

  // Combine and sort
  const stats = products?.map((product) => ({
    id: product.id,
    name: product.name,
    rating: product.rating,
    reviews: product.review_count,
    unitsSold: salesByProduct[product.id] || 0,
    stock: product.stock,
    price: product.price,
  }));

  return stats?.sort((a, b) => b.unitsSold - a.unitsSold) || [];
};

// ============ USER MANAGEMENT ============

/**
 * GET ALL USERS (Admin only)
 */
export const getAllUsers = async (page = 1, limit = 20) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("profiles")
    .select(
      `
      *,
      orders(count)
      `,
      { count: "exact" }
    )
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return {
    users: data,
    total: count,
    page,
    pages: Math.ceil(count / limit),
  };
};

/**
 * GET USER DETAILS (Admin view)
 */
export const getUserDetailsAdmin = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      orders(id, total_amount, order_status, created_at),
      addresses(count),
      wishlist(count)
      `
    )
    .eq("id", userId)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    totalOrders: data?.orders?.length || 0,
    totalSpent: data?.orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0,
    addressCount: data?.addresses?.[0]?.count || 0,
    wishlistCount: data?.wishlist?.[0]?.count || 0,
  };
};

/**
 * UPDATE USER ROLE (Admin only)
 */
export const updateUserRole = async (userId, newRole) => {
  const validRoles = ["customer", "admin"];
  if (!validRoles.includes(newRole)) {
    throw new Error(`Invalid role. Must be one of: ${validRoles.join(", ")}`);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * DEACTIVATE USER ACCOUNT (Admin only)
 */
export const deactivateUser = async (userId, reason = "") => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET USER STATISTICS
 */
export const getUserStats = async () => {
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, created_at");

  if (profilesError) throw new Error(profilesError.message);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("user_id, total_amount");

  if (ordersError) throw new Error(ordersError.message);

  const stats = {
    totalUsers: profiles?.length || 0,
    activeToday: 0, // Would need activity tracking
    totalSpend: 0,
    avgSpendPerUser: 0,
  };

  orders?.forEach((order) => {
    stats.totalSpend += order.total_amount || 0;
  });

  stats.avgSpendPerUser =
    stats.totalUsers > 0
      ? Math.round(stats.totalSpend / stats.totalUsers)
      : 0;

  return stats;
};
