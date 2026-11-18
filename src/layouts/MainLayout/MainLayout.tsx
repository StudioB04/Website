import { useRef, useEffect, useState } from "react";
import { clsx } from "clsx";
import { useI18n } from "@/i18n";
import { Outlet } from "react-router";
import { Icon, Link, SkipLink } from "@studio_b04/ds/uikit";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";
import { Footer, Header } from "@/layouts";

import "./MainLayout.css";

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
          <span>à vos côtés depuis 2009</span>
          <Link href="tel:+33644282055" label="+33 (0) 644 28 20 55" variant="inverse" iconStart="phone" className="text-xs!" />
        </section>

        <header id="header" ref={headerRef} className="main-layout__header" role="banner">
          <Header />
        </header>

        <main id="main" ref={mainRef} className="main-layout__inner">
          <Outlet />

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

        {/* <button className="main-layout__options" popoverTarget="options" title={t("common.settings.title")}>
          <div className="sr-only">{t("common.settings.title")}</div>
          <Icon src="settings" size={24} />
        </button>
        <SettingsPanel /> */}
      </div>
    </>
  );
}
