import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AmpersandProvider } from "@amp-labs/react";
import "@amp-labs/react/styles"; // Required for v2.x.x
import App from "./App.tsx";
import "./index.css";

// Production Ampersand configuration using environment variables
const ampersandConfig = {
  apiKey: import.meta.env.VITE_AMPERSAND_API_KEY,
  project: import.meta.env.VITE_AMPERSAND_PROJECT,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AmpersandProvider options={ampersandConfig}>
      <App />
    </AmpersandProvider>
  </StrictMode>
);
