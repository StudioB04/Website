import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Legal() {
  const { messages, t } = useI18n();

  return (
    <>
      <PageHeader heading={t("pages.legal.heading")} intro={t("pages.legal.intro")} />
      {messages.pages.legal.sections.map((section) => (
        <section key={section.title} className="mt-4 first:mt-0">
          <h2 className="mb-2 text-title-sm leading-title-sm font-semibold">
            {section.title}
          </h2>
          <p>{section.text}</p>
        </section>
      ))}
    </>
  );
}
