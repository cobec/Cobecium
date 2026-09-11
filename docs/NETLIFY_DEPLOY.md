# Deploying the Cobecium web app on Netlify

> **Paused:** Public Netlify hosting is stopped during the Entra auth cutover.
> Prefer local Vite / cobec-spark. This doc is retained for a future re-host.

This doc covers deploying **only the web app** (Vite + React) to Netlify. The Convex backend runs separately (Convex Cloud or your own self-hosted instance); the app on Netlify talks to it via `VITE_CONVEX_URL`.

---

## What’s already configured

- **`netlify.toml`** in the repo defines:
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Node version: 20
  - SPA rewrite: all routes serve `index.html` so client-side routing (e.g. `/analytics`, `/system-prompts`) works on direct load and refresh.

Netlify will pick this up when you connect the repo; you only need to set environment variables.

---

## 1. Connect the repository

1. In [Netlify](https://app.netlify.com): **Add new site** → **Import an existing project**.
2. Choose your Git provider and select the **cobecium** repo.
3. Netlify will detect Vite and suggest **Build command** `npm run build` and **Publish directory** `dist`. These are already set in `netlify.toml`, so you can leave them as-is (or confirm they match).
4. Click **Deploy site** (the first deploy may fail until you set env vars; that’s expected).

---

## 2. Environment variables

Set these in **Site configuration** → **Environment variables** (or during the “Import” flow).

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | **Yes** | URL the browser uses to reach Convex |
| `VITE_ENTRA_CLIENT_ID` | **Yes** | Entra SPA application (client) ID |
| `VITE_ENTRA_TENANT_ID` | **Yes** | Entra directory (tenant) ID |
| `VITE_ORCHESTRATOR_DOCS_URL` | No | Orchestrator docs link in the header |

- **Convex Cloud:** use the deployment URL from your Convex dashboard (e.g. `https://your-deployment.convex.cloud`).
- **Self-hosted Convex:** use the public URL where your Convex backend is reachable from the internet (e.g. `https://convex.yourdomain.com`). The Netlify app runs in the browser, so this must be a URL that the **user’s browser** can call.

Do **not** put Convex admin keys or backend-only secrets in Netlify env; only `VITE_*` vars are needed for the frontend.

After adding or changing env vars, trigger a **new deploy** (e.g. **Deploys** → **Trigger deploy** → **Deploy site**) so the build uses the new values.

---

## 3. After deploy

- Your site will be at `https://<site-name>.netlify.app` (or your custom domain if configured).
- Test a few routes (e.g. `/`, `/analytics`, `/system-prompts`) by opening them directly and refreshing; they should all load the app (SPA rewrite).

---

## Optional: Netlify CLI and local preview

- **Manual deploy from CLI**
  ```bash
  npm i -g netlify-cli
  netlify login
  netlify init   # link this repo to a Netlify site
  netlify deploy --prod
  ```
  Build still runs with `npm run build`; publish directory is `dist`.

- **Local dev with Netlify primitives**  
  For local use of Netlify features (redirects, env, etc.), you can add `@netlify/vite-plugin` and use it in `vite.config.ts`. This is optional and not required for deploying the app.

---

## Summary

| Item | Value |
|------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |
| Required env | `VITE_CONVEX_URL` |
| Optional env | `VITE_ORCHESTRATOR_DOCS_URL` |
| SPA routing | Handled by `netlify.toml` rewrite |
