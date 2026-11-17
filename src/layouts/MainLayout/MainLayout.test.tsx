import { fireEvent, render, screen, within } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import MainLayout from "./MainLayout";
import { translate } from "@/i18n";

/** Affiche le layout comme route de layout : la page "/" contient un lien vers la page "/b". */
function renderLayout() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<MainLayout />}>
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

/** Toutes les ancres, dans l'ordre de la page. */
const allTargets = ["#header", "#main", "#footer"];

describe("MainLayout", () => {
  it("renders the header, the main content and the footer", () => {
    renderLayout();

    expect(screen.getByRole("banner").id).toBe("header");
    expect(screen.getByRole("main").id).toBe("main");
    expect(screen.getByRole("contentinfo").id).toBe("footer");
  });

  it("renders the current route inside main", () => {
    renderLayout();

    expect(within(screen.getByRole("main")).getByRole("link", { name: "Go to B" })).toBeDefined();
  });

  it("keeps the parts in reading order: header, main, footer", () => {
    renderLayout();
    const parts = [screen.getByRole("banner"), screen.getByRole("main"), screen.getByRole("contentinfo")];

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

    it("points every link to exactly one element", () => {
      renderLayout();

      for (const target of skipLinkTargets()) {
        expect(document.querySelectorAll(target as string)).toHaveLength(1);
      }
    });

    it("gives every link a text, so a screen reader can announce it", () => {
      renderLayout();

      for (const link of skipLinks()) {
        expect(link.textContent?.trim()).not.toBe("");
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

describe("MainLayout CSS variables", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute("style");
  });

  it("exposes the height of the header, main and footer on <html>", () => {
    renderLayout();
    const root = document.documentElement.style;

    ["--header-height", "--main-height", "--footer-height"].forEach(name => expect(root.getPropertyValue(name)).toMatch(/^\d+px$/));
  });

  it("keeps the variables up to date when a part is resized", () => {
    const callbacks: ResizeObserverCallback[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          callbacks.push(callback);
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    renderLayout();
    const header = screen.getByRole("banner");
    Object.defineProperty(header, "clientHeight", { configurable: true, value: 48 });

    callbacks.forEach(callback => callback([{ target: header } as unknown as ResizeObserverEntry], {} as ResizeObserver));

    expect(document.documentElement.style.getPropertyValue("--header-height")).toBe("48px");
  });
});

describe("MainLayout top button", () => {
  const visibleClass = "main-layout__inner__top-button--visible";

  /** Le bouton est cherché aussi quand il est masqué (`inert`) : c'est justement l'état à vérifier. */
  const topButton = () => screen.getByRole("button", { name: translate("fr", "common.buttons.scroll-to-top"), hidden: true });

  /** Simule un défilement de la fenêtre à `top` pixels : jsdom ne défile pas, la position est posée à la main. */
  function scrollTo(top: number) {
    Object.defineProperty(window, "scrollY", { configurable: true, value: top });
    fireEvent.scroll(window);
  }

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("is hidden at the top of the page, and out of the tab order and the accessibility tree", () => {
    renderLayout();

    expect(topButton().classList.contains(visibleClass)).toBe(false);
    expect(topButton().hasAttribute("inert")).toBe(true);
  });

  it("appears once the page is scrolled past 400px", () => {
    renderLayout();

    scrollTo(401);

    expect(topButton().classList.contains(visibleClass)).toBe(true);
    expect(topButton().hasAttribute("inert")).toBe(false);
    expect(screen.getByRole("button", { name: translate("fr", "common.buttons.scroll-to-top") })).toBe(topButton());
  });

  it("stays hidden up to 400px included", () => {
    renderLayout();

    scrollTo(400);

    expect(topButton().classList.contains(visibleClass)).toBe(false);
  });

  it("disappears again when the user scrolls back up", () => {
    renderLayout();
    scrollTo(800);
    expect(topButton().classList.contains(visibleClass)).toBe(true);

    scrollTo(120);

    expect(topButton().classList.contains(visibleClass)).toBe(false);
    expect(topButton().hasAttribute("inert")).toBe(true);
  });

  it("is already visible when the page opens scrolled (reload, back navigation)", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 600 });

    renderLayout();

    expect(topButton().classList.contains(visibleClass)).toBe(true);
  });

  it("scrolls back to the top of the page when clicked", () => {
    const scrollToTop = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    renderLayout();
    scrollTo(600);

    fireEvent.click(topButton());

    expect(scrollToTop).toHaveBeenCalledWith({ top: 0 });
  });

  it("stops listening to the scroll when the layout is unmounted", () => {
    const addListener = vi.spyOn(window, "addEventListener");
    const { unmount } = renderLayout();
    const [, , options] = addListener.mock.calls.find(([type]) => type === "scroll") ?? [];
    const { signal } = options as AddEventListenerOptions;

    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);
  });
});
