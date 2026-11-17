import clsx from "clsx";
import { useRef, type ComponentRef } from "react";
import { useI18n } from "@/i18n";
import { Link, useLocation } from "react-router";
import { getPath, isCurrentPage } from "@/router";
import { useWindowSize } from "@studio_b04/ds/hooks";
import { Button, Dialog } from "@studio_b04/ds/uikit";

import "./MainNavigation.css";

function MainNavigationInner({ variant = "mobile", onChange }: { variant?: "desktop" | "mobile"; onChange?: () => void }) {
  const { locale, t } = useI18n();
  const { pathname } = useLocation();

  return (
    <nav className={clsx("main-navigation__inner", `main-navigation__inner--${variant}`)} role="navigation" aria-label={t("common.main-menu.title")}>
      <ul className="main-navigation__inner__list">
        {["web", "print", "enseignes", "salons"].map(page => (
          <li key={page} className="main-navigation__inner__list__item">
            <Link
              to={getPath(page, locale)}
              className="main-navigation__inner__list__item__link"
              aria-current={isCurrentPage(page, pathname) ? "page" : undefined}
              onClick={() => onChange?.()}>
              {t(`pages.${page}.link`)}
            </Link>
          </li>
        ))}

        <li className="main-navigation__inner__list__item">
          <Button className="main-navigation__inner__list__item__button" label="On s'apelle ?" iconStart="phone-call" shape="outline" size="sm" />
        </li>
      </ul>
    </nav>
  );
}

export default function MainNavigation() {
  const dialogRef = useRef<ComponentRef<typeof Dialog>>(null);
  const { isMd } = useWindowSize();
  const { t } = useI18n();

  return (
    <div className="main-navigation">
      {isMd ? (
        <MainNavigationInner variant="desktop" />
      ) : (
        <>
          <Button
            label="Open main menu"
            popoverTarget="modal-main-navigation"
            iconOnly="menu"
            shape="pill"
            variant="neutral"
            size="sm"
            className="shadow-none!"
          />

          <Dialog
            ref={dialogRef}
            id="modal-main-navigation"
            title={t("common.main-menu.title")}
            position="end"
            size="lg"
            className="[&_.ds-dialog\_\_header]:opacity-0">
            <MainNavigationInner variant="mobile" onChange={() => dialogRef.current?.close()} />
          </Dialog>
        </>
      )}
    </div>
  );
}
