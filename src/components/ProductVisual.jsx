import { colorValues } from "../data/products";
// Le dessin de coque reste visible si la photographie distante ne charge pas.
export default function ProductVisual({
  product,
  color = product.color,
  className = "",
  decorative = false,
}) {
  return (
    <div
      className={`product-visual ${className}`}
      style={{
        "--case-color": colorValues[color],
        "--scene-color": product.background,
      }}
    >
      <div
        className={`phone-case pattern-${product.pattern}`}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : `${product.name}, coque ${color}`}
        aria-hidden={decorative || undefined}
      >
        {product.pattern === "grain" && (
          <img
            className="case-texture"
            src={product.imageUrl}
            alt=""
            loading="lazy"
          />
        )}
        <span className="case-camera">
          <i />
          <i />
          <i />
          <b />
          <em />
        </span>
        {product.pattern === "botanical" && (
          <span className="botanical-art" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
        <span className="case-brand">c&s.</span>
        <span className="case-button" />
      </div>
    </div>
  );
}
