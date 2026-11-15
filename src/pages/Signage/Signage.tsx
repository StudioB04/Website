import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function Signage() {
  const { t } = useI18n();

  return <PageHeader heading={t("pages.signage.heading")} intro={t("pages.signage.intro")} />;
}
