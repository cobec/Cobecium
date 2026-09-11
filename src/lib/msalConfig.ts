import {
  PublicClientApplication,
  type Configuration,
  LogLevel,
} from "@azure/msal-browser";
import {
  ENTRA_CLIENT_ID,
  ENTRA_REDIRECT_URI,
  ENTRA_TENANT_ID,
  isEntraEnabled,
} from "@/lib/authMode";

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};

function buildConfig(): Configuration {
  const redirectUri =
    ENTRA_REDIRECT_URI ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

  return {
    auth: {
      clientId: ENTRA_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${ENTRA_TENANT_ID}`,
      redirectUri,
      postLogoutRedirectUri: redirectUri,
    },
    cache: {
      cacheLocation: "localStorage",
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
      },
    },
  };
}

let msalInstance: PublicClientApplication | null = null;
let initPromise: Promise<PublicClientApplication> | null = null;

/** Lazy singleton — only construct when Entra env is configured. */
export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!isEntraEnabled) {
    throw new Error(
      "Entra is not configured. Set VITE_ENTRA_CLIENT_ID and VITE_ENTRA_TENANT_ID."
    );
  }
  if (msalInstance) return msalInstance;
  if (!initPromise) {
    initPromise = (async () => {
      const pca = new PublicClientApplication(buildConfig());
      await pca.initialize();
      const result = await pca.handleRedirectPromise();
      if (result?.account) {
        pca.setActiveAccount(result.account);
      } else {
        const accounts = pca.getAllAccounts();
        if (accounts[0]) pca.setActiveAccount(accounts[0]);
      }
      msalInstance = pca;
      return pca;
    })();
  }
  return initPromise;
}
