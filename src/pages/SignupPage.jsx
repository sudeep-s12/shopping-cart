// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabaseClient";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState("");

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [receiveOffers, setReceiveOffers] = useState(false);

  const [errors, setErrors] = useState({});
  const [socialError, setSocialError] = useState("");

  const checkPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password.trim()) newErrors.password = "Password is required";
    if (!agreeTerms) newErrors.agreeTerms = "You must agree to continue";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const signupResult = await signup({
        email,
        password,
        display_name: firstName + " " + lastName,
      });

      let userId = signupResult?.user?.id || signupResult?.session?.user?.id;

      if (!userId) {
        const getUserRes = await supabase.auth.getUser();
        userId = getUserRes?.data?.user?.id;
      }

      if (!userId) throw new Error("Unable to determine user id after signup");

      await supabase.from("profiles").upsert({
        id: userId,
        display_name: `${firstName} ${lastName}`,
        role: "customer",
        phone,
        receive_offers: receiveOffers,
      });

      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (err) {
      setSocialError(err.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-slate-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-5xl">
        {/* Glow */}
        <div className="pointer-events-none absolute -inset-10 bg-gradient-to-r from-violet-700/30 via-fuchsia-500/25 to-emerald-400/20 blur-3xl opacity-80" />

        {/* Card */}
        <div className="relative w-full rounded-3xl bg-slate-950/80 border border-white/10 shadow-[0_22px_70px_rgba(15,23,42,0.95)] backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row">
          {/* LEFT IMAGE / BRAND PANEL */}
          <div className="hidden md:flex w-[45%] relative bg-cover bg-center bg-[url('https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg')]">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-slate-900/95" />
            <div className="relative z-10 p-8 flex flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.25em] text-violet-100/80">
                  SEVA SANJEEVANI
                </p>
                <h2 className="text-3xl font-semibold text-white leading-tight">
                  Begin your wellness
                  <br />
                  journey with us.
                </h2>
                <p className="text-sm text-violet-100/85 mt-2">
                  Create an account to save your favourites, track orders,
                  and receive personalized ayurvedic recommendations.
                </p>
              </div>

              <div className="mt-8 space-y-1 text-xs text-violet-100/75">
                <p>✔ One account across all devices</p>
                <p>✔ Faster checkout and saved addresses</p>
                <p>✔ Exclusive offers and early access</p>
              </div>
            </div>
          </div>

          {/* RIGHT FORM PANEL */}
          <div className="w-full md:w-[55%] p-8 sm:p-10">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl sm:text-3xl font-semibold">
                Create an account
              </h1>

              {/* Back to login button */}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-violet-400 hover:text-violet-200"
              >
                ← Back to login
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-7">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                type="button"
                className="text-violet-300 hover:text-violet-200 underline underline-offset-2"
              >
                Log in
              </button>
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* FIRST + LAST NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-200">
                    First name
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60 backdrop-blur-xl"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Sudeep"
                  />
                  {errors.firstName && (
                    <p className="text-xs text-rose-400 mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-200">
                    Last name
                  </label>
                  <input
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60 backdrop-blur-xl"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kumar"
                  />
                  {errors.lastName && (
                    <p className="text-xs text-rose-400 mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* PHONE */}
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Phone number
                </label>
                <input
                  placeholder="For order updates"
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60 backdrop-blur-xl"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700/80 px-3.5 py-2.5 text-sm text-slate-50 outline-none placeholder:text-slate-500/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60 backdrop-blur-xl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-slate-200">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700/80 px-3.5 py-2.5 pr-11 text-sm text-slate-50 outline-none placeholder:text-slate-500/80 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/60 backdrop-blur-xl"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setStrength(checkPasswordStrength(e.target.value));
                    }}
                    placeholder="At least 6 characters"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-100 text-xs"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.password}
                  </p>
                )}

                {password && (
                  <p className="text-xs mt-1">
                    Strength:{" "}
                    <span
                      className={
                        strength === "Weak"
                          ? "text-red-400"
                          : strength === "Medium"
                          ? "text-yellow-300"
                          : "text-green-400"
                      }
                    >
                      {strength}
                    </span>
                  </p>
                )}
              </div>

              {/* TERMS + OFFERS */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-500"
                  />
                  I agree to the Terms & Conditions
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-400 mt-1">
                    {errors.agreeTerms}
                  </p>
                )}

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={receiveOffers}
                    onChange={(e) => setReceiveOffers(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-violet-500"
                  />
                  Send me personalized offers & wellness tips
                </label>
              </div>

              {/* SUBMIT */}
              <button className="mt-2 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-violet-500/40 hover:shadow-violet-500/60 hover:-translate-y-[1px] transition">
                Create account
              </button>

              {/* Social buttons (UI only) */}
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-400">
                  Or continue with
                </span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-3 opacity-40 cursor-not-allowed">
                <button
                  type="button"
                  className="py-2 rounded-xl bg-white text-black text-xs font-medium"
                >
                  <span className="font-bold text-lg mr-1">G</span> Google
                </button>
                <button
                  type="button"
                  className="py-2 rounded-xl bg-black text-white text-xs font-medium"
                >
                  <span className="text-xl mr-1"></span> Apple
                </button>
              </div>

              {socialError && (
                <p className="text-xs text-rose-400 text-center mt-2">
                  {socialError}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
