import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import SettingsPanel from "./SettingsPanel";
import { I18nProvider, localeNames, locales, translate } from "@/i18n";

function renderPanel(locale: (typeof locales)[number] = "fr") {
  return render(
    <MemoryRouter initialEntries={[locale === "fr" ? "/" : `/${locale}/`]}>
      <I18nProvider locale={locale}>
        <SettingsPanel />
      </I18nProvider>
    </MemoryRouter>,
  );
}

describe("SettingsPanel", () => {
  it.each(locales)("has a button that opens the dialog, in %s", locale => {
    renderPanel(locale);

    const opener = screen.getByRole("button", { name: translate(locale, "common.settings.title") });
    expect(opener.getAttribute("popovertarget")).toBe(screen.getByRole("dialog", { hidden: true }).id);
  });

  it("has the language button and the theme choice in the dialog", () => {
    renderPanel();
    const dialog = screen.getByRole("dialog", { hidden: true });

    expect(within(dialog).getByRole("link", { name: localeNames.en, hidden: true })).toBeDefined();
    for (const theme of ["light", "dark", "system"]) {
      expect(within(dialog).getByRole("button", { name: translate("fr", `common.settings.theme.${theme}`), hidden: true })).toBeDefined();
    }
  });
});
