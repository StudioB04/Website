import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { dictionaries, findMessage, I18nProvider, isLocale, locales, translate, useI18n } from ".";
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
    collect(dictionaries[locale]);
    expect(strings.length).toBeGreaterThan(0);
    expect(strings.every((value) => value.length > 0)).toBe(true);
  });

  // Aucun texte n'a de paramètre pour l'instant (la syntaxe est testée dans `translate`) : ces contrôles gardent l'avenir.
  const placeholders = (value: unknown, path = ""): Array<[string, string[]]> => {
    if (typeof value === "string") return [[path, [...value.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map(([, name]) => name).sort()]];
    if (value && typeof value === "object") return Object.entries(value).flatMap(([key, child]) => placeholders(child, `${path}.${key}`));
    return [];
  };
  const singleBrace = (value: unknown): boolean => JSON.stringify(value).split('"').some(text => /(?<!\{)\{\w+\}(?!\})/.test(text));

  it("uses the same {{placeholders}} in every language and no other syntax", () => {
    expect(placeholders(dictionaries.en)).toEqual(placeholders(dictionaries.fr));
    expect(locales.some(locale => singleBrace(dictionaries[locale]))).toBe(false);
  });

  it("detects a placeholder that differs between languages, and a single-brace parameter", () => {
    expect(placeholders({ a: { b: "x {{year}} y {{ name }}" } })).toEqual([[".a.b", ["name", "year"]]]);
    expect(placeholders({ a: "{{year}}" })).not.toEqual(placeholders({ a: "{{annee}}" }));
    expect(singleBrace({ a: "x {year}" })).toBe(true);
    expect(singleBrace({ a: "x {{year}}" })).toBe(false);
  });

  it("recognises supported locales", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

// Aucun texte du site n'a de paramètre ni n'est vide : ces cas se testent en remplaçant un texte le temps du test.
const sample = dictionaries.fr.pages.home;
const originalDescription = sample.description;

afterEach(() => {
  sample.description = originalDescription;
  delete (sample as Record<string, unknown>).list;
});

describe("translate", () => {
  it("reads a text by its dotted key, in the requested language", () => {
    expect(translate("fr", "pages.home.title")).toBe(dictionaries.fr.pages.home.title);
    expect(translate("en", "pages.home.title")).toBe(dictionaries.en.pages.home.title);
    expect(translate("en", "site.name")).toBe(dictionaries.en.site.name);
  });

  it("replaces {{param}} with its value", () => {
    sample.description = "© {{year}} StudioB04.";

    expect(translate("fr", "pages.home.description", { year: 2026 })).toBe("© 2026 StudioB04.");
    expect(translate("fr", "pages.home.description", { year: "2026" })).toBe("© 2026 StudioB04.");
  });

  it("handles repeated, spaced and numeric params, and keeps the ones it has no value for", () => {
    sample.description = "lorem {{a}} ipsum {{ a }} {{b}} {{missing}} {{zero}}";

    expect(translate("fr", "pages.home.description", { a: "A", b: 2, zero: 0 })).toBe("lorem A ipsum A 2 {{missing}} 0");
    expect(translate("fr", "pages.home.description")).toBe("lorem {{a}} ipsum {{ a }} {{b}} {{missing}} {{zero}}");
  });

  it("does not interpret the value of a param", () => {
    sample.description = "{{a}}";

    expect(translate("fr", "pages.home.description", { a: "{{b}} $& $1", b: "x" })).toBe("{{b}} $& $1");
  });

  it("returns an empty text as is, not the key", () => {
    sample.description = "";

    expect(translate("fr", "pages.home.description")).toBe("");
  });

  it("returns the key itself when the text does not exist", () => {
    expect(translate("fr", "pages.home.nope")).toBe("pages.home.nope");
    expect(translate("fr", "pages")).toBe("pages");
  });

  it("does not read a list as a text: it is read through `messages`", () => {
    (sample as Record<string, unknown>).list = [{ title: "a", text: "b" }];

    expect(translate("fr", "pages.home.list" as MessageKey)).toBe("pages.home.list");
  });

  it("never reads inherited properties", () => {
    expect(translate("fr", "constructor" as MessageKey)).toBe("constructor");
    expect(translate("fr", "pages.__proto__.toString" as MessageKey)).toBe("pages.__proto__.toString");
  });
});

describe("findMessage", () => {
  it("reads any text by its dotted path, in the given locale", () => {
    expect(findMessage("fr", "pages.legal.slug")).toBe(dictionaries.fr.pages.legal.slug);
    expect(findMessage("en", "pages.legal.slug")).toBe(dictionaries.en.pages.legal.slug);
  });

  it("returns an empty text as is", () => {
    sample.description = "";

    expect(findMessage("fr", "pages.home.description")).toBe("");
  });

  it("returns undefined, not the key, when there is no text", () => {
    (sample as Record<string, unknown>).list = [{ title: "a", text: "b" }];

    expect(findMessage("fr", "pages.nope.slug")).toBeUndefined();
    expect(findMessage("fr", "pages")).toBeUndefined();
    expect(findMessage("fr", "pages.home.list")).toBeUndefined();
  });

  it("never reads inherited properties", () => {
    expect(findMessage("fr", "constructor")).toBeUndefined();
    expect(findMessage("fr", "pages.__proto__.toString")).toBeUndefined();
  });
});

describe("useI18n", () => {
  const inLocale = (locale: Locale) => ({ children }: { children: ReactNode }) => createElement(I18nProvider, { locale, children });

  it.each(locales)("gives a t bound to the %s locale of the provider", locale => {
    const { result } = renderHook(() => useI18n(), { wrapper: inLocale(locale) });

    expect(result.current.locale).toBe(locale);
    expect(result.current.messages).toBe(dictionaries[locale]);
    expect(result.current.t("pages.home.title")).toBe(dictionaries[locale].pages.home.title);
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
