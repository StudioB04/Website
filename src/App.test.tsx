import { StrictMode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./App";
import { dictionaries } from "./i18n";
import { getAllRoutes } from "./routes";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it.each(getAllRoutes())("renders $path with its heading, title and lang", ({ path, pageId, locale }) => {
    renderAt(path);
    const page = dictionaries[locale].pages[pageId];

    expect(screen.getByRole("heading", { level: 1, name: page.heading })).toBeDefined();
    expect(document.title).toBe(page.title);
    expect(document.documentElement.lang).toBe(locale);
  });

  it("provides a skip link targeting the main landmark", () => {
    renderAt("/");
    const skipLink = screen.getByRole("link", { name: "Aller au contenu" });

    expect(skipLink.getAttribute("href")).toBe("#main");
    expect(screen.getByRole("main").id).toBe("main");
  });

  it("marks the current page in the main navigation", () => {
    renderAt("/print/");
    const nav = screen.getByRole("navigation", { name: "Navigation principale" });

    expect(within(nav).getByRole("link", { name: "Print" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Accueil" }).getAttribute("aria-current")).toBeNull();
  });

  it("links the language switcher to the same page in the other language", () => {
    renderAt("/salons-plv/");
    const switcher = screen.getByRole("navigation", { name: "Choix de la langue" });
    const english = within(switcher).getByRole("link", { name: "English" });

    expect(english.getAttribute("href")).toBe("/en/trade-shows/");
    expect(english.getAttribute("lang")).toBe("en");
    expect(within(switcher).getByRole("link", { name: "Français" }).getAttribute("aria-current")).toBe("true");
  });

  it("lists every service on the home page", () => {
    renderAt("/en/");
    expect(screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent)).toEqual([
      "Digital",
      "Print",
      "Signs & wayfinding",
      "Trade shows & POS",
    ]);
  });

  it("serves the French home page at the root, without redirect", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.home.heading })).toBeDefined();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("shows the not found page in French for unknown URLs without prefix", () => {
    renderAt("/does-not-exist/");
    expect(screen.getByRole("heading", { level: 1, name: "Page introuvable" })).toBeDefined();
    expect(document.documentElement.lang).toBe("fr");
  });

  it("shows the not found page in the locale of the URL", () => {
    renderAt("/en/does-not-exist/");
    expect(screen.getByRole("heading", { level: 1, name: "Page not found" })).toBeDefined();
    expect(document.documentElement.lang).toBe("en");
  });

  it("moves focus to the page heading after a client-side navigation, not on first render", () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/"]}>
          <App />
        </MemoryRouter>
      </StrictMode>,
    );
    expect(document.activeElement).toBe(document.body);

    const nav = screen.getByRole("navigation", { name: "Navigation principale" });
    fireEvent.click(within(nav).getByRole("link", { name: "Print" }));

    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1, name: "Print" }));
  });
});
