import { useRef, useEffect } from "react";
import { Outlet } from "react-router";
import { SkipLink } from "@studio_b04/ds/uikit";
import { useI18n } from "@/i18n";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";
import { Footer, Header } from "@/layouts";

import "./MainLayout.css";

export default function MainLayout() {
  const { t } = useI18n();

  const headerRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHTMLCustomProp(headerRef.current, "clientHeight", "--header-height");
    setHTMLCustomProp(mainRef.current, "clientHeight", "--main-height");
    setHTMLCustomProp(footerRef.current, "clientHeight", "--footer-height");
  }, [headerRef, mainRef, footerRef]);

  return (
    <>
      <SkipLink label={t("common.skiplinks.header")} anchor="#header" />
      <SkipLink label={t("common.skiplinks.main")} anchor="#main" />
      <SkipLink label={t("common.skiplinks.footer")} anchor="#footer" />

      <div className="main-layout">
        <header id="header" ref={headerRef} className="main-layout__header" role="banner">
          <Header />
        </header>

        <main id="main" ref={mainRef} className="main-layout__inner">
          <Outlet />
        </main>

        <footer id="footer" ref={footerRef} className="main-layout__footer" role="contentinfo">
          <Footer />
        </footer>
      </div>
    </>
  );
}
