/** URL publique du site, sous-dossier inclus (ex. https://studiob04.github.io/Website). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? "https://www.studiob04.fr").replace(/\/$/, "");

/** Sous-dossier d'hébergement, slash final inclus : "/" à la racine, "/Website/" sur GitHub Pages. */
export const BASE_URL = import.meta.env.BASE_URL;

/** Préprod : toutes les pages portent `noindex` et aucun sitemap n'est publié. */
export const NOINDEX = import.meta.env.VITE_NOINDEX === "true";
