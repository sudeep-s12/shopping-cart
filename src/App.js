import React, { useState } from "react";

// Reusable text field
function TextField({ id, label, type = "text", value, onChange, error, ...props }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-200"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border bg-slate-900/70 px-3.5 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 outline-none transition
        border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/80
        ${error ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/80" : ""}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

// Password field with eye toggle
function PasswordField({ id, label, value, onChange, error }) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-200"
      >
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
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-2 flex items-center px-2 rounded-lg text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {/* Simple eye icon */}
          {show ? (
            // eye-off (slashed)
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.5 10.5A3 3 0 0 0 13.5 13.5" />
              <path d="M9 5.5A10.4 10.4 0 0 1 12 5c5 0 9 4 10 7-1 2.6-3 4.9-5.4 6.4" />
              <path d="M6.3 6.3A10.4 10.4 0 0 0 2 12c1 2.6 3.1 4.9 5.6 6.4 1.3.4 2.4.6 3.4.6 1 0 2.1-.2 3.1-.5" />
            </svg>
          ) : (
            // eye-on
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

// Checkbox with link
function CheckboxField({ id, checked, onChange, label, linkText, linkHref, error }) {
  return (
    <div className="space-y-1">
      <div className="flex items-start gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900/80 text-violet-500 focus:ring-violet-500"
        />
        <label
          htmlFor={id}
          className="text-xs sm:text-sm text-slate-300"
        >
          {label}{" "}
          <a
            href={linkHref}
            className="font-medium text-violet-300 hover:text-violet-200 hover:underline underline-offset-4"
          >
            {linkText}
          </a>
        </label>
      </div>
      {error && (
        <p className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

// Social login button
function SocialButton({ variant, label, children }) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

  const variants = {
    google:
      "border border-slate-600 bg-slate-900/40 text-slate-100 hover:bg-slate-800/80",
    apple:
      "border border-slate-400 bg-slate-100 text-slate-900 hover:bg-white",
  };

  return (
    <button type="button" className={`${base} ${variants[variant]}`}>
      {children}
      <span>{label}</span>
    </button>
  );
}

function App() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = "You must agree to the Terms & Conditions.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate async submit
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Account created (simulated).");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 text-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl rounded-3xl bg-slate-950/80 border border-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden flex flex-col md:flex-row md:divide-x md:divide-slate-800/80">
        {/* Right panel: Form (on top on mobile) */}
        <div className="order-1 md:order-2 md:w-[55%]">
          <div className="h-full px-6 py-7 sm:px-10 sm:py-10 lg:px-12 lg:py-12 flex flex-col">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                Create an account
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-medium text-violet-300 hover:text-violet-200 hover:underline underline-offset-4"
                >
                  Log in
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  id="firstName"
                  label="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={errors.firstName}
                  autoComplete="given-name"
                />
                <TextField
                  id="lastName"
                  label="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={errors.lastName}
                  autoComplete="family-name"
                />
              </div>

              <TextField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                autoComplete="email"
              />

              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />

              <CheckboxField
                id="terms"
                checked={agreeTerms}
                onChange={setAgreeTerms}
                label="I agree to the"
                linkText="Terms & Conditions"
                linkHref="#"
                error={errors.agreeTerms}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition
                hover:from-violet-400 hover:to-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting && (
                  <span className="mr-2 inline-block h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                )}
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>

              {/* Separator */}
              <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
                <div className="h-px flex-1 bg-slate-700/80" />
                <span>Or register with</span>
                <div className="h-px flex-1 bg-slate-700/80" />
              </div>

              {/* Social buttons */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SocialButton variant="google" label="Google">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-900">
                    G
                  </span>
                </SocialButton>

                <SocialButton variant="apple" label="Apple">
                  <span className="inline-flex h-5 w-5 items-center justify-center">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M17.3 19.3c-.9.9-1.9 1-2.4 1-.5 0-1-.3-1.8-.3s-1.3.3-1.9.3c-.8 0-1.7-.8-2.4-1.6C7.7 17.8 7 16.3 7 14.9c0-1.6.7-2.4 1.9-3.1.7-.4 1.6-.7 2.5-.7.6 0 1.2.2 1.8.2.5 0 1.1-.2 1.9-.4.3 0 .6-.1.9-.1.7 0 1.5.3 2.1.8-.6.4-1.1 1.1-1.1 2.1 0 1.1.6 1.9 1.3 2.3-.4.8-.9 1.5-1.3 1.9zM14.8 8.9c-.5.6-1.3 1.1-2 1.1-.1-.7.2-1.4.6-1.9.5-.6 1.3-1.1 2-1.1.1.7-.2 1.4-.6 1.9z" />
                    </svg>
                  </span>
                </SocialButton>
              </div>
            </form>
          </div>
        </div>

        {/* Left panel: Branding / image */}
        <div className="relative order-2 md:order-1 md:w-[45%] bg-gradient-to-br from-violet-700/70 via-slate-900/80 to-slate-950 flex">
          <div className="relative flex-1 bg-cover bg-center bg-[url('https://images.pexels.com/photos/2101187/pexels-photo-2101187.jpeg')]">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-purple-900/60" />

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-5">
              <div className="text-lg font-semibold tracking-[0.25em] text-white">
                AMU
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-slate-50 backdrop-blur-md border border-white/20 hover:bg-white/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-100/70"
              >
                <span className="text-xs">←</span>
                <span>Back to website</span>
              </button>
            </div>

            {/* Bottom content */}
            <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 sm:px-8 sm:pb-10">
              <div className="max-w-xs sm:max-w-sm">
                <p className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                  Capturing Moments,
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                  Creating Memories
                </p>
              </div>

              {/* Slider dots */}
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-5 rounded-full bg-white/90" />
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                  <span className="h-2 w-2 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      
    </div>
  );
}

export default App;
