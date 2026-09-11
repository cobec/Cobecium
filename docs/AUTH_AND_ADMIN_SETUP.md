# Auth and admin setup (Microsoft Entra ID + Convex)

Lynx uses **Microsoft Entra ID** for sign-in and **Convex** for identity and roles.
The Convex backend validates Entra ID tokens and stores users in `lynxUsers` with
`externalId` (Entra **oid**) and `role` (`"admin"` | `"user"`).

> **Hosting:** Public Netlify hosting is paused. Run locally / on cobec-spark
> (`bun run dev` / Docker). Clerk has been removed.

## Environment variables

### Frontend (Vite / `.env` / `.env.local`)

| Variable | Purpose |
|----------|---------|
| `VITE_ENTRA_CLIENT_ID` | SPA Application (client) ID from Entra app registration |
| `VITE_ENTRA_TENANT_ID` | Directory (tenant) ID — use the real GUID (not `common`) so JWT `iss` matches Convex |
| `VITE_ENTRA_REDIRECT_URI` | Optional; defaults to `window.location.origin` |
| `VITE_CONVEX_URL` | Convex deployment URL |

### Convex backend (`bunx convex env set …` / dashboard)

| Variable | Purpose |
|----------|---------|
| `ENTRA_CLIENT_ID` | Same SPA client ID — must equal JWT `aud` |
| `ENTRA_TENANT_ID` | Same tenant GUID — builds issuer + JWKS URLs |
| `LYNX_FIRST_ADMIN_OID` | Optional; Entra object ID (`oid`) of the first admin |

```bash
# Self-hosted example (from app container / repo with Convex CLI wired):
bunx convex env set ENTRA_TENANT_ID '<directory-id>'
bunx convex env set ENTRA_CLIENT_ID '<application-id>'
bunx convex env set LYNX_FIRST_ADMIN_OID '<your-oid>'
```

## Entra app registration (spike checklist)

1. Azure Portal → **Microsoft Entra ID** → **App registrations** → **New registration**
2. Name e.g. `Lynx Cobecium SPA`; single tenant
3. Platform: **Single-page application (SPA)**
4. Redirect URIs: `http://localhost:5173` (Vite), plus cobec-spark origin if used
5. **Token configuration**: ensure ID token optional claims include **`oid`**, `email`, `preferred_username` (or profile) as needed
6. Copy **Application (client) ID** and **Directory (tenant) ID** into Vite + Convex env

## First admin

1. Sign in once, decode the ID token (jwt.io) and copy the **`oid`** claim — or read it from Azure → Users → Object ID
2. Set `LYNX_FIRST_ADMIN_OID` to that value
3. Clear any leftover Clerk-era `lynxUsers` rows (schema field is now `externalId`)
4. Sign in again so `ensureMe` promotes you to admin

## Identity key

Always store **Entra `oid`**, not JWT `sub` (pairwise). Helper: `convex/lib/identity.ts` → `getExternalId`.
SamRank receives the same value as `externalId`.

## Admin-only features

Unchanged: `/admin`, `/analytics`, `/system-prompts` via `AdminOnlyRoute`; header links when `getMyRole` is admin.

## Spike verification

See [ENTRA_AUTH_SPIKE.md](./ENTRA_AUTH_SPIKE.md).
