import { Outlet } from "react-router";
import { Footer, Header, SubFooter } from "@/layouts";
import { SkipLink } from "@studio_b04/ds/uikit";

import "./GlobalLayout.css";

export default function GlobalLayout() {
  return (
    <>
      <SkipLink label="go to header" anchor="#header" />
      <SkipLink label="go to main content" anchor="#main" />
      <SkipLink label="go to footer" anchor="#footer" />
      <SkipLink label="go to subfooter" anchor="#subfooter" />

      <div className="global-layout">
        <Header />

        <div className="global-layout__inner">
          <main id="main" className="global-layout__inner__main">
            <Outlet />
          </main>

          <Footer />
        </div>

        <SubFooter />
      </div>
    </>
  );
}
