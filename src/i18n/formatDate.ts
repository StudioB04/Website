const LONG_DATE: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" };

// « mardi 24 novembre 2026 » → « Mardi 24 Novembre 2026 » : majuscule à chaque mot (les chiffres collés, comme dans « 1er », sont laissés).
function capitalize(text: string): string {
  return text.replace(/(^|[^\p{L}\p{N}])(\p{L})/gu, (_, before: string, letter: string) => before + letter.toLocaleUpperCase());
}

function formatWithTemporal(locale: string, isoDate?: string): string {
  const date = isoDate === undefined ? Temporal.Now.plainDateISO() : Temporal.PlainDate.from(isoDate);
  return date.toLocaleString(locale, LONG_DATE);
}

// Une date ISO sans heure (« 2026-11-24 ») est lue en UTC : le fuseau UTC évite qu'elle recule d'un jour. Sans date, c'est aujourd'hui, à l'heure locale.
function formatWithDate(locale: string, isoDate?: string): string {
  return isoDate === undefined
    ? new Date().toLocaleDateString(locale, LONG_DATE)
    : new Date(isoDate).toLocaleDateString(locale, { ...LONG_DATE, timeZone: "UTC" });
}

/**
 * Date longue dans la langue demandée, avec une majuscule à chaque mot (« Mardi 24 Novembre 2026 »).
 * Sans `isoDate` (« AAAA-MM-JJ »), c'est la date du jour. Utilise l'API Temporal quand le navigateur ou Node la fournit, sinon `Date` :
 * le résultat est le même (les deux passent par `Intl`).
 */
export function formatDate(locale: string, isoDate?: string): string {
  const text = typeof Temporal === "undefined" ? formatWithDate(locale, isoDate) : formatWithTemporal(locale, isoDate);
  return capitalize(text);
}
