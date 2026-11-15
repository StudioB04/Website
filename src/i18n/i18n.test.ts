import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { dictionaries, I18nProvider, isLocale, locales, translate, useI18n } from ".";
import type { Locale, MessageKey } from ".";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

describe("i18n", () => {
  it.each(locales)("%s.json has the same keys as fr.json", (locale) => {
    expect(shape(dictionaries[locale])).toEqual(shape(dictionaries.fr));
  });

  it.each(locales)("%s.json has no empty string", (locale) => {
    const strings: string[] = [];
    const collect = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (value && typeof value === "object") Object.values(value).forEach(collect);
    };
    collect(dictionaries[locale].common);
    expect(strings.every((value) => value.length > 0)).toBe(true);
  });

  it("uses the same {{placeholders}} in every language and no other syntax", () => {
    const placeholders = (value: unknown, path = ""): Array<[string, string[]]> => {
      if (typeof value === "string") return [[path, [...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(([, name]) => name).sort()]];
      if (value && typeof value === "object") return Object.entries(value).flatMap(([key, child]) => placeholders(child, `${path}.${key}`));
      return [];
    };
    const singleBrace = (value: unknown): boolean => JSON.stringify(value).split('"').some(text => /(?<!\{)\{\w+\}(?!\})/.test(text));

    expect(placeholders(dictionaries.en)).toEqual(placeholders(dictionaries.fr));
    expect(placeholders(dictionaries.fr).some(([, names]) => names.length > 0)).toBe(true);
    expect(locales.some(locale => singleBrace(dictionaries[locale]))).toBe(false);
  });

  it("recognises supported locales", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe("translate", () => {
  const original = dictionaries.fr.common.copyright;

  afterEach(() => {
    dictionaries.fr.common.copyright = original;
  });

  it("reads a text by its dotted key, in the requested language", () => {
    expect(translate("fr", "pages.digital.heading")).toBe(dictionaries.fr.pages.digital.heading);
    expect(translate("en", "pages.digital.heading")).toBe(dictionaries.en.pages.digital.heading);
    expect(translate("en", "site.name")).toBe(dictionaries.en.site.name);
  });

  it("replaces {{param}} with its value", () => {
    expect(translate("fr", "common.copyright", { year: 2026 })).toBe("© 2026 StudioB04. Tous droits réservés.");
    expect(translate("en", "common.copyright", { year: "2026" })).toBe("© 2026 StudioB04. All rights reserved.");
  });

  it("handles repeated, spaced and numeric params, and keeps the ones it has no value for", () => {
    dictionaries.fr.common.copyright = "lorem {{a}} ipsum {{ a }} {{b}} {{missing}} {{zero}}";

    expect(translate("fr", "common.copyright", { a: "A", b: 2, zero: 0 })).toBe("lorem A ipsum A 2 {{missing}} 0");
    expect(translate("fr", "common.copyright")).toBe("lorem {{a}} ipsum {{ a }} {{b}} {{missing}} {{zero}}");
  });

  it("does not interpret the value of a param", () => {
    dictionaries.fr.common.copyright = "{{a}}";

    expect(translate("fr", "common.copyright", { a: "{{b}} $& $1", b: "x" })).toBe("{{b}} $& $1");
  });

  it("returns an empty text as is, not the key", () => {
    expect(translate("fr", "pages.home.slug")).toBe("");
  });

  it("returns the key itself when the text does not exist", () => {
    // @ts-expect-error la clé n'existe pas : TypeScript la refuse, et au besoin t renvoie la clé
    expect(translate("fr", "pages.digital.nope")).toBe("pages.digital.nope");
    // @ts-expect-error un bloc n'est pas un texte
    expect(translate("fr", "pages")).toBe("pages");
    // @ts-expect-error une liste n'a pas de clé : elle se lit par `messages`
    expect(translate("fr", "pages.legal.sections")).toBe("pages.legal.sections");
  });

  it("never reads inherited properties", () => {
    expect(translate("fr", "constructor" as MessageKey)).toBe("constructor");
    expect(translate("fr", "pages.__proto__.toString" as MessageKey)).toBe("pages.__proto__.toString");
  });
});

describe("useI18n", () => {
  const inLocale = (locale: Locale) => ({ children }: { children: ReactNode }) => createElement(I18nProvider, { locale, children });

  it.each(locales)("gives a t bound to the %s locale of the provider", locale => {
    const { result } = renderHook(() => useI18n(), { wrapper: inLocale(locale) });

    expect(result.current.locale).toBe(locale);
    expect(result.current.messages).toBe(dictionaries[locale]);
    expect(result.current.t("common.skipToContent")).toBe(dictionaries[locale].common.skipToContent);
    expect(result.current.t("common.copyright", { year: 2026 })).toBe(translate(locale, "common.copyright", { year: 2026 }));
  });

  it("falls back to the default locale outside a provider", () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.locale).toBe("fr");
    expect(result.current.t("site.name")).toBe(dictionaries.fr.site.name);
  });

  it("keeps the same t between renders and changes it with the locale", () => {
    const { result, rerender } = renderHook(() => useI18n(), { wrapper: inLocale("fr") });
    const first = result.current.t;

    rerender();
    expect(result.current.t).toBe(first);

    const { result: english } = renderHook(() => useI18n(), { wrapper: inLocale("en") });
    expect(english.current.t).not.toBe(first);
  });
});
