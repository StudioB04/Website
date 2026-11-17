import { Route, Routes, useLocation } from "react-router";
import { type Locale } from "@/i18n";
import { MainLayout } from "@/layouts";
import { ErrorPage } from "@/pages";
import { useEffect, useRef } from "react";
import { getPageMeta } from "@/head";
import { findPage, getLocaleFromPath, getPages, getSlug } from "@/router";
import PageErrorBoundary from "../ErrorBoundary/ErrorBoundary";

function useDocumentUpdate(pathname: string, locale: Locale, pageId: string | null) {
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const { title, description } = getPageMeta(pageId ?? "notFound", locale);
    document.documentElement.lang = locale;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);

    globalThis?.scrollTo?.({ top: 0 });

    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    document.querySelector<HTMLElement>("#main h1")?.focus();
  }, [pathname, locale, pageId]);
}

// Les routes d'une langue : une par page de `src/pages`, trouvée automatiquement. L'adresse de chacune est traduite dans les JSON
// (`slug` de chaque dossier) ; l'accueil, sans adresse, est la route `index`. Appelée comme une fonction (un composant autour de
// `<Route>` serait refusé par React Router).
function pages(locale: Locale) {
  return getPages().map(({ id, Component }) => {
    const slug = getSlug(id, locale);
    return slug ? <Route key={id} path={slug} element={<Component />} /> : <Route key={id} index element={<Component />} />;
  });
}

export default function Router() {
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);
  const pageId = findPage(pathname)?.pageId ?? null;

  useDocumentUpdate(pathname, locale, pageId);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<PageErrorBoundary />}>
          <Route path="/">{pages("fr")}</Route>
          <Route path="en">{pages("en")}</Route>
          <Route path="*" element={<ErrorPage status={404} />} />
        </Route>
      </Route>
    </Routes>
  );
}
