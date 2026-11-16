import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import ErrorPage, { type ErrorStatus } from "./Error";
import { dictionaries, I18nProvider, type Locale } from "@/i18n";

function renderError(locale: Locale, status?: ErrorStatus) {
  return render(
    <MemoryRouter>
      <I18nProvider locale={locale}>
        <ErrorPage status={status} />
      </I18nProvider>
    </MemoryRouter>,
  );
}

const cases = (["fr", "en"] as const).flatMap(locale => [
  { locale, status: 404 as const, texts: dictionaries[locale].pages.notFound },
  { locale, status: 500 as const, texts: dictionaries[locale].pages.serverError },
]);

describe("ErrorPage", () => {
  it.each(cases)("shows the $status texts in $locale and a link back to the home page", ({ locale, status, texts }) => {
    renderError(locale, status);

    expect(screen.getByRole("heading", { level: 1, name: texts.heading })).toBeDefined();
    expect(screen.getByText(texts.intro)).toBeDefined();
    expect(screen.getByRole("link", { name: texts.backHome }).getAttribute("href")).toBe(locale === "fr" ? "/" : "/en/");
  });

  it("is a 404 by default", () => {
    renderError("fr");

    expect(screen.getByRole("heading", { level: 1, name: dictionaries.fr.pages.notFound.heading })).toBeDefined();
  });

  it("has a different title for a 404 and a 500", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(dictionaries[locale].pages.notFound.heading).not.toBe(dictionaries[locale].pages.serverError.heading);
    }
  });

  it("makes the heading focusable, so the focus can be moved to it after a navigation", () => {
    renderError("fr", 500);

    expect(screen.getByRole("heading", { level: 1 }).getAttribute("tabindex")).toBe("-1");
  });
});
