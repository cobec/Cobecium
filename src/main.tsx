import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import type { PublicClientApplication } from "@azure/msal-browser";
import { ConvexProvider, ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import App from "./App";
import { isEntraEnabled } from "@/lib/authMode";
import { getMsalInstance } from "@/lib/msalConfig";
import { useAuthFromMsal } from "@/auth/useAuthFromMsal";
import "./index.css";

const convex = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3210"
);

function EntraApp({ pca }: { pca: PublicClientApplication }) {
  return (
    <MsalProvider instance={pca}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromMsal}>
        <App />
      </ConvexProviderWithAuth>
    </MsalProvider>
  );
}

function Root() {
  const [pca, setPca] = useState<PublicClientApplication | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEntraEnabled) return;
    let cancelled = false;
    void getMsalInstance()
      .then((instance) => {
        if (!cancelled) setPca(instance);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to init MSAL");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isEntraEnabled) {
    return (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      </div>
    );
  }

  if (!pca) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading auth…
      </div>
    );
  }

  return <EntraApp pca={pca} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
