import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import GlassBlock from "./GlassBlock";

/** L'élément rendu par le bloc : le premier (et seul) enfant du conteneur de test. */
function renderBlock(ui: ReactNode) {
  const { container } = render(ui);
  return container.firstElementChild as HTMLElement;
}

const tags = ["section", "article", "aside", "header", "footer", "nav", "main", "ul", "li", "span"] as const;

describe("GlassBlock", () => {
  it("renders a div with the glass-block class and its children by default", () => {
    const block = renderBlock(<GlassBlock>Contenu</GlassBlock>);

    expect(block.tagName).toBe("DIV");
    expect(block.classList.contains("glass-block")).toBe(true);
    expect(block.textContent).toBe("Contenu");
  });

  it("renders any kind of children inside the block", () => {
    const block = renderBlock(
      <GlassBlock>
        <h2>Titre</h2>
        <p>Texte</p>
      </GlassBlock>,
    );

    expect(block.querySelector("h2")?.textContent).toBe("Titre");
    expect(block.querySelector("p")?.textContent).toBe("Texte");
  });

  describe("as", () => {
    it.each(tags)("renders a <%s> element", tag => {
      const block = renderBlock(<GlassBlock as={tag}>x</GlassBlock>);

      expect(block.tagName).toBe(tag.toUpperCase());
      expect(block.classList.contains("glass-block")).toBe(true);
    });

    it("gives the element the role of its tag, so the block can be a landmark", () => {
      render(
        <>
          <GlassBlock as="nav" aria-label="Menu">
            x
          </GlassBlock>
          <GlassBlock as="section" aria-label="Région">
            x
          </GlassBlock>
        </>,
      );

      expect(screen.getByRole("navigation", { name: "Menu" })).toBeDefined();
      expect(screen.getByRole("region", { name: "Région" })).toBeDefined();
    });

    it("falls back to a div when it is not given", () => {
      expect(renderBlock(<GlassBlock as={undefined}>x</GlassBlock>).tagName).toBe("DIV");
    });

    it("does not leak into the DOM as an attribute", () => {
      expect(renderBlock(<GlassBlock as="section">x</GlassBlock>).hasAttribute("as")).toBe(false);
    });

    it("can be a component, which receives the class, the attributes and the children", () => {
      function Card({ children, ...props }: { children: ReactNode; "data-kind": string; className?: string }) {
        return <article {...props}>{children}</article>;
      }

      const block = renderBlock(
        <GlassBlock as={Card} data-kind="card" className="extra">
          Contenu
        </GlassBlock>,
      );

      expect(block.tagName).toBe("ARTICLE");
      expect(block.getAttribute("data-kind")).toBe("card");
      expect(block.className).toBe("glass-block extra");
      expect(block.textContent).toBe("Contenu");
    });
  });

  describe("className", () => {
    it("adds the given classes after glass-block, without replacing it", () => {
      const block = renderBlock(<GlassBlock className="min-inline-[10rem] p-4">x</GlassBlock>);

      expect(block.className).toBe("glass-block min-inline-[10rem] p-4");
    });

    it("has only glass-block when no class is given, not 'undefined'", () => {
      expect(renderBlock(<GlassBlock>x</GlassBlock>).className).toBe("glass-block");
      expect(renderBlock(<GlassBlock className="">x</GlassBlock>).className).toBe("glass-block");
    });
  });

  describe("attributes", () => {
    it("passes the HTML attributes to the element", () => {
      const block = renderBlock(
        <GlassBlock id="intro" role="group" aria-label="Présentation" data-testid="glass" title="Info">
          x
        </GlassBlock>,
      );

      expect(block.id).toBe("intro");
      expect(block.getAttribute("role")).toBe("group");
      expect(block.getAttribute("aria-label")).toBe("Présentation");
      expect(block.getAttribute("data-testid")).toBe("glass");
      expect(block.title).toBe("Info");
    });

    it("passes the event handlers to the element", () => {
      const onClick = vi.fn();
      const block = renderBlock(<GlassBlock onClick={onClick}>x</GlassBlock>);

      fireEvent.click(block);

      expect(onClick).toHaveBeenCalledOnce();
    });

    it("passes the tabindex to the element, so the block can receive the focus", () => {
      const block = renderBlock(<GlassBlock tabIndex={-1}>x</GlassBlock>);

      block.focus();

      expect(document.activeElement).toBe(block);
    });
  });
});
