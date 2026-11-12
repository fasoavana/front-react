import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { products, colorValues, models, formatPrice } from "../data/products";
import ProductCard from "../components/ProductCard";
export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const query = params.get("recherche") || "",
    model = params.get("modele") || "",
    color = params.get("couleur") || "",
    category = params.get("collection") || "";
  const maximum = Number(params.get("prix")) || 45,
    sort = params.get("tri") || "selection",
    onlyNew = params.get("nouveautes") === "oui";
  const update = (key, value) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  const filtered = useMemo(() => {
    const normalize = (text) =>
      text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const result = products.filter(
      (product) =>
        (!model || product.models.includes(model)) &&
        (!color || product.colors.includes(color)) &&
        (!category || product.category === category) &&
        product.price <= maximum &&
        (!onlyNew || product.isNew) &&
        normalize(
          `${product.name} ${product.category} ${product.colors.join(" ")} ${product.models.join(" ")}`,
        ).includes(normalize(query)),
    );
    if (sort === "prix-croissant") result.sort((a, b) => a.price - b.price);
    if (sort === "prix-decroissant") result.sort((a, b) => b.price - a.price);
    if (sort === "avis") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [model, color, category, maximum, onlyNew, query, sort]);
  const hasFilters =
    query || model || color || category || maximum !== 45 || onlyNew;
  return (
    <div className="container-wide shop-page">
      <header className="page-heading">
        <span className="eyebrow">VOTRE NOUVEAU QUOTIDIEN</span>
        <h1>{onlyNew ? "Les nouveautés." : "La collection."}</h1>
        <p>Un style pour chaque envie. Une coque pour chaque vous.</p>
      </header>
      <div className="catalog-toolbar">
        <span>
          {filtered.length} pièce{filtered.length > 1 ? "s" : ""} à découvrir
        </span>
        <div>
          <button
            className="filter-mobile-toggle"
            onClick={() => setFiltersOpen(!filtersOpen)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
          >
            <SlidersHorizontal size={16} /> Filtres
          </button>
          <label className="sr-only" htmlFor="product-sort">
            Trier les produits
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(event) => update("tri", event.target.value)}
          >
            <option value="selection">Notre sélection</option>
            <option value="prix-croissant">Prix croissant</option>
            <option value="prix-decroissant">Prix décroissant</option>
            <option value="avis">Les mieux notées</option>
          </select>
        </div>
      </div>
      <div className="catalog-layout">
        <aside
          className={`catalog-filters ${filtersOpen ? "filters-open" : ""}`}
          id="catalog-filters"
          aria-label="Filtres du catalogue"
        >
          <div className="filter-heading">
            <h2>Affiner la sélection</h2>
            <SlidersHorizontal size={16} />
          </div>
          <fieldset>
            <legend>Votre téléphone</legend>
            {models.map((value) => (
              <label className="check-label" key={value}>
                <input
                  type="checkbox"
                  checked={model === value}
                  onChange={() =>
                    update("modele", model === value ? "" : value)
                  }
                />
                <span>{value}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>La collection</legend>
            {["Silicone", "Texturée", "Illustrée"].map((value) => (
              <label className="check-label" key={value}>
                <input
                  type="checkbox"
                  checked={category === value}
                  onChange={() =>
                    update("collection", category === value ? "" : value)
                  }
                />
                <span>{value}</span>
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend>Une touche de couleur</legend>
            <div className="filter-colors">
              {Object.entries(colorValues).map(([name, hex]) => (
                <button
                  key={name}
                  className={color === name ? "selected" : ""}
                  onClick={() => update("couleur", color === name ? "" : name)}
                  aria-label={`Couleur ${name}`}
                  aria-pressed={color === name}
                >
                  <span style={{ background: hex }} />
                  <small>{name}</small>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>Votre budget</legend>
            <label className="range-label" htmlFor="price-range">
              Jusqu’à {formatPrice(maximum)}
            </label>
            <input
              id="price-range"
              type="range"
              min="20"
              max="45"
              step="1"
              value={maximum}
              onChange={(event) => update("prix", event.target.value)}
            />
            <div className="range-extremes">
              <span>20 €</span>
              <span>45 €</span>
            </div>
          </fieldset>
          <label className="check-label">
            <input
              type="checkbox"
              checked={onlyNew}
              onChange={(event) =>
                update("nouveautes", event.target.checked ? "oui" : "")
              }
            />
            <span>Nouveautés uniquement</span>
          </label>
          {hasFilters && (
            <button className="reset-filters" onClick={() => setParams({})}>
              Tout réinitialiser <X size={14} />
            </button>
          )}
          <div className="filter-note">
            Le bon modèle fait
            <br />
            toute la différence.
            <span>
              Vérifiez les réglages de votre téléphone avant de choisir.
            </span>
          </div>
        </aside>
        <div>
          <form
            className="catalog-search"
            onSubmit={(event) => event.preventDefault()}
          >
            <Search size={17} />
            <label className="sr-only" htmlFor="catalog-query">
              Rechercher dans la collection
            </label>
            <input
              id="catalog-query"
              placeholder="Rechercher une coque, une couleur…"
              value={query}
              onChange={(event) => update("recherche", event.target.value)}
            />
            {query && (
              <button
                type="button"
                onClick={() => update("recherche", "")}
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </form>
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3 xl:gap-x-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Search size={34} strokeWidth={1} />
              <h2>Votre perle rare se fait discrète.</h2>
              <p>Essayez une autre couleur ou élargissez votre budget.</p>
              <button
                className="button button-dark"
                onClick={() => setParams({})}
              >
                Voir toute la collection
              </button>
            </div>
          )}
          <p className="catalog-end">
            {filtered.length
              ? "Vous avez vu toute notre sélection. Le plus dur, c’est de choisir."
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
