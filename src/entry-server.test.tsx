// @vitest-environment node
import { describe, expect, it } from "vitest";
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
