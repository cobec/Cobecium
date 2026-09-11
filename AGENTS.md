# Notes for AI agents

This file captures project-specific gotchas and learnings so agents (and humans) can avoid repeating the same failures.

---

## SAM opportunity ranking (CSV → embed → rank → Lynx `/opps`)

Manual Databank CSV drops live in `samoutput/`. Ranking engine: sibling **SamRank** (`.NET`, `:5190`). Lynx product UI: **`/opps`** (Entra-authenticated), via Convex actions in `convex/samRank.ts`.

| Doc | Use |
|-----|-----|
| **[`docs/OPPORTUNITIES_INTEGRATION.md`](docs/OPPORTUNITIES_INTEGRATION.md)** | **As-built Lynx ↔ SamRank wiring** (routes, env, enrich APIs, card UX) |
| [`docs/SAM_OPPORTUNITY_RANKING_AGENT.md`](docs/SAM_OPPORTUNITY_RANKING_AGENT.md) | Ranking/ingest agent brief (also `/docs/...` after `bun run docs:html`) |

**Split of responsibility**
- **SamRank:** CSV ingest, embeddings (LM Studio), team ranking overlay, preference learning, HTTP `/api/*`, Firecrawl link/description enrichment
- **Cobecium/Lynx:** Entra auth, `/opps` feed · approved · status UI, `SAMRANK_BASE_URL` Convex env

Set `SAMRANK_BASE_URL=http://cobec-spark:5190` (and optional `SAMRANK_DEFAULT_TEAM_ID=cobec`) in Convex env before using Opportunities.

Corpus membership comes from CSVs. Public SAM.gov detail URLs/full descriptions are optional Firecrawl enrich jobs on SamRank — do not restart SamRank mid-enrich unless necessary.

**POC enrich outcome (~1969 notices):** ~1932 detail URLs; **37** link fails (`no detail link in search results`, mostly inactive/legacy); description job ~1722 updated / **209** extract fails. Details and reconcile commands: [`docs/OPPORTUNITIES_INTEGRATION.md`](docs/OPPORTUNITIES_INTEGRATION.md#poc-enrich-results-corpus-1969-notices-jul-2026). Failure log: `SamRank/Data/enrichment-failures.jsonl`.

**Prod seed:** export enriched corpus from Lynx **Opportunities → Status** (or `GET /api/export/corpus`) — not legacy Databank CSVs. See [`docs/OPPORTUNITIES_INTEGRATION.md`](docs/OPPORTUNITIES_INTEGRATION.md#export-enriched-corpus-prod-seed).

---

## Convex CLI: self-hosted vs cloud env conflict

This repo uses **Convex self-hosted** (Docker backend). The Convex CLI enforces that you are either in “cloud” mode or “self-hosted” mode, not both.

### What goes wrong

When you run **any** Convex CLI command from the project root—e.g.:

- `npx convex dev`
- `npx convex codegen`
- `npx convex deploy`

—the CLI can **exit with an error** and refuse to run if **all** of these are true:

1. **Self-hosted** env vars are set: `CONVEX_SELF_HOSTED_URL` and `CONVEX_SELF_HOSTED_ADMIN_KEY` (often via `.env` or `.env.local`).
2. **Cloud** env var is also set: `CONVEX_DEPLOYMENT`.

### Exact error you may see

```text
✖ CONVEX_DEPLOYMENT must not be set when CONVEX_SELF_HOSTED_URL and CONVEX_SELF_HOSTED_ADMIN_KEY are set
```

So the CLI is saying: “You’ve configured self-hosted; do not set `CONVEX_DEPLOYMENT`.”

### What to do

- **When working in this repo (self-hosted):** Do **not** set `CONVEX_DEPLOYMENT` in `.env` or `.env.local`. The project’s `.env.example` and `docs/CONVEX_LOCAL_SETUP.md` already state this. If the user’s env has `CONVEX_DEPLOYMENT` set, they need to remove or comment it out and re-run the Convex command (or run it in a shell where `CONVEX_DEPLOYMENT` is unset).
- **When you need to run `npx convex codegen` (e.g. after adding a new `convex/*.ts` module):**
  - If the command fails with the error above, **do not assume** the new module was never added to the generated API. Check `convex/_generated/api.d.ts`: the new module may already be listed from a previous successful run (e.g. in Docker or on another machine).
  - Do **not** edit `convex/_generated/*` by hand. Those files are generated; they will be updated the next time `npx convex codegen` or `npx convex dev` runs successfully (e.g. in the app container where env is correct, or after the user fixes their env).
- **Do not** suggest setting `CONVEX_DEPLOYMENT` “so codegen works” when the project is set up for self-hosted; that would break the intended setup.

### Summary

| Context                         | Action                                                                 |
|---------------------------------|------------------------------------------------------------------------|
| Self-hosted (this repo’s setup) | Never set `CONVEX_DEPLOYMENT`. Remove it if the CLI errors.            |
| Running Convex CLI locally      | Ensure env doesn’t have both self-hosted vars and `CONVEX_DEPLOYMENT`.  |
| Codegen failed with above error | Check `_generated/api.d.ts`; new modules may already be there.         |

See also: `docs/CONVEX_LOCAL_SETUP.md`, `.env.example` (comment about not setting `CONVEX_DEPLOYMENT` when using self-hosted).
