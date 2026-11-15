import { useLocation } from "react-router";
import { I18nProvider } from "@/i18n";
import { getLocaleFromPath, Router } from "@/router";

import "@/styles/global.css";

export default function App() {
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);

  return (
    <I18nProvider locale={locale}>
      <Router />
    </I18nProvider>
  );
}
