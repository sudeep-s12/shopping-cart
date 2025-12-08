import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUserLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please fill in both email and password.");
      return;
    }

    // TEMPORARY: Accept all login attempts as normal users.
    // Later, replace with Supabase auth like LoginPage.
    navigate("/shop"); // FIXED ROUTE
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-1">User Login</h1>
        <p className="text-sm text-slate-400 mb-6">
          Sign in to continue shopping on SevaSanjeevani.
        </p>

        <form onSubmit={handleUserLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {errorMsg && (
            <p className="text-sm text-rose-400">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-400 hover:to-fuchsia-400 transition"
          >
            Login
          </button>

          <div className="flex justify-between items-center text-xs text-slate-400 mt-3">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-violet-300 hover:underline"
            >
              Create account
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin-login")}
              className="text-violet-300 hover:underline"
            >
              Admin login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
