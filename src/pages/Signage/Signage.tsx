import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Signage() {
  const { messages } = useI18n();
  const page = messages.pages.signage;

  return <PageHeader heading={page.heading} intro={page.intro} />;
}
