import { ClerkProvider } from "@clerk/react";
import { esES, enUS } from "@clerk/localizations";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary";
import { I18nProvider, useI18n } from "./i18n";
import { initAnalytics } from "./lib/analytics";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY === "pk_test_dummy_key") {
  console.warn("[Clerk] VITE_CLERK_PUBLISHABLE_KEY no configurada.");
}

// Clerk (inicio de sesión) sigue el idioma elegido en la página
function ClerkWithLanguage({ children }: { children: React.ReactNode }) {
  const { lang } = useI18n();
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY || "pk_test_dummy_key"} afterSignOutUrl="/" localization={lang === "es" ? esES : enUS}>
      {children}
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <I18nProvider>
      <ClerkWithLanguage>
        <App />
      </ClerkWithLanguage>
    </I18nProvider>
  </ErrorBoundary>
);