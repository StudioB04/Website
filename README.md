# Site StudioB04

Site vitrine statique et bilingue (français / anglais) de StudioB04.
Pile : React 19, TypeScript, React Router, Tailwind 4 et le design system `@studio_b04/ds`.
Toutes les pages sont pré-générées en HTML au build (SSG), puis hydratées dans le navigateur.

## Prérequis

- Node ≥ 22.22 (le script de pré-rendu est un fichier TypeScript exécuté directement par Node)
- npm
- `@studio_b04/ds` ^0.1.11 (thème Tailwind depuis la 0.1.6 ; icônes affichables depuis la 0.1.8, voir « Limites connues »)

## Démarrage

```bash
npm install
npm run dev
```

Le site est alors sur http://localhost:5173, et aussi sur le réseau local (`vite --host`).

## Commandes

| Commande            | Rôle                                                          |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement (Vite)                               |
| `npm run build`     | Build client + serveur, puis pré-rendu dans `dist/client`     |
| `npm run preview`   | Sert `dist/client` en local (rendu identique à la production) |
| `npm test`          | Tests unitaires en mode watch (Vitest)                        |
| `npm run test:run`  | Tests unitaires, une seule exécution                          |
| `npm run typecheck` | Vérification TypeScript                                       |

## Comment ça marche

**Au build**, `npm run build` enchaîne trois étapes :

1. `build:client` compile le code du navigateur dans `dist/client`. Le fichier `index.html` sert de modèle, avec deux repères : `<!--app-head-->` et `<!--app-html-->`.
2. `build:server` compile `src/entry/server.tsx` en un module Node (`dist/server/server.js`). Sa fonction `render(url)` utilise le rendu statique de React 19 (`prerender`) avec un `StaticRouter`.
3. `prerender` (`scripts/prerender.ts`) appelle `render()` pour chaque page et chaque langue, insère le HTML et le `<head>` dans le modèle, et écrit un `index.html` par page. Il génère aussi `404.html`, `sitemap.xml` et `robots.txt` (pas de sitemap en préprod, voir plus bas), puis supprime `dist/server`.

**Dans le navigateur**, `src/entry/client.tsx` hydrate le HTML existant. Ensuite, la navigation passe par React Router : aucune page n'est rechargée. `MainLayout` est une route de layout unique (`<Route element={<MainLayout />}>` dans le composant `Router`, les pages s'affichent dans son `<Outlet />`) : l'en-tête, le pied de page et leur état restent en place d'une page à l'autre, y compris au changement de langue (un test le vérifie). Un état global qui doit survivre à la navigation (un toast, par exemple) peut donc vivre dans `MainLayout` ou dans `App.tsx`, au-dessus de `<Router />`. Seul un rafraîchissement du navigateur ou la saisie d'une adresse recharge le site.

**En développement**, la page est rendue uniquement dans le navigateur, sans pré-rendu : les balises SEO du `<head>` n'y sont pas injectées. Pour voir le résultat réel, utiliser `npm run build` puis `npm run preview`.

## URL et langues

Le français (langue par défaut) est à la racine, les autres langues sont préfixées, et **chaque page a une adresse traduite dans chaque langue**. Il n'y a pas de redirection selon la langue du navigateur.

| Page             | Français             | Anglais             |
| ---------------- | -------------------- | ------------------- |
| Accueil          | `/`                  | `/en/`              |
| Numérique        | `/numerique/`        | `/en/digital/`      |
| Impression       | `/impression/`       | `/en/print/`        |
| Enseignes        | `/enseignes/`        | `/en/signs/`        |
| Salons           | `/salons/`           | `/en/trade-shows/`  |
| Mentions légales | `/mentions-legales/` | `/en/legal-notice/` |

Six pages pour l'instant. Numérique, Impression, Enseignes et Salons (`Web`, `Print`, `Enseignes`, `Salons` dans `src/pages`) sont des pages provisoires, avec un seul `<div>` de texte. Le bloc `pages.actu` (`/actualites/`, `/en/actuality/`) est dans les fichiers de langue, mais le dossier `src/pages/Actu` n'existe plus : cette adresse affiche donc la 404. Toute autre adresse affiche aussi la page 404.

Les pages se trouvent toutes seules : chaque fichier `src/pages/<Dossier>/<Dossier>.tsx` est une page, et le chemin de ses dossiers donne son identifiant (`Print/Global/Global.tsx` → `print.global`) et le bloc de ses textes dans les JSON (`pages.print.global`). `Home/Home.tsx` est l'accueil, et le dossier `Error` est réservé à la page d'erreur. L'adresse d'une page est la suite des `slug` de ses dossiers, traduits dans `locales/fr.json` et `locales/en.json` : si `pages.print.slug` vaut `imprimerie` en français et `print` en anglais, et `pages.print.global.slug` vaut `global`, la page est servie à `/imprimerie/global/` et `/en/print/global/`. Le bloc d'une page peut aussi porter un `link`, le libellé de son lien dans le menu principal (`pages.web.link`). Sans `slug`, l'adresse d'un dossier est son nom en minuscules avec des tirets (`TradeShows` → `trade-shows`). Vite liste les pages au build (`import.meta.glob`, `src/router/routes/pageModules.ts`) et le composant `Router` (`src/router/Router/Router.tsx`) génère une `<Route>` par page et par langue, pour le français (racine) et sous `<Route path="en">` : il n'y a aucune liste à tenir. `src/App.tsx` se limite à fournir la langue (`I18nProvider`) et à afficher `<Router />`. `src/router/routes/routes.ts` fournit les fonctions qui dérivent les adresses complètes (`getSlug`, `getPath`, `getAlternates`, `findPage`, `getAllRoutes`), utilisées par `hreflang`, le sitemap et le lien de retour des pages d'erreur ; `isCurrentPage(pageId, pathname)` dit si une page est celle qui est affichée (le `pathname` vient de `useLocation()`), pour poser `aria-current="page"` sur le lien d'un menu ; `src/router/routes/pageFiles.ts` contient les règles de nommage, testables sans Vite. La langue par défaut est `defaultLocale` dans `src/i18n/index.tsx`. L'identifiant d'une page est une simple chaîne (`"home"`, `"print.global"`) : TypeScript ne le vérifie pas, ce sont les tests qui contrôlent que chaque page trouvée a son bloc. Une adresse ne doit jamais commencer par un code de langue (`en`), ni être celle d'une autre page de la même langue : des tests le vérifient, ainsi que la présence du titre et de la description de chaque page dans les deux langues.

## Textes et traductions

Tous les textes sont dans `src/i18n/locales/fr.json` et `src/i18n/locales/en.json`, qui doivent avoir exactement les mêmes clés et les mêmes `{{paramètres}}` (un test le vérifie ; TypeScript ne le fait plus). Ils ont trois blocs :

- `site` : `site.name`, le nom du site (balises du `<head>`) ;
- `common` : les textes partagés par les layouts : `skiplinks.{header,main,footer}` (liens d'évitement), `main-menu.title` (nom du menu principal), `buttons.{scroll-to-top,back-to-home}`, `languageSwitcher` (nom du choix de langue) et `settings` (`title` du panneau de réglages, `theme.{title,light,dark,system}` pour le choix du thème) ;
- `pages` : un bloc par page, dont la clé est le chemin de ses dossiers en camelCase (`"home"`, `"legal"`, `"web"`, `"print.global"`), avec `title` et `description` (le `<head>`), `heading` (le `h1`, quand il diffère du `title` : `legal`), `slug` (l'adresse) et `link` (le libellé du menu). Le bloc `error` (`title` avec `{{status}}`, `intro`) est prévu pour les pages d'erreur.

Les composants lisent les textes avec la fonction `t`, qui prend la clé (le chemin dans le JSON, séparé par des points) et, au besoin, les valeurs à insérer :

```tsx
const { t } = useI18n();

t("common.buttons.back-to-home"); // "Retour à l'accueil"
t(`pages.${page}.link`); // clé construite : aucune vérification à la compilation
```

Dans le JSON, un paramètre s'écrit `{{nom}}` (`"Erreur {{status}}."`) et `t("la.cle", { status: 404 })` le remplace. Les clés ne sont plus typées (`MessageKey` est un simple `string`) : une faute de frappe ne se voit pas à la compilation. Une clé introuvable à l'exécution renvoie la clé elle-même, ce qui la rend visible dans la page. Un marqueur sans valeur correspondante reste tel quel (`{{nom}}`).

- `translate(locale, key, params)`, exportée par `@/i18n`, fait la même chose sans React (utilisée pour les balises du `<head>`, voir `src/head/index.ts`).
- `findMessage(locale, key)` renvoie le texte, ou `undefined` s'il n'existe pas (là où `translate` renvoie la clé) : c'est ce qui sert à lire le `slug` d'une page, qui peut être absent.
- `useI18n()` renvoie aussi `locale` et `messages` (le dictionnaire complet).
- `formatDate(locale, isoDate?)`, exportée par `@/i18n`, écrit une date longue avec une majuscule à chaque mot (`Mardi 24 Novembre 2026`) : celle du jour, ou `isoDate` (`"2026-11-24"`). Elle passe par l'API Temporal quand le navigateur la fournit et par `Date` sinon (Node 22 au prérendu) : le texte est le même des deux côtés, donc sans écart à l'hydratation.

Les pages d'erreur (`src/pages/Error/Error.tsx`) lisent `pages.notFound` et `pages.serverError` (`heading`, `intro`), ainsi que `common.buttons.back-to-home` pour le lien de retour. Les fichiers de langue n'ont pour l'instant que le bloc `pages.error` : tant que les deux ne sont pas rapprochés, ces pages affichent les clés à la place des textes, et la 404 n'a ni titre ni description propres dans le `<head>`.

Les pages `Home` et `Legal` n'affichent que du lorem ipsum (et, pour `Legal`, son titre et sa description lus dans le JSON). Restent aussi écrits en dur : le bouton « On s'apelle ? » et le libellé « Open main menu » de `MainNavigation`, et le texte de `SubFooter` (non affiché). Les fichiers de langue contiennent encore le bloc `pages.actu`, qu'aucune page ne lit ; les anciens textes des pages retirées, dont les mentions légales avec leurs `[À compléter]`, sont dans l'historique git.

## SEO

`src/head/index.ts` génère au build, pour chaque page : titre, description, URL canonique, liens `hreflang` (dont `x-default` vers le français), Open Graph, et JSON-LD sur l'accueil. La page 404 est en `noindex`, ainsi que toutes les pages de la préprod (voir « Préproduction »). Côté navigateur, `Router` met à jour le titre, la description et l'attribut `lang` à chaque changement de page. Le reste du `<head>` (canonical, `hreflang`, Open Graph, `robots`, JSON-LD) n'est écrit qu'au build et ne suit pas la navigation sans rechargement : chaque adresse a son propre HTML pré-rendu, c'est lui que lisent les moteurs de recherche.

## Accessibilité

- Trois liens d'évitement (`SkipLink` du design system, textes traduits dans `common.skiplinks`) vers l'en-tête (`#header`), le contenu (`#main`) et le pied de page (`#footer`), placés avant l'en-tête : chaque ancre doit correspondre à un `id` présent dans la page (un test le vérifie). Repères de page : `banner` (`header`), `main` et `contentinfo` (`footer`).
- Le menu principal (`MainNavigation`) est une `<nav>` nommée (`common.main-menu.title`) dont le lien de la page affichée porte `aria-current="page"` (`isCurrentPage`). Sur petit écran, il se range dans une fenêtre (`Dialog` du design system) ouverte par un bouton, et se referme au choix d'une page. Au survol ou au focus clavier d'un lien, un fond unique glisse d'un lien à l'autre (`::after` de la liste, positionné par ancrage CSS ; si le navigateur ne gère pas l'ancrage, le fond reste sur le lien lui-même).
- Le bouton « retour en haut » est hors de l'ordre de tabulation et de l'arbre d'accessibilité tant qu'il est caché (`inert`) ; il a un `title` et un texte pour lecteur d'écran traduits (`common.buttons.scroll-to-top`).
- `AppLink` et `LanguageSwitcher` (non affiché pour l'instant) signalent la page courante par `aria-current` et la langue par `lang`.
- Anneau de focus visible sur tous les éléments, fourni par le reset du design system.
- Après une navigation, le focus se place sur le titre `h1` de la page, dans `#main` (pas au premier chargement) : le `h1` de chaque page doit donc porter `tabIndex={-1}`, sinon le focus ne bouge pas.
- Attribut `lang` sur chaque lien du sélecteur de langue.

## Styles

Tailwind 4 est branché par le plugin Vite `@tailwindcss/vite`. `src/styles/global.css`, importé par `App.tsx`, contient dans l'ordre :

1. `@layer base, properties, theme, fonts, utilities, components;` : déclare l'ordre des couches, de sorte que les classes utilitaires de Tailwind l'emportent sur le reset et les styles du design system
2. `@studio_b04/ds/styles` dans `layer(base)` : jetons CSS (`--ds-*`), clair/sombre
3. `@studio_b04/ds/reset` dans `layer(base)` : reset du design system (couleurs du `body`, anneau de focus `:focus-visible`)
4. `tailwindcss` dans `layer(theme)`
5. `@studio_b04/ds/tailwind-theme` dans `layer(theme)` : le thème Tailwind du design system
6. `@layer fonts { :root { --ds-font-family-sans: "Red Hat Display", sans-serif; } }` : la police du site
7. un bloc `:root` (`font-size: 16px`, fond `--ds-bg-tertiary`, `scroll-behavior: smooth`) et un bloc `#root` : le conteneur nommé `screen` (`container-type: inline-size`), d'au moins `100dvh` de haut, de `100dvw` de large au plus `1920px` (centré), avec `overflow-x: clip`

**Police :** Red Hat Display est chargée par les balises `<link>` de `index.html` (deux `preconnect` et la feuille de style Google Fonts), et non par un `@import` dans le CSS : Tailwind insère les imports locaux dans le fichier, or un `@import` distant doit précéder toute règle, sinon le build échoue (« @import statements must precede all other statements »).

**CSS des layouts :** chaque layout a son fichier à côté du composant (`Header/Header.css`, `MainLayout/MainLayout.css`…), importé par le composant. Un fichier CSS est compilé seul : pour y utiliser `@apply` avec un utilitaire qui dépend du thème (`container`, `p-lg`, `text-brand`…), il faut commencer par `@reference "@/styles/global.css";`, sinon `@apply container` ne produit que `width: 100%`, sans les points de rupture. Cette ligne n'ajoute aucun CSS. Les points de rupture du thème sont `sm` 37,5 rem, `md` 61,25 rem, `lg` 75 rem et `xl` 112,5 rem (ils remplacent ceux de Tailwind) ; à la main, on écrit `@media screen and (width > 61.25rem)` avec un commentaire `/* md */`. Dans VS Code, `.vscode/settings.json` règle `css.lint.unknownAtRules` sur `ignore` pour ne pas signaler `@apply` et `@reference`.

**`MainLayout.css` :** la page entière défile (c'est la fenêtre, non plus une zone interne). `.main-layout` est une colonne d'au moins `100dvh` : `header.main-layout__header`, `main.main-layout__inner` (le panneau arrondi) puis `footer.main-layout__footer`. Les tailles, marges et rayons dépendent du point de rupture (variables `--main-layout-*` : l'en-tête mesure 4, 5, 6 puis 7 rem au repos). Deux animations suivent le défilement de la page, avec `animation-timeline: scroll(root block)` dans un `@supports (animation-timeline: scroll())` (sans prise en charge, rien ne bouge) :

- l'en-tête, collé en haut (`position: sticky`), rétrécit (`shrink-header` : de 4-7 rem à 3-4 rem selon le point de rupture), prend une ombre, une bordure et une légère inclinaison ;
- le fond de points est le `::before` de `main.main-layout__inner` : un calque `position: sticky` qui reste en place pendant le défilement et s'efface (`opacity` de 0,3 à 0) avec un effet de parallaxe (`parallax-dots`) sur les 350 premiers pixels (`--fade-distance`).

Le bouton « retour en haut » (`.main-layout__inner__top-button`) est fixe, au-dessus du pied de page (`bottom: var(--footer-height)`) ; la classe `--visible` le fait apparaître quand la page est défilée de plus de 400 px. `MainLayout` écrit la hauteur de l'en-tête, de `main` et du pied de page dans `--header-height`, `--main-height` et `--footer-height` (sur `<html>`, `setHTMLCustomProp`), que les CSS des layouts réutilisent.

**`GlassBlock` :** composant d'habillage « verre dépoli » (`src/components/GlassBlock`) : un bloc arrondi, translucide et flouté (`backdrop-filter`), `div` par défaut ; la propriété `as` choisit une autre balise (`<GlassBlock as="section">`) et les autres propriétés HTML passent à l'élément.

**Réglages :** le bouton fixe sur le bord de la page (`SettingsPanel`, rendu par `MainLayout`) ouvre un dialog qui contient `LanguageButton` (un bouton vers la même page dans l'autre langue, avec navigation interne) et `ThemeSwitcher` (clair, sombre ou système). Le thème est géré par `useTheme()` (`src/theme`) : l'attribut `data-ds-theme` de `<html>` (absent pour « système »), mémorisé dans `localStorage` ; un petit script en ligne de `index.html` le repose avant le premier affichage pour éviter un clignotement.

Classes issues du thème : `bg-secondary`, `text-secondary`, `text-brand`, `border-primary`, `text-title-xl`, `leading-title-xl`, `rounded-lg`, etc. L'espacement est basé sur `--ds-spacing-unit` (0,5 rem) : `p-3` = 1,5 rem. Le thème supprime la palette Tailwind par défaut (`--color-*: initial`) : seules les couleurs du design system existent. Pour une valeur sans classe, utiliser un jeton en valeur arbitraire : `bg-(--ds-bg-inverse)`, `text-(color:--ds-text-inverse)`.

Par défaut, le site suit le réglage clair/sombre du système, uniquement en CSS : les jetons du design system (`@studio_b04/ds/styles`) changent de valeur selon `prefers-color-scheme`, le reset applique `--ds-bg-primary` et `--ds-text-primary` au `body`, et le thème Tailwind pointe vers ces mêmes jetons, d'où l'absence de variante `dark:`. Le choix « clair » ou « sombre » du dialog des réglages pose l'attribut `data-ds-theme` sur `<html>` (voir « Réglages » plus haut) ; `index.html` déclare `<meta name="color-scheme" content="light dark">` pour que les contrôles natifs suivent aussi.

## Tests

Vitest, jsdom et Testing Library. Les tests sont à côté du code (`*.test.ts(x)`). Ils couvrent la découverte des pages dans `src/pages` (nommage, pages imbriquées, repli sur le nom du dossier), les routes et les chemins par langue, les fichiers de langue (mêmes clés et mêmes paramètres en français et en anglais, `translate`, `findMessage`), le `<head>` (SEO), `MainLayout` (`src/layouts/MainLayout/MainLayout.test.tsx` : les trois repères, les liens d'évitement, le layout qui reste monté entre deux pages, les variables `--header-height`, `--main-height` et `--footer-height`, le bouton « retour en haut » : seuil de 400 px, `inert`, clic, arrêt de l'écoute au démontage), `GlassBlock` (balise `as`, classes, propriétés transmises), l'application (lien d'évitement, chaque adresse de `getAllRoutes()`, accueil à la racine, page 404, focus après navigation), les pages d'erreur (`Error.test.tsx` : textes 404 et 500 dans chaque langue ; `ErrorBoundary.test.tsx` et `Router.test.tsx` : une page qui plante affiche la 500 dans le layout, sans toucher aux autres pages ; `Router.nested.test.tsx` : le routage de pages simulées, dont des pages imbriquées, et leur 404 pour une mauvaise langue) et le pré-rendu serveur (`src/entry/server.test.tsx`, exécuté sans jsdom), le démarrage dans le navigateur (`src/entry/client.test.tsx` : `createRoot` sur une page vide, hydratation sans écart du HTML pré-rendu, sous-dossier d'hébergement), `AppLink` et les liens sous un sous-dossier d'hébergement, et le mode préprod (`noindex`).

Les textes attendus par les tests des pages d'erreur et de `MainLayout` sont lus avec `translate()` et `dictionaries` plutôt qu'écrits en dur : ils suivent donc les fichiers de langue (mais ne détectent pas une clé absente, qui s'affiche telle quelle des deux côtés). `src/setup-tests.ts` nettoie le DOM après chaque test et remplace `matchMedia`, absente de jsdom, par un stub (aucune requête ne correspond : écran étroit) ; `MainNavigation` en a besoin, via `useWindowSize` du design system. Un test qui veut un écran large remplace ce stub avec `vi.stubGlobal("matchMedia", …)`. Pas encore de test pour `isCurrentPage`, `MainNavigation`, `Header` ni `Footer`.

## Structure

```
index.html                  modèle HTML du build (repères <!--app-head--> et <!--app-html-->, police Red Hat Display, color-scheme)
public/                     favicon
scripts/prerender.ts        pré-rendu : une page HTML par route, 404, sitemap, robots
.github/workflows/          déploiement de la préprod sur GitHub Pages (deploy-preprod.yml)
vite.config.ts              Vite, React, Tailwind, Vitest
src/
  App.tsx                   fournit la langue (I18nProvider) et le design system (StudioB04Provider), et affiche <Router />
  entry/                    client.tsx : hydratation ; server.tsx : rendu statique d'une URL (et leurs tests)
  router/                   Router/Router.tsx : les <Route> générées (une par page de src/pages et par langue : français à la racine, anglais sous /en/ ; la 404) et la mise à jour de lang/titre/description/focus ; ErrorBoundary/ErrorBoundary.tsx : la page 500 si une page plante ; routes/ : routes.ts (getSlug, getPath, getAlternates, findPage, isCurrentPage…), pageFiles.ts (règles de nommage des pages) et pageModules.ts (pages trouvées par Vite), avec leurs tests ; index.ts exporte le tout
  head/                     index.ts : balises SEO du <head> (et son test)
  config.ts                 URL publique, sous-dossier d'hébergement (BASE_URL) et mode préprod (NOINDEX)
  i18n/                     index.tsx (I18nProvider, useI18n, t, translate, findMessage, formatDate), formatDate.ts (date longue : Temporal, sinon Date), locales/fr.json et en.json (et les tests)
  theme/                    index.ts : useTheme (thème clair, sombre ou du système), applyTheme, getStoredTheme (et son test)
  components/               un dossier par composant (AppLink, GlassBlock, LanguageButton, LanguageSwitcher, SettingsPanel, ThemeSwitcher) et index.ts qui les exporte
  layouts/                  un dossier par layout, avec son .css : MainLayout (liens d'évitement, en-tête, <main> avec l'<Outlet /> et le bouton « retour en haut », pied de page ; son test), Header (logo, MainNavigation), MainNavigation (menu principal), Footer, SubFooter (non affiché) ; index.ts les exporte
  pages/                    un dossier par page, imbriquable (Home, Legal, Web, Print, Enseignes, Salons ; Print/Global/Global.tsx pour une page imbriquée) ; Error/Error.tsx : pages 404 et 500, sans adresse ; index.ts n'exporte que ErrorPage
  styles/global.css         ordre des couches CSS, imports (Tailwind, design system), police, blocs :root et #root
  setup-tests.ts            configuration Vitest (nettoyage du DOM, stub de matchMedia)
```

## Alias d'import

`@` pointe vers `src` : `import { AppLink, GlassBlock } from "@/components";`, `import { MainLayout } from "@/layouts";`, `import { getPath } from "@/router";` et `import { useI18n } from "@/i18n";` à la place de chemins relatifs du type `../../i18n`. Chaque composant vit dans son dossier (`src/components/<Nom>/<Nom>.tsx`) et est exporté par `src/components/index.ts` ; il en va de même pour les layouts (`src/layouts/index.ts`). Les pages n'ont pas d'`index.ts` à tenir (voir « Ajouter une page »). Les modules de plusieurs fichiers (`src/router`, `src/head`, `src/i18n`) suivent la même idée : un dossier, un `index.ts`, et on les importe par le dossier (`@/router`, `@/head`, `@/i18n`), pas par un fichier interne. Les alias se déclarent une seule fois, dans `paths` de `tsconfig.json` : TypeScript les utilise, et Vite (donc aussi Vitest et le pré-rendu) les lit grâce à `resolve.tsconfigPaths: true` dans `vite.config.ts`.

Pour ajouter un composant : créer `src/components/<Nom>/<Nom>.tsx` (`export default function <Nom>`), puis ajouter `export { default as <Nom> } from "./<Nom>/<Nom>";` à `src/components/index.ts`.

## Ajouter une page

1. Créer `src/pages/<Nom>/<Nom>.tsx` (`export default function <Nom>`), par exemple `src/pages/About/About.tsx` : la route existe aussitôt, il n'y a rien à déclarer ni à exporter. Une page dans un sous-dossier (`src/pages/Print/Global/Global.tsx`) a l'adresse de ses dossiers parents suivie de la sienne.
2. Dans `locales/fr.json` et `locales/en.json`, ajouter sous `pages` un bloc dont la clé est le nom du dossier en camelCase (`"about"` ; pour une page imbriquée, le bloc `"global"` se place dans le bloc `"print"`), avec `title` et `description` (obligatoires : ils servent au `<head>`) et `slug` si l'adresse n'est pas le nom du dossier en kebab-case (`"a-propos"` / `"about"`). Les autres champs (`heading`, `intro`…) sont lus par la page avec `t("pages.about.heading")`.
3. Pour l'afficher dans le menu principal : ajouter son identifiant à la liste de `MainNavigationInner` (`src/layouts/MainNavigation/MainNavigation.tsx`, aujourd'hui `["web", "print", "enseignes", "salons"]`) et un `link` (le libellé du lien) à son bloc `pages` dans les deux langues.
4. Lancer `npm run test:run` : un test échoue si une page n'a pas son titre et sa description dans les deux langues, et le test « renders $path » vérifie qu'elle s'affiche à chacune de ses adresses.

## Ajouter une langue

1. Créer `src/i18n/locales/xx.json` avec les mêmes clés que `fr.json` (blocs `site`, `common` et `pages`).
2. L'ajouter à `locales`, `localeNames` et `dictionaries` dans `src/i18n/index.tsx`, et à `ogLocales` dans `src/head/index.ts`.
3. Ajouter `<Route path="xx">{pages("xx")}</Route>` à côté de `<Route path="en">` dans `src/router/Router/Router.tsx`, et les textes de chaque page dans `xx.json` (`title`, `description` et, au besoin, `slug`).

## Configuration

Trois variables, lues au build (aucune n'est nécessaire pour un build local ordinaire) :

| Variable        | Rôle                                                                                                | Défaut                     |
| --------------- | --------------------------------------------------------------------------------------------------- | -------------------------- |
| `VITE_SITE_URL` | URL publique complète, sous-dossier compris (canonical, `hreflang`, sitemap)                        | `https://www.studiob04.fr` |
| `BASE_PATH`     | Sous-dossier d'hébergement (`/Website`). Devient le `base` de Vite et le `basename` de React Router | vide (racine du domaine)   |
| `VITE_NOINDEX`  | `true` : mode préprod (`noindex` sur toutes les pages, pas de sitemap)                              | non défini                 |

`BASE_PATH` n'a pas le préfixe `VITE_` car il est lu par `vite.config.ts` (Node) ; le code du site reçoit le résultat par `import.meta.env.BASE_URL`, exposé par `src/config.ts`.

## Préproduction (GitHub Pages)

Chaque push sur `main` déploie le site sur GitHub Pages grâce à `.github/workflows/deploy-preprod.yml`. Il peut aussi être lancé à la main (Actions → « Déploiement préprod » → Run workflow).

Le workflow :

1. installe les dépendances (`npm ci`) ;
2. lance `npm run typecheck` et `npm run test:run` : un échec bloque le déploiement ;
3. construit le site avec `VITE_SITE_URL` et `BASE_PATH` fournis par `actions/configure-pages`, et `VITE_NOINDEX=true` ;
4. publie `dist/client`.

**Réglage unique :** Settings → Pages → Source = « GitHub Actions » (déjà fait).

**Adresse :** par défaut `https://studiob04.github.io/Website/` (l'adresse exacte s'affiche sur l'exécution du workflow, job `deploy`). Pour utiliser un domaine à soi (par exemple `preprod.studiob04.fr`) : créer un enregistrement DNS `CNAME` vers `studiob04.github.io`, puis saisir le domaine dans Settings → Pages → Custom domain (un fichier `CNAME` dans le dépôt est ignoré avec un workflow Actions), et relancer le workflow : `configure-pages` fournit alors l'URL du domaine et un chemin vide, sans modification du code.

**Pas d'indexation :** toutes les pages portent `<meta name="robots" content="noindex" />`, aucun `sitemap.xml` n'est publié, et `robots.txt` n'interdit rien. C'est voulu : un `Disallow` empêcherait les moteurs de lire la balise `noindex`. Cela n'empêche pas l'accès : le dépôt étant public, la préprod est lisible par quiconque connaît l'adresse (une préprod privée demande GitHub Enterprise Cloud). Ne pas y mettre de contenu confidentiel.

**Tester le même rendu en local :**

```bash
BASE_PATH=/Website VITE_SITE_URL=https://studiob04.github.io/Website VITE_NOINDEX=true npm run build
BASE_PATH=/Website npm run preview   # http://localhost:4173/Website/
```

## Hébergement (production)

Servir le dossier `dist/client`. Configurer l'hébergeur pour renvoyer `404.html` avec le statut 404 pour les adresses inconnues. Cette page est en français uniquement, y compris pour une adresse inconnue sous `/en/`. La page d'erreur 500 n'existe pas en fichier : elle ne s'affiche que dans le navigateur, si le rendu d'une page échoue. Le choix de l'hébergeur de production n'est pas fait ; GitHub Pages ne sert que la préprod.

## Limites connues

- **Icônes du design system :** elles s'affichent depuis la version 0.1.8 (`iconStart`, `iconEnd` et `external` sur `Link` et `Button`, composant `Icon`) : le composant écrit un `<svg>` en ligne. Avant (0.1.7 et plus ancien), il utilisait `<use href="data:…">`, que les navigateurs bloquent, et chaque page pré-rendue pesait environ 730 Ko. Ne pas revenir sous la 0.1.8.
- **`clsx` :** `GlassBlock`, `MainLayout` et `MainNavigation` l'importent, mais il n'est pas dans le `package.json` du site : il arrive comme dépendance du design system (`@studio_b04/ds`). Un changement de cette dépendance côté design system casserait ces imports.
- **Poids du JavaScript :** environ 720 Ko (200 Ko compressé en gzip), car le composant `Icon` du design system embarque toute la bibliothèque Lucide, même pour une seule icône. Chaque page pré-rendue ne pèse plus que quelques Ko de HTML.
- **Page 404 :** une seule page `404.html` est générée, en français. Il n'y a pas de 404 anglaise pré-générée pour une adresse inconnue sous `/en/`. Le navigateur affiche bien la page en anglais, mais l'hydratation signale l'erreur React #418 dans la console (le HTML français ne correspond pas), puis refait le rendu côté client. GitHub Pages renvoie bien ce fichier avec le statut 404.
- **Sous-dossier :** `npm run dev` et `npm run preview` ne répondent que sous `/Website/` quand `BASE_PATH=/Website` est défini (et `/Website` sans slash final n'y est pas redirigé, contrairement à GitHub Pages).
