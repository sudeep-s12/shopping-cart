import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

const demoCategories = [
  { id: "immunity", label: "Immunity Boosters", desc: "Kadhas, churna & tonics", emoji: "🛡️" },
  { id: "stress-sleep", label: "Stress & Sleep", desc: "Calming herbs & oils", emoji: "😴" },
  { id: "digestion", label: "Digestive Care", desc: "Triphala, jeera, ajwain", emoji: "🌿" },
  { id: "skin-hair", label: "Skin & Hair", desc: "Oils & lepas", emoji: "💆‍♀️" },
  { id: "women", label: "Women’s Wellness", desc: "PCOS, cycle support", emoji: "🌸" },
  { id: "kids", label: "Kids Care", desc: "Gentle tonics", emoji: "🧸" },
];

export default function CategoriesPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold text-emerald-200 mb-4">
          Shop by concern & category
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Browse Ayurveda essentials organised by health goals and daily needs.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products/${cat.id}`}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-400/70 hover:bg-slate-900/90 p-4 flex gap-3 transition"
            >
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg">
                {cat.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {cat.label}
                </p>
                <p className="text-xs text-slate-400 mt-1">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
