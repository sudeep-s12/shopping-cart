// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* --------------------------------------------
   Reusable Text Input
--------------------------------------------- */
function TextField({ id, label, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition
        border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/80
        ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/80" : ""}`}
      />

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* --------------------------------------------
   Password Field With Eye Toggle
--------------------------------------------- */
function PasswordField({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border bg-slate-900/70 px-3.5 py-2.5 pr-10 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition
          border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/80
          ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/80" : ""}`}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-2 flex items-center px-2 text-slate-400 hover:text-slate-100"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            // eye-off icon
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 3 16 2 12c.46-1.84 1.52-3.55 3.06-5.06M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12M1 1l22 22" />
            </svg>
          ) : (
            // eye icon
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

/* --------------------------------------------
   Checkbox
--------------------------------------------- */
function CheckboxField({ id, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-500"
      />
      <span>{label}</span>
    </label>
  );
}

/* --------------------------------------------
   Simple Social Buttons (dummy handlers)
--------------------------------------------- */
function SocialButton({ variant, label, children, onClick }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

  const variants = {
    google: "bg-white text-slate-900 hover:bg-slate-200",
    apple: "bg-slate-800 text-white hover:bg-slate-700",
  };

  return (
    <button
      type="button"
      className={base + " " + (variants[variant] || "")}
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/* --------------------------------------------
   MAIN LOGIN PAGE
--------------------------------------------- */
export default function LoginPage() {
  const navigate = useNavigate();

  // mode: "login" | "resetEmail" | "resetOtp"
  const [mode, setMode] = useState("login");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtpInput, setResetOtpInput] = useState("");
  const [resetGeneratedOtp, setResetGeneratedOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetErrors, setResetErrors] = useState({});
  const [resetLoading, setResetLoading] = useState(false);

  // Hardcoded admin credentials
  const ADMIN_EMAIL = "admin@sevasanjeevani.com";
  const ADMIN_PASS = "Admin@123";

  /* ---------------- LOGIN LOGIC ---------------- */

  const validateLogin = () => {
    const errs = {};

    if (!email) errs.email = "Email is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      errs.email = "Enter a valid email address.";

    if (!password) errs.password = "Password is required.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // 1) ADMIN LOGIN
      if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        const adminUser = {
          email: ADMIN_EMAIL,
          name: "Admin",
          role: "admin",
        };
        localStorage.setItem("currentUser", JSON.stringify(adminUser));
        alert("Admin logged in");
        navigate("/admin");
        return;
      }

      // 2) USER LOGIN (from localStorage)
      const users = JSON.parse(localStorage.getItem("users") || "[]");

      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        alert("Invalid email or password. Please sign up first or try again.");
        return;
      }

      const currentUser = {
        ...foundUser,
        role: "user",
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      alert("Welcome back, " + (foundUser.firstName || foundUser.email) + "!");
      navigate("/shop");
    }, 800);
  };

  /* ---------------- FORGOT PASSWORD FLOW ---------------- */

  const handleForgotClick = () => {
    setMode("resetEmail");
    setResetEmail("");
    setResetOtpInput("");
    setResetGeneratedOtp("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setResetErrors({});
  };

  const handleBackToLogin = () => {
    setMode("login");
    setErrors({});
    setResetErrors({});
  };

  const handleResetEmailSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!resetEmail) {
      errs.resetEmail = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(resetEmail)) {
      errs.resetEmail = "Enter a valid email address.";
    }

    setResetErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u) => u.email === resetEmail);

    if (!user) {
      setResetErrors({
        resetEmail: "No account found with this email.",
      });
      return;
    }

    // Generate 6-digit OTP
    const otpNumber = Math.floor(100000 + Math.random() * 900000);
    const otp = String(otpNumber);

    setResetGeneratedOtp(otp);
    setResetOtpInput("");
    setResetNewPassword("");
    setResetConfirmPassword("");

    alert("Your OTP code is: " + otp + " (demo only, not sent by email)");
    setMode("resetOtp");
  };

  const handleResetOtpSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!resetOtpInput) {
      errs.resetOtpInput = "OTP is required.";
    } else if (resetOtpInput !== resetGeneratedOtp) {
      errs.resetOtpInput = "Incorrect OTP. Please check and try again.";
    }

    if (!resetNewPassword) {
      errs.resetNewPassword = "New password is required.";
    }
    if (!resetConfirmPassword) {
      errs.resetConfirmPassword = "Please re-enter the new password.";
    } else if (
      resetNewPassword &&
      resetConfirmPassword &&
      resetNewPassword !== resetConfirmPassword
    ) {
      errs.resetConfirmPassword = "Passwords do not match.";
    }

    setResetErrors(errs);
    if (Object.keys(errs).length !== 0) return;

    setResetLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updated = users.map((u) =>
        u.email === resetEmail ? { ...u, password: resetNewPassword } : u
      );
      localStorage.setItem("users", JSON.stringify(updated));

      setResetLoading(false);
      alert("Password has been reset successfully. Please log in.");

      setEmail(resetEmail);
      setPassword("");
      setMode("login");
    }, 800);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-violet-900 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-slate-950/80 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* -------- Left Branding Panel -------- */}
        <div className="relative md:w-[45%] bg-gradient-to-br from-violet-700 via-slate-900 to-slate-950">
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg')] bg-cover bg-center opacity-40" />

          <div className="relative p-6 flex flex-col h-full justify-between">
            <div className="flex justify-between items-center">
              <h1 className="text-white text-lg tracking-[0.2em] font-semibold">
                AMU
              </h1>

              <button
                className="text-xs bg-white/10 px-3 py-1.5 rounded-full text-white backdrop-blur-md border border-white/20"
                type="button"
                onClick={() => navigate("/")}
              >
                ← Back to website
              </button>
            </div>

            <div>
              <h2 className="text-white text-2xl font-semibold leading-tight">
                Welcome back,
              </h2>
              <h2 className="text-white text-2xl font-semibold leading-tight">
                we missed you.
              </h2>
            </div>

            <div className="flex justify-center gap-2 pb-4">
              <span className="w-5 h-2 bg-white rounded-full" />
              <span className="w-2 h-2 bg-white/40 rounded-full" />
              <span className="w-2 h-2 bg-white/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* -------- Right Panel (Login / Reset) -------- */}
        <div className="md:w-[55%] p-10">
          {mode === "login" && (
            <>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Welcome back
              </h1>
              <p className="text-slate-400 mb-8">
                Sign in to continue shopping, track your orders and manage your
                wishlist.
              </p>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <TextField
                  id="email"
                  label="Email"
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

                <div className="flex justify-between items-center">
                  <CheckboxField
                    id="remember"
                    label="Remember me"
                    checked={remember}
                    onChange={setRemember}
                  />

                  <button
                    type="button"
                    className="text-xs text-violet-300 hover:underline"
                    onClick={handleForgotClick}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 flex justify-center disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <div className="flex-1 h-px bg-slate-700" />
                  Or continue with
                  <div className="flex-1 h-px bg-slate-700" />
                </div>

                {/* Social Buttons – demo only */}
                <div className="grid grid-cols-2 gap-3">
                  <SocialButton
                    variant="google"
                    label="Google"
                    onClick={() =>
                      alert("Google sign-in will be connected to backend later.")
                    }
                  >
                    <span className="bg-white text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      G
                    </span>
                  </SocialButton>

                  <SocialButton
                    variant="apple"
                    label="Apple"
                    onClick={() =>
                      alert("Apple sign-in will be connected to backend later.")
                    }
                  >
                    <span></span>
                  </SocialButton>
                </div>

                {/* Create account link */}
                <p className="text-center text-slate-400 text-sm">
                  New here?{" "}
                  <button
                    type="button"
                    className="text-violet-300 hover:underline"
                    onClick={() => navigate("/signup")}
                  >
                    Create account
                  </button>
                </p>
              </form>
            </>
          )}

          {mode === "resetEmail" && (
            <>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Reset password
              </h1>
              <p className="text-slate-400 mb-6">
                Enter the email linked to your account and we&apos;ll send you a
                one-time code to reset your password.
              </p>

              <form onSubmit={handleResetEmailSubmit} className="space-y-5">
                <TextField
                  id="reset-email"
                  label="Account email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  error={resetErrors.resetEmail}
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 flex justify-center"
                >
                  Send OTP
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs text-slate-400 hover:text-slate-200 hover:underline mt-2"
                >
                  Back to sign in
                </button>
              </form>
            </>
          )}

          {mode === "resetOtp" && (
            <>
              <h1 className="text-3xl font-semibold text-white mb-2">
                Verify code
              </h1>
              <p className="text-slate-400 mb-6">
                We sent a one-time code to{" "}
                <span className="font-medium text-slate-100">
                  {resetEmail}
                </span>
                . Enter the code below and set your new password.
              </p>

              <form onSubmit={handleResetOtpSubmit} className="space-y-5">
                <TextField
                  id="otp"
                  label="OTP code"
                  type="text"
                  value={resetOtpInput}
                  onChange={(e) => setResetOtpInput(e.target.value)}
                  error={resetErrors.resetOtpInput}
                  placeholder="6-digit code"
                />

                <PasswordField
                  id="new-password"
                  label="New password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  error={resetErrors.resetNewPassword}
                />

                <PasswordField
                  id="confirm-password"
                  label="Re-enter new password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  error={resetErrors.resetConfirmPassword}
                />

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2.5 rounded-xl font-semibold hover:opacity-90 flex justify-center disabled:opacity-60"
                >
                  {resetLoading ? "Resetting..." : "Reset password"}
                </button>

                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="w-full text-xs text-slate-400 hover:text-slate-200 hover:underline mt-2"
                >
                  Back to sign in
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}