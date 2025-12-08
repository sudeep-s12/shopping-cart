// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Splash & Auth
import SplashScreen from "./pages/loginpage/SplashScreen";
import LoginPage from "./pages/loginpage/LoginPage";
import SignupPage from "./pages/loginpage/SignupPage";
import UserLoginPage from "./pages/loginpage/UserLoginPage"; // optional if needed

// Admin
import AdminLoginPage from "./pages/Admin/AdminLoginPage";
import AdminPage from "./pages/Admin/AdminPage";

// User Pages
import HomePage from "./pages/user/HomePage";
import ProductListPage from "./pages/user/ProductListPage";
import ProductDetailPage from "./pages/user/ProductDetailPage";
import CategoriesPage from "./pages/user/CategoriesPage";
import CartPage from "./pages/user/CartPage";
import WishlistPage from "./pages/user/WishlistPage";
import OrdersPage from "./pages/user/OrdersPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import AccountPage from "./pages/user/AccountPage";
import OrderDetailPage from "./pages/user/OrderDetailPage";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { UserProvider } from "./context/UserContext";
import ProductChatbot from "./components/ProductChatbot";

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <Routes>
              {/* Splash Screen */}
              <Route path="/" element={<SplashScreen />} />

              {/* User Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/user-login" element={<UserLoginPage />} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminPage />} />

              {/* User Shopping Routes */}
              <Route path="/shop" element={<HomePage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/products/:categoryId" element={<ProductListPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />

              {/* Cart & Wishlist */}
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />

              {/* Orders */}
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/order/:orderId" element={<OrderDetailPage />} />

              {/* Account Settings */}
              <Route path="/account" element={<AccountPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ProductChatbot />
          </Router>
        </WishlistProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
