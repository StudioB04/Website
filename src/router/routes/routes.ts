import { defaultLocale, dictionaries, isLocale, locales, type Locale } from "@/i18n";
import { RouterEnum } from "../RouterEnum";

export type PageId = RouterEnum;
export const pageIds: PageId[] = Object.values(RouterEnum);

export const mainNavPages: PageId[] = [RouterEnum.HOME, RouterEnum.DIGITAL, RouterEnum.PRINT, RouterEnum.SIGNAGE, RouterEnum.TRADE_SHOWS];
export const servicePages = [RouterEnum.DIGITAL, RouterEnum.PRINT, RouterEnum.SIGNAGE, RouterEnum.TRADE_SHOWS] as const;

/** Adresse traduite d'une page, sans préfixe de langue ni slashs (vide pour l'accueil). */
export function getSlug(pageId: PageId, locale: Locale): string {
  return dictionaries[locale].pages[pageId].slug;
}

export function getPath(pageId: PageId, locale: Locale): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const slug = getSlug(pageId, locale);
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

export function getAlternates(pageId: PageId): Record<Locale, string> {
  return Object.fromEntries(locales.map(locale => [locale, getPath(pageId, locale)])) as Record<Locale, string>;
}

function normalize(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) && segment !== defaultLocale ? segment : defaultLocale;
}

export function findPage(pathname: string): { pageId: PageId; locale: Locale } | null {
  const locale = getLocaleFromPath(pathname);
  const target = normalize(pathname);
  const pageId = pageIds.find(id => getPath(id, locale) === target);
  return pageId ? { pageId, locale } : null;
}

/** Toutes les adresses du site (une par page et par langue), pour le pré-rendu et le sitemap. */
export function getAllRoutes(): { pageId: PageId; locale: Locale; path: string }[] {
  return locales.flatMap(locale => pageIds.map(pageId => ({ pageId, locale, path: getPath(pageId, locale) })));
}
