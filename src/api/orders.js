// src/api/orders.js
// Order and checkout API functions

import { supabase } from "../lib/supabaseClient";

/**
 * CREATE NEW ORDER FROM CART
 */
export const createOrder = async (userId, orderData) => {
  const {
    addressId,
    paymentMethod = "cod",
    notes = "",
    items = [], // Accept items directly from checkout
    subtotal = 0,
    discountAmount = 0,
    shippingCost = 0,
    totalAmount = 0,
  } = orderData;

  // Validate items
  if (!items || items.length === 0) {
    throw new Error("Cannot create order with empty cart");
  }

  // Use provided totals or calculate from items
  const finalSubtotal = subtotal || items.reduce((sum, item) => {
    return sum + (item.price * (item.quantity || 1));
  }, 0);

  const finalDiscount = discountAmount || items.reduce((sum, item) => {
    return sum + ((item.price * (item.discount || 0) * (item.quantity || 1)) / 100);
  }, 0);

  const finalShipping = shippingCost !== undefined ? shippingCost : (finalSubtotal > 999 ? 0 : 59);
  const finalTotal = totalAmount || (finalSubtotal - finalDiscount + finalShipping);

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,
      payment_method: paymentMethod,
      subtotal: finalSubtotal,
      discount_amount: finalDiscount,
      tax_amount: 0,
      shipping_cost: finalShipping,
      total_amount: finalTotal,
      order_status: paymentMethod === "cod" ? "confirmed" : "pending_payment",
      notes,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation error:", orderError);
    throw new Error(orderError.message);
  }

  // Add order items
  const orderItems = items.map((item) => ({
    order_id: order.id,
    item_id: item.productId || item.id,
    quantity: item.quantity || 1,
    price_at_purchase: item.price,
    discount_at_purchase: item.discount || 0,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Order items creation error:", itemsError);
    throw new Error("Failed to add items to order: " + itemsError.message);
  }

  return {
    orderId: order.id,
    totalAmount: finalTotal,
    itemCount: items.length,
    orderStatus: order.order_status,
  };
};

/**
 * GET ORDER BY ID (with items and delivery address)
 */
export const getOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      user_id,
      address_id,
      payment_method,
      payment_status,
      order_status,
      subtotal,
      discount_amount,
      tax_amount,
      shipping_cost,
      total_amount,
      notes,
      tracking_number,
      created_at,
      paid_at,
      dispatched_at,
      delivered_at,
      order_items(
        id,
        order_id,
        item_id,
        quantity,
        price_at_purchase,
        discount_at_purchase
      ),
      addresses(
        id,
        street,
        city,
        state,
        pincode,
        phone,
        is_default
      )
      `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    throw new Error(error.message);
  }
  return data;
};

/**
 * GET ORDERS FOR A USER
 */
export const getOrdersByUser = async (userId, limit = 50) => {
  const { data, error } = await supabase
    .from("orders")
    .select(`id, order_status, total_amount, created_at`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching user orders:", error);
    throw new Error(error.message);
  }

  return data || [];
};

/**
 * INITIATE RAZORPAY PAYMENT
 */
export const initiateRazorpayPayment = async (orderId, totalAmount) => {
  // This creates a Razorpay order
  // In production, call your backend API to create Razorpay order
  // Returns order details needed for Razorpay checkout

  const razorpayOrderData = {
    amount: Math.round(totalAmount * 100), // Convert to paise
    currency: "INR",
    receipt: `order_${orderId}`,
    notes: {
      orderId,
    },
  };

  // For now, return mock data - replace with actual backend API call
  return {
    razorpayOrderId: `razorpay_order_${Date.now()}`,
    amount: razorpayOrderData.amount,
    currency: "INR",
    key: process.env.REACT_APP_RAZORPAY_KEY_ID || "",
  };
};

/**
 * VERIFY RAZORPAY PAYMENT
 */
export const verifyRazorpayPayment = async (
  orderId,
  paymentId,
  razorpayOrderId,
  signature
) => {
  // In production, call your backend to verify payment signature
  // For now, update order status directly
  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: "confirmed",
      payment_id: paymentId,
      payment_status: "completed",
      paid_at: new Date(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * UPDATE ORDER STATUS (Admin)
 */
export const updateOrderStatus = async (
  orderId,
  newStatus,
  trackingNumber = null
) => {
  const updateData = { order_status: newStatus };

  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  if (newStatus === "dispatched") {
    updateData.dispatched_at = new Date();
  } else if (newStatus === "delivered") {
    updateData.delivered_at = new Date();
  }

  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * CANCEL ORDER (user-initiated)
 * We also filter by user_id to prevent cancelling others' orders.
 */
export const cancelOrder = async (orderId, cancelReason, userId) => {
  const query = supabase
    .from("orders")
    .update({
      order_status: "cancelled",
      cancel_reason: cancelReason,
      cancelled_at: new Date(),
    })
    .eq("id", orderId);

  if (userId) {
    query.eq("user_id", userId);
  }

  const { data, error } = await query.select().single();

  if (error) throw new Error(error.message || "Failed to cancel order");
  if (!data) throw new Error("Order not found or not authorized");
  return data;
};

/**
 * REQUEST RETURN/REFUND
 */
export const requestReturn = async (orderId, returnReason) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: "return_requested",
      return_reason: returnReason,
      return_requested_at: new Date(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

/**
 * GET ORDER TRACKING DETAILS
 */
export const getOrderTracking = async (orderId) => {
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_status,
      created_at,
      dispatched_at,
      delivered_at,
      tracking_number
      `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error("Error fetching tracking:", error);
    throw new Error(error.message);
  }

  // Format tracking timeline
  const timeline = [
    { status: "Order Placed", date: data?.created_at, completed: true },
    {
      status: "Confirmed",
      date: data?.created_at,
      completed: data?.order_status !== "pending_payment",
    },
    {
      status: "Dispatched",
      date: data?.dispatched_at,
      completed: ["dispatched", "delivered"].includes(data?.order_status),
    },
    {
      status: "Delivered",
      date: data?.delivered_at,
      completed: data?.order_status === "delivered",
    },
  ];

  return {
    ...data,
    timeline,
  };
};

/**
 * ESTIMATE DELIVERY DATE
 */
export const estimateDeliveryDate = (orderCreatedAt, shippingType = "standard") => {
  const createdDate = new Date(orderCreatedAt);
  let deliveryDays = 5; // Standard delivery

  if (shippingType === "express") deliveryDays = 2;
  if (shippingType === "premium") deliveryDays = 1;

  const estimatedDate = new Date(createdDate);
  estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

  return estimatedDate;
};
