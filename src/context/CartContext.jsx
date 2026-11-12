import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { cartReducer, itemKey, sanitizeCart, totals } from "./cartState";
const CartContext = createContext(null);
const STORAGE_KEY = "coque-style-cart-v1";
const loadCart = () => {
  try {
    return sanitizeCart(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return [];
  }
};
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);
  const [notice, setNotice] = useState("");
  const timer = useRef();
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* Le panier reste utilisable si le navigateur refuse le stockage. */
    }
  }, [items]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const notify = useCallback((message) => {
    clearTimeout(timer.current);
    setNotice(message);
    timer.current = setTimeout(() => setNotice(""), 3500);
  }, []);
  const addItem = (
    product,
    color = product.color,
    model = product.models[0],
    quantity = 1,
  ) => {
    const current = items.find(
      (item) =>
        itemKey(item.id, item.color, item.model) ===
        itemKey(product.id, color, model),
    );
    if (current?.quantity >= 10) {
      notify("Maximum de 10 exemplaires par modèle.");
      return;
    }
    dispatch({ type: "add", item: { id: product.id, color, model, quantity } });
    notify(`${product.name} ajoutée au panier`);
  };
  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        notice,
        notify,
        dismissNotice: () => setNotice(""),
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        ...totals(items),
        setQuantity: (key, quantity) =>
          dispatch({ type: "quantity", key, quantity }),
        removeItem: (key) => dispatch({ type: "remove", key }),
        clearCart: () => dispatch({ type: "clear" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("CartProvider doit englober les composants du panier.");
  return context;
}
