import { useId } from "react";
import { useHref, useLinkClickHandler, useLocation } from "react-router";
import { Button } from "@studio_b04/ds/uikit";
import { localeNames, locales, useI18n, type Locale } from "@/i18n";
import { findPage, getAlternates, getPath } from "@/router";

function SwitchTo({ target, to }: { target: Locale; to: string }) {
  const href = useHref(to);
  const handleClick = useLinkClickHandler<HTMLButtonElement & HTMLLinkElement>(to);

  return (
    <Button href={href} onClick={handleClick} lang={target} hrefLang={target} label={localeNames[target]} iconStart="languages" shape="pill" size="sm" variant="neutral" />
  );
}

/** Un bouton par autre langue du site (un seul tant qu'il y en a deux) : il mène à la même page dans cette langue, ou à son accueil si la page est inconnue. */
export default function LanguageButton() {
  const { locale, t } = useI18n();
  const { pathname } = useLocation();
  const pageId = findPage(pathname)?.pageId;
  const titleId = useId();

  return (
    <div role="group" aria-labelledby={titleId} className="flex flex-col gap-md">
      <p id={titleId} className="text-sm font-semibold">
        {t("common.languageSwitcher")}
      </p>

      <div className="flex flex-wrap gap-sm">
        {locales
          .filter(alt => alt !== locale)
          .map(alt => (
            <SwitchTo key={alt} target={alt} to={pageId ? getAlternates(pageId)[alt] : getPath("home", alt)} />
          ))}
      </div>
    </div>
  );
}
