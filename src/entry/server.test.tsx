// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { dictionaries, translate } from "@/i18n";
import { render } from "./server";

describe("entry-server", () => {
  it("prerenders a page to static HTML with its head", async () => {
    const { html, head, locale } = await render("/en/legal-notice/");

    expect(locale).toBe("en");
    expect(html).toContain("<h1");
    expect(html).toContain(dictionaries.en.pages.legal.heading);
    expect(head).toContain("<title>Legal notice – StudioB04</title>");
  });

  it("prerenders the not found page for unknown URLs", async () => {
    const { html, head, locale } = await render("/404/");

    expect(locale).toBe("fr");
    expect(html).toContain(translate("fr", "pages.notFound.heading"));
    expect(head).toContain("noindex");
  });
});

describe("entry-server under a base path (GitHub Pages)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function renderUnderBase(url: string) {
    vi.stubEnv("BASE_URL", "/Website/");
    vi.resetModules();
    const { render: renderPage } = await import("@/entry/server");
    return renderPage(url);
  }

  it("still renders the right page", async () => {
    const { html, locale } = await renderUnderBase("/en/legal-notice/");

    expect(locale).toBe("en");
    expect(html).toContain("<h1");
    expect(html).toContain(dictionaries.en.pages.legal.heading);
  });

  it("prefixes every internal link with the base path", async () => {
    // La page 404 est, pour l'instant, la seule à avoir un lien interne : l'en-tête et le pied de page sont provisoires.
    const { html } = await renderUnderBase("/en/unknown/");
    const hrefs = [...html.matchAll(/href="([^"]*)"/g)].map(([, href]) => href);
    const internal = hrefs.filter(href => href.startsWith("/"));

    expect(internal.length).toBeGreaterThan(0);
    expect(internal.every(href => href.startsWith("/Website/"))).toBe(true);
  });
});
