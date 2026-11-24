import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { dictionaries, translate } from "@/i18n";

// La page d'accueil plante ; les autres pages sont celles du site (le routeur les trouve dans `src/pages`, le mock vise le fichier).
vi.mock("@/pages/Home/Home", () => ({
  default: () => {
    throw new Error("boom");
  },
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  // React écrit dans la console l'erreur qu'une barrière d'erreur attrape : inutile ici.
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Router", () => {
  it("shows the 500 page inside the layout when a page throws", () => {
    renderAt("/");

    expect(screen.getByRole("heading", { level: 1, name: translate("fr", "pages.serverError.heading") })).toBeDefined();
    expect(screen.getByRole("banner")).toBeDefined();
    expect(screen.getByRole("main")).toBeDefined();
  });

  it("shows the 500 page in English under /en/", () => {
    renderAt("/en/");

    expect(screen.getByRole("heading", { level: 1, name: translate("en", "pages.serverError.heading") })).toBeDefined();
  });

  it("does not affect the other pages", () => {
    renderAt("/mentions-legales/");

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.legal.heading })).toBeDefined();
    expect(screen.queryByText(translate("fr", "pages.serverError.heading"))).toBeNull();
  });

  it("shows the 404 page, not the 500 page, for an unknown address", () => {
    renderAt("/does-not-exist/");

    expect(screen.getByRole("heading", { level: 1, name: translate("fr", "pages.notFound.heading") })).toBeDefined();
    expect(screen.queryByText(translate("fr", "pages.serverError.heading"))).toBeNull();
  });
});
