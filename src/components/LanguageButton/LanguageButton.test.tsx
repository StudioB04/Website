import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import LanguageButton from "./LanguageButton";
import { I18nProvider, localeNames, translate } from "@/i18n";
import type { Locale } from "@/i18n";
import { getPath } from "@/router";

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

function renderButton(pathname: string, locale: Locale, basename = "/") {
  return render(
    <MemoryRouter basename={basename} initialEntries={[`${basename.replace(/\/$/, "")}${pathname}`]}>
      <I18nProvider locale={locale}>
        <LanguageButton />
        <CurrentPath />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("LanguageButton", () => {
  it("is a group named after the language selection", () => {
    renderButton("/", "fr");

    expect(screen.getByRole("group", { name: translate("fr", "common.languageSwitcher") })).toBeDefined();
  });

  it("offers the other language only, named in that language", () => {
    renderButton("/", "fr");

    expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual([localeNames.en]);
    expect(screen.getByRole("link", { name: localeNames.en }).getAttribute("lang")).toBe("en");
    expect(screen.getByRole("link", { name: localeNames.en }).getAttribute("hreflang")).toBe("en");
  });

  it("offers French from an English page", () => {
    renderButton("/en/", "en");

    expect(screen.getAllByRole("link").map(link => link.textContent)).toEqual([localeNames.fr]);
  });

  it("points to the same page in the other language", () => {
    renderButton(getPath("legal", "fr"), "fr");

    expect(screen.getByRole("link", { name: localeNames.en }).getAttribute("href")).toBe(getPath("legal", "en"));
  });

  it("points back to the French page from an English one", () => {
    renderButton(getPath("print", "en"), "en");

    expect(screen.getByRole("link", { name: localeNames.fr }).getAttribute("href")).toBe(getPath("print", "fr"));
  });

  it("falls back to the home page of the other language on an unknown page", () => {
    renderButton("/page-inconnue/", "fr");

    expect(screen.getByRole("link", { name: localeNames.en }).getAttribute("href")).toBe(getPath("home", "en"));
  });

  it("prefixes the href with the router basename", () => {
    renderButton(getPath("legal", "fr"), "fr", "/Website/");

    expect(screen.getByRole("link", { name: localeNames.en }).getAttribute("href")).toBe(`/Website${getPath("legal", "en")}`);
  });

  it("navigates client-side to the other language", () => {
    renderButton(getPath("legal", "fr"), "fr");

    fireEvent.click(screen.getByRole("link", { name: localeNames.en }));

    expect(screen.getByRole("status").textContent).toBe(getPath("legal", "en"));
  });
});
