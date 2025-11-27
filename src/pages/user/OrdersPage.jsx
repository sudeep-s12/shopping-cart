import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { Link } from "react-router-dom";

// later: fetch from backend
const demoOrders = [];

export default function OrdersPage() {
  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <h1 className="text-lg font-semibold text-emerald-200">Your orders</h1>
        {demoOrders.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400">
            You have no orders yet.
            <Link
              to="/home"
              className="text-emerald-300 hover:text-emerald-100 underline ml-1"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* later: map orders */}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
