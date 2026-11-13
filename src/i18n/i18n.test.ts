import { describe, expect, it } from "vitest";
import { dictionaries, format, isLocale, locales } from ".";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, shape(child)]));
  }
  return typeof value;
}

describe("i18n", () => {
  it.each(locales)("%s.json has the same keys as fr.json", (locale) => {
    expect(shape(dictionaries[locale])).toEqual(shape(dictionaries.fr));
  });

  it.each(locales)("%s.json has no empty string", (locale) => {
    const strings: string[] = [];
    const collect = (value: unknown) => {
      if (typeof value === "string") strings.push(value);
      else if (value && typeof value === "object") Object.values(value).forEach(collect);
    };
    collect(dictionaries[locale].common);
    expect(strings.every((value) => value.length > 0)).toBe(true);
  });

  it("replaces placeholders and keeps unknown ones", () => {
    expect(format("© {year} {name} {missing}", { year: 2026, name: "B04" })).toBe("© 2026 B04 {missing}");
  });

  it("recognises supported locales", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
