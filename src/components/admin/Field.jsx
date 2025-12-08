export default function Field({ label, value, onChange, placeholder, error }) {
  return (
    <div className="space-y-1">
      <label className="text-[0.7rem] text-slate-400">{label}</label>
      <input
        className={`w-full rounded-xl border bg-slate-900/70 px-3 py-2 text-xs outline-none 
        ${error ? "border-rose-500" : "border-slate-700"}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <p className="text-[0.65rem] text-rose-400">{error}</p>}
    </div>
  );
}
