import { dictionaries, defaultLocale, isLocale, locales } from "./i18n";
import type { Locale } from "./i18n";

export const pageIds = ["home", "digital", "print", "signage", "tradeShows", "legal"] as const;
export type PageId = (typeof pageIds)[number];

export const mainNavPages: PageId[] = ["home", "digital", "print", "signage", "tradeShows"];
export const servicePages: PageId[] = ["digital", "print", "signage", "tradeShows"];

export function getPath(pageId: PageId, locale: Locale): string {
  const slug = dictionaries[locale].pages[pageId].slug;
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

export function getAlternates(pageId: PageId): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, getPath(pageId, locale)])) as Record<Locale, string>;
}

function normalize(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function findPage(pathname: string): { pageId: PageId; locale: Locale } | null {
  const target = normalize(pathname);
  for (const locale of locales) {
    for (const pageId of pageIds) {
      if (getPath(pageId, locale) === target) return { pageId, locale };
    }
  }
  return null;
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) && segment !== defaultLocale ? segment : defaultLocale;
}

export function getAllRoutes(): { pageId: PageId; locale: Locale; path: string }[] {
  return locales.flatMap((locale) => pageIds.map((pageId) => ({ pageId, locale, path: getPath(pageId, locale) })));
}
