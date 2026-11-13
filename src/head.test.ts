import { describe, expect, it } from "vitest";
import { SITE_URL } from "./config";
import { escapeHtml, renderHead } from "./head";

describe("head", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;",
    );
  });

  it("renders title, description, canonical and hreflang links", () => {
    const head = renderHead("signage", "fr");
    expect(head).toContain("<title>Enseigne &amp; signalétique – StudioB04</title>");
    expect(head).toContain('<meta name="description"');
    expect(head).toContain(`<link rel="canonical" href="${SITE_URL}/enseigne-signaletique/" />`);
    expect(head).toContain(`hreflang="fr" href="${SITE_URL}/enseigne-signaletique/"`);
    expect(head).toContain(`hreflang="en" href="${SITE_URL}/en/signage/"`);
    expect(head).toContain(`hreflang="x-default" href="${SITE_URL}/enseigne-signaletique/"`);
    expect(head).toContain('<meta property="og:locale" content="fr_FR" />');
  });

  it("uses the site root as canonical for the French home page and /en/ for the English one", () => {
    expect(renderHead("home", "fr")).toContain(`<link rel="canonical" href="${SITE_URL}/" />`);
    expect(renderHead("home", "en")).toContain(`<link rel="canonical" href="${SITE_URL}/en/" />`);
  });

  it("adds JSON-LD on the home page only", () => {
    expect(renderHead("home", "en")).toContain("application/ld+json");
    expect(renderHead("print", "en")).not.toContain("application/ld+json");
  });

  it("marks the not found page as noindex without canonical", () => {
    const head = renderHead("notFound", "fr");
    expect(head).toContain('content="noindex"');
    expect(head).not.toContain("canonical");
  });
});
