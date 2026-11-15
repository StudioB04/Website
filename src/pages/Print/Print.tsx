import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Print() {
  const { t } = useI18n();

  return <PageHeader heading={t("pages.print.heading")} intro={t("pages.print.intro")} />;
}
