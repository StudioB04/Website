/**
 * Découverte des pages à partir des chemins de fichiers de `src/pages`.
 *
 * Une page est le fichier `<Dossier>/<Dossier>.tsx` (le nom du fichier est celui de son dossier). Son identifiant est le chemin
 * des dossiers, en camelCase et séparé par des points : `Print/Global/Global.tsx` donne `print.global`, qui est aussi le chemin du
 * bloc de la page dans les JSON de langue (`pages.print.global`). Un dossier peut n'avoir que des sous-dossiers de pages.
 *
 * Aucune dépendance à Vite ni à React : ce module ne reçoit que des chemins, ce qui le rend testable seul.
 */

/** Identifiant de l'accueil : `Home/Home.tsx`, servi à la racine de chaque langue. */
export const HOME_ID = "home";

/** Dossiers de premier niveau de `src/pages` qui ne sont pas des routes (la page d'erreur est affichée par le routeur, sans adresse). */
const RESERVED_FOLDERS: readonly string[] = ["Error"];

// `/src/pages/Print/Global/Global.tsx` : les dossiers parents, puis `Global/Global.tsx` (même nom pour le dossier et le fichier).
const PAGE_FILE = /^\/src\/pages\/((?:[^/]+\/)*?)([^/]+)\/\2\.tsx$/;

export interface PageFile {
  /** Chemin de fichier d'origine (`/src/pages/Print/Global/Global.tsx`). */
  file: string;
  /** Un élément par dossier, en camelCase (`["print", "global"]`). */
  segments: string[];
  /** `segments` séparés par des points (`print.global`) : clé de la page dans les JSON de langue. */
  id: string;
}

export function lowerFirst(name: string): string {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

/** `tradeShows` → `trade-shows` : adresse par défaut d'un dossier qui n'a pas de `slug` dans les JSON. */
export function toKebabCase(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Lit un chemin de fichier : renvoie la page qu'il définit, ou `null` s'il n'est pas une page (test, helper, style, dossier réservé…). */
export function parsePageFile(file: string): PageFile | null {
  const match = PAGE_FILE.exec(file);
  if (!match) return null;

  const folders = [...match[1].split("/").filter(Boolean), match[2]];
  if (RESERVED_FOLDERS.includes(folders[0])) return null;

  const segments = folders.map(lowerFirst);
  return { file, segments, id: segments.join(".") };
}

/** Les pages d'une liste de chemins de fichiers, l'accueil en premier puis par ordre alphabétique. Deux fichiers pour une même page : erreur. */
export function toPageFiles(files: string[]): PageFile[] {
  const pages = files.flatMap(file => parsePageFile(file) ?? []);

  const seen = new Map<string, string>();
  for (const { id, file } of pages) {
    const other = seen.get(id);
    if (other !== undefined) throw new Error(`Deux fichiers définissent la même page « ${id} » : ${other} et ${file}.`);
    seen.set(id, file);
  }

  const rank = (page: PageFile) => (page.id === HOME_ID ? "" : page.id);
  return pages.sort((a, b) => rank(a).localeCompare(rank(b)));
}

/**
 * L'adresse d'une page, un élément par dossier : le `slug` de la langue (`lookup("print.global")` lit `pages.print.global.slug`),
 * ou à défaut le nom du dossier en kebab-case. L'accueil n'a pas d'adresse (tableau vide).
 */
export function resolveSlugs(segments: string[], lookup: (key: string) => string | undefined): string[] {
  if (segments.length === 1 && segments[0] === HOME_ID) return [];

  return segments.map((segment, index) => lookup(segments.slice(0, index + 1).join(".")) || toKebabCase(segment));
}
