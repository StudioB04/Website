/**
 * Toutes les pages du site, par identifiant.
 *
 * L'identifiant est le même dans toutes les langues : il sert de clé dans `pages` (fr.json, en.json), où
 * l'adresse de la page est traduite (`slug`) : `/numerique/` en français, `/en/digital/` en anglais.
 * HOME a un slug vide : c'est la route `index` (`/` et `/en/`).
 */
export enum RouterEnum {
  HOME = "home",
  DIGITAL = "digital",
  PRINT = "print",
  SIGNAGE = "signage",
  TRADE_SHOWS = "tradeShows",
  LEGAL = "legal",
}
