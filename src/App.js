// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SplashScreen from "./pages/SplashScreen";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminPage from "./pages/AdminPage";   // ✅ Correct import

// Temporary shop page — replace later
function ShopPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      User Shop Page
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Splash Screen */}
        <Route path="/" element={<SplashScreen />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* User Shop */}
        <Route path="/shop" element={<ShopPage />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Fallback Route */}
        <Route path="*" element={<SplashScreen />} />

      </Routes>
    </BrowserRouter>
  );
}
