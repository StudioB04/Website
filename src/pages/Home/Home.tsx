import { AppLink, PageHeader } from "@/components";
import { useI18n } from "@/i18n";
import { getPath, servicePages } from "@/routes";

export default function Home() {
  const { locale, messages } = useI18n();
  const page = messages.pages.home;

  return (
    <>
      <PageHeader heading={page.heading} intro={page.intro} />

      <section aria-labelledby="services-heading">
        <h2
          id="services-heading"
          className="mb-3 text-title-md leading-title-md font-semibold"
        >
          {page.servicesHeading}
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-3">
          {servicePages.map((id) => {
            const service = messages.pages[id];
            return (
              <li
                key={id}
                className="flex flex-col items-start gap-2 rounded-lg bg-secondary p-3"
              >
                <h3 className="text-title-xs leading-title-xs font-semibold">
                  {service.navLabel}
                </h3>
                <p className="flex-1">
                  {"summary" in service ? service.summary : null}
                </p>
                <AppLink
                  to={getPath(id, locale)}
                  label={messages.common.learnMore}
                  aria-label={`${messages.common.learnMore} : ${service.navLabel}`}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
