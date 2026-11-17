import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Outlet, Route, Routes, useNavigate } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageErrorBoundary from "./ErrorBoundary";
import { dictionaries, I18nProvider, type Locale } from "@/i18n";

function Bomb(): never {
  throw new Error("boom");
}

// Remplace MainLayout : doit rester affiché quand une page plante.
function Layout() {
  return (
    <div>
      <p>layout</p>
      <Outlet />
    </div>
  );
}

function GoTo({ to, children }: { to: string; children: string }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)}>{children}</button>;
}

function renderApp(path: string, locale: Locale = "fr") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <I18nProvider locale={locale}>
        <Routes>
          <Route element={<Layout />}>
            <Route element={<PageErrorBoundary />}>
              <Route path="/" element={<p>fine</p>} />
              <Route path="/broken" element={<Bomb />} />
            </Route>
          </Route>
        </Routes>
        <GoTo to="/">go home</GoTo>
        <GoTo to="/broken">go broken</GoTo>
      </I18nProvider>
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

describe("PageErrorBoundary", () => {
  it("renders the page when nothing fails", () => {
    renderApp("/");

    expect(screen.getByText("fine")).toBeDefined();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("shows the 500 page instead of a blank screen when a page throws", () => {
    renderApp("/broken");

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.serverError.heading })).toBeDefined();
    expect(screen.getByRole("link", { name: dictionaries.fr.pages.serverError.backHome })).toBeDefined();
  });

  it("shows the 500 page in the language of the page", () => {
    renderApp("/broken", "en");

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.en.pages.serverError.heading })).toBeDefined();
  });

  it("keeps the layout around the error", () => {
    renderApp("/");
    const layout = screen.getByText("layout");

    fireEvent.click(screen.getByRole("button", { name: "go broken" }));

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.serverError.heading })).toBeDefined();
    expect(screen.getByText("layout")).toBe(layout);
  });

  it("goes back to normal as soon as the user navigates to another page", () => {
    renderApp("/broken");
    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.serverError.heading })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "go home" }));

    expect(screen.getByText("fine")).toBeDefined();
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("shows the error again if the user comes back to the broken page", () => {
    renderApp("/");

    fireEvent.click(screen.getByRole("button", { name: "go broken" }));
    fireEvent.click(screen.getByRole("button", { name: "go home" }));
    fireEvent.click(screen.getByRole("button", { name: "go broken" }));

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.serverError.heading })).toBeDefined();
  });
});
