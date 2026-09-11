import { useCallback, useMemo } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { loginRequest } from "@/lib/msalConfig";

/**
 * Bridge MSAL → ConvexProviderWithAuth.
 * Returns the Entra ID token (not a Graph access token) so Convex can validate aud = client ID.
 */
export function useAuthFromMsal() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const isLoading = inProgress !== "none";

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      const account = instance.getActiveAccount() ?? accounts[0];
      if (!account) return null;
      try {
        const result = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
          forceRefresh: forceRefreshToken,
        });
        return result.idToken;
      } catch (err) {
        if (err instanceof InteractionRequiredAuthError) {
          try {
            const result = await instance.acquireTokenPopup(loginRequest);
            if (result.account) instance.setActiveAccount(result.account);
            return result.idToken;
          } catch {
            return null;
          }
        }
        console.error("MSAL acquireTokenSilent failed", err);
        return null;
      }
    },
    [instance, accounts]
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [isLoading, isAuthenticated, fetchAccessToken]
  );
}
