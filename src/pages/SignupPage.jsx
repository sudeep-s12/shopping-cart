import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ⭐ Replace these with your real IDs:
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const APPLE_CLIENT_ID = "YOUR_APPLE_CLIENT_ID";
const APPLE_REDIRECT_URI = "https://yourdomain.com/auth/apple/callback";

function SignupPage() {
  const navigate = useNavigate();

  // ----------------- YOUR ORIGINAL STATES -----------------
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

  const googleClient = useRef(null);

  // ----------------- PASSWORD STRENGTH -----------------
  const checkPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 6) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (score <= 1) return "Weak";
    if (score === 2) return "Medium";
    if (score >= 3) return "Strong";
    return "";
  };

  // ----------------- NORMAL FORM SUBMIT -----------------
  const handleSubmit = (e) => {
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

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({
      firstName,
      lastName,
      phone,
      email,
      password,
      receiveOffers,
      provider: "local",
    });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully!");
    navigate("/login");
  };

  // ----------------- LOAD GOOGLE + APPLE -----------------
  useEffect(() => {
    // Google script
    const gScript = document.createElement("script");
    gScript.src = "https://accounts.google.com/gsi/client";
    gScript.async = true;
    gScript.defer = true;
    gScript.onload = () => {
      googleClient.current = window.google?.accounts?.oauth2?.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        ux_mode: "popup",
        callback: (response) => {
          console.log("Google code:", response.code);
          alert("Google login successful! (Send code to backend)");
        },
      });
    };
    document.body.appendChild(gScript);

    // Apple script
    const aScript = document.createElement("script");
    aScript.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    aScript.onload = () => {
      window.AppleID?.auth?.init({
        clientId: APPLE_CLIENT_ID,
        redirectURI: APPLE_REDIRECT_URI,
        scope: "name email",
        usePopup: true,
      });
    };
    document.body.appendChild(aScript);
  }, []);

  // ----------------- HANDLE GOOGLE LOGIN -----------------
  const handleGoogleSignup = () => {
    if (!googleClient.current) {
      setSocialError("Google is not ready yet. Try again.");
      return;
    }
    googleClient.current.requestCode();
  };

  // ----------------- HANDLE APPLE LOGIN -----------------
  const handleAppleSignup = async () => {
    try {
      const result = await window.AppleID.auth.signIn();
      console.log("Apple login:", result);
      alert("Apple login successful! (Send ID token to backend)");
    } catch (err) {
      setSocialError("Apple login failed or cancelled.");
    }
  };

  // ----------------- UI (YOUR ORIGINAL UI) -----------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-950/80 border border-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT IMAGE PANEL */}
        <div className="hidden md:flex w-[45%] relative bg-cover bg-center bg-[url('https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg')]">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/40 to-slate-900/90" />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[55%] p-8 sm:p-12">
          <h1 className="text-3xl font-semibold mb-2">Create an account</h1>

          <p className="text-sm text-slate-400 mb-6">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-violet-300 hover:text-violet-200 underline"
            >
              Log in
            </button>
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* FIRST + LAST NAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">First name</label>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3.5 py-2.5"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                {errors.firstName && (
                  <p className="text-xs text-rose-400">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-sm">Last name</label>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3.5 py-2.5"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
                {errors.lastName && (
                  <p className="text-xs text-rose-400">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="text-sm">Phone number</label>
              <input
                placeholder="For order updates"
                className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3.5 py-2.5"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {errors.phone && (
                <p className="text-xs text-rose-400">{errors.phone}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm">Email</label>
              <input
                type="email"
                className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3.5 py-2.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label className="text-sm">Password</label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-700 px-3.5 py-2.5 pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setStrength(checkPasswordStrength(e.target.value));
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password}</p>
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

            {/* CHECKBOXES */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                I agree to the Terms & Conditions
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-rose-400">{errors.agreeTerms}</p>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={receiveOffers}
                  onChange={(e) => setReceiveOffers(e.target.checked)}
                />
                Send me personalized offers & updates
              </label>
            </div>

            {/* NORMAL REGISTER BUTTON */}
            <button className="mt-2 w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 rounded-xl text-white font-semibold shadow-lg">
              Create account
            </button>

            {/* SOCIAL LOGIN DIVIDER */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-slate-700"></div>
              <span className="text-xs text-slate-400">Or register with</span>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* GOOGLE + APPLE BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* GOOGLE */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="py-2 bg-white text-black rounded-xl flex items-center justify-center gap-2"
              >
                <span className="font-bold text-lg">G</span> Google
              </button>

              {/* APPLE */}
              <button
                type="button"
                onClick={handleAppleSignup}
                className="py-2 bg-black text-white rounded-xl flex items-center justify-center gap-2"
              >
                <span className="text-xl"></span> Apple
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
  );
}

export default SignupPage;