import { act, renderHook } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyTheme, getStoredTheme, isTheme, THEME_STORAGE_KEY, themes, useTheme } from ".";

const root = document.documentElement;

beforeEach(() => {
  localStorage.clear();
  delete root.dataset.dsTheme;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("isTheme", () => {
  it.each(themes)("accepts %s", theme => {
    expect(isTheme(theme)).toBe(true);
  });

  it.each(["", "auto", "Dark", null, undefined, 1])("rejects %s", value => {
    expect(isTheme(value)).toBe(false);
  });
});

describe("getStoredTheme", () => {
  it("falls back to the system theme when nothing is stored", () => {
    expect(getStoredTheme()).toBe("system");
  });

  it.each(themes)("returns the stored %s theme", theme => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    expect(getStoredTheme()).toBe(theme);
  });

  it("ignores a stored value that is not a theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");

    expect(getStoredTheme()).toBe("system");
  });

  it("falls back to the system theme when the storage is not accessible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(getStoredTheme()).toBe("system");
  });
});

describe("applyTheme", () => {
  it.each(["light", "dark"] as const)("sets data-ds-theme to %s on <html>", theme => {
    applyTheme(theme);

    expect(root.dataset.dsTheme).toBe(theme);
  });

  it("removes data-ds-theme for the system theme, so that prefers-color-scheme applies", () => {
    applyTheme("dark");
    applyTheme("system");

    expect(root.hasAttribute("data-ds-theme")).toBe(false);
  });
});

describe("useTheme", () => {
  it("starts with the system theme and leaves <html> alone", () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("system");
    expect(root.hasAttribute("data-ds-theme")).toBe(false);
  });

  it("restores the stored theme after the first render", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe("dark");
    expect(root.dataset.dsTheme).toBe("dark");
  });

  it("applies and stores the chosen theme", () => {
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("dark"));

    expect(result.current.theme).toBe("dark");
    expect(root.dataset.dsTheme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    act(() => result.current.setTheme("system"));

    expect(result.current.theme).toBe("system");
    expect(root.hasAttribute("data-ds-theme")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("system");
  });

  it("keeps the choice for the current page when the storage refuses the write", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const { result } = renderHook(() => useTheme());

    act(() => result.current.setTheme("light"));

    expect(result.current.theme).toBe("light");
    expect(root.dataset.dsTheme).toBe("light");
  });
});

// Le script en ligne de index.html pose le thème avant le premier affichage (sinon la page clignote) : il doit lire la même clé.
describe("index.html theme script", () => {
  const html = readFileSync(resolve(process.cwd(), "index.html"), "utf-8");
  const script = /<script>([\s\S]*?)<\/script>/.exec(html)?.[1] ?? "";
  const run = () => new Function(script)();

  it("reads the key used by the theme module", () => {
    expect(script).toContain(`"${THEME_STORAGE_KEY}"`);
  });

  it.each(["light", "dark"])("applies a stored %s theme", theme => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    run();

    expect(root.dataset.dsTheme).toBe(theme);
  });

  it.each([null, "system", "sepia"])("leaves <html> alone for %s", value => {
    if (value) localStorage.setItem(THEME_STORAGE_KEY, value);

    run();

    expect(root.hasAttribute("data-ds-theme")).toBe(false);
  });

  it("does not throw when the storage is not accessible", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });

    expect(run).not.toThrow();
  });
});
