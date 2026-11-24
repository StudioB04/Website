import { useCallback, useEffect, useState } from "react";

export const themes = ["light", "dark", "system"] as const;
export type Theme = (typeof themes)[number];
export const defaultTheme: Theme = "system";

/** Clé de `localStorage`. Le script de `index.html`, qui pose le thème avant le premier affichage, utilise la même. */
export const THEME_STORAGE_KEY = "studiob04-theme";

export function isTheme(value: unknown): value is Theme {
  return themes.includes(value as Theme);
}

/** Le thème choisi lors d'une visite précédente, `"system"` s'il n'y en a pas (ou si le navigateur refuse l'accès au stockage). */
export function getStoredTheme(): Theme {
  try {
    const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : defaultTheme;
  } catch {
    return defaultTheme;
  }
}

function storeTheme(theme: Theme): void {
  try {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Navigation privée ou stockage plein : le choix vaut pour la page en cours seulement.
  }
}

/** Le design system lit `data-ds-theme` sur `<html>` ; sans l'attribut, c'est le réglage du système (`prefers-color-scheme`) qui s'applique. */
export function applyTheme(theme: Theme): void {
  if (theme === "system") delete document.documentElement.dataset.dsTheme;
  else document.documentElement.dataset.dsTheme = theme;
}

/**
 * Le thème de l'interface et le moyen d'en changer. Le premier rendu vaut toujours `"system"` (celui du HTML pré-rendu : pas d'écart à
 * l'hydratation) ; le choix mémorisé est lu juste après.
 */
export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    storeTheme(next);
  }, []);

  return { theme, setTheme };
}
