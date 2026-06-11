import "./theme.arv";
import { setTheme } from "./arvia-theme";
import { StrictMode } from "react";

setTheme("dark");
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
