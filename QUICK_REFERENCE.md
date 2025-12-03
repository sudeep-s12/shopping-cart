# 🚀 Quick Reference Card - API Functions

## 📍 File Locations
```
src/api/users.js       → User profiles, addresses, orders, wishlist
src/api/products.js    → Products, search, reviews, stock
src/api/categories.js  → Categories management
src/api/cart.js        → Shopping cart operations
src/api/orders.js      → Order creation, tracking, payment
src/api/admin.js       → Admin dashboard & management
```

---

## 👤 USER API (`users.js`)

### Profile Management
```javascript
import { getUserProfile, updateUserProfile } from './api/users.js';

// Get user profile
const profile = await getUserProfile(userId);

// Update profile
await updateUserProfile(userId, { phone: '9876543210' });
```

### Address Management
```javascript
import { getUserAddresses, addUserAddress, updateUserAddress, deleteUserAddress } from './api/users.js';

// Get all addresses
const addresses = await getUserAddresses(userId);

// Add new address
await addUserAddress(userId, {
  street: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  phone: "9999999999",
  is_default: true
});

// Update address
await updateUserAddress(addressId, { city: "Delhi" });

// Delete address
await deleteUserAddress(addressId);
```

### Order History
```javascript
import { getUserOrders, getOrderDetails, updateOrderStatus } from './api/users.js';

// Get user's orders
const orders = await getUserOrders(userId, page = 1, limit = 10);

// Get order details
const details = await getOrderDetails(orderId);

// Update status (admin only)
await updateOrderStatus(orderId, 'dispatched', 'TRACKING123');
```

### Wishlist
```javascript
import { getWishlist, addToWishlist, removeFromWishlist } from './api/users.js';

// Get wishlist
const wishlist = await getWishlist(userId);

// Add to wishlist
await addToWishlist(userId, productId);

// Remove from wishlist
await removeFromWishlist(wishlistId);
```

### Notifications
```javascript
import { getNotifications, markNotificationAsRead } from './api/users.js';

// Get notifications
const notifs = await getNotifications(userId, limit = 10);

// Mark as read
await markNotificationAsRead(notificationId);
```

---

## 🛍️ PRODUCTS API (`products.js`)

### Browse & Search
```javascript
import { getProducts, getProductById, searchProducts } from './api/products.js';

// Get all products with filters
const results = await getProducts({
  searchTerm: 'phone',
  categoryId: 'cat-123',
  priceRange: [5000, 50000],
  minRating: 4,
  sortBy: 'price_asc'  // or 'rating_desc', 'newest', etc
}, page = 1, limit = 20);

// Get single product
const product = await getProductById(productId);

// Search products
const search = await searchProducts('iphone', limit = 10);
```

### Categories & Featured
```javascript
import { getProductsByCategory, getFeaturedProducts, getDiscountedProducts } from './api/products.js';

// Get category products
const categoryProducts = await getProductsByCategory(categoryId, limit = 8);

// Get featured (top-rated)
const featured = await getFeaturedProducts(limit = 6);

// Get discounted
const discounted = await getDiscountedProducts(limit = 6);
```

### Reviews
```javascript
import { getProductReviews, addProductReview, getSimilarProducts } from './api/products.js';

// Get reviews
const reviews = await getProductReviews(productId, page = 1, limit = 10);

// Add review
await addProductReview(userId, productId, {
  rating: 5,
  title: "Great product!",
  comment: "Very satisfied with purchase"
});

// Get similar products
const similar = await getSimilarProducts(productId, limit = 5);
```

### Stock
```javascript
import { checkProductStock, updateProductStock } from './api/products.js';

// Check stock
const inStock = await checkProductStock(productId);

// Update stock (admin)
await updateProductStock(productId, newQuantity = 100);
```

---

## 📂 CATEGORIES API (`categories.js`)

```javascript
import { getCategories, getCategoryById, getCategoriesWithCount, createCategory, updateCategory, deleteCategory } from './api/categories.js';

// Get all categories
const all = await getCategories();

// Get category by ID
const cat = await getCategoryById(categoryId);

// Get with product counts
const withCounts = await getCategoriesWithCount();

// Create (admin)
await createCategory({ id: 'cat-new', name: 'Electronics', emoji: '📱' });

// Update (admin)
await updateCategory(categoryId, { name: 'New Name' });

// Delete (admin)
await deleteCategory(categoryId);
```

---

## 🛒 CART API (`cart.js`)

```javascript
import { getUserCart, addToCart, updateCartItem, removeFromCart, clearCart, getCartTotal, validateCart } from './api/cart.js';

// Get cart
const cart = await getUserCart(userId);

// Add item
await addToCart(userId, productId, quantity = 1);

// Update quantity
await updateCartItem(cartItemId, newQuantity = 3);

// Remove item
await removeFromCart(cartItemId);

// Clear cart
await clearCart(userId);

// Get total with tax & shipping
const total = await getCartTotal(userId);
// Returns: { subtotal, discount, tax, shipping, total, itemCount }

// Validate stock before checkout
const validation = await validateCart(userId);
if (!validation.isValid) {
  // Show validation issues
  console.log(validation.issues);
}
```

---

## 📦 ORDERS API (`orders.js`)

```javascript
import { createOrder, getOrderById, initiateRazorpayPayment, verifyRazorpayPayment, updateOrderStatus, cancelOrder, requestReturn, getOrderTracking, estimateDeliveryDate } from './api/orders.js';

// Create order from cart
const order = await createOrder(userId, {
  addressId: 'addr-123',
  paymentMethod: 'razorpay',
  notes: 'Gift wrapping requested'
});
// Returns: { orderId, totalAmount, itemCount, orderStatus }

// Get order details
const details = await getOrderById(orderId);

// Payment - Initiate Razorpay
const razorpayOrder = await initiateRazorpayPayment(orderId, totalAmount);

// Payment - Verify (after payment success)
await verifyRazorpayPayment(orderId, paymentId, razorpayOrderId, signature);

// Update status (admin)
await updateOrderStatus(orderId, 'dispatched', trackingNumber = 'TRK123');

// Cancel order
await cancelOrder(orderId, cancelReason = 'Changed mind');

// Request return/refund
await requestReturn(orderId, returnReason = 'Defective item');

// Get tracking
const tracking = await getOrderTracking(orderId);

// Estimate delivery
const deliveryDate = estimateDeliveryDate(orderCreatedAt, shippingType = 'standard');
// shippingType: 'standard' (5 days), 'express' (2 days), 'premium' (1 day)
```

---

## 👨‍💼 ADMIN API (`admin.js`)

### Order Management
```javascript
import { getAllOrders, getOrderStats, bulkUpdateOrderStatus, generateInvoiceData } from './api/admin.js';

// Get all orders with filters
const orders = await getAllOrders(
  { status: 'pending_payment', dateFrom: '2024-01-01' },
  page = 1,
  limit = 20
);

// Get statistics
const stats = await getOrderStats();
// Returns: { totalOrders, totalRevenue, pendingOrders, confirmedOrders, avgOrderValue }

// Bulk update status
await bulkUpdateOrderStatus(['order-1', 'order-2'], 'dispatched');

// Generate invoice
const invoice = await generateInvoiceData(orderId);
```

### Product Management
```javascript
import { getAllProducts, createProduct, updateProduct, deleteProduct, updateProductStock, bulkUpdatePrices, getLowStockProducts, getProductStats } from './api/admin.js';

// Get all products
const products = await getAllProducts(page = 1, limit = 20);

// Create product
await createProduct({
  name: 'iPhone 15',
  brand: 'Apple',
  categoryId: 'cat-phones',
  price: 79999,
  mrp: 99999,
  discount: 20,
  imageUrl: 'https://...',
  stock: 100,
  description: 'Latest iPhone'
});

// Update product
await updateProduct(productId, { price: 75000, stock: 50 });

// Delete product
await deleteProduct(productId, hardDelete = false); // soft delete

// Update stock
await updateProductStock(productId, 150);

// Bulk update prices
await bulkUpdatePrices([
  { id: 'prod-1', price: 1000, mrp: 1500, discount: 33 },
  { id: 'prod-2', price: 2000, mrp: 2500, discount: 20 }
]);

// Get low stock alerts
const lowStock = await getLowStockProducts(threshold = 10);

// Get sales stats
const stats = await getProductStats();
// Shows: units sold, rating, price for each product
```

### User Management
```javascript
import { getAllUsers, getUserDetailsAdmin, updateUserRole, deactivateUser, getUserStats } from './api/admin.js';

// Get all users
const users = await getAllUsers(page = 1, limit = 20);

// Get user details (admin view)
const details = await getUserDetailsAdmin(userId);

// Change user role
await updateUserRole(userId, 'admin'); // 'admin' or 'customer'

// Deactivate account
await deactivateUser(userId, reason = 'Policy violation');

// Get user statistics
const stats = await getUserStats();
// Returns: { totalUsers, totalSpend, avgSpendPerUser }
```

---

## 🌍 Import Examples

```javascript
// Import single function
import { addToCart } from './api/cart.js';

// Import multiple functions
import { getUserCart, addToCart, getCartTotal } from './api/cart.js';

// Import entire module
import * as Cart from './api/cart.js';
const cart = await Cart.getUserCart(userId);
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `RLS policy violation` | Not logged in | Login first (auth.uid() required) |
| `No products found` | Database empty | Run DATABASE_SETUP.sql |
| `Invalid user_id` | Wrong user | Check localStorage for userId |
| `Quantity must be > 0` | Invalid qty | Use `removeFromCart` instead |
| `Cart is empty` | No items | `addToCart` first |
| `Order already exists` | Duplicate | Check order status |

---

## 📱 React Component Integration

```javascript
import React, { useState, useEffect } from 'react';
import { useUser } from './context/UserContext.js';
import { addToCart, getCartTotal } from './api/cart.js';

export function ProductCard({ product }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login first');
      return;
    }

    try {
      setLoading(true);
      await addToCart(user.id, product.id, 1);
      alert('Added to cart!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <img src={product.image_url} alt={product.name} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button onClick={handleAddToCart} disabled={loading}>
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
}
```

---

## 🎯 Quick Start (Copy-Paste Ready)

### Test Cart
```javascript
import { addToCart, getUserCart, getCartTotal } from './api/cart.js';

const userId = localStorage.getItem('userId');
await addToCart(userId, 'product-id-here', 1);
const cart = await getUserCart(userId);
const total = await getCartTotal(userId);
console.log(cart, total);
```

### Test Order
```javascript
import { createOrder } from './api/orders.js';

const userId = localStorage.getItem('userId');
const order = await createOrder(userId, {
  addressId: 'address-id-here',
  paymentMethod: 'razorpay'
});
console.log(order);
```

### Test Admin
```javascript
import { getAllOrders, getOrderStats } from './api/admin.js';

const orders = await getAllOrders({}, 1, 10);
const stats = await getOrderStats();
console.log(orders, stats);
```

---

## 📊 Data Models

### Cart Item
```javascript
{
  id: 'uuid',
  user_id: 'uuid',
  item_id: 'uuid',
  quantity: 2,
  items: { id, name, brand, price, image_url, stock }
}
```

### Order
```javascript
{
  id: 'uuid',
  user_id: 'uuid',
  address_id: 'uuid',
  total_amount: 50000,
  order_status: 'confirmed',
  payment_method: 'razorpay',
  tracking_number: 'TRK123',
  created_at: '2024-01-15T10:30:00Z'
}
```

### Product
```javascript
{
  id: 'uuid',
  name: 'iPhone 15',
  brand: 'Apple',
  price: 79999,
  mrp: 99999,
  discount: 20,
  category_id: 'uuid',
  image_url: 'https://...',
  stock: 50,
  rating: 4.5,
  review_count: 234
}
```

---

## ✅ Checklist Before Going Live

- [ ] Run DATABASE_SETUP.sql
- [ ] Create test user account
- [ ] Add item to cart
- [ ] Create delivery address
- [ ] Create test order
- [ ] Test Razorpay with test cards
- [ ] Test order tracking
- [ ] Test admin functions
- [ ] Test mobile responsive
- [ ] Setup error logging
- [ ] Backup database
- [ ] Deploy to production

---

**Print this card or bookmark for quick reference! 📌**

Created: 2024
Version: 1.0
Status: Production Ready ✅
