// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

/* --------------------------------------------
   Reusable Text Input
--------------------------------------------- */
function TextField({ id, label, type = "text", value, onChange, error }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-200 tracking-wide"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-slate-900/60 px-4 py-2.5 text-sm text-slate-50 outline-none transition
        border-slate-700/70 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60
        placeholder:text-slate-500/80 backdrop-blur-xl
        ${error ? "border-rose-500 focus:ring-rose-500/70" : ""}`}
        placeholder={label}
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* --------------------------------------------
   Password Input with Eye Toggle
--------------------------------------------- */
function PasswordField({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-200 tracking-wide"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border bg-slate-900/60 px-4 py-2.5 pr-11 text-sm text-slate-50 outline-none transition
          border-slate-700/70 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60
          placeholder:text-slate-500/80 backdrop-blur-xl
          ${error ? "border-rose-500 focus:ring-rose-500/70" : ""}`}
          placeholder={label}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 text-lg"
        >
          {show ? "🙈" : "👁️"}
        </button>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* --------------------------------------------
   MAIN LOGIN PAGE
--------------------------------------------- */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "Enter valid email.";

    if (!password) e.password = "Password is required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const loginResult = await login({ email, password });

      let userId = loginResult?.user?.id || loginResult?.session?.user?.id;
      if (!userId) {
        const getUserRes = await supabase.auth.getUser();
        userId = getUserRes?.data?.user?.id;
      }
      if (!userId) throw new Error("Unable to determine user id after login");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, display_name, phone")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      const fullName = profile?.display_name || "";
      const firstName =
        fullName.trim().split(" ")[0] || email.split("@")[0] || "User";

      const userData = {
        id: userId,
        email,
        firstName,
        fullName,
        role: profile?.role || "customer",
      };
      localStorage.setItem("currentUser", JSON.stringify(userData));

      if (profile?.role === "admin") navigate("/admin");
      else navigate("/shop");
    } catch (err) {
      alert(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      alert("Enter your email first.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset",
    });

    if (error) alert(error.message);
    else alert("Password reset link sent to your email.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-900 flex items-center justify-center px-4">
      <div className="relative w-full max-w-5xl">
        {/* Soft glow behind card */}
        <div className="pointer-events-none absolute -inset-10 bg-gradient-to-r from-violet-700/30 via-fuchsia-500/20 to-emerald-400/20 blur-3xl opacity-70" />

        {/* Card */}
        <div className="relative w-full rounded-3xl border border-white/10 bg-slate-950/70 shadow-[0_25px_80px_rgba(15,23,42,0.9)] overflow-hidden backdrop-blur-2xl flex flex-col md:flex-row">
          {/* Left branding panel */}
          <div className="md:w-5/12 bg-gradient-to-br from-violet-600/80 via-indigo-700/80 to-slate-950/90 px-8 py-9 flex flex-col justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.25em] text-violet-100/70">
                SEVA SANJEEVANI
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white leading-tight">
                Welcome back,
                <br />
                let&apos;s continue your healing journey.
              </h2>
              <p className="text-sm text-violet-100/80 mt-2">
                Sign in to manage orders, wishlist, and personalized
                recommendations.
              </p>
            </div>

            <div className="mt-8 space-y-2 text-xs text-violet-100/70">
              <p>✔ Secure login with Supabase Auth</p>
              <p>✔ Access your cart from any device</p>
              <p>✔ Track orders and manage addresses</p>
            </div>
          </div>

          {/* Right form panel */}
          <div className="md:w-7/12 px-8 py-9 md:px-10 md:py-10 bg-slate-950/60">
            <div className="mb-7">
              <h1 className="text-2xl md:text-3xl font-semibold text-white">
                Sign in
              </h1>
              <p className="text-slate-400 text-sm mt-2">
                Enter your credentials to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <TextField
                id="email"
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />

              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  className="text-violet-300 hover:text-violet-200 hover:underline underline-offset-2"
                  onClick={handleResetPassword}
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/40 transition
                hover:shadow-violet-500/60 hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>

              <p className="pt-3 text-center text-xs text-slate-400">
                New here?{" "}
                <button
                  type="button"
                  className="font-semibold text-violet-300 hover:text-violet-200 hover:underline underline-offset-2"
                  onClick={() => navigate("/signup")}
                >
                  Create an account
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
