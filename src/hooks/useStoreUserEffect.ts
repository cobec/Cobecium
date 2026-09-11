import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * When authenticated with Convex (Entra), ensure the current user has a lynxUsers row
 * so getMyRole and admin checks work. Call once at app level (e.g. in App.tsx).
 */
export function useStoreUserEffect() {
  const { isAuthenticated } = useConvexAuth();
  const ensureMe = useMutation(api.users.ensureMe);

  useEffect(() => {
    if (!isAuthenticated) return;
    void ensureMe();
  }, [isAuthenticated, ensureMe]);
}
