import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function TradeShows() {
  const { t } = useI18n();

  return <PageHeader heading={t("pages.tradeShows.heading")} intro={t("pages.tradeShows.intro")} />;
}
