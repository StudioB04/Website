import { describe, expect, it } from "vitest";
import { locales, translate, type MessageKey } from "@/i18n";
import { findPage, getAllRoutes, getAlternates, getLocaleFromPath, getPageIds, getPages, getPath, getSlug } from "@/router";

describe("routes", () => {
  it("puts the default locale at the root and prefixes the others", () => {
    expect(getPath("home", "fr")).toBe("/");
    expect(getPath("home", "en")).toBe("/en/");
    expect(getPath("legal", "fr")).toBe("/mentions-legales/");
    expect(getPath("legal", "en")).toBe("/en/legal-notice/");
  });

  it("translates the address of a page in each locale", () => {
    expect(getSlug("legal", "fr")).toBe("mentions-legales");
    expect(getSlug("legal", "en")).toBe("legal-notice");
    expect(getSlug("home", "fr")).toBe("");
  });

  it("returns the alternate path of a page in every locale", () => {
    expect(getAlternates("legal")).toEqual({ fr: "/mentions-legales/", en: "/en/legal-notice/" });
    expect(getAlternates("home")).toEqual({ fr: "/", en: "/en/" });
  });

  it("finds a page from its path, with or without trailing slash", () => {
    expect(findPage("/")).toEqual({ pageId: "home", locale: "fr" });
    expect(findPage("/en")).toEqual({ pageId: "home", locale: "en" });
    expect(findPage("/en/legal-notice/")).toEqual({ pageId: "legal", locale: "en" });
    expect(findPage("/mentions-legales")).toEqual({ pageId: "legal", locale: "fr" });
    expect(findPage("/unknown/")).toBeNull();
    expect(findPage("/fr/mentions-legales/")).toBeNull();
  });

  it("does not serve the address of one language under the other", () => {
    expect(findPage("/legal-notice/")).toBeNull();
    expect(findPage("/en/mentions-legales/")).toBeNull();
  });

  it("generates one route per page and per locale, all different", () => {
    const paths = getAllRoutes().map(({ path }) => path);

    expect(paths).toHaveLength(getPageIds().length * locales.length);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("reads the locale from the first path segment, defaulting to French", () => {
    expect(getLocaleFromPath("/en/whatever")).toBe("en");
    expect(getLocaleFromPath("/de/")).toBe("fr");
    expect(getLocaleFromPath("/")).toBe("fr");
    expect(getLocaleFromPath("/mentions-legales/")).toBe("fr");
  });
});

describe("pages found in src/pages", () => {
  it("lists the home page first, then the others", () => {
    expect(getPageIds()[0]).toBe("home");
    expect(getPageIds()).toContain("legal");
  });

  it("gives each page a component", () => {
    for (const { id, Component } of getPages()) {
      expect(typeof Component, id).toBe("function");
    }
  });

  it("has a title and a description in every language for every page (the folder must have its block in the JSON files)", () => {
    for (const locale of locales) {
      for (const pageId of getPageIds()) {
        for (const field of ["title", "description"] as const) {
          const key = `pages.${pageId}.${field}` as MessageKey;
          const text = translate(locale, key);

          expect(text, `${locale} ${key}`).not.toBe(key);
          expect(text.length, `${locale} ${key}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("never uses a locale code as the first part of an address (it would clash with a prefix)", () => {
    for (const locale of locales) {
      for (const pageId of getPageIds()) {
        expect(locales as readonly string[]).not.toContain(getSlug(pageId, locale).split("/")[0]);
      }
    }
  });

  it("gives every page a different address in each locale, and only the home page an empty one", () => {
    for (const locale of locales) {
      const slugs = getPageIds().map(pageId => getSlug(pageId, locale));

      expect(new Set(slugs).size).toBe(slugs.length);
      expect(getPageIds().filter(pageId => getSlug(pageId, locale) === "")).toEqual(["home"]);
    }
  });
});
