import { ClerkProvider } from "@clerk/react";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { initAnalytics } from "./lib/analytics";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_dummy_key") {
  console.warn("[Clerk] VITE_CLERK_PUBLISHABLE_KEY no configurada. Usando modo desarrollo sin autenticación real.");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_dummy_key"} afterSignOutUrl="/">
      <App />
    </ClerkProvider>
  </ErrorBoundary>
);