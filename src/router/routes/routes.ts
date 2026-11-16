import type { ComponentType } from "react";
import { defaultLocale, findMessage, isLocale, locales, type Locale, type Messages } from "@/i18n";
import { resolveSlugs } from "./pageFiles";
import { getPageModules } from "./pageModules";

// Chemins pointés vers un bloc de `pages` (dans les JSON) qui a un titre et une description : "home", "legal", "print.global"…
// C'est aussi l'identifiant d'une page (voir `pageFiles.ts`). Les listes n'en sont pas.
type PageIdsOf<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends readonly unknown[]
    ? never
    : T[K] extends object
      ? (T[K] extends { title: string; description: string } ? `${Prefix}${K}` : never) | PageIdsOf<T[K], `${Prefix}${K}.`>
      : never;
}[keyof T & string];

/**
 * Identifiant d'une page : le chemin de ses dossiers dans `src/pages`, en camelCase, séparé par des points (`Print/Global/Global.tsx` →
 * `"print.global"`). TypeScript le déduit des JSON de langue ; un test vérifie que chaque page trouvée dans `src/pages` y a son bloc.
 */
export type PageId = Exclude<PageIdsOf<Messages["pages"]>, "notFound">;

export interface Page {
  id: PageId;
  Component: ComponentType;
}

let pages: Page[] | undefined;

/** Les pages du site, trouvées dans `src/pages` : l'accueil d'abord, puis par ordre alphabétique. */
export function getPages(): Page[] {
  pages ??= getPageModules().map(({ id, Component }) => ({ id: id as PageId, Component }));
  return pages;
}

export function getPageIds(): PageId[] {
  return getPages().map(page => page.id);
}

export const mainNavPages: PageId[] = ["home", "legal"];
export const servicePages = [] as const;

/** Adresse traduite d'une page, sans préfixe de langue ni slash de bord (vide pour l'accueil) : `imprimerie/global`. */
export function getSlug(pageId: PageId, locale: Locale): string {
  return resolveSlugs(pageId.split("."), key => findMessage(locale, `pages.${key}.slug`)).join("/");
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
  const pageId = getPageIds().find(id => getPath(id, locale) === target);
  return pageId ? { pageId, locale } : null;
}

/** Toutes les adresses du site (une par page et par langue), pour le pré-rendu et le sitemap. */
export function getAllRoutes(): { pageId: PageId; locale: Locale; path: string }[] {
  return locales.flatMap(locale => getPageIds().map(pageId => ({ pageId, locale, path: getPath(pageId, locale) })));
}
