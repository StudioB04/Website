import { describe, expect, it } from "vitest";
import { dictionaries, locales } from "@/i18n";
import { findPage, getAllRoutes, getAlternates, getLocaleFromPath, getPath, getSlug, mainNavPages, pageIds, RouterEnum, servicePages } from "@/router";

describe("routes", () => {
  it("puts the default locale at the root and prefixes the others", () => {
    expect(getPath(RouterEnum.HOME, "fr")).toBe("/");
    expect(getPath(RouterEnum.HOME, "en")).toBe("/en/");
    expect(getPath(RouterEnum.DIGITAL, "fr")).toBe("/numerique/");
    expect(getPath(RouterEnum.SIGNAGE, "en")).toBe("/en/signage/");
    expect(getPath(RouterEnum.LEGAL, "fr")).toBe("/mentions-legales/");
  });

  it("translates the address of a page in each locale", () => {
    expect(getSlug(RouterEnum.TRADE_SHOWS, "fr")).toBe("salons-plv");
    expect(getSlug(RouterEnum.TRADE_SHOWS, "en")).toBe("trade-shows");
    expect(getSlug(RouterEnum.HOME, "fr")).toBe("");
  });

  it("returns the alternate path of a page in every locale", () => {
    expect(getAlternates(RouterEnum.TRADE_SHOWS)).toEqual({ fr: "/salons-plv/", en: "/en/trade-shows/" });
  });

  it("finds a page from its path, with or without trailing slash", () => {
    expect(findPage("/")).toEqual({ pageId: RouterEnum.HOME, locale: "fr" });
    expect(findPage("/en")).toEqual({ pageId: RouterEnum.HOME, locale: "en" });
    expect(findPage("/en/digital/")).toEqual({ pageId: RouterEnum.DIGITAL, locale: "en" });
    expect(findPage("/print")).toEqual({ pageId: RouterEnum.PRINT, locale: "fr" });
    expect(findPage("/unknown/")).toBeNull();
    expect(findPage("/fr/numerique/")).toBeNull();
  });

  it("does not serve the address of one language under the other", () => {
    expect(findPage("/digital/")).toBeNull();
    expect(findPage("/en/numerique/")).toBeNull();
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
        expect(locales as readonly string[]).not.toContain(getSlug(pageId, locale));
      }
    }
  });

  it("gives every page a different slug in each locale, and only the home page an empty one", () => {
    for (const locale of locales) {
      const slugs = pageIds.map(pageId => getSlug(pageId, locale));
      expect(new Set(slugs).size).toBe(pageIds.length);
      expect(pageIds.filter(pageId => getSlug(pageId, locale) === "")).toEqual([RouterEnum.HOME]);
    }
  });

  it("has texts in every language for every page, and only lists known pages in the menus", () => {
    for (const locale of locales) {
      for (const pageId of pageIds) {
        expect(dictionaries[locale].pages[pageId].title.length).toBeGreaterThan(0);
      }
    }
    for (const pageId of [...mainNavPages, ...servicePages]) {
      expect(pageIds).toContain(pageId);
    }
  });
});
