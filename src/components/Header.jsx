// src/components/Header.jsx
import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import logo from "../assets/seva-sanjeevani-logo.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: contextUser, logout: contextLogout } = useUser();

  const [search, setSearch] = useState("");

  // Determine if user is logged in (check both context and localStorage for compatibility)
  let currentUser = contextUser;
  if (!currentUser) {
    try {
      currentUser = JSON.parse(localStorage.getItem("currentUser"));
    } catch (e) {
      currentUser = null;
    }
  }
  const isLoggedIn = !!currentUser;

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    if (contextLogout) {
      contextLogout().then(() => {
        window.location.href = "/login";
      });
    } else {
      window.location.href = "/login";
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;
    navigate(`/products/all?q=${encodeURIComponent(q)}`);
  };

  const navLinkClass = ({ isActive }) =>
    "px-3 py-1.5 rounded-full text-xs font-medium transition " +
    (isActive
      ? "bg-emerald-500/15 text-emerald-200"
      : "text-slate-200 hover:bg-slate-800/80");

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo + brand */}
        <Link to="/shop" className="flex items-center gap-2 shrink-0">
          <div className="h-9 w-9 rounded-full bg-slate-900 border border-emerald-400/60 overflow-hidden flex items-center justify-center">
            <img
              src={logo}
              alt="Seva Sanjeevani"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <p className="text-xs text-emerald-300 tracking-[0.25em] uppercase">
              Seva Sanjeevani
            </p>
            <p className="text-[11px] text-slate-400">
              Ayurvedic Essentials
            </p>
          </div>
        </Link>

        {/* Search (only on /shop & products pages) */}
        <div className="flex-1 hidden md:flex justify-center">
          <div className="w-full max-w-xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            >
              <button
                type="submit"
                className="text-slate-400 hover:text-emerald-300 transition text-sm"
                aria-label="Search products"
              >
                🔍
              </button>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ayurvedic essentials, herbs, oils..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-slate-50 placeholder:text-slate-500"
              />
            </form>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-2 text-xs">
          <NavLink to="/shop" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/products/all" className={navLinkClass}>
            All products
          </NavLink>
          <NavLink to="/categories" className={navLinkClass}>
            Categories
          </NavLink>
          <NavLink to="/orders" className={navLinkClass}>
            Orders
          </NavLink>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            to="/wishlist"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-emerald-400/70"
          >
            <span>❤️</span>
            <span>Wishlist</span>
          </Link>

          <Link
            to="/cart"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 hover:border-emerald-400/70"
          >
            <span>🛒</span>
            <span>Cart</span>
          </Link>

          {isLoggedIn ? (
            <div className="inline-flex items-center gap-2">
              <span className="hidden sm:inline text-[11px] text-slate-300">
                Hi, {currentUser.fullName || currentUser.firstName || currentUser.display_name || currentUser.name || currentUser.email?.split("@")[0] || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-full bg-rose-500 text-white font-semibold hover:bg-rose-400 text-xs"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 text-xs"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}