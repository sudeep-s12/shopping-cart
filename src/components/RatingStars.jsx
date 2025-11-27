export default function RatingStars({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
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
      <span className="text-[11px] text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}
