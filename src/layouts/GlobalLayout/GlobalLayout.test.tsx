import { fireEvent, render, screen, within } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import GlobalLayout from "./GlobalLayout";
import type { GlobalLayoutProps } from "./GlobalLayout.types";

/** Affiche le layout comme route de layout : la page "/" contient un lien vers la page "/b". */
function renderLayout(props: GlobalLayoutProps = {}) {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<GlobalLayout {...props} />}>
          <Route path="/" element={<Link to="/b">Go to B</Link>} />
          <Route path="/b" element={<p>Page B</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

/** Liens d'évitement : les liens qui pointent vers une ancre de la page, dans l'ordre du document. */
function skipLinks() {
  return screen.getAllByRole("link").filter(link => link.getAttribute("href")?.startsWith("#"));
}

function skipLinkTargets() {
  return skipLinks().map(link => link.getAttribute("href"));
}

function precedes(first: Element, second: Element) {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

const optionalParts = [
  { prop: "header", target: "#header" },
  { prop: "footer", target: "#footer" },
  { prop: "subfooter", target: "#subfooter" },
] as const;

/** Toutes les ancres, dans l'ordre de la page ; `main` est toujours affiché. */
const allTargets = ["#header", "#main", "#footer", "#subfooter"];

const booleans = [true, false];
const combinations = booleans.flatMap(header => booleans.flatMap(footer => booleans.map(subfooter => ({ header, footer, subfooter }))));

describe("GlobalLayout", () => {
  it("renders the header, the main content, the footer and the subfooter by default", () => {
    renderLayout();

    expect(screen.getByRole("banner").id).toBe("header");
    expect(screen.getByRole("main").id).toBe("main");
    expect(screen.getByRole("contentinfo").id).toBe("footer");
    expect(document.getElementById("subfooter")).not.toBeNull();
  });

  it("renders the current route inside main", () => {
    renderLayout();

    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to B" })).toBeDefined();
  });

  it("keeps the parts in reading order: header, main, footer, subfooter", () => {
    renderLayout();
    const parts = [screen.getByRole("banner"), screen.getByRole("main"), screen.getByRole("contentinfo"), document.getElementById("subfooter") as HTMLElement];

    parts.slice(1).forEach((part, index) => expect(precedes(parts[index], part)).toBe(true));
  });

  it("does not nest the footer in the main landmark", () => {
    renderLayout();

    expect(screen.getByRole("main").contains(screen.getByRole("contentinfo"))).toBe(false);
  });

  describe("skip links", () => {
    it("lists a link for each part, in the order of the page", () => {
      renderLayout();

      expect(skipLinkTargets()).toEqual(allTargets);
    });

    it("comes before the header, so they are the first thing a keyboard user reaches", () => {
      renderLayout();
      const header = screen.getByRole("banner");

      for (const link of skipLinks()) {
        expect(precedes(link, header)).toBe(true);
      }
    });

    it.each(optionalParts)("removes the $prop and its link when $prop is false, and keeps the other parts", ({ prop, target }) => {
      renderLayout({ [prop]: false });

      expect(document.querySelector(target)).toBeNull();
      expect(skipLinkTargets()).toEqual(allTargets.filter(anchor => anchor !== target));
      for (const other of optionalParts.filter(part => part.target !== target)) {
        expect(document.querySelector(other.target)).not.toBeNull();
      }
      expect(document.getElementById("main")).not.toBeNull();
    });

    it("always keeps main and its link, even without header, footer and subfooter", () => {
      renderLayout({ header: false, footer: false, subfooter: false });

      expect(skipLinkTargets()).toEqual(["#main"]);
      expect(screen.getByRole("main").id).toBe("main");
      expect(screen.queryByRole("banner")).toBeNull();
      expect(screen.queryByRole("contentinfo")).toBeNull();
      expect(document.getElementById("subfooter")).toBeNull();
    });

    it.each(combinations)("points every link to exactly one element (header: $header, footer: $footer, subfooter: $subfooter)", props => {
      renderLayout(props);
      const targets = skipLinkTargets();

      expect(targets).toHaveLength(1 + [props.header, props.footer, props.subfooter].filter(Boolean).length);
      for (const target of targets) {
        expect(document.querySelectorAll(target as string)).toHaveLength(1);
      }
    });
  });

  it("stays mounted when the page changes: only the content of main is replaced", () => {
    renderLayout();
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");

    fireEvent.click(screen.getByRole("link", { name: "Go to B" }));

    expect(within(main).getByText("Page B")).toBeDefined();
    expect(within(main).queryByRole("link", { name: "Go to B" })).toBeNull();
    expect(screen.getByRole("banner")).toBe(header);
    expect(screen.getByRole("main")).toBe(main);
    expect(screen.getByRole("contentinfo")).toBe(footer);
  });
});
