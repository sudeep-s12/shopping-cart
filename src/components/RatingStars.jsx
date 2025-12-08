export default function RatingStars({ rating }) {
  const safeRating = Number.isFinite(rating) ? rating : 0;
  const full = Math.floor(safeRating);
  const hasHalf = safeRating - full >= 0.5;
  const total = 5;

  return (
    <div className="flex items-center gap-1 text-[11px]">
      {Array.from({ length: total }).map((_, i) => {
        if (i < full) return <span key={i}>⭐</span>;
        if (i === full && hasHalf) return <span key={i}>⭐</span>;
        return (
          <span key={i} className="text-slate-600">
            ⭐
          </span>
        );
      })}
      <span className="text-[11px] text-slate-400 ml-1">{safeRating.toFixed(1)}</span>
    </div>
  );
}
