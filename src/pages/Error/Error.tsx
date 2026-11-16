import { AppLink } from "@/components";
import { useI18n } from "@/i18n";
import { getPath } from "@/router";

const textKeys = { 404: "notFound", 500: "serverError" } as const;

export type ErrorStatus = keyof typeof textKeys;

export default function ErrorPage({ status = 404 }: { status?: ErrorStatus }) {
  const { locale, t } = useI18n();
  const key = textKeys[status];

  return (
    <section className="container mx-auto flex flex-col gap-xl items-center justify-center py-10xl">
      <h1 tabIndex={-1} className="text-title-xl leading-title-xl font-bold">
        {t(`pages.${key}.heading`)}
      </h1>

      <p className="text-xl text-secondary">{t(`pages.${key}.intro`)}</p>

      <AppLink to={getPath("home", locale)} label={t(`pages.${key}.backHome`)} />
    </section>
  );
}
