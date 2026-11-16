import { useEffect, useRef } from "react";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";

import "./Footer.css";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHTMLCustomProp(footerRef.current, "clientHeight", "--footer-height");
  }, [footerRef]);

  return <footer id="footer" ref={footerRef} className="footer"></footer>;
}
