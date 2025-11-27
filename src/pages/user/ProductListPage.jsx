import { useParams } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";

const demoProducts = [
  // reuse / extend later
];

export default function ProductListPage() {
  const { categoryId } = useParams();

  const friendlyName =
    categoryId === "all"
      ? "All Ayurveda Products"
      : categoryId?.replace("-", " ");

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 grid gap-6 md:grid-cols-[240px_minmax(0,1fr)]">
        {/* Filters */}
        <aside className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <h3 className="text-sm font-semibold mb-2 text-emerald-200">
              Filters
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-slate-200">Price</p>
              <input type="range" min={0} max={2000} className="w-full" />
              <p className="font-semibold mt-3 text-slate-200">Rating</p>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 4★ & above
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" /> 3★ & above
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-semibold text-emerald-200 capitalize">
                {friendlyName}
              </h1>
              <p className="text-xs text-slate-400">
                Showing curated ayurvedic products for this category.
              </p>
            </div>
            <select className="rounded-xl bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-xs">
              <option>Sort: Popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          {demoProducts.length === 0 ? (
            <p className="text-xs text-slate-500 mt-6">
              (Connect backend here to load products for category:{" "}
              <span className="font-mono">{categoryId}</span>)
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {demoProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
