import { formatDate, useI18n } from "@/i18n";
import { Icon, Markdown, Link } from "@studio_b04/ds/uikit";

export default function Legal() {
  const { locale, t } = useI18n();

  return (
    <div className="mbs-3xl grid gap-x-8xl gap-y-3xl desktop:grid-cols-[3fr_1fr]">
      <div className="flex flex-col gap-3xl max-w-2xl">
        <h1 tabIndex={-1} className="text-title-lg font-bold">
          {t("pages.legal.heading")}
        </h1>

        <Markdown>{t("pages.legal.date", { date: formatDate(locale) })}</Markdown>

        {["brand", "responsability", "edition", "hosting"].map(section => (
          <div key={section}>
            <h2 className="text-title-md font-bold">{t(`pages.legal.${section}.title`)}</h2>
            <Markdown>{t(`pages.legal.${section}.content`)}</Markdown>
          </div>
        ))}
      </div>

      <div className="shrink-0 flex flex-col sticky inset-bs-[calc(var(--header-height)+var(--ds-spacing-3xl))] inline-full w-full desktop:w-auto">
        <img src={`${import.meta.env.BASE_URL}images/moi.png`} alt="" className="w-xs mx-auto" />
        <p className="border-bs-4 border-inverse-secondary pbs-3xl italic flex flex-col items-center">
          <span className="font-extrabold text-title-xs text-brand-primary">StudioB04</span>
          <span className="text-sm">(Entreprise Individuelle)</span>
          <span>Allée des Cerisiers</span>
          <span>59200 TOURCOING</span>
          <span className="flex gap-sm items-center">
            <Icon src="phone" size={12} />
            <Link href={t("common.contact.phone.href")} label={t("common.contact.phone.label")} variant="neutral" />
          </span>
          <span className="flex gap-sm items-center">
            <Icon src="mail" size={12} />
            <Link href={t("common.contact.email.href")} label={t("common.contact.email.label")} variant="neutral" />
          </span>
          <span>N° Siret : 51473264300028</span>
          <span>TVA : FR39514732643</span>
          <span>Code NAF : 6201Z</span>
        </p>
      </div>
    </div>
  );
}
