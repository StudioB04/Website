import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

interface RenderResult {
  html: string;
  head: string;
  locale: string;
}

interface ServerEntry {
  render: (url: string) => Promise<RenderResult>;
  getAllRoutes: () => { path: string }[];
  SITE_URL: string;
}

const root = resolve(import.meta.dirname, "..");
const clientDir = join(root, "dist", "client");
const serverEntry = join(root, "dist", "server", "entry-server.js");

const { render, getAllRoutes, SITE_URL } = (await import(pathToFileURL(serverEntry).href)) as ServerEntry;
const template = await readFile(join(clientDir, "index.html"), "utf-8");

function fillTemplate({ html, head, locale }: RenderResult): string {
  return template
    .replace('<html lang="fr">', `<html lang="${locale}">`)
    .replace("<!--app-head-->", head)
    .replace("<!--app-html-->", html);
}

async function writePage(file: string, content: string) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content, "utf-8");
}

const routes = getAllRoutes();

for (const { path } of routes) {
  const file = join(clientDir, path, "index.html");
  await writePage(file, fillTemplate(await render(path)));
  console.log(`✓ ${path}`);
}

await writePage(join(clientDir, "404.html"), fillTemplate(await render("/404/")));
console.log("✓ /404.html");


const today = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(({ path }) => `  <url><loc>${SITE_URL}${path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`;
await writePage(join(clientDir, "sitemap.xml"), sitemap);
await writePage(join(clientDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log("✓ sitemap.xml, robots.txt");

await rm(join(root, "dist", "server"), { recursive: true, force: true });
