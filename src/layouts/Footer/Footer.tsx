import AppLink from "@/components/AppLink/AppLink";
import { useI18n } from "@/i18n";
import { getPath } from "@/router";

import "./Footer.css";

export default function Footer() {
  const { locale, t } = useI18n();

  return (
    <div className="footer">
      <AppLink to={getPath("legal", locale)} label={t("pages.legal.link")} />
    </div>
  );
}
