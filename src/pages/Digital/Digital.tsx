import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Digital() {
  const { t } = useI18n();

  return <PageHeader heading={t("pages.digital.heading")} intro={t("pages.digital.intro")} />;
}
