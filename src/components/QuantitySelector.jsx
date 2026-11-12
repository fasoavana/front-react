import { Minus, Plus } from "lucide-react";
export default function QuantitySelector({
  value,
  onChange,
  label = "Quantité",
}) {
  return (
    <div className="quantity-selector" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`Diminuer ${label.toLowerCase()}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label={`Augmenter ${label.toLowerCase()}`}
        disabled={value >= 10}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
