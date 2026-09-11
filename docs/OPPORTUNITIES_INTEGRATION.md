# Opportunities integration (Lynx ↔ SamRank)

**Product UI:** Lynx `/opps`, `/opps/approved`, `/opps/status` (Entra-authenticated).  
**Ranking engine:** sibling **SamRank** at `/home/jmartinez/Projects/SamRank` (`.NET 10`, port **`:5190`**).  
**Bridge:** Convex actions in [`convex/samRank.ts`](../convex/samRank.ts).

Embeddings and preference learning stay on SamRank. Convex/Lynx never re-embeds.

---

## Architecture

```text
samoutput/*.csv  ──ingest──►  SamRank Data/opportunities.json
                                    │
                                    ├─ embed (LM Studio Nomic :1234)
                                    ├─ rank (team overlay + personal votes)
                                    ├─ Firecrawl enrich links / descriptions
                                    │
Entra user ──► Lynx /opps ──► Convex samRank.* ──HTTP──► SamRank /api/*
```

| Layer | Responsibility |
|-------|----------------|
| **CSV drops** (`cobecium/samoutput/`) | Corpus membership + structured fields from SAM Databank exports |
| **SamRank** | Ingest, dedupe, embeddings, ranking, votes, HTTP API, Firecrawl enrichment |
| **Convex `samRank.ts`** | Entra identity → SamRank user ensure; proxy feed/vote/search/status/pipeline |
| **Lynx UI** | Opportunity cards, Yes/No/Feedback, semantic search, approved list, status |

---

## Lynx routes & UI

| Route | Page | Notes |
|-------|------|--------|
| `/opps` | Feed + semantic search | Top-N unvoted batch (`FeedTopN`, default 10). Cards show type/status, dates, identifiers, POC, PoP, classification, description preview |
| `/opps/approved` | Yes votes | Personal / team scope via API |
| `/opps/status` | Pipeline health | Ingest / embed / rank phase; Rescan triggers SamRank pipeline |

**Card UX (as-built):**
- Sectioned layout: Identifiers · Contact & location · Classification · Description
- **Open on SAM.gov** button under the title (uses enriched detail URL when available)
- Description is clamped on the card; **View full description** opens a modal
- Votes: No / Feedback / Yes (feedback dialog attaches a note)

Nav: Lynx header → **Opportunities**.

---

## Convex env

Set on the **Convex backend** (not Vite):

```bash
docker compose exec app bunx convex env set SAMRANK_BASE_URL 'http://cobec-spark:5190'
docker compose exec app bunx convex env set SAMRANK_DEFAULT_TEAM_ID 'cobec'
```

| Variable | Purpose |
|----------|---------|
| `SAMRANK_BASE_URL` | Base URL reachable from the Convex/backend container |
| `SAMRANK_DEFAULT_TEAM_ID` | Team for ranking overlay (default `cobec`) |

See [`.env.example`](../.env.example).

### Convex actions (`convex/samRank.ts`)

| Action | SamRank API |
|--------|-------------|
| `ensureMe` | `POST /api/users/ensure` |
| `getFeed` | `GET /api/feed?userId=` |
| `getBatch` | `GET /api/batch?userId=` |
| `castVote` | `POST /api/vote` |
| `rerollBatch` | `POST /api/batch/reroll` |
| `getApproved` | `GET /api/approved?userId=&scope=` |
| `search` | `GET /api/search?userId=&q=` |
| `getStatus` | `GET /api/status` |
| `runPipeline` | `POST /api/pipeline/run` |

Identity: Entra `oid` (via `getExternalId`) → SamRank `externalId` (sanitized user id under `Data/users/{id}/`).

---

## SamRank ops (Spark)

| Item | Value |
|------|--------|
| Path | `/home/jmartinez/Projects/SamRank` |
| Port | `5190` (`http://cobec-spark:5190`) |
| systemd | `~/.config/systemd/user/samrank.service` |
| CSV watch | `/home/jmartinez/Projects/cobecium/samoutput/` |
| LM Studio | `http://127.0.0.1:1234` — model `text-embedding-nomic-embed-text-v1.5` |
| Firecrawl | Self-hosted `http://127.0.0.1:3002` (link + description enrichment) |

Health: `GET http://127.0.0.1:5190/api/health`

### Core pipeline

1. **Ingest** CSVs → upsert by `NoticeId`  
2. **Rank** (team overlay + themes)  
3. **Embed** backlog batches  
4. **Feed** packs top-N unvoted for each user  

`POST /api/pipeline/run` (also Lynx **Rescan**) runs one cycle.

### SAM.gov link & description enrichment

CSV exports only give **search deep-links** and often **truncated descriptions**. SamRank resolves public detail pages with **Firecrawl** (no SAM Public API key required):

| Job | Endpoint | What it does |
|-----|----------|--------------|
| Link enrich | `POST /api/enrich/links` | Scrape search URL → replace `samUrl` with `https://sam.gov/workspace/contract/opp/{uuid}/view`, store `samOppId` |
| Description enrich | `POST /api/enrich/descriptions` | Scrape detail `samUrl` → full `descriptionText` / `descriptionHtml`, set `descriptionEnrichedAt`, mark `needsReembed` |

Status (GET only):

- `/api/enrich/links/status`
- `/api/enrich/descriptions/status`

Examples:

```bash
# Resume remaining search→detail URL resolution (async)
curl -sS -X POST http://127.0.0.1:5190/api/enrich/links \
  -H 'Content-Type: application/json' -d '{"force":false}'

# Enrich descriptions for notices that already have detail URLs
curl -sS -X POST http://127.0.0.1:5190/api/enrich/descriptions \
  -H 'Content-Type: application/json' -d '{"force":false}'

# Targeted sync smoke test
curl -sS -X POST http://127.0.0.1:5190/api/enrich/descriptions \
  -H 'Content-Type: application/json' \
  -d '{"sync":true,"force":true,"noticeIds":["PANMCC26P0000049225"]}'
```

Config (`SamRank/appsettings.json` → `Firecrawl`): `BaseUrl`, `Parallel`, `DescriptionParallel`, `WaitForMs`, `ChainDescriptionEnrichment` (auto-start descriptions after a full link run).

Failure tracking (append-only while jobs run):

- `SamRank/Data/enrichment-failures.jsonl`
- `SamRank/Data/enrichment-failures-summary.md` (written when a tracker finishes)

**Do not restart SamRank mid-job** unless necessary — in-memory progress is lost; disk checkpoints for completed notices are kept.

### POC enrich results (corpus ~1969 notices, Jul 2026)

Accepted for POC: high coverage is enough; remaining failures are mostly inactive/legacy or extract edge cases.

| Job | Processed | Updated | Failed | Failure reason (logged) |
|-----|----------:|--------:|-------:|-------------------------|
| Links | 1578 (remaining after prior partial run; corpus end state **1932/1969** with detail URLs) | 1541 (this run) | **37** | `no detail link in search results` |
| Descriptions | 1931 | 1722 | **209** | `could not extract description` |

**Link failures (37) — why**

All failed the same way: Firecrawl scraped the SAM **search** page and found no `/workspace/contract/opp/{uuid}/view` href.

| Kind | Approx. count | Notes |
|------|--------------:|-------|
| Inactive / cancelled in store | ~26 | Archived notices often don’t surface a usable detail link in the public search UI Firecrawl sees |
| Active but scrape empty | ~11 | Often still findable via SAM’s public search JSON; Firecrawl miss (timing/UI). Retryable later |
| No SAM hit | ~2 | e.g. test/bogus ids like `HC101326TEST` |

Notices without a detail URL keep the CSV-style **search deep-link**; Lynx **Open on SAM.gov** still works, just lands on search instead of the workspace detail page.

**Description failures (209) — why**

Detail URL existed, but markdown/HTML parsing could not pull a usable body (empty/short extract). Card still shows CSV preview text; modal shows whatever `descriptionText` is stored.

**Ops tip:** reconcile anytime with:

```bash
# counts still missing detail URLs / descriptionEnrichedAt
python3 - <<'PY'
import json,re
ops=json.load(open("/home/jmartinez/Projects/SamRank/Data/opportunities.json"))["opportunities"]
pat=re.compile(r"opp/[a-f0-9]{32}/view", re.I)
print("total", len(ops))
print("detail urls", sum(1 for o in ops if pat.search(o.get("samUrl") or "")))
print("desc enriched", sum(1 for o in ops if o.get("descriptionEnrichedAt")))
PY
curl -s http://127.0.0.1:5190/api/enrich/links/status | python3 -m json.tool
curl -s http://127.0.0.1:5190/api/enrich/descriptions/status | python3 -m json.tool
```

---

## Data fields shown in Lynx

From SamRank feed/search DTOs:

- Title, opportunity type, status  
- Respond by / inactive dates  
- Notice ID, procurement AAC  
- POC email, place of performance  
- NAICS, PSC, sub tier  
- Description preview + full text (when enriched)  
- `samUrl` (prefer workspace detail URL after link enrich)

---

## Export enriched corpus (prod seed)

Do **not** re-seed prod from legacy Databank CSVs (search deep-links + truncated descriptions). Export what SamRank already enriched:

### From Lynx UI

**Opportunities → Status** → **Export corpus for prod seed**

| Button | Result |
|--------|--------|
| JSON / CSV (all) | Full store as Lynx seed schema |
| JSON / CSV (enriched only) | Only rows with workspace detail `samUrl` **and** `descriptionEnrichedAt` |
| Write JSON on SamRank disk | `SamRank/Data/exports/lynx-opportunities-seed-*.json` |

### From SamRank API (host)

```bash
curl -s 'http://127.0.0.1:5190/api/export/corpus/meta' | python3 -m json.tool
curl -OJ 'http://127.0.0.1:5190/api/export/corpus?format=json'
curl -OJ 'http://127.0.0.1:5190/api/export/corpus?format=csv'
curl -OJ 'http://127.0.0.1:5190/api/export/corpus?format=json&enrichedLinksOnly=true&enrichedDescriptionsOnly=true'
curl -sS -X POST http://127.0.0.1:5190/api/export/corpus/write \
  -H 'Content-Type: application/json' -d '{"format":"json"}'
```

Seed JSON (`schemaVersion: 1`): `exportedAt`, `purpose`, `stats`, `opportunities[]` with `noticeId`, `title`, `descriptionText`/`Html`, `samUrl`, `samOppId`, `hasDetailUrl`, `descriptionEnriched`, classification/PoP/POC fields, optional rank metadata.

Convex: `samRank.exportCorpusMeta`, `exportCorpusPage`, `writeCorpusExport`.

---

## Local checklist

1. SamRank up (`systemctl --user status samrank` or Spark dashboard).  
2. Convex env `SAMRANK_BASE_URL` set (from app container network).  
3. Entra signed in → open `/opps`.  
4. Drop CSVs into `samoutput/` → Rescan (or wait for watch).  
5. Optionally run link then description enrichment so Open on SAM.gov and full descriptions are accurate.
6. Before prod: download seed from Status (or `Data/exports/`) — not legacy CSVs.

---

## Related docs

- Agent / ranking design: [`SAM_OPPORTUNITY_RANKING_AGENT.md`](./SAM_OPPORTUNITY_RANKING_AGENT.md)  
- Agent gotchas: [`../AGENTS.md`](../AGENTS.md)  
- SamOpps (optional official Opportunities API, key required): `/home/jmartinez/Projects/SamOpps/`  
- SamRank skill: `/home/jmartinez/Projects/SamRank/.cursor/skills/sam-opportunity-ranking/SKILL.md`
