import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  cartReducer,
  sanitizeCart,
  totals,
  itemKey,
} from "../src/context/cartState.js";
import { getAccessToken, saveToken, logout, api } from "../src/lib/api.js";
import { pageNumbers } from "../src/lib/pagination.js";
import { products, models } from "../src/data/products.js";
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { AuthProvider } from "../src/context/AuthContext.jsx";
import { StoreProvider } from "../src/context/StoreContext.jsx";
import AccountNew from "../src/pages/AccountNew.jsx";
import AdminNew from "../src/pages/AdminNew.jsx";
import ResetNew from "../src/pages/ResetNew.jsx";
import TrackNew from "../src/pages/TrackNew.jsx";
import { AdminContent, AdminSalesGraph } from "../src/ui/AdminExtras.jsx";

function LocationProbe() { return React.createElement("output", { "data-testid": "location" }, useLocation().pathname); }

describe("panier et pagination", () => {
  it("nettoie les lignes invalides et plafonne les quantités", () => {
    const valid = {
      id: products[0].id,
      color: products[0].colors[0],
      model: models[0],
      quantity: 9,
    };
    const result = sanitizeCart([
      valid,
      { ...valid, quantity: 9 },
      { ...valid, color: "invalide" },
      { ...valid, quantity: 0 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(10);
  });

  it("gère ajout, quantité, suppression et remise à zéro", () => {
    const item = {
      id: products[0].id,
      color: products[0].colors[0],
      model: models[0],
      quantity: 1,
    };
    const key = itemKey(item.id, item.color, item.model);
    let state = cartReducer([], { type: "add", item });
    state = cartReducer(state, { type: "quantity", key, quantity: 99.8 });
    expect(state[0].quantity).toBe(10);
    expect(cartReducer(state, { type: "remove", key })).toEqual([]);
    expect(cartReducer(state, { type: "clear" })).toEqual([]);
    expect(cartReducer(state, { type: "unknown" })).toEqual(state);
  });

  it("calcule livraison gratuite au seuil et livraison payante sinon", () => {
    const item = {
      id: products[0].id,
      color: products[0].colors[0],
      model: models[0],
      quantity: 1,
    };
    const paid = totals([item]);
    expect(paid.shipping).toBeGreaterThan(0);
    const many = { ...item, quantity: 10 };
    expect(totals([many]).shipping).toBe(0);
    expect(totals([]).total).toBe(0);
  });

  it("retourne une pagination bornée", () => {
    expect(pageNumbers(3, 8)).toEqual([1, 2, 3, 4, 8]);
    expect(pageNumbers(1, 1)).toEqual([1]);
    expect(pageNumbers(0, 0)).toEqual([]);
  });
});

describe("API et session", () => {
  beforeEach(() => {
    sessionStorage.clear();
    saveToken("");
    vi.restoreAllMocks();
  });

  it("gère les jetons et la déconnexion", () => {
    saveToken("access");
    expect(getAccessToken()).toBe("access");
    expect(sessionStorage.getItem("na_access_token")).toBe("access");
    logout();
    expect(getAccessToken()).toBe("");
    expect(sessionStorage.getItem("na_access_token")).toBeNull();
  });

  it("sérialise JSON et expose les erreurs HTTP", async () => {
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ detail: "Données invalides" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => { throw new Error("empty"); },
      });
    await expect(api("/bad", { method: "POST", body: { x: 1 } }))
      .rejects.toThrow("Données invalides");
    await expect(api("/empty")).resolves.toBeNull();
    expect(fetch.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
  });

  it("rafraîchit un access token après HTTP 401", async () => {
    sessionStorage.setItem("na_refresh_token", "refresh");
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ access: "new" }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) });
    await expect(api("/private", { auth: true })).resolves.toEqual({ ok: true });
    expect(getAccessToken()).toBe("new");
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});

describe("pages de compte et de suivi", () => {
  beforeEach(() => {
    sessionStorage.clear();
    globalThis.fetch = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
  });

  it("affiche le formulaire de connexion et le mode inscription", async () => {
    render(React.createElement(MemoryRouter, null,
      React.createElement(AuthProvider, null, React.createElement(AccountNew))));
    await waitFor(() => expect(screen.getByText("Mon")).toBeTruthy());
    const register = screen.queryByRole("button", { name: "Inscription" });
    if (register) {
      fireEvent.click(register);
      expect(screen.getByLabelText("Nom")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Créer mon compte" }).getAttribute("type")).toBe("submit");
    } else {
      expect(screen.getByRole("button", { name: "Déconnexion" }).getAttribute("type")).toBe("button");
    }
  });

  it("affiche les pages admin, reset et suivi sans jeton", async () => {
    render(React.createElement(MemoryRouter, null,
      React.createElement(AuthProvider, null,
        React.createElement(StoreProvider, null, React.createElement(AdminNew)))));
    await waitFor(() => expect(screen.getByText(/Administration|Gestion/)).toBeTruthy());
    render(React.createElement(MemoryRouter, null, React.createElement(ResetNew)));
    expect(screen.getByText("oublié ?")).toBeTruthy();
    render(React.createElement(MemoryRouter, null, React.createElement(React.Fragment, null,
      React.createElement(TrackNew), React.createElement(LocationProbe))));
    expect(screen.getByRole("button", { name: /Consulter/ }).getAttribute("type")).toBe("submit");
  });

  it("couvre les branches authentifiées du compte et de l’administration", async () => {
    cleanup();
    saveToken("access");
    globalThis.fetch = vi.fn(async (input) => {
      const path = String(input);
      if (path.includes("/auth/me/")) return { ok: true, json: async () => ({ id: 1, email: "a@test", name: "Admin", is_staff: true }) };
      if (path.includes("/my-orders/")) return { ok: true, json: async () => ({ results: [] }) };
      if (path.includes("/wishlist/") || path.includes("/addresses/")) return { ok: true, json: async () => [] };
      if (path.includes("/admin/dashboard/")) return { ok: true, json: async () => ({ day: {}, week: {}, pending_payment: 0, by_source: [] }) };
      if (path.endsWith("/orders/")) return { ok: true, json: async () => [] };
      if (path.includes("/products/")) return { ok: true, json: async () => ({ results: [] }) };
      if (path.includes("/categories/") || path.includes("/phone-models/")) return { ok: true, json: async () => [] };
      if (path.includes("/site-config/")) return { ok: true, json: async () => ({}) };
      return { ok: true, json: async () => ({}) };
    });
    render(React.createElement(MemoryRouter, null,
      React.createElement(AuthProvider, null, React.createElement(AccountNew))));
    await waitFor(() => expect(screen.getByText("Bonjour Admin")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Profil et adresses" }));
    expect(screen.getByRole("button", { name: "Ajouter l'adresse" }).getAttribute("type")).toBe("submit");
    cleanup();
    render(React.createElement(MemoryRouter, null,
      React.createElement(AuthProvider, null,
        React.createElement(StoreProvider, null, React.createElement(AdminNew)))));
    await waitFor(() => expect(screen.getByText("Gestion")).toBeTruthy());
    for (const tab of ["Commandes", "Vente Facebook", "Produits", "Éditeur photos", "Bannières & avis", "Clients", "Stocks", "Configuration"]) {
      fireEvent.click(screen.getByRole("button", { name: tab }));
    }
    expect(screen.getByText("Configuration")).toBeTruthy();
  });

  it("soumet une demande de réinitialisation et affiche l'erreur API", async () => {
    cleanup();
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ detail: "Message envoyé" }) });
    render(React.createElement(MemoryRouter, null, React.createElement(ResetNew)));
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "client@test.fr" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(screen.getByText("Message envoyé")).toBeTruthy());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("password-reset"), expect.anything());

    cleanup();
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false, status: 400, json: async () => ({ detail: "Adresse invalide" }),
    });
    render(React.createElement(MemoryRouter, null, React.createElement(ResetNew)));
    fireEvent.change(screen.getByLabelText("Adresse e-mail"), { target: { value: "bad@test.fr" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));
    await waitFor(() => expect(screen.getByText("Adresse invalide")).toBeTruthy());
  });

  it("normalise un lien de suivi avant navigation", () => {
    cleanup();
    render(React.createElement(MemoryRouter, null, React.createElement(React.Fragment, null,
      React.createElement(TrackNew), React.createElement(LocationProbe))));
    fireEvent.change(screen.getByLabelText(/Lien ou identifiant/), { target: { value: "https://site/suivi/ABC-42" } });
    fireEvent.click(screen.getByRole("button", { name: /Consulter/ }));
    expect(screen.getByTestId("location").textContent).toBe("/suivi/ABC-42");
  });

  it("affiche et modère le contenu administrateur", async () => {
    cleanup();
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1, title: "Promo", active: true }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, display_name: "Client", rating: 5, body: "Très bien", approved: false }] })
      .mockResolvedValue({ ok: true, json: async () => [] });
    render(React.createElement(MemoryRouter, null, React.createElement(AdminContent)));
    await waitFor(() => expect(screen.getByText("Promo")).toBeTruthy());
    expect(screen.getByText("Client")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Désactiver" }));
    await waitFor(() => expect(screen.getByText("Enregistré")).toBeTruthy());
  });

  it("affiche les états du graphique et les alertes de stock", () => {
    cleanup();
    render(React.createElement(AdminSalesGraph, { stats: { daily: [], low_stock: [] } }));
    expect(screen.getByText(/Pas de ventes/)).toBeTruthy();
    expect(screen.getByText(/Aucune alerte/)).toBeTruthy();
    cleanup();
    render(React.createElement(AdminSalesGraph, { stats: {
      daily: [{ day: "2026-11-16", total: 50000 }],
      low_stock: [{ id: 1, product__name: "Coque", phone_model__name: "iPhone", stock_count: 2 }],
    } }));
    expect(screen.getByRole("img", { name: /Graphique des ventes/ })).toBeTruthy();
    expect(screen.getByText(/Coque iPhone/)).toBeTruthy();
  });
});
