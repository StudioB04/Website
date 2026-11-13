import { Logo } from "@studio_b04/ds/uikit";
import { Link, NavLink } from "react-router";
import { useI18n } from "@/i18n";
import { getPath, mainNavPages } from "@/routes";
import type { PageId } from "@/routes";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

export default function Header({ pageId }: { pageId: PageId | null }) {
  const { locale, messages } = useI18n();

  return (
    <header className="border-b border-primary">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-3 py-2 sm:px-6">
        <Link
          to={getPath("home", locale)}
          className="inline-flex h-5 [&_svg]:h-full [&_svg]:w-auto"
          aria-label={messages.common.homeLink}
        >
          <Logo type="full" aria-hidden="true" />
        </Link>

        <nav aria-label={messages.common.mainNavigation} className="order-last w-full md:order-none md:w-auto md:flex-1">
          <ul className="flex flex-wrap gap-x-4 gap-y-1">
            {mainNavPages.map((id) => (
              <li key={id}>
                <NavLink
                  to={getPath(id, locale)}
                  end
                  className="underline-offset-4 hover:underline aria-[current=page]:font-semibold aria-[current=page]:text-brand"
                >
                  {messages.pages[id].navLabel}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <LanguageSwitcher pageId={pageId} />
      </div>
    </header>
  );
}
