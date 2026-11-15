import { Link } from "react-router";
import { useI18n } from "@/i18n";
import { getPath, RouterEnum } from "@/router";

export default function Footer() {
  const { locale, t } = useI18n();

  return (
    <footer className="border-t border-primary text-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap justify-between gap-2 px-3 py-3 sm:px-6">
        <p>{t("common.copyright", { year: new Date().getFullYear() })}</p>
        <nav aria-label={t("common.footerNavigation")}>
          <ul className="flex flex-wrap gap-x-4">
            <li>
              <Link to={getPath(RouterEnum.LEGAL, locale)} className="underline underline-offset-4">
                {t("pages.legal.navLabel")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
