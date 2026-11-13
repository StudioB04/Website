import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { I18nProvider } from "@/i18n";
import type { Locale } from "@/i18n";
import { getPageMeta } from "@/head";
import type { PageId } from "@/routes";
import { Footer, Header, SkipLink } from "@/components";

interface LayoutProps {
  locale: Locale;
  pageId: PageId | null;
  children: ReactNode;
}

function useDocumentUpdate(locale: Locale, pageId: PageId | null) {
  const { pathname } = useLocation();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    const { title, description } = getPageMeta(pageId ?? "notFound", locale);
    document.documentElement.lang = locale;
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);

    if (lastPathname.current === pathname) return;

    lastPathname.current = pathname;
    document.querySelector<HTMLElement>("#main h1")?.focus();
  }, [pathname, locale, pageId]);
}

export default function GlobalLayout({
  locale,
  pageId,
  children,
}: LayoutProps) {
  useDocumentUpdate(locale, pageId);

  return (
    <I18nProvider locale={locale}>
      <SkipLink />
      <Header pageId={pageId} />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6"
      >
        {children}
      </main>
      <Footer />
    </I18nProvider>
  );
}
