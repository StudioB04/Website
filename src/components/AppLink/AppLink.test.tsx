import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router";
import { describe, expect, it } from "vitest";
import AppLink from "./AppLink";

function CurrentPath() {
  return <output>{useLocation().pathname}</output>;
}

function renderLink(to: string, basename = "/") {
  return render(
    <MemoryRouter basename={basename} initialEntries={[basename]}>
      <AppLink to={to} label="Lien" />
      <CurrentPath />
    </MemoryRouter>,
  );
}

describe("AppLink", () => {
  it("renders the path as is at the root of a domain", () => {
    renderLink("/enseigne-signaletique/");
    expect(screen.getByRole("link", { name: "Lien" }).getAttribute("href")).toBe("/enseigne-signaletique/");
  });

  it("prefixes the href with the router basename", () => {
    renderLink("/enseigne-signaletique/", "/Website/");
    expect(screen.getByRole("link", { name: "Lien" }).getAttribute("href")).toBe("/Website/enseigne-signaletique/");
  });

  it("keeps the trailing slash on the home link under a basename", () => {
    renderLink("/", "/Website/");
    expect(screen.getByRole("link", { name: "Lien" }).getAttribute("href")).toBe("/Website/");
  });

  it("navigates client-side, the router location excluding the basename", () => {
    renderLink("/enseigne-signaletique/", "/Website/");
    fireEvent.click(screen.getByRole("link", { name: "Lien" }));
    expect(screen.getByRole("status").textContent).toBe("/enseigne-signaletique/");
  });
});
