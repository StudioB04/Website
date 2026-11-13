import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Legal() {
  const { messages } = useI18n();
  const page = messages.pages.legal;

  return (
    <>
      <PageHeader heading={page.heading} intro={page.intro} />
      {page.sections.map((section) => (
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
