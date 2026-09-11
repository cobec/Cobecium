import type { AuthConfig } from "convex/server";

/**
 * Microsoft Entra ID (Azure AD) as JWT issuer for Convex.
 *
 * Uses customJwt because Entra JWKS lives at
 * `/discovery/v2.0/keys`, not `{iss}/.well-known/jwks.json`.
 *
 * Set on the Convex deployment (self-hosted: `bunx convex env set …`):
 *   ENTRA_TENANT_ID   – Directory (tenant) ID
 *   ENTRA_CLIENT_ID   – SPA application (client) ID — must match JWT `aud`
 *   LYNX_FIRST_ADMIN_OID – optional; first admin’s Entra object ID (`oid`)
 *
 * JWT `iss` must be exactly:
 *   https://login.microsoftonline.com/<tenant>/v2.0
 */
export default {
  providers: [
    {
      type: "customJwt",
      applicationID: process.env.ENTRA_CLIENT_ID!,
      issuer: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/v2.0`,
      jwks: `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}/discovery/v2.0/keys`,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
