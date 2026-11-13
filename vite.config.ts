/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Sous-dossier d'hébergement (ex. "/Website" sur GitHub Pages), vide à la racine d'un domaine.
const basePath = (process.env.BASE_PATH ?? "").replace(/^\/+|\/+$/g, "");

export default defineConfig({
  base: basePath ? `/${basePath}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    manifest: false,
  },
  ssr: {
    noExternal: ["@studio_b04/ds"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    server: {
      deps: {
        inline: ["@studio_b04/ds"],
      },
    },
  },
});
