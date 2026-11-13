import { PageHeader } from "@/components";
import { useI18n } from "@/i18n";

export default function TradeShows() {
  const { messages } = useI18n();
  const page = messages.pages.tradeShows;

  return <PageHeader heading={page.heading} intro={page.intro} />;
}
