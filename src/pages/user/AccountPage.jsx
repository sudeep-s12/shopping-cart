// src/pages/user/AccountPage.jsx

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

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <div className="bg-slate-950 min-h-screen text-slate-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-lg font-semibold text-emerald-200">
          Your Account
        </h1>

        {/* ------------------------------------ */}
        {/* NOT LOGGED IN MESSAGE               */}
        {/* ------------------------------------ */}
        {!user && (
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 text-sm text-slate-400 text-center">
            You are not logged in.
            <Link
              to="/login"
              className="text-emerald-300 hover:text-emerald-100 underline ml-1"
            >
              Sign in
            </Link>
          </div>
        )}

        {/* ------------------------------------ */}
        {/* LOGGED-IN USER ACCOUNT DASHBOARD    */}
        {/* ------------------------------------ */}
        {user && (
          <>
            {/* PROFILE CARD */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 text-xs flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-50">
                  {displayName}
                </p>

                <p className="text-slate-400">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="text-[11px] rounded-full border border-slate-700 px-4 py-1.5 hover:border-rose-400 hover:text-rose-300 transition"
              >
                Log out
              </button>
            </div>

            {/* ACCOUNT OPTIONS */}
            <div className="grid sm:grid-cols-2 gap-4 text-xs">

              {/* Orders */}
              <Link
                to="/orders"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70 transition"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Your Orders
                </p>
                <p className="text-slate-400">
                  Track, return and review your past purchases.
                </p>
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70 transition"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Wishlist
                </p>
                <p className="text-slate-400">
                  Products you saved for later.
                </p>
              </Link>

              {/* Addresses */}
              <Link
                to="/checkout"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70 transition"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Saved Addresses
                </p>
                <p className="text-slate-400">
                  Manage your shipping addresses.
                </p>
              </Link>

              {/* Support */}
              <a
                href="mailto:sevasanjeevani.support@gmail.com"
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 hover:border-emerald-400/70 transition"
              >
                <p className="text-sm font-semibold text-emerald-200 mb-1">
                  Help & Support
                </p>
                <p className="text-slate-400">
                  Contact our team for assistance.
                </p>
              </a>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
