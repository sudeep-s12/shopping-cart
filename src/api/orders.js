// src/api/orders.js
// Order and checkout API functions

import { supabase } from "../lib/supabaseClient";

/**
 * CREATE NEW ORDER FROM CART
 */
export const createOrder = async (userId, orderData) => {
  const {
    addressId,
    paymentMethod = "razorpay",
    notes = "",
  } = orderData;

  // Get cart items
  const { data: cartItems, error: cartError } = await supabase
    .from("cart")
    .select(
      `
      item_id,
      quantity,
      items(id, name, price, mrp, discount, brand, image_url)
      `
    )
    .eq("user_id", userId);

  if (cartError) throw new Error(cartError.message);

  // Allow creating orders even with empty cart (for testing)
  // In production, you'd want to enforce non-empty carts
  let subtotal = 0;
  let discountAmount = 0;

  // Calculate totals if cart has items
  if (cartItems && cartItems.length > 0) {
    cartItems.forEach((item) => {
      const itemPrice = item.items?.price || 0;
      const itemDiscount = item.items?.discount || 0;
      const quantity = item.quantity || 1;

      subtotal += itemPrice * quantity;
      discountAmount += (itemPrice * itemDiscount * quantity) / 100;
    });
  }

  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50;
  const totalAmount = subtotal - discountAmount + tax + shipping;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      address_id: addressId,
      payment_method: paymentMethod,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: tax,
      shipping_cost: shipping,
      total_amount: totalAmount,
      order_status: "pending_payment",
      notes,
      created_at: new Date(),
    })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  // Add order items (only if cart has items)
  if (cartItems && cartItems.length > 0) {
    const orderItems = cartItems.map((item) => ({
      order_id: order.id,
      item_id: item.item_id,
      quantity: item.quantity,
      price_at_purchase: item.items?.price,
      discount_at_purchase: item.items?.discount,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);
  }

  // Clear cart
  const { error: clearError } = await supabase
    .from("cart")
    .delete()
    .eq("user_id", userId);

  if (clearError) throw new Error(clearError.message);

  return {
    orderId: order.id,
    totalAmount,
    itemCount: cartItems.length,
    orderStatus: "pending_payment",
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
 * CANCEL ORDER
 */
export const cancelOrder = async (orderId, cancelReason) => {
  const { data, error } = await supabase
    .from("orders")
    .update({
      order_status: "cancelled",
      cancel_reason: cancelReason,
      cancelled_at: new Date(),
    })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
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
