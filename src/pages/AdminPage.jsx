// src/pages/AdminPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

// IMPORT ALL MODULES FROM MERGED INDEX
import {
  DashboardModule,
  CategoriesModule,
  ProductsModule,
  OrdersModule,
  CouponsModule,
  UsersModule,
  ReviewsModule,
  SeoModule,
  BulkUploadModule,
  ActivityLogModule,
} from "./AdminModules";

export default function AdminPage() {
  const [section, setSection] = useState("dashboard");
  const navigate = useNavigate();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "products", label: "Products", icon: "🧴" },
    { id: "categories", label: "Categories", icon: "🗂️" },
    { id: "orders", label: "Orders", icon: "📦" },
    { id: "coupons", label: "Coupons", icon: "🎟" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "reviews", label: "Reviews", icon: "⭐" },
    { id: "seo", label: "SEO Meta", icon: "🔍" },
    { id: "bulk", label: "Bulk Upload", icon: "📥" },
    { id: "activity", label: "Activity Log", icon: "📝" },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    } finally {
      localStorage.removeItem("currentUser");
      navigate("/login");
    }
  };

  const renderMain = () => {
    switch (section) {
      case "dashboard":
        return <DashboardModule />;
      case "products":
        return <ProductsModule />;
      case "categories":
        return <CategoriesModule />;
      case "orders":
        return <OrdersModule />;
      case "coupons":
        return <CouponsModule />;
      case "users":
        return <UsersModule />;
      case "reviews":
        return <ReviewsModule />;
      case "seo":
        return <SeoModule />;
      case "bulk":
        return <BulkUploadModule />;
      case "activity":
        return <ActivityLogModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/90 p-4">
        <div className="mb-8 p-2">
          <h1 className="text-xl font-bold text-white">SevaSanjeevani</h1>
          <p className="text-xs text-slate-400">Admin Panel</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                section === item.id
                  ? "bg-emerald-900/50 text-white"
                  : "text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <button className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg text-slate-300 hover:bg-slate-800/50">
            <span className="mr-3">⚙️</span>
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm rounded-lg text-red-400 hover:bg-red-900/20"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="bg-slate-900/80 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button className="md:hidden p-2 mr-2 rounded-lg hover:bg-slate-800">
              <span className="text-xl">☰</span>
            </button>
            <h2 className="text-lg font-medium">
              {navItems.find((item) => item.id === section)?.label ||
                "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs">
              Admin
            </span>
            <select
              className="rounded-xl border border-slate-700 bg-slate-900/80 px-2 py-1 text-xs"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              {navItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Actual Module Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          {renderMain()}
        </div>
      </main>
    </div>
  );
}
