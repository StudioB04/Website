import { Outlet, useLocation } from "react-router";
import { findPage } from "@/router";
import { Footer, Header, SkipLink } from "@/components";

/** Structure commune à toutes les pages ; la langue et la page courante se déduisent de l'adresse. */
export default function GlobalLayout() {
  const { pathname } = useLocation();
  const pageId = findPage(pathname)?.pageId ?? null;

  return (
    <>
      <SkipLink />
      <Header pageId={pageId} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-3 py-6 sm:px-6">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
