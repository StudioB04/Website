import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll } from "vitest";

// jsdom n'implémente pas `matchMedia`, que lisent les hooks du design system (`useWindowSize`, utilisé par `MainNavigation` pour choisir
// entre le menu étalé et le menu en fenêtre). Sans cela, tout rendu du layout plante. Par défaut aucune requête ne correspond (écran étroit) ;
// un test peut remplacer ce stub avec `vi.stubGlobal("matchMedia", …)`.
beforeAll(() => {
  Object.defineProperty(globalThis, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
});
