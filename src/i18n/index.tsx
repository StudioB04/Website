import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import fr from "./fr.json";
import en from "./en.json";

export type Messages = typeof fr;

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const localeNames: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export const dictionaries: Record<Locale, Messages> = { fr, en };

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export function format(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

interface I18nValue {
  locale: Locale;
  messages: Messages;
}

const I18nContext = createContext<I18nValue>({
  locale: defaultLocale,
  messages: dictionaries[defaultLocale],
});

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, messages: dictionaries[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
