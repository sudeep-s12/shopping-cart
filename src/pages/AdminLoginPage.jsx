import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const adminEmail = "admin@sevasanjeevani.com";
    const adminPassword = "Admin@123";

    const isAdmin =
      email.trim().toLowerCase() === adminEmail.toLowerCase() &&
      password === adminPassword;

    if (isAdmin) {
      navigate("/admin");
    } else {
      setErrorMsg("Invalid admin email or password.");
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
              placeholder="admin@sevasanjeevani.com"
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
              placeholder="Admin@123"
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
            Login as Admin
          </button>

          <div className="text-center text-xs text-slate-400 mt-3">
            <button
              type="button"
              onClick={() => navigate("/user-login")}
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
