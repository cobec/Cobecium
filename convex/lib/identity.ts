import type { UserIdentity } from "convex/server";

/**
 * Stable Cobec/Lynx user key from an Entra (or other OIDC) identity.
 * Prefer Entra `oid` so Cobecium matches Lynx.Enterprise `users.external_id`.
 * Falls back to JWT `sub` when `oid` is absent.
 */
export function getExternalId(identity: UserIdentity): string {
  const oid = identity.oid;
  if (typeof oid === "string" && oid.length > 0) return oid;
  return identity.subject;
}
