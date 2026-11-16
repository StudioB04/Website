import { useEffect, useRef } from "react";
import { setHTMLCustomProp } from "@studio_b04/ds/utils";

import "./SubFooter.css";

export default function SubFooter() {
  const subFooterRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setHTMLCustomProp(subFooterRef.current, "clientHeight", "--subfooter-height");
  }, [subFooterRef]);

  return (
    <footer id="sub-footer" ref={subFooterRef} className="sub-footer">
      All right reserved. {new Date().getFullYear()} | StudioB04©
    </footer>
  );
}
