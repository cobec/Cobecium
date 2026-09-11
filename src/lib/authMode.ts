/** Entra SPA app (client) ID from Azure portal → App registration. */
export const ENTRA_CLIENT_ID =
  (import.meta.env.VITE_ENTRA_CLIENT_ID as string | undefined)?.trim() ?? "";

/** Entra Directory (tenant) ID — prefer a real tenant GUID, not "common", for Convex iss match. */
export const ENTRA_TENANT_ID =
  (import.meta.env.VITE_ENTRA_TENANT_ID as string | undefined)?.trim() ?? "";

/** Optional override; defaults to window.location.origin when signing in. */
export const ENTRA_REDIRECT_URI =
  (import.meta.env.VITE_ENTRA_REDIRECT_URI as string | undefined)?.trim() ?? "";

export const isEntraEnabled =
  ENTRA_CLIENT_ID.length > 0 && ENTRA_TENANT_ID.length > 0;
