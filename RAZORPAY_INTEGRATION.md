# Razorpay Payment Integration Guide

## Overview
This guide explains how to integrate Razorpay payment gateway for online payments in your e-commerce platform.

## Step 1: Get Razorpay API Keys

### Create Razorpay Account
1. Go to https://razorpay.com
2. Click **Sign Up** and create a business account
3. Verify your email and phone
4. Complete KYC (Know Your Customer) verification
5. Get approval (usually within 1-2 hours)

### Get API Keys
1. Login to Razorpay Dashboard: https://dashboard.razorpay.com
2. Go to **Settings** → **API Keys**
3. You'll see two keys:
   - **Key ID** (Public key) - Safe to use in frontend
   - **Key Secret** (Private key) - NEVER share or commit to code

## Step 2: Add Environment Variables

Update your `.env` file:
```
REACT_APP_RAZORPAY_KEY_ID=your_key_id_here
```

Create `.env.local` on your server (if using backend):
```
RAZORPAY_KEY_SECRET=your_key_secret_here
```

## Step 3: Install Razorpay SDK

In your React app:
```bash
npm install razorpay
```

## Step 4: Update Checkout Flow

### Modified Checkout Process

1. **User adds items to cart** → Cart stored in database
2. **User clicks "Checkout"** → Go to CheckoutPage
3. **User selects address** → Address must be in addresses table
4. **User clicks "Pay Now"** → Initiate Razorpay order
5. **Razorpay popup opens** → User enters payment details
6. **Payment success** → Verify signature → Create order in database
7. **User redirected** → Order confirmation page with tracking

### Code Implementation

#### 1. Create Razorpay Order (on backend or frontend)

**Frontend approach (simpler, less secure):**
```javascript
// src/pages/user/CheckoutPage.jsx
import { initiateRazorpayPayment, verifyRazorpayPayment } from "../../api/orders.js";

const handlePayment = async () => {
  try {
    // Step 1: Create order in database (status: pending_payment)
    const orderResult = await createOrder(userId, {
      addressId: selectedAddressId,
      paymentMethod: "razorpay",
    });

    // Step 2: Get Razorpay order details
    const razorpayOrder = await initiateRazorpayPayment(
      orderResult.orderId,
      orderResult.totalAmount
    );

    // Step 3: Open Razorpay checkout
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: "Your Store Name",
      description: "Purchase from Your Store",
      order_id: razorpayOrder.razorpayOrderId,
      handler: async (response) => {
        // Step 4: Handle payment success
        await verifyRazorpayPayment(
          orderResult.orderId,
          response.razorpay_payment_id,
          response.razorpay_order_id,
          response.razorpay_signature
        );
        
        // Redirect to order confirmation
        navigate(`/order/${orderResult.orderId}`);
      },
      prefill: {
        email: userEmail,
        contact: userPhone,
      },
      theme: {
        color: "#3399cc",
      },
      modal: {
        ondismiss: () => {
          console.log("Checkout modal closed");
          // Allow user to retry
        },
      },
    };

    // Load Razorpay script and open checkout
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    console.error("Payment error:", error);
    alert("Payment initiation failed: " + error.message);
  }
};
```

#### 2. Backend Verification (Recommended for Production)

Create a backend endpoint to verify payment:

**If using Node.js/Express:**
```javascript
// backend/routes/payment.js
const crypto = require("crypto");
const express = require("express");
const router = express.Router();

// Verify Razorpay payment signature
router.post("/verify-payment", async (req, res) => {
  const { orderId, paymentId, razorpayOrderId, signature } = req.body;

  try {
    // Verify signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpayOrderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === signature) {
      // Signature verified - update order status
      // Call Supabase to mark order as confirmed
      // Return success response
      res.json({ success: true, message: "Payment verified" });
    } else {
      res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
```

**Simpler Frontend Verification (Less Secure):**
```javascript
// For development/testing only - NOT recommended for production
export const verifyRazorpayPayment = async (
  orderId,
  paymentId,
  razorpayOrderId,
  signature
) => {
  // In production, this should be verified on the backend
  // For now, we'll trust Razorpay's callback and update status directly
  
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
```

## Step 5: Handle Different Payment States

```javascript
// Payment Success Handler
const handlePaymentSuccess = (response) => {
  console.log("Payment successful:", response);
  // Update order status to "confirmed"
  // Create notification for user
  // Send confirmation email
};

// Payment Failure Handler
const handlePaymentFailure = (error) => {
  console.error("Payment failed:", error);
  // Keep order status as "pending_payment"
  // Show retry button
  // Log error for support team
};

// Timeout Handler
const handleCheckoutClose = () => {
  console.log("User closed checkout");
  // Order remains in "pending_payment" status
  // Allow user to retry
};
```

## Step 6: Order Status Flow

```
User Creates Order
       ↓
Order Created (pending_payment)
       ↓
Razorpay Popup Opens
       ↓
Payment Success ← or → Payment Failed
       ↓                      ↓
Order Confirmed         Keep pending_payment
       ↓                 User can retry
Dispatch Soon
       ↓
Order Dispatched
       ↓
Delivery in Progress
       ↓
Order Delivered
```

## Step 7: Testing Payments

### Using Razorpay Test Cards

1. Stay in **Test Mode** (see toggle at top of Razorpay Dashboard)
2. Use these test cards:

**Successful Payment:**
```
Card Number: 4111 1111 1111 1111
Expiry: 12/25
CVV: 123
```

**Failed Payment:**
```
Card Number: 4111 1111 1111 1110
Expiry: 12/25
CVV: 123
```

### Test Webhook
1. Use Razorpay Dashboard → **Webhooks** section
2. Add your webhook URL
3. Test events: payment.authorized, payment.failed, order.paid

## Step 8: Production Checklist

- [ ] Switch Razorpay account to Live Mode
- [ ] Update API keys from Live to Production keys
- [ ] Verify backend payment verification is implemented
- [ ] Test full checkout flow with real test transactions
- [ ] Setup Razorpay webhooks for payment notifications
- [ ] Implement email confirmations after payment
- [ ] Setup customer support process for payment issues
- [ ] Test refund process
- [ ] Setup payment failure recovery emails
- [ ] Document customer support procedures

## Common Issues & Solutions

### "Razorpay is not defined"
**Problem:** Script didn't load before checkout was triggered
**Solution:** 
```javascript
// Load script on component mount
useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### "Invalid Key ID"
**Problem:** Wrong API key being used
**Solution:** Verify in `.env` that you have the correct Key ID (not Key Secret)

### "Signature mismatch"
**Problem:** Backend verification of signature failing
**Solution:** Ensure using correct Key Secret on backend, never expose in frontend

### International Payments Not Working
**Problem:** Razorpay test mode doesn't support all countries
**Solution:** Test with Indian addresses first, then go live for full access

## Refund Processing

```javascript
// Process refund (admin function)
export const initiateRefund = async (orderId, refundAmount) => {
  const { data: order } = await supabase
    .from("orders")
    .select("payment_id")
    .eq("id", orderId)
    .single();

  // Call backend API to process refund
  const response = await fetch("/api/refund", {
    method: "POST",
    body: JSON.stringify({
      paymentId: order.payment_id,
      amount: refundAmount,
    }),
  });

  return response.json();
};
```

## Additional Resources

- Razorpay Documentation: https://razorpay.com/docs
- JavaScript Integration: https://razorpay.com/docs/payment-gateway/web-integration/standard/
- Webhook Events: https://razorpay.com/docs/webhooks/
- Support: https://razorpay.com/support

---

**Important:** 
- NEVER commit API keys to version control
- NEVER expose Key Secret in frontend code
- ALWAYS verify payments on backend in production
- Test thoroughly before going live

---

Next Steps:
1. ✅ Get Razorpay account and API keys
2. ✅ Add to .env file
3. ✅ Update CheckoutPage component with payment flow
4. ✅ Test with test cards
5. ✅ Setup backend verification
6. ✅ Go live
