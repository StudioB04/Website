import { useI18n } from "@/i18n";

export default function Legal() {
  const { t } = useI18n();

  return (
    <>
      <h1 className="text-title-xl leading-title-xl font-semibold">{t("pages.legal.title")}</h1>
      <p>{t("pages.legal.description")}</p>
    </>
  );
}
