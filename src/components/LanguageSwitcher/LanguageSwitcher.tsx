import { Link } from "react-router";
import { localeNames, locales, useI18n } from "@/i18n";
import { getAlternates, getPath } from "@/router";
import type { PageId } from "@/router";

export default function LanguageSwitcher({ pageId }: { pageId: PageId | null }) {
  const { locale, t } = useI18n();
  const alternates = pageId ? getAlternates(pageId) : null;

  return (
    <nav aria-label={t("common.languageSwitcher")} className="ml-auto">
      <ul className="flex flex-wrap gap-x-3">
        {locales.map(alt => (
          <li key={alt}>
            <Link
              to={alternates ? alternates[alt] : getPath("home", alt)}
              lang={alt}
              hrefLang={alt}
              aria-current={alt === locale ? "true" : undefined}
              className="underline-offset-4 hover:underline aria-[current=true]:font-semibold aria-[current=true]:text-brand">
              {localeNames[alt]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
