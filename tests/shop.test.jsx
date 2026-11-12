import React from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "../src/App";
import { CartProvider } from "../src/context/CartContext";

beforeEach(() => {
  localStorage.clear();
  window.scrollTo = vi.fn();
});
afterEach(cleanup);
function openPage(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CartProvider>
        <App />
      </CartProvider>
    </MemoryRouter>,
  );
}

test("la recherche et les filtres réduisent réellement les huit produits", async () => {
  const user = userEvent.setup();
  openPage("/boutique");
  expect(screen.getAllByRole("article")).toHaveLength(8);
  const search = screen.getByLabelText("Rechercher dans la collection");
  await user.type(search, "lavande");
  expect(screen.getAllByRole("article")).toHaveLength(1);
  expect(screen.getByRole("heading", { name: "La Studio" })).toBeTruthy();
  await user.clear(search);
  await user.click(screen.getByLabelText("Illustrée"));
  expect(screen.getAllByRole("article")).toHaveLength(2);
  fireEvent.change(screen.getByLabelText(/Jusqu’à/), {
    target: { value: "20" },
  });
  expect(screen.queryAllByRole("article")).toHaveLength(0);
  await user.click(
    screen.getByRole("button", { name: "Voir toute la collection" }),
  );
  expect(screen.getAllByRole("article")).toHaveLength(8);
});

test("une variante est conservée après remontage, puis le parcours de commande aboutit", async () => {
  const user = userEvent.setup();
  const page = openPage("/produit/silicone-sauge");
  const detail = within(page.container.querySelector(".detail-copy"));
  await user.click(
    detail.getByRole("button", { name: "Terracotta", exact: true }),
  );
  await user.selectOptions(
    screen.getByLabelText("Votre modèle de téléphone"),
    "Samsung Galaxy S25",
  );
  await user.click(
    screen.getByRole("button", { name: "Augmenter quantité", exact: true }),
  );
  await user.click(screen.getByRole("button", { name: /Ajouter au panier/ }));
  await user.click(screen.getByRole("link", { name: "Panier, 2 articles" }));
  expect(screen.getByText("Samsung Galaxy S25")).toBeTruthy();
  expect(screen.getByText("Terracotta · Silicone")).toBeTruthy();
  expect(screen.getByText(/64,70/)).toBeTruthy();
  page.unmount();
  openPage("/panier");
  expect(screen.getByRole("link", { name: "Panier, 2 articles" })).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: /Augmenter quantité de/ }),
  );
  expect(screen.getByText("Offerte")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: /Passer commande/ }));
  await user.type(screen.getByLabelText("Prénom"), "Camille");
  await user.type(screen.getByLabelText("Nom", { exact: true }), "Exemple");
  await user.type(
    screen.getByLabelText("Adresse e-mail"),
    "camille@example.com",
  );
  await user.type(
    screen.getByLabelText("Adresse de livraison"),
    "1 rue du Test",
  );
  await user.type(screen.getByLabelText("Code postal"), "75001");
  await user.type(screen.getByLabelText("Ville"), "Paris");
  await user.click(screen.getByRole("checkbox"));
  await user.click(
    screen.getByRole("button", { name: /Confirmer ma commande démo/ }),
  );
  expect(screen.getByRole("heading", { name: "Merci, Camille." })).toBeTruthy();
  expect(screen.getByRole("link", { name: "Panier, 0 article" })).toBeTruthy();
  expect(localStorage.getItem("coque-style-cart-v1")).toBe("[]");
});

test("le stockage corrompu et les produits inconnus affichent un état utilisable", () => {
  localStorage.setItem("coque-style-cart-v1", "not-json");
  const page = openPage("/panier");
  expect(
    screen.getByRole("heading", { name: "Tout commence par un coup de cœur." }),
  ).toBeTruthy();
  page.unmount();
  openPage("/produit/inexistant");
  expect(
    screen.getByRole("heading", { name: "Cette page nous échappe." }),
  ).toBeTruthy();
});

test("accueil, navigation, recherche et newsletter fonctionnent", async () => {
  const user = userEvent.setup();
  HTMLElement.prototype.scrollBy = vi.fn();
  openPage("/");
  expect(screen.getByRole("heading", { name: /Protégez/ })).toBeTruthy();
  await user.click(
    screen.getByRole("button", { name: "Voir les nouveautés suivantes" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Voir les nouveautés précédentes" }),
  );
  await user.type(
    screen.getByLabelText("Votre adresse e-mail"),
    "demo@example.com",
  );
  await user.click(
    screen.getByRole("button", { name: /Enregistrer mon intérêt/ }),
  );
  expect(screen.getByText(/Votre intérêt a été enregistré/)).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Ouvrir le menu" }));
  await user.keyboard("{Escape}");
  await user.click(
    screen.getByRole("button", { name: "Rechercher un produit" }),
  );
  await user.type(screen.getByLabelText("Rechercher une coque"), "Minuit");
  await user.click(
    screen.getByRole("button", { name: "Rechercher", exact: true }),
  );
  expect(screen.getByRole("heading", { name: "La collection." })).toBeTruthy();
  expect(screen.getAllByRole("article").length).toBeGreaterThan(0);
});

test("les pages d’information et les liens du pied de page sont accessibles", () => {
  for (const name of [
    "notre-histoire",
    "livraison",
    "faq",
    "contact",
    "mon-espace",
    "confidentialite",
    "conditions",
    "inconnue",
  ]) {
    const page = openPage(`/informations/${name}`);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    page.unmount();
  }
});

test("tri, nouveautés, couleur et modèle du catalogue sont combinables", async () => {
  const user = userEvent.setup();
  openPage("/boutique");
  await user.click(
    screen.getByRole("button", { name: "Filtres", exact: true }),
  );
  await user.click(screen.getByLabelText("iPhone 15"));
  await user.click(screen.getByRole("button", { name: "Couleur Lavande" }));
  expect(screen.getAllByRole("article")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: /Tout réinitialiser/ }));
  for (const sort of ["prix-croissant", "prix-decroissant", "avis"]) {
    await user.selectOptions(screen.getByLabelText("Trier les produits"), sort);
    expect(screen.getAllByRole("article")).toHaveLength(8);
  }
  await user.click(screen.getByLabelText("Nouveautés uniquement"));
  expect(screen.getAllByRole("article")).toHaveLength(5);
});

test("ajout rapide, suppression et accordéons de la fiche produit", async () => {
  const user = userEvent.setup();
  const page = openPage("/produit/botanique-creme");
  await user.click(screen.getByText("Les petits détails qui comptent"));
  await user.click(
    screen.getByText("Livraison & retours", { selector: "summary" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Voir la couleur Sauge" }),
  );
  const related = page.container.querySelectorAll(".product-card")[0];
  await user.click(
    within(related).getByRole("button", { name: "Sable", exact: true }),
  );
  await user.click(within(related).getByRole("button", { name: /Ajouter/ }));
  await user.click(
    screen.getByRole("button", { name: "Fermer la notification" }),
  );
  await user.click(screen.getByRole("link", { name: "Panier, 1 article" }));
  await user.click(
    screen.getByRole("button", { name: /Retirer L’Essentielle/ }),
  );
  expect(
    screen.getByRole("heading", { name: "Tout commence par un coup de cœur." }),
  ).toBeTruthy();
});
