import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import ErrorPage, { type ErrorStatus } from "./Error";
import { I18nProvider, translate, type Locale } from "@/i18n";

function renderError(locale: Locale, status?: ErrorStatus) {
  return render(
    <MemoryRouter>
      <I18nProvider locale={locale}>
        <ErrorPage status={status} />
      </I18nProvider>
    </MemoryRouter>,
  );
}

// Le bloc de textes de chaque statut dans les JSON (`pages.<bloc>.heading` et `pages.<bloc>.intro`).
const blocks = { 404: "notFound", 500: "serverError" } as const;

const cases = (["fr", "en"] as const).flatMap(locale => [
  { locale, status: 404 as const, block: blocks[404] },
  { locale, status: 500 as const, block: blocks[500] },
]);

describe("ErrorPage", () => {
  it.each(cases)("shows the $status texts in $locale and a link back to the home page", ({ locale, status, block }) => {
    renderError(locale, status);

    expect(screen.getByRole("heading", { level: 1, name: translate(locale, `pages.${block}.heading`) })).toBeDefined();
    expect(screen.getByText(translate(locale, `pages.${block}.intro`))).toBeDefined();
    expect(screen.getByRole("link", { name: translate(locale, "common.buttons.back-to-home") }).getAttribute("href")).toBe(locale === "fr" ? "/" : "/en/");
  });

  it("is a 404 by default", () => {
    renderError("fr");

    expect(screen.getByRole("heading", { level: 1, name: translate("fr", "pages.notFound.heading") })).toBeDefined();
  });

  it("has a different title for a 404 and a 500", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(translate(locale, "pages.notFound.heading")).not.toBe(translate(locale, "pages.serverError.heading"));
    }
  });

  it("makes the heading focusable, so the focus can be moved to it after a navigation", () => {
    renderError("fr", 500);

    expect(screen.getByRole("heading", { level: 1 }).getAttribute("tabindex")).toBe("-1");
  });
});
