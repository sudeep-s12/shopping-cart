import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useUser } from "../../context/UserContext";
import { useNavigate, Link } from "react-router-dom";

export default function AccountPage() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <h1 className="text-lg font-semibold text-emerald-200">Your account</h1>

        {!user && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400">
            You are not logged in.
            <Link
              to="/login"
              className="text-emerald-300 hover:text-emerald-100 underline ml-1"
            >
              Sign in
            </Link>
          </div>
        )}

        {user && (
          <>
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 text-xs flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {user.name || "User"}
                </p>
                <p className="text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-[11px] rounded-full border border-slate-700 px-4 py-1.5 hover:border-rose-400 hover:text-rose-300"
              >
                Log out
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <Link
                to="/orders"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Your orders
                </p>
                <p className="text-slate-400">
                  Track, return and review past purchases.
                </p>
              </Link>
              <Link
                to="/wishlist"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Wishlist
                </p>
                <p className="text-slate-400">
                  All the products you are saving for later.
                </p>
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
