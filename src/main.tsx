import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { initAnalytics } from "./lib/analytics";

// Initialize analytics on app load
initAnalytics();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
