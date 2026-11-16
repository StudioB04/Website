import { AppLink } from "@/components";
import { useI18n } from "@/i18n";
import { getPath, RouterEnum } from "@/router";

// Chaque erreur a son bloc de textes dans `pages` (fr.json, en.json).
const textKeys = { 404: "notFound", 500: "serverError" } as const;

export type ErrorStatus = keyof typeof textKeys;

/** Page d'erreur : 404 (adresse inconnue, route `*`) ou 500 (erreur d'affichage, voir `PageErrorBoundary`). */
export default function ErrorPage({ status = 404 }: { status?: ErrorStatus }) {
  const { locale, t } = useI18n();
  const key = textKeys[status];

  return (
    <>
      <div className="mb-6">
        <h1 tabIndex={-1} className="text-title-xl leading-title-xl font-semibold">
          {t(`pages.${key}.heading`)}
        </h1>
        <p className="mt-2 max-w-3xl text-xl text-secondary">{t(`pages.${key}.intro`)}</p>
      </div>
      <AppLink to={getPath(RouterEnum.HOME, locale)} label={t(`pages.${key}.backHome`)} />
    </>
  );
}
