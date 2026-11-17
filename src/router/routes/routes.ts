import type { ComponentType } from "react";
import { defaultLocale, findMessage, isLocale, locales, type Locale } from "@/i18n";
import { resolveSlugs } from "./pageFiles";
import { getPageModules } from "./pageModules";

/**
 * Identifiant d'une page : le chemin de ses dossiers dans `src/pages`, en camelCase, séparé par des points (`Print/Global/Global.tsx` →
 * `"print.global"`). TypeScript le déduit des JSON de langue ; un test vérifie que chaque page trouvée dans `src/pages` y a son bloc.
 */

export interface Page {
  id: string;
  Component: ComponentType;
}

let pages: Page[] | undefined;

/** Les pages du site, trouvées dans `src/pages` : l'accueil d'abord, puis par ordre alphabétique. */
export function getPages(): Page[] {
  pages ??= getPageModules().map(({ id, Component }) => ({ id: id as string, Component }));
  return pages;
}

export function getPageIds(): string[] {
  return getPages().map(page => page.id);
}

/** Adresse traduite d'une page, sans préfixe de langue ni slash de bord (vide pour l'accueil) : `imprimerie/global`. */
export function getSlug(pageId: string, locale: Locale): string {
  return resolveSlugs(pageId.split("."), key => findMessage(locale, `pages.${key}.slug`)).join("/");
}

export function getPath(pageId: string, locale: Locale): string {
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  const slug = getSlug(pageId, locale);
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

export function getAlternates(pageId: string): Record<Locale, string> {
  return Object.fromEntries(locales.map(locale => [locale, getPath(pageId, locale)])) as Record<Locale, string>;
}

function normalize(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function getLocaleFromPath(pathname: string): Locale {
  const segment = pathname.split("/")[1];
  return isLocale(segment) && segment !== defaultLocale ? segment : defaultLocale;
}

export function findPage(pathname: string): { pageId: string; locale: Locale } | null {
  const locale = getLocaleFromPath(pathname);
  const target = normalize(pathname);
  const pageId = getPageIds().find(id => getPath(id, locale) === target);
  return pageId ? { pageId, locale } : null;
}

/**
 * Vrai si `pathname` (celui de `useLocation()`, sans le sous-dossier d'hébergement) est l'adresse de la page `pageId`, dans la langue de
 * l'adresse : pour `aria-current="page"` sur le lien d'un menu. Une page mère n'est pas courante quand une de ses pages filles est affichée,
 * et aucune page ne l'est sur une adresse inconnue.
 */
export function isCurrentPage(pageId: string, pathname: string): boolean {
  return findPage(pathname)?.pageId === pageId;
}

/** Toutes les adresses du site (une par page et par langue), pour le pré-rendu et le sitemap. */
export function getAllRoutes(): { pageId: string; locale: Locale; path: string }[] {
  return locales.flatMap(locale => getPageIds().map(pageId => ({ pageId, locale, path: getPath(pageId, locale) })));
}
