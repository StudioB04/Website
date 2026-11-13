import type { ComponentType } from "react";
import { Route, Routes, useLocation } from "react-router";
import { GlobalLayout } from "@/layouts";
import { getAllRoutes, getLocaleFromPath } from "./routes";
import type { PageId } from "./routes";
import {
  Digital,
  Home,
  Legal,
  NotFound,
  Print,
  Signage,
  TradeShows,
} from "@/pages";

import "./styles/global.css";

export const pageComponents: Record<PageId, ComponentType> = {
  home: Home,
  digital: Digital,
  print: Print,
  signage: Signage,
  tradeShows: TradeShows,
  legal: Legal,
};

function NotFoundRoute() {
  const { pathname } = useLocation();
  return (
    <GlobalLayout locale={getLocaleFromPath(pathname)} pageId={null}>
      <NotFound />
    </GlobalLayout>
  );
}

export default function App() {
  return (
    <Routes>
      {getAllRoutes().map(({ pageId, locale, path }) => {
        const Page = pageComponents[pageId];
        return (
          <Route
            key={path}
            path={path}
            element={
              <GlobalLayout locale={locale} pageId={pageId}>
                <Page />
              </GlobalLayout>
            }
          />
        );
      })}
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}
