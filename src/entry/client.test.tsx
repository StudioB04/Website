import { act, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { dictionaries } from "@/i18n";

type ReactDomClient = typeof import("react-dom/client");

// react-dom/client est enveloppé pour savoir laquelle des deux fonctions est appelée, récupérer
// les racines (à démonter après chaque test) et les erreurs d'hydratation récupérables.
const spy = vi.hoisted(() => ({
  roots: [] as Array<{ unmount: () => void }>,
  recoverableErrors: [] as unknown[],
}));

vi.mock("react-dom/client", async importOriginal => {
  const actual = await importOriginal<ReactDomClient>();
  return {
    ...actual,
    createRoot: vi.fn((...args: Parameters<ReactDomClient["createRoot"]>) => {
      const root = actual.createRoot(...args);
      spy.roots.push(root);
      return root;
    }),
    hydrateRoot: vi.fn((container: Parameters<ReactDomClient["hydrateRoot"]>[0], node: Parameters<ReactDomClient["hydrateRoot"]>[1]) => {
      const root = actual.hydrateRoot(container, node, { onRecoverableError: error => spy.recoverableErrors.push(error) });
      spy.roots.push(root);
      return root;
    }),
  };
});

// Le HTML que le pré-rendu écrit dans #root : même arbre que `render()` de entry/server.tsx.
function prerendered(url: string, basename = "/") {
  return renderToString(
    <StaticRouter basename={basename} location={`${basename}${url.slice(1)}`}>
      <App />
    </StaticRouter>,
  );
}

// La page telle que le navigateur la reçoit : #root rempli (build) ou vide (serveur de dev), à l'adresse `path`.
function openPage(path: string, html = "") {
  document.body.innerHTML = `<div id="root">${html}</div>`;
  window.history.pushState({}, "", path);
  return document.getElementById("root") as HTMLElement;
}

// client.tsx démarre l'application dès son import : on le charge à neuf pour chaque scénario.
async function runClient() {
  vi.resetModules();
  const { createRoot, hydrateRoot } = await import("react-dom/client");
  await act(async () => {
    await import("./client");
  });
  return { createRoot: vi.mocked(createRoot), hydrateRoot: vi.mocked(hydrateRoot) };
}

function internalHrefs(container: HTMLElement) {
  return [...container.querySelectorAll("a[href]")].map(link => link.getAttribute("href") ?? "").filter(href => href.startsWith("/"));
}

beforeEach(() => {
  spy.recoverableErrors.length = 0;
});

afterEach(async () => {
  await act(async () => {
    spy.roots.splice(0).forEach(root => root.unmount());
  });
  document.body.innerHTML = "";
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("entry/client", () => {
  it("renders the app from scratch when #root is empty (dev server)", async () => {
    const container = openPage("/numerique/");

    const { createRoot, hydrateRoot } = await runClient();

    expect(createRoot).toHaveBeenCalledWith(container);
    expect(hydrateRoot).not.toHaveBeenCalled();
    expect(within(container).getByRole("heading", { level: 1 }).textContent).toBe(dictionaries.fr.pages.digital.heading);
  });

  it("hydrates the pre-rendered HTML in place when #root already has content", async () => {
    const container = openPage("/numerique/", prerendered("/numerique/"));
    const heading = container.querySelector("h1");

    const { createRoot, hydrateRoot } = await runClient();

    expect(hydrateRoot).toHaveBeenCalledWith(container, expect.anything());
    expect(createRoot).not.toHaveBeenCalled();
    expect(spy.recoverableErrors).toEqual([]);
    expect(heading).not.toBeNull();
    expect(container.querySelector("h1")).toBe(heading);
  });

  it("hydrates an English page without mismatch", async () => {
    const container = openPage("/en/digital/", prerendered("/en/digital/"));

    const { hydrateRoot } = await runClient();

    expect(hydrateRoot).toHaveBeenCalledOnce();
    expect(spy.recoverableErrors).toEqual([]);
    expect(within(container).getByRole("heading", { level: 1 }).textContent).toBe(dictionaries.en.pages.digital.heading);
  });

  describe("under a base path (GitHub Pages)", () => {
    beforeEach(() => {
      vi.stubEnv("BASE_URL", "/Website/");
    });

    it("uses BASE_URL as router basename to pick the page and prefix every internal link", async () => {
      const container = openPage("/Website/en/digital/");

      await runClient();

      expect(within(container).getByRole("heading", { level: 1 }).textContent).toBe(dictionaries.en.pages.digital.heading);
      expect(internalHrefs(container).length).toBeGreaterThan(0);
      expect(internalHrefs(container).every(href => href.startsWith("/Website/"))).toBe(true);
    });

    it("hydrates the pre-rendered HTML without mismatch", async () => {
      const container = openPage("/Website/numerique/", prerendered("/numerique/", "/Website/"));
      const heading = container.querySelector("h1");

      const { createRoot, hydrateRoot } = await runClient();

      expect(hydrateRoot).toHaveBeenCalledOnce();
      expect(createRoot).not.toHaveBeenCalled();
      expect(spy.recoverableErrors).toEqual([]);
      expect(container.querySelector("h1")).toBe(heading);
    });
  });
});
