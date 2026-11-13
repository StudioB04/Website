# CLAUDE.md — Site StudioB04

Site vitrine statique et bilingue de StudioB04 : React 19 + TypeScript, React Router, Tailwind 4, design system `@studio_b04/ds` (≥ 0.1.6). Pages pré-générées au build (SSG) puis hydratées. `README.md` décrit le projet ; ce fichier donne les règles pour y travailler.

## Règles du projet (décidées par le propriétaire)

- **Aucune bibliothèque externe sauf absolue nécessité.** Dépendances actuelles : `react`, `react-dom`, `react-router`, `@studio_b04/ds` ; en développement : Vite, `@vitejs/plugin-react`, TypeScript, Tailwind (`tailwindcss`, `@tailwindcss/vite`), Vitest, jsdom, Testing Library. N'en ajouter aucune sans accord.
- **React Router :** utiliser le paquet `react-router` (v8). `react-router-dom` n'est plus qu'une façade de la v7.
- **Langues :** français à la racine (`/`), anglais sous `/en/`. Pas de redirection selon la langue du navigateur. Seulement français et anglais.
- **Textes :** toujours dans `src/i18n/fr.json` et `en.json` (mêmes clés), jamais en dur dans les composants.
- **Navigation sans rechargement :** l'état global (par exemple un toast) doit vivre dans `App.tsx`, au-dessus de `<Routes>`. `GlobalLayout` est aussi réutilisé d'une page à l'autre (vérifié dans Chrome), mais il est rendu dans l'élément de chaque `<Route>` : ne pas compter sur lui pour un état qui doit survivre.
- **Thème :** pas de bouton de changement de thème (demande abandonnée). Le site suit le réglage clair/sombre du système via les jetons du design system. Ne pas en ajouter sans demande.
- **Tests unitaires** pour tout comportement ajouté ou modifié.
- Les documents, textes et échanges sont en français.

## Commandes

```bash
npm install
npm run dev          # Vite, http://localhost:5173 (réseau local inclus), sans pré-rendu
npm run build        # build:client + build:server + prerender → dist/client
npm run preview      # sert dist/client
npm run test:run     # Vitest, une exécution (npm test = mode watch)
npm run typecheck    # tsc --noEmit
```

Avant de livrer : `npm run typecheck && npm run test:run && npm run build`, puis `npm run preview` et vérifier dans le navigateur : aucune erreur console, navigation sans rechargement, changement de langue.

## Architecture

- `index.html` : modèle du build, repères `<!--app-head-->` et `<!--app-html-->`.
- `scripts/prerender.ts` : importe le module serveur, appelle `render(url)` pour chaque route de `getAllRoutes()`, écrit `dist/client/<chemin>/index.html`, plus `404.html`, `sitemap.xml`, `robots.txt`, puis supprime `dist/server`. Exécuté par Node directement (TypeScript sans compilation).
- `src/entry-server.tsx` : `render(url)` = `prerender` de `react-dom/static` + `StaticRouter`, renvoie `{ html, head, locale }`.
- `src/entry-client.tsx` : `hydrateRoot` si la page contient déjà du HTML, sinon `createRoot` (cas du serveur de dev).
- `src/routes.ts` : source unique des pages et des adresses. `getPath(pageId, locale)`, `getAlternates`, `findPage`, `getLocaleFromPath`, `getAllRoutes`. Les slugs viennent des JSON ; la langue par défaut est sans préfixe.
- `src/App.tsx` : une `<Route>` par page et par langue (générées depuis `getAllRoutes()`), plus la 404.
- `src/head.ts` : `renderHead()` génère les balises SEO au build. React Router ne gère pas le `<head>`.
- `src/layouts/GlobalLayout/GlobalLayout.tsx` : fournit la langue (`I18nProvider`), le lien d'évitement, l'en-tête, `<main id="main">`, le pied de page. Met à jour `lang`, le titre et la description à chaque navigation, et place le focus sur le `h1` après un changement d'adresse (jamais au premier rendu).
- `src/components/AppLink/AppLink.tsx` : `Link` du design system + `useLinkClickHandler` de React Router (navigation interne sans rechargement).

## Conventions de code

- TypeScript strict, `verbatimModuleSyntax` : utiliser `import type` pour les types.
- Un composant par dossier : `src/components/<Nom>/<Nom>.tsx` en `export default function`, puis une ligne dans `src/components/index.ts` : `export { default as <Nom> } from "./<Nom>/<Nom>";`. Les fichiers propres au composant (test, styles) vont dans son dossier. Même organisation pour les pages (`src/pages/<Nom>/<Nom>.tsx` et `src/pages/index.ts`) et pour les layouts (`src/layouts/<Nom>/<Nom>.tsx` et `src/layouts/index.ts`).
- Imports : tout ce qui remonte dans l'arborescence passe par l'alias `@/` (`@/i18n`, `@/routes`, `@/head`), jamais par `../../…`. Les composants, les layouts et les pages s'importent via leur fichier d'index : `import { Footer, PageHeader } from "@/components";`, `import { GlobalLayout } from "@/layouts";`, `import { Home } from "@/pages";`. Les imports dans le même dossier restent relatifs (`./routes`). Exception : à l'intérieur de `src/components`, importer un autre composant par chemin relatif (`../Header/Header`), jamais par l'index (risque de dépendance circulaire).
- Alias d'import : `@/*` → `src/*`. Un alias se déclare une seule fois, dans `paths` de `tsconfig.json` ; Vite, Vitest et le pré-rendu le lisent grâce à `resolve.tsconfigPaths: true` dans `vite.config.ts` (ne pas ajouter de `resolve.alias`).
- Styles : classes Tailwind du thème du design system, pas de CSS maison. `src/styles/global.css` (fichier tenu par le propriétaire, ne pas le modifier sans demande) ne contient que l'ordre des couches et les imports ; les styles de base (couleurs du `body`, anneau de focus) viennent du reset du design system. Pour un jeton sans classe : `bg-(--ds-bg-inverse)`, `text-(color:--ds-text-inverse)`.
- Accessibilité (priorité du projet) : repères de page, navigations nommées, `aria-current`, `lang` sur les liens de langue, anneau de focus visible (fourni par le reset du design system), focus géré après navigation.
- Tests : Vitest + Testing Library, à côté du code. Chercher par rôle et nom accessible, pas par classe CSS. Les tests de rendu serveur commencent par `// @vitest-environment node`.

## Pièges connus

- **Couches CSS :** garder la déclaration `@layer base, properties, theme, mozaic, utilities, components;` en première ligne de `global.css`, et les imports `@studio_b04/ds/styles` et `@studio_b04/ds/reset` dans `layer(base)` ; sinon des règles hors couche écrasent les classes Tailwind (`p-3`, `m-0`…).
- **Thème Tailwind du design system :** il supprime la palette par défaut ; l'espacement est basé sur 0,5 rem (`p-3` = 1,5 rem). Les noms (`bg-primary`, `text-brand`, `border-primary`) n'existent qu'à partir de `@studio_b04/ds` 0.1.6. Avec un lockfile, `^0.1.5` n'installe pas la 0.1.6 : utiliser `npm install @studio_b04/ds@latest`.
- **Icônes du design system :** bloquées par les navigateurs (`<use href="data:…">`). Ne pas utiliser `iconStart`, `iconEnd` ni `external` sur `Link` et `Button`. Le composant `Icon` embarque toute la bibliothèque Lucide, d'où ~1,3 Mo de JavaScript. À corriger dans le design system.
- **`StrictMode` (développement) :** les effets s'exécutent deux fois. Ne pas détecter le « premier rendu » avec un booléen : `GlobalLayout` compare l'adresse précédente (un test le couvre).
- **Rendu serveur :** ne pas lire `window` ni `document` pendant le rendu, seulement dans les effets.
- **Slugs :** un slug ne doit jamais être égal à un code de langue (conflit avec le préfixe `/en/`) ; un test le vérifie.
- **Serveur de dev :** n'injecte pas les balises SEO du `<head>` ; vérifier le SEO avec `build` + `preview`.
- **Lien d'évitement :** le composant `SkipLink` du projet existe aussi dans le design system (≥ 0.1.6) ; la version locale peut être remplacée si on le souhaite.
- **Page 404 :** `404.html` est générée en français uniquement (`render("/404/")`). Le rendu client d'une adresse inconnue sous `/en/` se fait en anglais : l'accord avec le HTML français pré-généré n'est pas vérifié. À tester avant de rendre la 404 bilingue.

## Hébergement

Pas encore choisi. Le résultat est un dossier statique (`dist/client`). Il faut un hébergeur qui renvoie `404.html` avec le statut 404. L'URL publique se règle avec `VITE_SITE_URL` (défaut `https://www.studiob04.fr`).
