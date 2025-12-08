// src/pages/user/CategoriesPage.jsx

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, emoji")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
        } else {
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-emerald-200 mb-2">
          Shop by concern & category
        </h1>

        <p className="text-xs text-slate-400 mb-6">
          Browse Ayurveda essentials organised by health goals and daily needs.
        </p>

        {/* Category Cards */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No categories available</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products/${cat.name}`}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 
                           hover:border-emerald-400/70 hover:bg-slate-900/90 
                           p-4 flex gap-3 transition-all duration-200"
              >
                {/* Icon / Emoji */}
                <div className="h-10 w-10 rounded-full bg-slate-800 
                                flex items-center justify-center text-lg">
                  {cat.emoji || "📦"}
                </div>

                {/* Text */}
                <div>
                  <p className="text-sm font-semibold text-slate-50">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
