import { Outlet } from "react-router";
import type { GlobalLayoutProps } from "./GlobalLayout.types";
import { Footer, Header, SubFooter } from "@/layouts";
import { SkipLink } from "@studio_b04/ds/uikit";

import "./GlobalLayout.css";

export default function GlobalLayout({ header = true, footer = true, subfooter = true }: GlobalLayoutProps) {
  return (
    <>
      {header && <SkipLink label="go to header" anchor="#header" />}
      {<SkipLink label="go to main content" anchor="#main" />}
      {footer && <SkipLink label="go to footer" anchor="#footer" />}
      {subfooter && <SkipLink label="go to subfooter" anchor="#subfooter" />}

      <div className="global-layout">
        {header && <Header />}

        <div className="global-layout__inner">
          <main id="main" className="global-layout__inner__main">
            <Outlet />
          </main>

          {footer && <Footer />}
        </div>

        {subfooter && <SubFooter />}
      </div>
    </>
  );
}
