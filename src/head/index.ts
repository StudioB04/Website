import { NOINDEX, SITE_URL } from "@/config";
import { defaultLocale, locales, translate } from "@/i18n";
import type { Locale } from "@/i18n";
import { getAlternates, getPath } from "@/router";
import type { PageId } from "@/router";

const ogLocales: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export interface PageMeta {
  title: string;
  description: string;
}

export function getPageMeta(pageId: PageId | "notFound", locale: Locale): PageMeta {
  return { title: translate(locale, `pages.${pageId}.title`), description: translate(locale, `pages.${pageId}.description`) };
}

export function renderHead(pageId: PageId | "notFound", locale: Locale): string {
  const { title, description } = getPageMeta(pageId, locale);
  const tags = [`<title>${escapeHtml(title)}</title>`, `<meta name="description" content="${escapeHtml(description)}" />`];

  if (pageId === "notFound" || NOINDEX) {
    tags.push(`<meta name="robots" content="noindex" />`);
  }

  if (pageId === "notFound") {
    return tags.join("\n    ");
  }

  const url = `${SITE_URL}${getPath(pageId, locale)}`;
  const alternates = getAlternates(pageId);

  tags.push(`<link rel="canonical" href="${url}" />`);
  for (const alt of locales) {
    tags.push(`<link rel="alternate" hreflang="${alt}" href="${SITE_URL}${alternates[alt]}" />`);
  }
  tags.push(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}${alternates[defaultLocale]}" />`);

  tags.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(translate(locale, "site.name"))}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:locale" content="${ogLocales[locale]}" />`,
  );

  if (pageId === "home") {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: translate(locale, "site.name"),
      url,
      description,
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>`);
  }

  return tags.join("\n    ");
}
