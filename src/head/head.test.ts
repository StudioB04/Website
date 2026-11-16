import { afterEach, describe, expect, it, vi } from "vitest";
import { SITE_URL } from "@/config";
import { escapeHtml, renderHead } from "@/head";

describe("head", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;");
  });

  it("renders title, description, canonical and hreflang links", () => {
    const head = renderHead("legal", "fr");
    expect(head).toContain("<title>Mentions légales – StudioB04</title>");
    expect(head).toContain('<meta name="description"');
    expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/mentions-legales/" />`);
    expect(head).toContain(`hreflang="fr" href="${SITE_URL}/mentions-legales/"`);
    expect(head).toContain(`hreflang="en" href="${SITE_URL}/en/legal-notice/"`);
    expect(head).toContain(`hreflang="x-default" href="${SITE_URL}/mentions-legales/"`);
    expect(head).toContain('<meta property="og:locale" content="fr_FR" />');
  });

  it("uses the site root as canonical for the French home page and /en/ for the English one", () => {
    expect(renderHead("home", "fr")).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
    expect(renderHead("home", "en")).toContain(`<link rel="canonical" href="${SITE_URL}/en/" />`);
  });

  it("adds JSON-LD on the home page only", () => {
    expect(renderHead("home", "en")).toContain("application/ld+json");
    expect(renderHead("legal", "en")).not.toContain("application/ld+json");
  });

  it("marks the not found page as noindex without canonical", () => {
    const head = renderHead("notFound", "fr");
    expect(head).toContain('content="noindex"');
    expect(head).not.toContain("canonical");
  });

  it("does not add noindex on regular pages by default", () => {
    expect(renderHead("home", "fr")).not.toContain("noindex");
  });
});

describe("head in preprod mode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("adds noindex on every page while keeping canonical and hreflang", async () => {
    vi.stubEnv("VITE_NOINDEX", "true");
    vi.resetModules();
    const { renderHead: renderPreprodHead } = await import("@/head");

    const head = renderPreprodHead("legal", "en");
    expect(head).toContain('<meta name="robots" content="noindex" />');
    expect(head).toContain('rel="canonical"');
    expect(head).toContain('hreflang="fr"');
  });
});
