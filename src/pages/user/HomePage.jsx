import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { Link } from "react-router-dom";

// TEMP demo data – later connect to backend
const demoProducts = [
  {
    id: "1",
    name: "Ashwagandha Stress Relief Capsules",
    brand: "Seva Sanjeevani",
    price: 499,
    mrp: 699,
    discount: 28,
    rating: 4.6,
    badge: "Bestseller",
    image:
      "https://images.pexels.com/photos/3735762/pexels-photo-3735762.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "2",
    name: "Triphala Digestive Wellness Powder",
    brand: "Seva Sanjeevani",
    price: 299,
    mrp: 399,
    discount: 25,
    rating: 4.4,
    badge: "Popular",
    image:
      "https://images.pexels.com/photos/3735757/pexels-photo-3735757.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const demoCategories = [
  { id: "immunity", label: "Immunity", emoji: "🛡" },
  { id: "stress-sleep", label: "Stress & Sleep", emoji: "😴" },
  { id: "digestion", label: "Digestion", emoji: "🌿" },
  { id: "skin-hair", label: "Skin & Hair", emoji: "💆‍♀" },
  { id: "women", label: "Women’s Health", emoji: "🌸" },
  { id: "kids", label: "Kids Care", emoji: "🧸" },
];

export default function HomePage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-10">
        {/* Hero banner */}
        <section className="grid md:grid-cols-[1.6fr_1fr] gap-5 items-center">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/20 via-emerald-400/10 to-amber-300/10 border border-emerald-400/30 p-6 sm:p-8 shadow-[0_22px_60px_rgba(0,0,0,0.8)]">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200 mb-3">
              Ayurveda • Daily Rituals
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
              Healthy choices for{" "}
              <span className="bg-gradient-to-r from-emerald-200 via-amber-200 to-emerald-300 bg-clip-text text-transparent">
                happier living
              </span>
              .
            </h1>
            <p className="mt-3 text-sm text-emerald-50/80 max-w-lg">
              Explore curated Ayurveda essentials crafted for immunity, stress
              relief, better sleep and everyday wellness.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <Link
                to="/categories"
                className="rounded-full bg-emerald-500 text-slate-950 px-4 py-2 font-semibold hover:bg-emerald-400"
              >
                Shop by category
              </Link>
              <Link
                to="/products/all"
                className="rounded-full border border-emerald-400/60 px-4 py-2 text-emerald-200 hover:bg-emerald-500/10"
              >
                Browse all products
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-4 h-full flex flex-col justify-between">
              <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-2">
                Highlights
              </p>
              <ul className="space-y-3 text-sm text-slate-200">
                <li>• 100% ayurvedic formulations</li>
                <li>• Handpicked herbs & classical recipes</li>
                <li>• Backed by modern quality checks</li>
                <li>• Crafted for Indian lifestyle & climate</li>
              </ul>
              <p className="text-[11px] text-slate-500 mt-4">
                Always consult your physician for chronic conditions.
              </p>
            </div>
          </div>
        </section>

        {/* Categories grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-emerald-200">
              Shop by concern
            </h2>
            <Link
              to="/categories"
              className="text-xs text-emerald-300 hover:text-emerald-100"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {demoCategories.map((cat) => (
              <Link
                key={cat.id}
                to={"/products/" + cat.id}   // ✅ FIXED (SAFE STRING)
                className="rounded-2xl bg-slate-900/80 border border-slate-800 
                  hover:border-emerald-400/70 hover:bg-slate-900/90 
                  p-3 flex flex-col items-center gap-2 text-center text-xs transition"
              >
                <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                  {cat.emoji}
                </div>
                <span className="text-slate-100">{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Product rows */}
        <section className="space-y-6">
          <Row title="Bestsellers in Ayurveda" products={demoProducts} />
          <Row title="New arrivals" products={demoProducts} />
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Row({ title, products }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-emerald-200">{title}</h3>
        <Link
          to="/products/all"
          className="text-[11px] text-slate-400 hover:text-emerald-200"
        >
          View more
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}