import { describe, expect, it } from "vitest";
import { HOME_ID, lowerFirst, parsePageFile, resolveSlugs, toKebabCase, toPageFiles } from "./pageFiles";

describe("parsePageFile", () => {
  it("reads a page and gives it the id of its folders", () => {
    expect(parsePageFile("/src/pages/Legal/Legal.tsx")).toEqual({ file: "/src/pages/Legal/Legal.tsx", segments: ["legal"], id: "legal" });
    expect(parsePageFile("/src/pages/TradeShows/TradeShows.tsx")?.id).toBe("tradeShows");
  });

  it("reads a nested page: one segment per folder", () => {
    expect(parsePageFile("/src/pages/Print/Global/Global.tsx")).toEqual({
      file: "/src/pages/Print/Global/Global.tsx",
      segments: ["print", "global"],
      id: "print.global",
    });
    expect(parsePageFile("/src/pages/A/B/C/C.tsx")?.id).toBe("a.b.c");
  });

  it.each([
    ["a test", "/src/pages/Legal/Legal.test.tsx"],
    ["another component of the folder", "/src/pages/Legal/Section.tsx"],
    ["a file named after the folder in another case", "/src/pages/Legal/legal.tsx"],
    ["a file that is not a component", "/src/pages/Legal/Legal.css"],
    ["the index of the pages", "/src/pages/index.ts"],
    ["a file straight in the pages folder", "/src/pages/Legal.tsx"],
    ["a file outside of the pages", "/src/components/Legal/Legal.tsx"],
    ["the reserved error page", "/src/pages/Error/Error.tsx"],
    ["a folder inside the reserved folder", "/src/pages/Error/Details/Details.tsx"],
  ])("ignores %s", (_, file) => {
    expect(parsePageFile(file)).toBeNull();
  });

  it("only reserves the Error folder at the top level", () => {
    expect(parsePageFile("/src/pages/Print/Error/Error.tsx")?.id).toBe("print.error");
  });
});

describe("toPageFiles", () => {
  const files = [
    "/src/pages/Print/Global/Global.tsx",
    "/src/pages/Print/Print.tsx",
    "/src/pages/Legal/Legal.tsx",
    "/src/pages/Legal/Legal.test.tsx",
    "/src/pages/Home/Home.tsx",
    "/src/pages/About/About.tsx",
    "/src/pages/Error/Error.tsx",
    "/src/pages/TradeShows/TradeShows.tsx",
    "/src/pages/TradeShows/Helper.tsx",
  ];

  it("keeps the pages only, the home page first, then in alphabetical order", () => {
    expect(toPageFiles(files).map(page => page.id)).toEqual(["home", "about", "legal", "print", "print.global", "tradeShows"]);
  });

  it("accepts a folder that only holds other pages (no page of its own)", () => {
    expect(toPageFiles(["/src/pages/Print/Global/Global.tsx"]).map(page => page.id)).toEqual(["print.global"]);
  });

  it("returns nothing when there is no page", () => {
    expect(toPageFiles([])).toEqual([]);
  });

  it("refuses two files that define the same page", () => {
    expect(() => toPageFiles(["/src/pages/Print/Print.tsx", "/src/pages/print/print.tsx"])).toThrow(/même page « print »/);
  });
});

describe("naming", () => {
  it("lowers the first letter of a folder name", () => {
    expect(lowerFirst("TradeShows")).toBe("tradeShows");
    expect(lowerFirst("Home")).toBe("home");
    expect(lowerFirst("")).toBe("");
  });

  it("turns a key into a kebab-case address", () => {
    expect(toKebabCase("tradeShows")).toBe("trade-shows");
    expect(toKebabCase("legal")).toBe("legal");
    expect(toKebabCase("faq")).toBe("faq");
    expect(toKebabCase("page2Column")).toBe("page2-column");
  });
});

describe("resolveSlugs", () => {
  const slugs: Record<string, string> = { print: "imprimerie", "print.global": "global-fr" };
  const lookup = (key: string) => slugs[key];

  it("uses the slug of each folder", () => {
    expect(resolveSlugs(["print", "global"], lookup)).toEqual(["imprimerie", "global-fr"]);
    expect(resolveSlugs(["print"], lookup)).toEqual(["imprimerie"]);
  });

  it("falls back to the kebab-case folder name when a slug is missing", () => {
    expect(resolveSlugs(["tradeShows"], lookup)).toEqual(["trade-shows"]);
    expect(resolveSlugs(["print", "tradeShows"], lookup)).toEqual(["imprimerie", "trade-shows"]);
    expect(resolveSlugs(["print", "global"], key => (key === "print" ? "imprimerie" : undefined))).toEqual(["imprimerie", "global"]);
  });

  it("treats an empty slug as a missing one", () => {
    expect(resolveSlugs(["legal"], () => "")).toEqual(["legal"]);
  });

  it("gives the home page no address, whatever the dictionary says", () => {
    expect(resolveSlugs([HOME_ID], () => "accueil")).toEqual([]);
  });

  it("only treats the top-level home page as the index", () => {
    expect(resolveSlugs(["print", HOME_ID], () => undefined)).toEqual(["print", "home"]);
  });
});
