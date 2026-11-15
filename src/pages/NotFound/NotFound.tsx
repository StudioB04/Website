import { AppLink, PageHeader } from "@/components";
import { useI18n } from "@/i18n";
import { getPath, RouterEnum } from "@/router";

export default function NotFound() {
  const { locale, t } = useI18n();

  return (
    <>
      <PageHeader heading={t("pages.notFound.heading")} intro={t("pages.notFound.intro")} />
      <AppLink to={getPath(RouterEnum.HOME, locale)} label={t("pages.notFound.backHome")} />
    </>
  );
}
