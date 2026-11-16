import { StrictMode, type ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";
import App from "./App";
import { dictionaries, translate, type MessageKey } from "./i18n";
import { getAllRoutes } from "@/router";

function renderAt(path: string, extra?: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      {extra}
    </MemoryRouter>,
  );
}

// Navigation côté client sans passer par l'interface : l'en-tête est provisoire, il n'a ni menu ni sélecteur de langue.
function GoTo({ to, children }: { to: string; children: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>{children}</button>;
}

describe("App", () => {
  it.each(getAllRoutes())("renders $path with its heading, title and lang", ({ path, pageId, locale }) => {
    renderAt(path);

    expect(screen.getByRole("heading", { level: 1, name: "Lorem ipsum" })).toBeDefined();
    expect(document.title).toBe(translate(locale, `pages.${pageId}.title` as MessageKey));
    expect(document.documentElement.lang).toBe(locale);
  });

  it("provides a skip link targeting the main landmark", () => {
    renderAt("/");
    const skipLink = screen.getAllByRole("link").find(link => link.getAttribute("href") === "#main");

    expect(skipLink).toBeDefined();
    expect(screen.getByRole("main").id).toBe("main");
  });

  it("serves the French home page at the root, without redirect", () => {
    renderAt("/");
    expect(screen.getByRole("heading", { level: 1, name: "Lorem ipsum" })).toBeDefined();
    expect(document.title).toBe(dictionaries.fr.pages.home.title);
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

  it("keeps the same layout when navigating and when switching language", () => {
    renderAt(
      "/",
      <>
        <GoTo to="/mentions-legales/">to legal</GoTo>
        <GoTo to="/en/legal-notice/">to english</GoTo>
      </>,
    );
    const header = screen.getByRole("banner");

    fireEvent.click(screen.getByRole("button", { name: "to legal" }));
    expect(document.title).toBe(dictionaries.fr.pages.legal.title);
    expect(screen.getByRole("banner")).toBe(header);

    fireEvent.click(screen.getByRole("button", { name: "to english" }));
    expect(document.title).toBe(dictionaries.en.pages.legal.title);
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("banner")).toBe(header);
  });

  it("moves focus to the page heading after a client-side navigation, not on first render", () => {
    render(
      <StrictMode>
        <MemoryRouter initialEntries={["/"]}>
          <App />
          <GoTo to="/mentions-legales/">to legal</GoTo>
        </MemoryRouter>
      </StrictMode>,
    );
    expect(document.activeElement).toBe(document.body);

    fireEvent.click(screen.getByRole("button", { name: "to legal" }));

    expect(document.activeElement).toBe(screen.getByRole("heading", { level: 1 }));
  });
});
