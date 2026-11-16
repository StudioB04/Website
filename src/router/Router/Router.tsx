import { Route, Routes, useLocation } from "react-router";
import { type Locale } from "@/i18n";
import { GlobalLayout } from "@/layouts";
import { getSlug, RouterEnum, getLocaleFromPath } from "@/router";
import { ErrorPage, Home, Legal } from "@/pages";
import { useEffect, useRef } from "react";
import { getPageMeta } from "@/head";
import { findPage, type PageId } from "@/router";
import PageErrorBoundary from "../ErrorBoundary/ErrorBoundary";

function useDocumentUpdate(pathname: string, locale: Locale, pageId: PageId | null) {
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const { title, description } = getPageMeta(pageId ?? "notFound", locale);
    document.documentElement.lang = locale;
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);

    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    document.querySelector<HTMLElement>("#main h1")?.focus();
  }, [pathname, locale, pageId]);
}

// Les routes d'une langue : les pages sont les mêmes, l'adresse de chacune est traduite dans les JSON (slug).
function pages(locale: Locale) {
  return (
    <>
      <Route index element={<Home />} />
      <Route path={getSlug(RouterEnum.LEGAL, locale)} element={<Legal />} />
    </>
  );
}

export default function Router() {
  const { pathname } = useLocation();
  const locale = getLocaleFromPath(pathname);
  const pageId = findPage(pathname)?.pageId ?? null;

  useDocumentUpdate(pathname, locale, pageId);

  return (
    <Routes>
      <Route element={<GlobalLayout />}>
        <Route element={<PageErrorBoundary />}>
          <Route path="/">{pages("fr")}</Route>
          <Route path="en">{pages("en")}</Route>
          <Route path="*" element={<ErrorPage status={404} />} />
        </Route>
      </Route>
    </Routes>
  );
}
