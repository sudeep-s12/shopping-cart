import React from "react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold mb-2">
          Welcome to SevaSanjeevani
        </h1>
        <p className="text-sm text-slate-400">
          You are logged in as a customer. Here you can later see product lists,
          offers, and start shopping.
        </p>
      </div>
    </div>
  );
}
