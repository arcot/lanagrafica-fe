import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/components/app.tsx";
import "normalize.css";
import "./index.css";
import { ThemeProvider } from "./components/providers/theme-provider.tsx";
import "./i18next";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "@/lib/auth0-config";

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={auth0Config.domain}
      clientId={auth0Config.clientId}
      authorizationParams={{
        redirect_uri: auth0Config.redirectUri,
        audience: auth0Config.audience,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storageKey="vite-ui-theme">
          <App />
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Auth0Provider>
  </React.StrictMode>,
);
