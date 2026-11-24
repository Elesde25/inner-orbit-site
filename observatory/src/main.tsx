import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { JournalProvider } from "./components/Journal";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JournalProvider><App /></JournalProvider>
  </StrictMode>
);
