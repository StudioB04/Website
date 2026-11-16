import { useEffect, useRef } from "react";
import { Button, Logo } from "@studio_b04/ds/uikit";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";
import { useI18n } from "@/i18n";
import { getPath } from "@/router";
import { Link } from "react-router";

import "./Header.css";

export default function Header() {
  const { locale } = useI18n();

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHTMLCustomProp(headerRef.current, "clientHeight", "--header-height");
  }, [headerRef]);

  return (
    <header id="header" ref={headerRef} className="header">
      <Link to={getPath("home", locale)} className="header__logo">
        <Logo />
      </Link>

      <nav className="header__nav">
        <ul className="contents">
          {/* <li>Numérique</li>
          <li>Impression</li>
          <li>Enseignes & signalétique</li>
          <li>Stands & PLV</li> */}
        </ul>
      </nav>

      <Button size="sm" className="header__button" label="On prends rendez-vous ?" shape="outline" variant="neutral" iconStart="ambulance" />
    </header>
  );
}
