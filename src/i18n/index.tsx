import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";

import fr from "./locales/fr.json";
import en from "./locales/en.json";

export type Messages = typeof fr;

// Clés de traduction : chemins pointés vers un texte du dictionnaire (`pages.digital.heading`).
// Les listes (`pages.legal.sections`) n'ont pas de clé : elles se lisent par `messages`.
type TextPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : T[K] extends readonly unknown[]
      ? never
      : T[K] extends object
        ? TextPaths<T[K], `${Prefix}${K}.`>
        : never;
}[keyof T & string];

export type MessageKey = TextPaths<Messages>;
export type TranslationParams = Record<string, string | number>;

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

function findText(messages: Messages, key: string): string | undefined {
  let value: unknown = messages;
  for (const part of key.split(".")) {
    if (typeof value !== "object" || value === null || !Object.hasOwn(value, part)) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : undefined;
}

// `{{param}}` est remplacé par la valeur de `params.param` ; un marqueur sans valeur reste tel quel.
function interpolate(text: string, params: TranslationParams): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (placeholder, name: string) => (Object.hasOwn(params, name) ? String(params[name]) : placeholder));
}

// Traduction hors de React (génération du <head>, par exemple) : dans un composant, utiliser `t` de `useI18n()`.
// Une clé introuvable renvoie la clé elle-même.
export function translate(locale: Locale, key: MessageKey, params: TranslationParams = {}): string {
  const text = findText(dictionaries[locale], key);
  return text === undefined ? key : interpolate(text, params);
}

interface I18nValue {
  locale: Locale;
  messages: Messages;
  t: (key: MessageKey, params?: TranslationParams) => string;
}

function createI18n(locale: Locale): I18nValue {
  return { locale, messages: dictionaries[locale], t: (key, params) => translate(locale, key, params) };
}

const I18nContext = createContext<I18nValue>(createI18n(defaultLocale));

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const value = useMemo(() => createI18n(locale), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
