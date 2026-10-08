import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AmpersandProvider } from "@amp-labs/react";
import { App } from "./App";

const options = {
  project: process.env.PUBLIC_AMPERSAND_PROJECT_ID!,
  apiKey: process.env.PUBLIC_AMPERSAND_API_KEY!,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AmpersandProvider options={options}>
      <App />
    </AmpersandProvider>
  </StrictMode>,
);
