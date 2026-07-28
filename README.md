# Lynx

## User

**Lynx** is a procurement hub for government and public-sector sourcing. It gives teams a single place to browse and search **state and city procurement portals**—official websites and direct procurement links—so researchers, business developers, and proposal teams can find opportunities without hunting across dozens of bookmarks or spreadsheets.

**Who it’s for:**

- **Researchers and BD teams** who need fast access to state/city procurement links by location.
- **Capture / BD teams** ranking **federal SAM.gov opportunities** inside Lynx at **`/opps`** (CSV → SamRank embed/rank → Yes/No learning).
- **Admins** who maintain the link catalog, import bulk data, manage system prompts for AI-assisted “hunts,” and view analytics.
- **Organizations** that pair Lynx with an external **AI Orchestrator** to run “hunts”: workflow runs (e.g. lead generation) scoped to a state, using configurable system prompts and optional RAG (e.g. AnythingLLM) or web search.

The main experience is a **procurement links grid** (by state/city) with search; **Opportunities** ranks federal notices from `samoutput/` CSVs via SamRank; admins get **System prompts**, **Analytics**, and **Admin** (user/role management). Right-clicking a state card opens **Start Hunt** to launch an Orchestrator workflow with a state-specific prompt.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, React Router 7, Vite 6, TypeScript 5.6 |
| **Styling** | Tailwind CSS 3, Radix UI (Dialog, Label, Slot), CVA, `clsx` / `tailwind-merge` |
| **Auth** | Clerk (sign-in, sign-up, `UserButton`); identity synced to Convex |
| **Backend / DB** | Convex (queries, mutations, actions); self-hosted option via Docker |
| **Runtime** | Bun or Node for scripts; `concurrently` for `vite` + `convex dev` |

Convex provides the API layer and persistence (`procurementLinks`, `chatSystemPrompts`, `lynxUsers`, `huntStarts`, `orchestratorDocsSync`, etc.). The app talks to an optional external **Orchestrator** service for workflow creation and polling; see `convex/orchestrator.ts` and `docs/INTEGRATION.md`.

---

## Architecture overview

- **App (Vite)** – SPA on port 5173; `@/` alias points at `src/`. Uses `ClerkProvider` and `ConvexProviderWithClerk`; `useStoreUserEffect` syncs Clerk identity into Convex `lynxUsers`.
- **Convex** – Backend can run in Convex Cloud or **self-hosted** (Docker: backend + dashboard + app container that runs `convex dev` + Vite). See `docs/CONVEX_LOCAL_SETUP.md`.
- **Routes** – `/` / `/app` = Procurement grid; `/opps` (+ `/approved`, `/status`) = federal Opportunities feed (Clerk + SamRank); `/system-prompts`, `/analytics`, `/admin` are admin-only (guarded by `AdminOnlyRoute` and Convex `requireAdmin`). Style demos live at `/1`–`/10`.
- **Data flow** – Grid reads `api.procurementLinks.list` and `api.systemPrompts.list`; Opportunities reads Convex `api.samRank.*` actions that proxy SamRank `:5190`. Admins can import JSON, add/edit links, and edit prompts. “Start Hunt” uses `api.orchestrator.createWorkflow` (and related actions) and opens `HuntChatModal` to poll workflow status.
- **Orchestrator docs sync** – Convex can fetch and hash the Orchestrator API docs; the header shows an indicator when stored docs have changed. See `convex/orchestratorDocsSync.ts` and env vars in `docs/CONVEX_LOCAL_SETUP.md`.

---

## Developer conventions

- **Path alias** – Use `@/` for `src/` (e.g. `@/components/LynxHeader`, `@/lib/utils`). Configured in `tsconfig.json` and `vite.config.ts`.
- **Convex** – Backend lives in `convex/`. Do not edit `convex/_generated/*` by hand. For self-hosted, do not set `CONVEX_DEPLOYMENT` when using `CONVEX_SELF_HOSTED_*`; see [AGENTS.md](AGENTS.md) and [docs/CONVEX_CLI_LOGIN.md](docs/CONVEX_CLI_LOGIN.md).
- **Auth and roles** – Convex validates Clerk JWTs via `auth.config.ts`. Roles (`admin` / `user`) live in `lynxUsers`; first admin can be bootstrapped with `LYNX_FIRST_ADMIN_CLERK_ID`. See [docs/AUTH_AND_ADMIN_SETUP.md](docs/AUTH_AND_ADMIN_SETUP.md).
- **UI** – Shared components under `src/components/` (including `ui/` for primitives). Prefer Tailwind and existing design tokens (e.g. `primary`, `accent`, `--base-orange`, `--base-teal`). Style-demo pages are isolated under `src/pages/Style*Page.tsx` and `StylePath10Page.tsx`.
- **Strict TypeScript** – `strict`, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess` in `tsconfig.json`. Convex types come from `convex/_generated`.
- **Scripts** – `bun run dev` (or `npm run dev`) runs Vite and Convex dev concurrently. Build: `bun run build`; preview: `bun run preview`.

---

## Docs and setup

| Doc | Purpose |
|-----|--------|
| [docs/OPPORTUNITIES_INTEGRATION.md](docs/OPPORTUNITIES_INTEGRATION.md) | Lynx ↔ SamRank Opportunities integration (routes, env, enrich) |
| [docs/SAM_OPPORTUNITY_RANKING_AGENT.md](docs/SAM_OPPORTUNITY_RANKING_AGENT.md) | CSV → embed → rank agent brief |
| [docs/CONVEX_CLI_LOGIN.md](docs/CONVEX_CLI_LOGIN.md) | Convex CLI login/logout and self-hosted env notes |
| [docs/CONVEX_LOCAL_SETUP.md](docs/CONVEX_LOCAL_SETUP.md) | Self-hosted Convex (Docker) quick start and architecture |
| [docs/AUTH_AND_ADMIN_SETUP.md](docs/AUTH_AND_ADMIN_SETUP.md) | Clerk + Convex auth and first-admin setup |
| [docs/INTEGRATION.md](docs/INTEGRATION.md) | Orchestrator API and hunt workflow integration |
| [AGENTS.md](AGENTS.md) | Notes for AI agents (Opportunities + Convex self-hosted vs cloud) |
