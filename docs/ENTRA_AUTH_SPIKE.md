# Entra → Convex auth spike

Goal: prove **MSAL ID token → Convex `getUserIdentity()` → `users.ensureMe(oid)`**
without Clerk, with Netlify hosting paused.

## Status

| Step | State |
|------|--------|
| Remove Clerk / add MSAL | Done in code |
| `auth.config.ts` Entra `customJwt` | Done |
| `clerkUserId` → `externalId` + oid helper | Done |
| UI sign-in (popup) | Done |
| Live Entra app + first login | **You must configure Azure + env** |

## Configure (once)

1. Create SPA app registration (see [AUTH_AND_ADMIN_SETUP.md](./AUTH_AND_ADMIN_SETUP.md)).
2. Put IDs in `.env.local`:

```bash
VITE_ENTRA_CLIENT_ID=<application-id>
VITE_ENTRA_TENANT_ID=<directory-id>
# VITE_CONVEX_URL already set for cobec-spark / local
```

3. Set Convex env (same IDs) and push functions:

```bash
bunx convex env set ENTRA_TENANT_ID '<directory-id>'
bunx convex env set ENTRA_CLIENT_ID '<application-id>'
# after first token decode:
bunx convex env set LYNX_FIRST_ADMIN_OID '<oid>'
bunx convex dev   # or your self-hosted push path
```

4. Wipe legacy Clerk rows if the deployment still has `clerkUserId` documents
   (schema no longer accepts that field).

## Prove it

1. `bun run dev` → open the Vite URL
2. **Sign in** → Entra popup → account picker
3. Confirm Convex auth: open `/admin` after setting `LYNX_FIRST_ADMIN_OID`, or
   check Convex logs / dashboard that `ensureMe` inserted `lynxUsers` with your oid
4. Optional: jwt.io on the ID token — `aud` = client ID, `iss` =
   `https://login.microsoftonline.com/<tenant>/v2.0`, claim `oid` present

## Failure modes

| Symptom | Likely cause |
|---------|----------------|
| Popup blocked / cancelled | Allow popups for localhost |
| Convex “Unauthenticated” after MSAL login | `iss`/`aud` mismatch; tenant `common` vs GUID; Convex env not set |
| `oid` missing on identity | Add optional claim in Entra token config; helper falls back to `sub` |
| Schema errors on lynxUsers | Old Clerk documents still in table |

## Out of scope for this spike

- Teams silent SSO (`getAuthToken`)
- Dual Clerk+Entra
- Netlify redeploy
- Email-merge of historical feedback
