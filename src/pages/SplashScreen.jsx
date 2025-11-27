// src/pages/SplashScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import sevaLogo from "../assets/seva-sanjeevani-logo.png";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-900">
      {/* Soft glowing blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute inset-y-1/4 -right-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      {/* Main Card */}
      <div className="relative splash-fade-in">
        <div className="mx-auto flex flex-col items-center gap-6 rounded-3xl border border-emerald-200/15 bg-slate-950/80 px-8 py-10 sm:px-12 sm:py-12 shadow-[0_28px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl">
          
          {/* Logo inside glowing ring */}
          <div className="relative mb-2">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400 via-amber-300 to-emerald-500 opacity-70 blur-md" />

            {/* Circle container */}
            <div
              className="relative flex h-28 w-28 sm:h-32 sm:w-32
                          items-center justify-center rounded-full
                          bg-slate-950/90 border border-emerald-200/60
                          logo-float shadow-[0_0_25px_rgba(0,0,0,0.6)]"
            >
              {/* Perfect circular logo, fully visible */}
              <img
                src={sevaLogo}
                alt="Seva Sanjeevani"
                className="w-[88%] h-[88%] object-contain rounded-full"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-[1.4rem] sm:text-2xl font-semibold tracking-[0.25em] uppercase text-emerald-50">
              SEVA{" "}
              <span className="bg-gradient-to-r from-amber-200 via-emerald-200 to-amber-300 bg-clip-text text-transparent">
                SANJEEVANI
              </span>
            </h1>

            {/* Slogan */}
            <p className="slogan-reveal text-xs sm:text-sm text-emerald-100/90">
              “Healthy Choices, Happier Living”
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-[0.7rem] sm:text-xs text-emerald-100/70 mt-2">
            Curating wellness, care & mindful living for every day.
          </p>

          {/* Loading bar */}
          <div className="mt-4 w-40 sm:w-52">
            <div className="h-1.5 rounded-full bg-emerald-900/70 overflow-hidden">
              <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-emerald-200 loading-bar" />
            </div>
            <p className="mt-2 text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.18em] text-emerald-200/80 text-center">
              Preparing your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}