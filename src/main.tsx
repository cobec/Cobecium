import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import App from "./App";
import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from "@/lib/authMode";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL ?? "http://localhost:3210");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isClerkEnabled ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    ) : (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    )}
  </StrictMode>
);
