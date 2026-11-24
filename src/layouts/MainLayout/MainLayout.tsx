import { useRef, useEffect, useState } from "react";
import { clsx } from "clsx";
import { useI18n } from "@/i18n";
import { Outlet } from "react-router";
import { Icon, SkipLink } from "@studio_b04/ds/uikit";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";
import { Footer, Header, PreHeader } from "@/layouts";

import "./MainLayout.css";
import SettingsPanel from "@/components/SettingsPanel/SettingsPanel";

export default function MainLayout() {
  const { t } = useI18n();

  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const [isTopButtonVisible, setIsTopButtonVisible] = useState(false);

  useEffect(() => {
    setHTMLCustomProp(headerRef.current, "clientHeight", "--header-height");
    setHTMLCustomProp(mainRef.current, "clientHeight", "--main-height");
    setHTMLCustomProp(footerRef.current, "clientHeight", "--footer-height");
  }, [headerRef, mainRef, footerRef]);

  useEffect(() => {
    const ac = new AbortController();
    const updateTopButton = () => setIsTopButtonVisible(globalThis.scrollY > 400);

    updateTopButton();
    globalThis.addEventListener("scroll", updateTopButton, { passive: true, signal: ac.signal });

    return () => ac.abort();
  }, []);

  return (
    <>
      <SkipLink label={t("common.skiplinks.header")} anchor="#header" />
      <SkipLink label={t("common.skiplinks.main")} anchor="#main" />
      <SkipLink label={t("common.skiplinks.footer")} anchor="#footer" />

      <div className="main-layout">
        <section className="main-layout__preheader">
          <PreHeader />
        </section>

        <header id="header" ref={headerRef} className="main-layout__header" role="banner">
          <Header />
        </header>

        <main id="main" ref={mainRef} className="main-layout__inner">
          <div className="main-layout__inner__container">
            <Outlet />
          </div>

          <button
            type="button"
            title={t("common.buttons.scroll-to-top")}
            className={clsx("main-layout__inner__top-button", isTopButtonVisible && "main-layout__inner__top-button--visible")}
            inert={!isTopButtonVisible}
            onClick={() => globalThis.scrollTo({ top: 0 })}>
            <Icon src="arrow-up-to-line" size={24} />
            <div className="sr-only">{t("common.buttons.scroll-to-top")}</div>
          </button>
        </main>

        <footer id="footer" ref={footerRef} className="main-layout__footer" role="contentinfo">
          <Footer />
        </footer>

        <SettingsPanel />
      </div>
    </>
  );
}
