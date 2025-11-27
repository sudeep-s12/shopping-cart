// src/pages/AdminPage.jsx
import React, { useState } from "react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-950 to-emerald-950 text-slate-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/90 p-4">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-400/40">
            <span className="text-lg">🪔</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">
              Admin Panel
            </p>
            <p className="text-sm font-semibold text-slate-50">
              Seva Sanjeevani
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 text-xs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition ${
                section === item.id
                  ? "bg-emerald-500/15 text-emerald-100 border border-emerald-400/50"
                  : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-[0.7rem] text-slate-400">
          <p className="font-semibold text-slate-100 mb-1">Tip</p>
          <p>
            Products saved here will be visible on your user shop page using
            localStorage key{" "}
            <code className="rounded bg-slate-800 px-1">ayurvedaProducts</code>.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2 md:hidden">
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

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              ADMIN • {section.toUpperCase()}
            </p>
            <p className="text-sm text-slate-200">
              Manage Seva Sanjeevani Ayurveda catalogue & operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right text-[0.7rem] text-slate-400">
              <span className="text-slate-200">Admin</span>
              <span>admin@sevasanjeevani.com</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-[0.8rem]">
              SS
            </div>
          </div>
        </header>

        {/* Content scroll area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          {renderMain()}
        </div>
      </main>
    </div>
  );
}
