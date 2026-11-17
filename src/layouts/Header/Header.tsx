import { Logo } from "@studio_b04/ds/uikit";
import { useI18n } from "@/i18n";
import { getPath } from "@/router";
import { Link } from "react-router";
import { MainNavigation } from "@/layouts";

import "./Header.css";

export default function Header() {
  const { locale, t } = useI18n();

  return (
    <div className="header">
      <Link to={getPath("home", locale)} className="header__logo" title={t("common.back-to-home")}>
        <Logo />
        <span className="sr-only">{t("common.back-to-home")}</span>
      </Link>

      <MainNavigation />
    </div>
  );
}
