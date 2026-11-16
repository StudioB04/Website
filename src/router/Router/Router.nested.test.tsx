import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";
import App from "@/App";
import { dictionaries } from "@/i18n";

// Pages simulées : un accueil, un dossier de pages imbriquées (`Print/Global`), une page sans `slug` dans les JSON (`TradeShows`)
// et une page dont le dossier n'a pas de page à lui seul (`Docs/Guide`).
vi.mock("../routes/pageModules", () => {
  const page = (id: string, label: string) => ({ id, file: `/src/pages/${id}.tsx`, segments: id.split("."), Component: () => <h1>{label}</h1> });
  return {
    getPageModules: () => [
      page("home", "Accueil"),
      page("docs.guide", "Guide"),
      page("print", "Print"),
      page("print.global", "Print global"),
      page("tradeShows", "Trade shows"),
    ],
  };
});

// Les `slug` des dossiers, par langue. Ceux qui manquent (`global`, `guide`, `tradeShows`, `docs`) retombent sur le nom du dossier.
const slugs: Record<string, Record<string, string>> = {
  fr: { "pages.print.slug": "imprimerie" },
  en: { "pages.print.slug": "print", "pages.docs.slug": "documentation" },
};

vi.mock("@/i18n", async importOriginal => {
  const actual = await importOriginal<typeof import("@/i18n")>();
  return { ...actual, findMessage: (locale: string, key: string) => slugs[locale]?.[key] };
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

function heading() {
  return screen.getByRole("heading", { level: 1 }).textContent;
}

describe("Router with nested pages", () => {
  it.each([
    ["/", "Accueil"],
    ["/imprimerie/", "Print"],
    ["/imprimerie/global/", "Print global"],
    ["/trade-shows/", "Trade shows"],
    ["/docs/guide/", "Guide"],
    ["/en/", "Accueil"],
    ["/en/print/", "Print"],
    ["/en/print/global/", "Print global"],
    ["/en/trade-shows/", "Trade shows"],
    ["/en/documentation/guide/", "Guide"],
  ])("serves %s", (path, expected) => {
    renderAt(path);

    expect(heading()).toBe(expected);
  });

  it("serves a nested page without its trailing slash", () => {
    renderAt("/en/print/global");

    expect(heading()).toBe("Print global");
  });

  it.each([
    ["/print/global/", "fr"], // adresse anglaise de la page, servie en français
    ["/docs/", "fr"], // dossier sans page à lui seul
    ["/imprimerie/global/extra/", "fr"], // niveau inconnu
    ["/en/imprimerie/global/", "en"], // adresse française, servie en anglais
    ["/en/docs/guide/", "en"], // `docs` s'appelle `documentation` en anglais
  ] as const)("shows the 404 page for %s", (path, locale) => {
    renderAt(path);

    expect(heading()).toBe(dictionaries[locale].pages.notFound.heading);
  });
});
