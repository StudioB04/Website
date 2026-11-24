import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import ThemeSwitcher from "./ThemeSwitcher";
import { I18nProvider, locales, translate } from "@/i18n";
import { THEME_STORAGE_KEY, themes } from "@/theme";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.dsTheme;
});

afterEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.dsTheme;
});

function renderSwitcher(locale: (typeof locales)[number] = "fr") {
  return render(
    <I18nProvider locale={locale}>
      <ThemeSwitcher />
    </I18nProvider>,
  );
}

describe("ThemeSwitcher", () => {
  it.each(locales)("is a group named after the theme title, in %s", locale => {
    renderSwitcher(locale);

    expect(screen.getByRole("group", { name: translate(locale, "common.settings.theme.title") })).toBeDefined();
  });

  it.each(locales)("offers a button for each theme, in %s", locale => {
    renderSwitcher(locale);

    for (const theme of themes) {
      expect(screen.getByRole("button", { name: translate(locale, `common.settings.theme.${theme}`) })).toBeDefined();
    }
  });

  it("starts with the system theme pressed, and only that one", () => {
    renderSwitcher();

    const pressed = screen.getAllByRole("button").filter(button => button.getAttribute("aria-pressed") === "true");
    expect(pressed.map(button => button.textContent)).toEqual([translate("fr", "common.settings.theme.system")]);
  });

  it("applies, stores and shows the chosen theme", () => {
    renderSwitcher();
    const dark = screen.getByRole("button", { name: translate("fr", "common.settings.theme.dark") });

    fireEvent.click(dark);

    expect(dark.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: translate("fr", "common.settings.theme.system") }).getAttribute("aria-pressed")).toBe("false");
    expect(document.documentElement.dataset.dsTheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("goes back to the system theme by removing the attribute", () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole("button", { name: translate("fr", "common.settings.theme.light") }));
    fireEvent.click(screen.getByRole("button", { name: translate("fr", "common.settings.theme.system") }));

    expect(document.documentElement.hasAttribute("data-ds-theme")).toBe(false);
  });

  it("shows the theme stored on a previous visit", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    renderSwitcher();

    expect(screen.getByRole("button", { name: translate("fr", "common.settings.theme.light") }).getAttribute("aria-pressed")).toBe("true");
  });
});
