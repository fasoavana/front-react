import { getProduct, models } from "../data/products.js";
export const MAX_QUANTITY = 10;
export const SHIPPING = 4.9;
export const FREE_SHIPPING_AT = 60;
export const itemKey = (id, color, model) => `${id}|${color}|${model}`;

// Prix et variantes sont revalidés au chargement du stockage navigateur.
export function sanitizeCart(value) {
  if (!Array.isArray(value)) return [];
  const entries = new Map();
  for (const item of value) {
    const product = getProduct(item?.id);
    if (
      !product ||
      !product.colors.includes(item.color) ||
      !models.includes(item.model)
    )
      continue;
    if (!Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const key = itemKey(item.id, item.color, item.model);
    const quantity = Math.min(
      MAX_QUANTITY,
      (entries.get(key)?.quantity || 0) + item.quantity,
    );
    entries.set(key, {
      id: item.id,
      color: item.color,
      model: item.model,
      quantity,
    });
  }
  return [...entries.values()];
}
export function cartReducer(state, action) {
  switch (action.type) {
    case "add":
      return sanitizeCart([...state, action.item]);
    case "quantity":
      return state.map((item) =>
        itemKey(item.id, item.color, item.model) === action.key
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(
                  MAX_QUANTITY,
                  Math.trunc(Number(action.quantity)) || 1,
                ),
              ),
            }
          : item,
      );
    case "remove":
      return state.filter(
        (item) => itemKey(item.id, item.color, item.model) !== action.key,
      );
    case "clear":
      return [];
    default:
      return state;
  }
}
export function totals(items) {
  const subtotalCents = items.reduce(
    (sum, item) =>
      sum + Math.round(getProduct(item.id).price * 100) * item.quantity,
    0,
  );
  const subtotal = subtotalCents / 100;
  const shipping = !items.length || subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING;
  return {
    subtotal,
    shipping,
    total: (subtotalCents + Math.round(shipping * 100)) / 100,
  };
}
