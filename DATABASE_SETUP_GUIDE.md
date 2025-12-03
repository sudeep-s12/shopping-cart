# Database Setup Instructions

## Overview
This document explains how to set up all required database tables for the Flipkart-like e-commerce platform.

## Tables to Create
The `DATABASE_SETUP.sql` file contains SQL to create:

1. **cart** - Shopping cart items
2. **addresses** - User delivery addresses
3. **orders** - Customer orders
4. **order_items** - Line items in orders
5. **reviews** - Product reviews
6. **wishlist** - User wishlists
7. **notifications** - User notifications

## How to Execute the SQL

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire content of `DATABASE_SETUP.sql`
6. Paste into the SQL editor
7. Click **Run** button (or press Ctrl+Enter)
8. Wait for all queries to complete successfully

### Option 2: Using psql CLI
```bash
psql -h db.xyzabc.supabase.co -U postgres -p 5432 -d postgres < DATABASE_SETUP.sql
```
(Replace the host with your Supabase project host)

## What Gets Created

### Tables
- **cart**: Stores items in user's shopping cart
- **addresses**: User's delivery addresses (one-to-many with users)
- **orders**: Order records with totals and status
- **order_items**: Items within each order (line items)
- **reviews**: Product reviews by users
- **wishlist**: Bookmarked products
- **notifications**: Order status updates and alerts

### Security (RLS Policies)
- Users can only see/modify their own data
- Admins can view all orders
- System can create notifications
- Reviews are publicly readable

### Indexes
- Indexes on user_id for fast lookups
- Index on order_status for filtering
- Index on notifications.is_read for queries

## After Setup

### Verify Tables Created
Go to **Table Editor** in Supabase dashboard and verify you see:
- ✅ cart
- ✅ addresses
- ✅ orders
- ✅ order_items
- ✅ reviews
- ✅ wishlist
- ✅ notifications

### Test Cart API
```javascript
import { addToCart, getUserCart } from "./api/cart.js";

// Add item to cart (itemId must exist in items table)
await addToCart(userId, itemId, 1);

// Get user's cart
const cart = await getUserCart(userId);
console.log(cart);
```

### Test Orders API
```javascript
import { createOrder } from "./api/orders.js";

// Create order from cart
const order = await createOrder(userId, {
  addressId: addressId,
  paymentMethod: "razorpay",
});
console.log(order);
```

## Troubleshooting

### "relation does not exist" error
- Make sure you executed the entire DATABASE_SETUP.sql file
- Verify the tables are listed in Supabase dashboard

### "permission denied" error
- Check that your Supabase user has permissions
- Verify you're connected to the correct database

### RLS Policy Errors
- Ensure you're logged in as a user (auth.uid() returns a value)
- For admin functions, make sure the user has role='admin' in profiles table

## Next Steps

1. ✅ Run DATABASE_SETUP.sql
2. ✅ Create sample addresses for test users
3. 🔲 Integrate payment gateway (Razorpay/Stripe)
4. 🔲 Build admin dashboard for order management
5. 🔲 Build checkout page UI
6. 🔲 Build order tracking page

## Important Notes

- The order_status column has CHECK constraint with these valid values:
  - `pending_payment`
  - `confirmed`
  - `dispatched`
  - `delivered`
  - `cancelled`
  - `return_requested`
  - `returned`

- Cart items maintain unique constraint on (user_id, item_id) so adding same item twice increases quantity
- Addresses are linked to orders so they cannot be deleted if an order exists
- All timestamps use UTC and are automatically set

---

**Created**: 2024
**For**: Flipkart-like E-commerce Platform
