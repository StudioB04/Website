# Site StudioB04

Site vitrine statique et bilingue (français / anglais) de StudioB04.
Pile : React 19, TypeScript, React Router, Tailwind 4 et le design system `@studio_b04/ds`.
Toutes les pages sont pré-générées en HTML au build (SSG), puis hydratées dans le navigateur.

## Prérequis

- Node ≥ 22.22 (le script de pré-rendu est un fichier TypeScript exécuté directement par Node)
- npm
- `@studio_b04/ds` ≥ 0.1.6 (nécessaire pour le thème Tailwind)

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

**Dans le navigateur**, `src/entry/client.tsx` hydrate le HTML existant. Ensuite, la navigation passe par React Router : aucune page n'est rechargée. `GlobalLayout` est une route de layout unique (`<Route element={<GlobalLayout />}>` dans le composant `Router`, les pages s'affichent dans son `<Outlet />`) : l'en-tête, le pied de page et leur état restent en place d'une page à l'autre, y compris au changement de langue (un test le vérifie). Un état global qui doit survivre à la navigation (un toast, par exemple) peut donc vivre dans `GlobalLayout` ou dans `App.tsx`, au-dessus de `<Router />`. Seul un rafraîchissement du navigateur ou la saisie d'une adresse recharge le site.

**En développement**, la page est rendue uniquement dans le navigateur, sans pré-rendu : les balises SEO du `<head>` n'y sont pas injectées. Pour voir le résultat réel, utiliser `npm run build` puis `npm run preview`.

## URL et langues

Le français (langue par défaut) est à la racine, les autres langues sont préfixées, et **chaque page a une adresse traduite dans chaque langue**. Il n'y a pas de redirection selon la langue du navigateur.

| Page             | Français             | Anglais             |
| ---------------- | -------------------- | ------------------- |
| Accueil          | `/`                  | `/en/`              |
| Mentions légales | `/mentions-legales/` | `/en/legal-notice/` |

Ce sont les deux seules pages pour l'instant : les autres (numérique, print, enseigne, salons) ont été retirées, et leurs textes restent dans les fichiers de langue sans être utilisés. Toute autre adresse affiche la page 404.

`RouterEnum` (`src/router/RouterEnum.tsx`, importée par `@/router`) liste les pages par identifiant (`HOME`, `LEGAL`), identique dans toutes les langues. L'adresse de chaque page est traduite dans `locales/fr.json` et `locales/en.json` (champ `slug` du bloc de la page ; vide pour l'accueil). Le composant `Router` (`src/router/Router/Router.tsx`) déclare les routes à la main, une `<Route>` par page : la fonction `pages(locale)` les écrit une seule fois, avec `getSlug(RouterEnum.X, locale)` comme adresse, et elle est utilisée pour le français (racine) et sous `<Route path="en">`. `src/App.tsx` se limite à fournir la langue (`I18nProvider`) et à afficher `<Router />`. `src/router/routes/routes.ts` fournit les fonctions qui dérivent les adresses complètes (`getSlug`, `getPath`, `getAlternates`, `findPage`, `getAllRoutes`), utilisées par `hreflang`, le sitemap et le lien de retour des pages d'erreur. La langue par défaut est `defaultLocale` dans `src/i18n/index.tsx`. Un slug ne doit jamais être égal à un code de langue (`en`), ni à celui d'une autre page de la même langue : des tests le vérifient, et un test affiche chaque adresse de `getAllRoutes()`, ce qui détecte une `<Route>` oubliée dans `Router.tsx`.

## Textes et traductions

Tous les textes sont dans `src/i18n/locales/fr.json` et `src/i18n/locales/en.json`, qui doivent avoir exactement les mêmes clés (vérifié par TypeScript et par un test). Sous `pages`, la clé de chaque page est la valeur de `RouterEnum` (`"home"`, `"legal"`), plus `notFound` (404) et `serverError` (500) pour les pages d'erreur.

Les composants lisent les textes avec la fonction `t`, qui prend la clé (le chemin dans le JSON, séparé par des points) et, au besoin, les valeurs à insérer :

```tsx
const { t } = useI18n();

t("pages.notFound.heading");                             // "Page introuvable"
t("common.copyright", { year: new Date().getFullYear() }); // "© 2026 StudioB04. …"
t(`pages.${id}.navLabel`);                               // clé construite : `id` doit être un identifiant de page valide
```

Dans le JSON, un paramètre s'écrit `{{nom}}` : `"copyright": "© {{year}} StudioB04…"`. Les clés sont typées (`MessageKey`) : une faute de frappe ou une clé qui ne désigne pas un texte (un bloc entier, une liste) est refusée par TypeScript. Une clé introuvable à l'exécution renvoie la clé elle-même, ce qui la rend visible dans la page. Un marqueur sans valeur correspondante reste tel quel (`{{nom}}`).

- `translate(locale, key, params)`, exportée par `@/i18n`, fait la même chose sans React (utilisée pour les balises du `<head>`, voir `src/head/index.ts`).
- `useI18n()` renvoie aussi `locale` et `messages` (le dictionnaire complet). `messages` ne sert que pour les listes, qu'une clé de texte ne peut pas désigner (par exemple les sections des mentions légales, `messages.pages.legal.sections.map(...)`, inutilisées pour l'instant).

Pour l'instant, les pages `Home` et `Legal` n'affichent que du lorem ipsum écrit en dur, et les libellés des liens d'évitement de `GlobalLayout` sont en dur aussi : seuls les titres, descriptions et adresses (`<head>`) et les pages d'erreur passent par les fichiers de langue. Les anciens textes des pages (dont les mentions légales, avec leurs `[À compléter]`) sont toujours dans les JSON.

## SEO

`src/head/index.ts` génère au build, pour chaque page : titre, description, URL canonique, liens `hreflang` (dont `x-default` vers le français), Open Graph, et JSON-LD sur l'accueil. La page 404 est en `noindex`, ainsi que toutes les pages de la préprod (voir « Préproduction »). Côté navigateur, `Router` met à jour le titre, la description et l'attribut `lang` à chaque changement de page. Le reste du `<head>` (canonical, `hreflang`, Open Graph, `robots`, JSON-LD) n'est écrit qu'au build et ne suit pas la navigation sans rechargement : chaque adresse a son propre HTML pré-rendu, c'est lui que lisent les moteurs de recherche.

## Accessibilité

- Liens d'évitement (`SkipLink` du design system) vers l'en-tête, le contenu, le pied de page et le sous-pied de page ; repères de page (`header`, `main`, `footer`).
- `AppLink` et `LanguageSwitcher` (non affiché pour l'instant) signalent la page courante par `aria-current` et la langue par `lang`.
- Anneau de focus visible sur tous les éléments, fourni par le reset du design system.
- Après une navigation, le focus se place sur le titre `h1` de la page (pas au premier chargement).
- Attribut `lang` sur chaque lien du sélecteur de langue.

## Styles

Tailwind 4 est branché par le plugin Vite `@tailwindcss/vite`. `src/styles/global.css` ne contient que l'ordre des couches CSS et les imports :

1. `@layer base, properties, theme, mozaic, utilities, components;` : déclare l'ordre des couches, de sorte que les classes utilitaires de Tailwind l'emportent sur le reset et les styles du design system
2. `@studio_b04/ds/styles` dans `layer(base)` : jetons CSS (`--ds-*`), clair/sombre
3. `@studio_b04/ds/reset` dans `layer(base)` : reset du design system (couleurs du `body`, anneau de focus `:focus-visible`)
4. `tailwindcss`
5. `@studio_b04/ds/tailwind-theme` : le thème Tailwind du design system

Classes issues du thème : `bg-secondary`, `text-secondary`, `text-brand`, `border-primary`, `text-title-xl`, `leading-title-xl`, `rounded-lg`, etc. L'espacement est basé sur `--ds-spacing-unit` (0,5 rem) : `p-3` = 1,5 rem. Le thème supprime la palette Tailwind par défaut (`--color-*: initial`) : seules les couleurs du design system existent. Pour une valeur sans classe, utiliser un jeton en valeur arbitraire : `bg-(--ds-bg-inverse)`, `text-(color:--ds-text-inverse)`.

Il n'y a pas de bouton de changement de thème. Le site suit le réglage clair/sombre du système, grâce aux jetons du design system (sans variante `dark:`).

## Tests

Vitest, jsdom et Testing Library. Les tests sont à côté du code (`*.test.ts(x)`). Ils couvrent les routes et les chemins par langue, les fichiers de langue, le `<head>` (SEO), `GlobalLayout` (`src/layouts/GlobalLayout/GlobalLayout.test.tsx`), l'application (lien d'évitement, chaque adresse de `getAllRoutes()`, accueil à la racine, page 404, focus après navigation), les pages d'erreur (`Error.test.tsx` : textes 404 et 500 dans chaque langue ; `ErrorBoundary.test.tsx` et `Router.test.tsx` : une page qui plante affiche la 500 dans le layout, sans toucher aux autres pages) et le pré-rendu serveur (`src/entry/server.test.tsx`, exécuté sans jsdom), le démarrage dans le navigateur (`src/entry/client.test.tsx` : `createRoot` sur une page vide, hydratation sans écart du HTML pré-rendu, sous-dossier d'hébergement), `AppLink` et les liens sous un sous-dossier d'hébergement, et le mode préprod (`noindex`).

## Structure

```
index.html                  modèle HTML du build
public/                     favicon
scripts/prerender.ts        pré-rendu : une page HTML par route, 404, sitemap, robots
.github/workflows/          déploiement de la préprod sur GitHub Pages (deploy-preprod.yml)
vite.config.ts              Vite, React, Tailwind, Vitest
src/
  App.tsx                   fournit la langue (I18nProvider) et affiche <Router />
  entry/                    client.tsx : hydratation ; server.tsx : rendu statique d'une URL (et son test)
  router/                   Router/Router.tsx : les <Route> écrites à la main (pages(locale) pour le français à la racine et l'anglais sous /en/, la 404) et la mise à jour de lang/titre/description/focus ; ErrorBoundary/ErrorBoundary.tsx : la page 500 si une page plante ; RouterEnum.tsx : les pages par identifiant ; routes/routes.ts : getSlug, getPath, getAlternates, findPage… (et tests) ; index.ts exporte le tout
  head/                     index.ts : balises SEO du <head> (et son test)
  config.ts                 URL publique, sous-dossier d'hébergement (BASE_URL) et mode préprod (NOINDEX)
  i18n/                     index.tsx (I18nProvider, useI18n, t, translate), locales/fr.json et en.json
  components/               un dossier par composant (AppLink, LanguageSwitcher) et index.ts qui les exporte
  layouts/                  un dossier par layout (GlobalLayout/GlobalLayout.tsx : liens d'évitement, Header, <main> avec l'<Outlet />, Footer, SubFooter) et index.ts
  pages/                    un dossier par page (Home, Legal : lorem ipsum ; Error/Error.tsx : pages 404 et 500) et index.ts qui les exporte
  styles/global.css         ordre des couches CSS et imports (Tailwind, design system)
  setup-tests.ts            configuration Vitest
```

## Alias d'import

`@` pointe vers `src` : `import { AppLink } from "@/components";`, `import { GlobalLayout } from "@/layouts";`, `import { getPath } from "@/router";` et `import { useI18n } from "@/i18n";` à la place de chemins relatifs du type `../../i18n`. Chaque composant vit dans son dossier (`src/components/<Nom>/<Nom>.tsx`) et est exporté par `src/components/index.ts` ; il en va de même pour les pages (`src/pages/index.ts`) et les layouts (`src/layouts/index.ts`). Les modules de plusieurs fichiers (`src/router`, `src/head`, `src/i18n`) suivent la même idée : un dossier, un `index.ts`, et on les importe par le dossier (`@/router`, `@/head`, `@/i18n`), pas par un fichier interne. Les alias se déclarent une seule fois, dans `paths` de `tsconfig.json` : TypeScript les utilise, et Vite (donc aussi Vitest et le pré-rendu) les lit grâce à `resolve.tsconfigPaths: true` dans `vite.config.ts`.

Pour ajouter un composant : créer `src/components/<Nom>/<Nom>.tsx` (`export default function <Nom>`), puis ajouter `export { default as <Nom> } from "./<Nom>/<Nom>";` à `src/components/index.ts`.

## Ajouter une page

1. Ajouter une entrée à `RouterEnum` (`src/router/RouterEnum.tsx`), par exemple `ABOUT = "about"` : la valeur est l'identifiant de la page, pas son adresse.
2. Dans `locales/fr.json` et `locales/en.json`, ajouter un bloc sous `pages` dont la clé est cette valeur (`"about"`), avec `slug` (l'adresse dans la langue : `"a-propos"` / `"about"`), `navLabel`, `title`, `description`, `heading`, `intro` (et `summary` si la page est un service affiché sur l'accueil).
3. Ajouter la page à `mainNavPages` (menu) ou `servicePages` (accueil) dans `src/router/routes/routes.ts` si besoin.
4. Créer `src/pages/<Nom>/<Nom>.tsx` (qui lit ses textes avec `t("pages.about.heading")`, etc.), l'exporter dans `src/pages/index.ts` (`export { default as <Nom> } from "./<Nom>/<Nom>";`), puis ajouter `<Route path={getSlug(RouterEnum.ABOUT, locale)} element={<About />} />` dans `pages(locale)` de `src/router/Router/Router.tsx` : une seule ligne pour les deux langues.

## Ajouter une langue

1. Créer `src/i18n/locales/xx.json` avec les mêmes clés que `fr.json`.
2. L'ajouter à `locales`, `localeNames` et `dictionaries` dans `src/i18n/index.tsx`, et à `ogLocales` dans `src/head/index.ts`.
3. Ajouter `<Route path="xx">{pages("xx")}</Route>` à côté de `<Route path="en">` dans `src/router/Router/Router.tsx`, et un `slug` pour chaque page dans `xx.json`.

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

- **Icônes du design system :** elles sont bloquées par Chrome (`<use href="data:…">`). Le site n'en utilise donc aucune : ne pas utiliser `iconStart`, `iconEnd` ou `external` sur `Link` et `Button`.
- **Poids du JavaScript :** environ 1,3 Mo (280 Ko compressé), car le composant `Icon` du design system embarque toute la bibliothèque Lucide.
- **Page 404 :** une seule page `404.html` est générée, en français. Il n'y a pas de 404 anglaise pré-générée pour une adresse inconnue sous `/en/`. Le navigateur affiche bien la page en anglais, mais l'hydratation signale l'erreur React #418 dans la console (le HTML français ne correspond pas), puis refait le rendu côté client. GitHub Pages renvoie bien ce fichier avec le statut 404.
- **Sous-dossier :** `npm run dev` et `npm run preview` ne répondent que sous `/Website/` quand `BASE_PATH=/Website` est défini (et `/Website` sans slash final n'y est pas redirigé, contrairement à GitHub Pages).
