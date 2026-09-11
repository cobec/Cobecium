import { Navigate, useLocation } from "react-router-dom";
import { useAppAuth } from "@/auth/EntraAuthButtons";

interface AuthenticatedRouteProps {
  children: React.ReactNode;
}

/**
 * Renders children only when Convex has an authenticated Entra session;
 * otherwise redirects to welcome with a return URL.
 */
export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const { isSignedIn, isLoading } = useAppAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <p className="p-6 text-sm text-muted-foreground">Checking sign-in…</p>
    );
  }

  if (!isSignedIn) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/welcome?redirect=${redirect}`} replace />;
  }
  return <>{children}</>;
}
