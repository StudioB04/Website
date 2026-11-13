import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Digital() {
  const { messages } = useI18n();
  const page = messages.pages.digital;

  return <PageHeader heading={page.heading} intro={page.intro} />;
}
