import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "@/App";
import { BASE_URL } from "@/config";

const container = document.getElementById("root") as HTMLElement;
const app = (
  <StrictMode>
    <BrowserRouter basename={BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
