import { AppLink, PageHeader } from "@/components";
import { useI18n } from "@/i18n";
import { getPath, servicePages } from "@/router";

export default function Home() {
  const { locale, t } = useI18n();

  return (
    <>
      <PageHeader heading={t("pages.home.heading")} intro={t("pages.home.intro")} />

      <section aria-labelledby="services-heading">
        <h2 id="services-heading" className="mb-3 text-title-md leading-title-md font-semibold">
          {t("pages.home.servicesHeading")}
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
          {servicePages.map(id => (
            <li key={id} className="flex flex-col items-start gap-2 rounded-lg bg-secondary p-3">
              <h3 className="text-title-xs leading-title-xs font-semibold">{t(`pages.${id}.navLabel`)}</h3>
              <p className="flex-1">{t(`pages.${id}.summary`)}</p>
              <AppLink to={getPath(id, locale)} label={t("common.learnMore")} aria-label={`${t("common.learnMore")} : ${t(`pages.${id}.navLabel`)}`} />
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
