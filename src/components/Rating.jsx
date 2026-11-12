import { Star } from "lucide-react";
export default function Rating({ value, count, compact = false }) {
  return (
    <span
      className={`rating ${compact ? "rating-compact" : ""}`}
      aria-label={`Note ${value} sur 5${count ? `, ${count} avis` : ""}`}
    >
      {compact ? (
        <Star size={12} fill="currentColor" />
      ) : (
        Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            size={13}
            fill={index < Math.round(value) ? "currentColor" : "none"}
          />
        ))
      )}
      <span>
        {value.toFixed(1)}
        {count && !compact ? ` (${count} avis)` : ""}
      </span>
    </span>
  );
}
