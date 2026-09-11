import { useCallback, type ReactNode } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { useConvexAuth } from "convex/react";
import { loginRequest } from "@/lib/msalConfig";
import { isEntraEnabled } from "@/lib/authMode";
import { Button } from "@/components/ui/button";

/** App-wide signed-in check (Convex JWT established). Safe without MsalProvider. */
export function useAppAuth() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  return {
    isLoading,
    isSignedIn: isAuthenticated,
    entraConfigured: isEntraEnabled,
  };
}

function useEntraSignIn() {
  const { instance } = useMsal();
  return useCallback(async () => {
    const result = await instance.loginPopup(loginRequest);
    if (result.account) instance.setActiveAccount(result.account);
  }, [instance]);
}

function useEntraSignOut() {
  const { instance } = useMsal();
  return useCallback(async () => {
    const account = instance.getActiveAccount() ?? instance.getAllAccounts()[0];
    await instance.logoutPopup({ account: account ?? undefined });
  }, [instance]);
}

type AuthButtonsProps = {
  className?: string;
  signInLabel?: string;
  signOutLabel?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
};

function EntraAuthButtonsActive({
  className,
  signInLabel = "Sign in",
  signOutLabel = "Sign out",
  size = "sm",
  variant = "outline",
}: AuthButtonsProps) {
  const msalAuthed = useIsAuthenticated();
  const { isAuthenticated: convexAuthed } = useConvexAuth();
  const signIn = useEntraSignIn();
  const signOut = useEntraSignOut();
  const signedIn = msalAuthed || convexAuthed;

  if (signedIn) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className ?? "uppercase font-semibold"}
        onClick={() => void signOut()}
      >
        {signOutLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className ?? "uppercase font-semibold"}
      onClick={() => void signIn().catch((e) => console.error(e))}
    >
      {signInLabel}
    </Button>
  );
}

/** Sign in / Sign out. Safe when Entra env is missing (no MSAL hooks). */
export function EntraAuthButtons(props: AuthButtonsProps) {
  if (!isEntraEnabled) {
    return (
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        Set VITE_ENTRA_* to enable sign-in
      </span>
    );
  }
  return <EntraAuthButtonsActive {...props} />;
}

function EntraSignInButtonActive({
  children,
}: {
  children: ReactNode;
  className?: string;
}) {
  const signIn = useEntraSignIn();
  return (
    <span
      role="presentation"
      className="inline-flex"
      onClick={(e) => {
        e.preventDefault();
        void signIn().catch((err) => console.error(err));
      }}
    >
      {children}
    </span>
  );
}

export function EntraSignInButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  if (!isEntraEnabled) {
    return (
      <Button type="button" disabled className={className}>
        Entra not configured
      </Button>
    );
  }
  return <EntraSignInButtonActive>{children}</EntraSignInButtonActive>;
}
