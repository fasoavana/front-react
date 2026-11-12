import { test } from "vitest";
import assert from "node:assert/strict";
import {
  cartReducer,
  itemKey,
  sanitizeCart,
  totals,
} from "../src/context/cartState.js";

const first = {
  id: "silicone-sauge",
  color: "Sauge",
  model: "iPhone 16",
  quantity: 1,
};
test("les mêmes variantes fusionnent, les couleurs et téléphones restent distincts", () => {
  let cart = cartReducer([], { type: "add", item: first });
  cart = cartReducer(cart, { type: "add", item: first });
  cart = cartReducer(cart, { type: "add", item: { ...first, color: "Sable" } });
  cart = cartReducer(cart, {
    type: "add",
    item: { ...first, model: "iPhone 15" },
  });
  assert.equal(cart.length, 3);
  assert.equal(cart[0].quantity, 2);
});
test("les montants sont calculés en centimes et la livraison respecte le seuil de 60 euros", () => {
  assert.deepEqual(totals([]), { subtotal: 0, shipping: 0, total: 0 });
  assert.deepEqual(totals([first]), {
    subtotal: 29.9,
    shipping: 4.9,
    total: 34.8,
  });
  assert.deepEqual(totals([{ ...first, quantity: 2 }]), {
    subtotal: 59.8,
    shipping: 4.9,
    total: 64.7,
  });
  assert.deepEqual(totals([{ ...first, quantity: 3 }]), {
    subtotal: 89.7,
    shipping: 0,
    total: 89.7,
  });
});
test("un ancien panier malformé ne permet ni prix injecté ni variantes inconnues", () => {
  assert.deepEqual(sanitizeCart({}), []);
  assert.deepEqual(
    sanitizeCart([
      null,
      {},
      { ...first, id: "inconnu" },
      { ...first, model: "Autre" },
      { ...first, color: "Rouge" },
      { ...first, quantity: -1 },
      { ...first, quantity: 1.5 },
    ]),
    [],
  );
  assert.deepEqual(sanitizeCart([{ ...first, price: 0.01 }]), [first]);
});
test("quantités bornées et suppression indépendante des variantes", () => {
  const key = itemKey(first.id, first.color, first.model);
  let cart = sanitizeCart([
    { ...first, quantity: 9 },
    { ...first, quantity: 9 },
    { ...first, color: "Sable" },
  ]);
  assert.equal(cart[0].quantity, 10);
  cart = cartReducer(cart, { type: "quantity", key, quantity: 0 });
  assert.equal(cart[0].quantity, 1);
  cart = cartReducer(cart, { type: "remove", key });
  assert.equal(cart.length, 1);
  assert.equal(cart[0].color, "Sable");
  assert.deepEqual(cartReducer(cart, { type: "clear" }), []);
});
