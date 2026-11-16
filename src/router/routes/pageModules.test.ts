import { describe, expect, it } from "vitest";
import { getPageModules } from "./pageModules";

describe("getPageModules", () => {
  const modules = getPageModules();

  it("finds the pages of src/pages by themselves, the home page first", () => {
    const ids = modules.map(page => page.id);

    expect(ids[0]).toBe("home");
    expect(ids).toContain("legal");
  });

  it("gives each page its component", () => {
    for (const { Component, file } of modules) {
      expect(typeof Component, file).toBe("function");
    }
  });

  it("leaves out tests and the error page", () => {
    const files = modules.map(page => page.file);

    expect(files.filter(file => file.endsWith(".test.tsx"))).toEqual([]);
    expect(files.filter(file => file.includes("/Error/"))).toEqual([]);
  });

  it("reads the pages once", () => {
    expect(getPageModules()).toBe(modules);
  });
});
