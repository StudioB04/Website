import { AppLink, PageHeader } from "@/components";
import { useI18n } from "@/i18n";
import { getPath } from "@/routes";

export default function NotFound() {
  const { locale, messages } = useI18n();
  const page = messages.pages.notFound;

  return (
    <>
      <PageHeader heading={page.heading} intro={page.intro} />
      <AppLink to={getPath("home", locale)} label={page.backHome} />
    </>
  );
}
