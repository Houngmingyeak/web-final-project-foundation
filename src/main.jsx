import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./app/store.js";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { HelmetProvider } from "react-helmet-async";
const rootElement = document.getElementById("root");

const appContent = (
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>
);

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, appContent);
} else {
  ReactDOM.createRoot(rootElement).render(appContent);
}
