"use client";

const STAR = "⭐";

export function StarRatingDisplay(props: { rating: number; showValue?: boolean; size?: "sm" | "md" | "lg"; className?: string }) {
  const { rating, showValue = false, size = "md", className = "" } = props;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const sizeClass = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass} ${className}`} aria-label={`${rating} yıldız`}>
      {Array.from({ length: full }, (_, i) => (<span key={i} aria-hidden>{STAR}</span>))}
      {hasHalf && <span aria-hidden>½</span>}
      {Array.from({ length: empty }, (_, i) => (<span key={i} className="opacity-30" aria-hidden>{STAR}</span>))}
      {showValue && <span className="ml-1 font-semibold tabular-nums">{rating.toFixed(1)}</span>}
    </span>
  );
}

export function StarRatingInput(props: { value: number; onChange: (r: number) => void; max?: number; className?: string }) {
  const { value, onChange, max = 5, className = "" } = props;
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }, (_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)} className="text-2xl leading-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded" aria-label={`${i + 1} yıldız`}>
          <span className={value >= i + 1 ? "" : "opacity-30"}>{STAR}</span>
        </button>
      ))}
    </div>
  );
}
