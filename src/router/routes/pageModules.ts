import type { ComponentType } from "react";
import { toPageFiles, type PageFile } from "./pageFiles";

// Toutes les pages, trouvées par Vite au build (aucune liste à tenir à la main). Les tests et le dossier réservé `Error` sont écartés ici ;
// `toPageFiles` garde ensuite les seuls fichiers `<Dossier>/<Dossier>.tsx`.
const components = import.meta.glob<ComponentType>(["/src/pages/**/*.tsx", "!/src/pages/**/*.test.tsx", "!/src/pages/Error/**"], {
  eager: true,
  import: "default",
});

export interface PageModule extends PageFile {
  Component: ComponentType;
}

let modules: PageModule[] | undefined;

/**
 * Les pages du site. Lues au premier appel et non à l'import du module : une page peut ainsi importer `@/router`
 * sans créer de cycle à l'évaluation.
 */
export function getPageModules(): PageModule[] {
  modules ??= toPageFiles(Object.keys(components)).map(page => {
    const Component = components[page.file];
    if (!Component) throw new Error(`${page.file} doit exporter un composant par défaut.`);
    return { ...page, Component };
  });

  return modules;
}
