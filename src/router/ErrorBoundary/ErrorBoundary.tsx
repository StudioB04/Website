import { Component, type ReactNode } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorPage } from "@/pages";

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <ErrorPage status={500} /> : this.props.children;
  }
}

/**
 * Route de layout : une erreur d'affichage dans une page montre la page 500 dans le layout (en-tête et pied de page
 * restent là) au lieu d'un écran blanc. L'erreur disparaît dès qu'on change de page.
 */
export default function PageErrorBoundary() {
  const { pathname } = useLocation();

  return (
    <Boundary key={pathname}>
      <Outlet />
    </Boundary>
  );
}
