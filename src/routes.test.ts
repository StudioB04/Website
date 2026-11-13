import { describe, expect, it } from "vitest";
import { dictionaries, locales } from "./i18n";
import { findPage, getAllRoutes, getAlternates, getLocaleFromPath, getPath, pageIds } from "./routes";

describe("routes", () => {
  it("puts the default locale at the root and prefixes the others", () => {
    expect(getPath("home", "fr")).toBe("/");
    expect(getPath("home", "en")).toBe("/en/");
    expect(getPath("digital", "fr")).toBe("/numerique/");
    expect(getPath("signage", "en")).toBe("/en/signage/");
    expect(getPath("legal", "fr")).toBe("/mentions-legales/");
  });

  it("returns the alternate path of a page in every locale", () => {
    expect(getAlternates("tradeShows")).toEqual({ fr: "/salons-plv/", en: "/en/trade-shows/" });
  });

  it("finds a page from its path, with or without trailing slash", () => {
    expect(findPage("/")).toEqual({ pageId: "home", locale: "fr" });
    expect(findPage("/en")).toEqual({ pageId: "home", locale: "en" });
    expect(findPage("/en/digital/")).toEqual({ pageId: "digital", locale: "en" });
    expect(findPage("/print")).toEqual({ pageId: "print", locale: "fr" });
    expect(findPage("/unknown/")).toBeNull();
    expect(findPage("/fr/numerique/")).toBeNull();
  });

  it("generates 12 unique routes (6 pages × 2 locales)", () => {
    const paths = getAllRoutes().map(({ path }) => path);
    expect(paths).toHaveLength(12);
    expect(new Set(paths).size).toBe(12);
  });

  it("reads the locale from the first path segment, defaulting to French", () => {
    expect(getLocaleFromPath("/en/whatever")).toBe("en");
    expect(getLocaleFromPath("/de/")).toBe("fr");
    expect(getLocaleFromPath("/")).toBe("fr");
    expect(getLocaleFromPath("/numerique/")).toBe("fr");
  });

  it("never uses a locale code as a page slug (it would clash with a prefix)", () => {
    for (const locale of locales) {
      for (const pageId of pageIds) {
        expect(locales as readonly string[]).not.toContain(dictionaries[locale].pages[pageId].slug);
      }
    }
  });
});
