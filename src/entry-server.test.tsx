// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "./entry-server";

describe("entry-server", () => {
  it("prerenders a page to static HTML with its head", async () => {
    const { html, head, locale } = await render("/en/digital/");

    expect(locale).toBe("en");
    expect(html).toContain("<h1");
    expect(html).toContain("Digital");
    expect(head).toContain("<title>Digital – StudioB04</title>");
  });

  it("prerenders the not found page for unknown URLs", async () => {
    const { html, head, locale } = await render("/404/");

    expect(locale).toBe("fr");
    expect(html).toContain("Page introuvable");
    expect(head).toContain("noindex");
  });
});

describe("entry-server under a base path (GitHub Pages)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("prefixes every internal link with the base path and still renders the right page", async () => {
    vi.stubEnv("BASE_URL", "/Website/");
    vi.resetModules();
    const { render: renderUnderBase } = await import("./entry-server");

    const { html, locale } = await renderUnderBase("/en/digital/");
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);
    const internal = hrefs.filter((href) => href.startsWith("/"));

    expect(locale).toBe("en");
    expect(html).toContain("<h1");
    expect(internal.length).toBeGreaterThan(0);
    expect(internal.every((href) => href.startsWith("/Website/"))).toBe(true);
  });
});
