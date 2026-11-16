import { useLocation } from "react-router";
import { I18nProvider } from "@/i18n";
import { getLocaleFromPath, Router } from "@/router";
import { StudioB04Provider } from "@studio_b04/ds";

import "@/styles/global.css";

export default function App() {
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);

  return (
    <I18nProvider locale={locale}>
      <StudioB04Provider>
        <Router />
      </StudioB04Provider>
    </I18nProvider>
  );
}
