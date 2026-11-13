import { StrictMode } from "react";
import { prerender } from "react-dom/static";
import { StaticRouter } from "react-router";
import App from "./App";
import { SITE_URL } from "./config";
import { renderHead } from "./head";
import { getAllRoutes, findPage, getLocaleFromPath } from "./routes";

export { getAllRoutes, SITE_URL };

export async function render(url: string) {
  const match = findPage(url);
  const locale = match?.locale ?? getLocaleFromPath(url);

  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  return {
    html: await new Response(prelude).text(),
    head: renderHead(match?.pageId ?? "notFound", locale),
    locale,
  };
}
