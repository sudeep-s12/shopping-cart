import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ LOGIN USING SUPABASE AUTH
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg("Invalid email or password.");
        return;
      }

      const user = data.user;

      // 2️⃣ FETCH PROFILE TO CHECK ADMIN ROLE
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        setErrorMsg("You are not authorized as admin.");
        await supabase.auth.signOut();
        return;
      }

      // 3️⃣ SAVE ADMIN FLAG
      localStorage.setItem("isAdmin", "true");

      // 4️⃣ REDIRECT TO ADMIN DASHBOARD
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/80 rounded-2xl border border-slate-700 shadow-xl p-8">
        <h1 className="text-2xl font-semibold mb-1">Admin Login</h1>
        <p className="text-sm text-slate-400 mb-6">
          Only authorized SevaSanjeevani admins can access this panel.
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Admin Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="admin@example.com"
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
              placeholder="Your admin password"
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
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-400 hover:to-fuchsia-400 transition disabled:opacity-40"
          >
            {loading ? "Checking..." : "Login as Admin"}
          </button>

          <div className="text-center text-xs text-slate-400 mt-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-violet-300 hover:underline"
            >
              Back to user login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
