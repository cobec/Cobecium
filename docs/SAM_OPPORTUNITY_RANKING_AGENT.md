# Agent brief: SAM opportunity embed + rank (ResearchTBR pattern)

**Audience:** a fresh AI agent implementing or extending the system.  
**Goal:** Embedding + preference-ranking feed for **federal contract opportunities**, mirroring [ResearchTbr](../../ResearchTbr/), seeded from **manual Databank CSV drops**.

**Product context:** Cobecium / Lynx is a procurement hub for a **government subcontractor** (Cobec). Ranked feed is in Lynx at **`/opps`** (Entra → Convex `samRank.ts` → SamRank `/api`). SamRank owns ranking/embeddings; do not reimplement embeddings inside Convex.

**As-built integration (read this first):** [`OPPORTUNITIES_INTEGRATION.md`](./OPPORTUNITIES_INTEGRATION.md) — routes, Convex env, SamRank ports, Firecrawl enrich APIs, card UX.

---

## Non-goals (do not do)

- Do **not** call undocumented Databank report URLs or require logged-in Databank session automation for CSV acquisition. Operators download CSVs manually into `samoutput/`.
- Do **not** require the [SamOpps](../../SamOpps/) official Opportunities API key for v1 (optional later; quota-limited).
- Do **not** remount LM Studio embedding models on every row (see ResearchTBR `LmStudioModelGuard`).
- Do **not** re-embed inside Convex.

**Allowed enrichment (as-built):** After CSV ingest, SamRank may use **self-hosted Firecrawl** against **public** SAM.gov search/detail pages to resolve workspace detail URLs and full description text. That is separate from Databank scraping and does not use a SAM Public API key. See [`OPPORTUNITIES_INTEGRATION.md`](./OPPORTUNITIES_INTEGRATION.md#samgov-link--description-enrichment).

---

## Data source: `samoutput/`

| Path | Role |
|------|------|
| `/home/jmartinez/Projects/cobecium/samoutput/` | Drop zone for Excel/CSV exports from SAM.gov **Contract Notice Details** (and future similar dumps) |

### Expectation

- **More files will be added** over time (new downloads, date slices, filters).
- Filenames vary (`Contract_Notice_Details.csv`, `Contract_Notice_Details (1).csv`, …). Treat the directory as a **bag of CSVs**, not a single fixed file.
- On ingest: scan `*.csv`, parse all, **dedupe by `Notice ID`** (last-write / newest `Last Updated Date` wins).
- Keep an ingest manifest (which files seen, mtime, row counts, errors) so re-runs are incremental.
- CSV descriptions are often **truncated**; prefer Firecrawl description enrichment for UI-accurate text.
- CSV `SamUrl` builders are **search deep-links**; prefer Firecrawl link enrichment for `/workspace/contract/opp/{uuid}/view`.

### Observed schema (27 columns)

Excel exports often have a **leading space** on the first header (` Contracting Office`). Normalize headers (trim) before mapping.

| CSV column | Suggested model field | Notes |
|------------|----------------------|--------|
| Notice ID | `NoticeId` (primary key) | Required for dedupe |
| Opportunity Title | `Title` | Core embed text |
| Description | `Description` | Often HTML; strip tags for embed; may be truncated |
| Contract Opportunity Type | `OpportunityType` | Solicitation, Presolicitation, … |
| Current Set Aside | `SetAside` | e.g. Total Small Business Set-Aside |
| NAICS | `Naics` | Text label in this export (not always 6-digit code) |
| PSC | `Psc` | Text label |
| Contracting Office | `ContractingOffice` | |
| Sub Tier Name / Code | `SubTierName`, `SubTierCode` | |
| Procurement AAC Code | `ProcurementAac` | |
| Current Response Date | `ResponseDate` | Excel quirks possible — parse defensively |
| Place of Performance - * | `PopCountry/Zip/City/State` | |
| POC Name / Email | `PocName`, `PocEmail` | |
| Status | `Status` | Prefer Active for feed |
| Last Updated Date / Last Published Date / Inactive Date | timestamps | |
| Initiative, IVL, attachment count, UEI, Legal Business Name | keep on record | useful filters later |

**Corpus scale:** thousands of unique notices after multi-file ingest (watch SamRank `Data/opportunities.json` / status).

### Manual drops

Default watch path is `cobecium/samoutput` (configured in SamRank `Ingest:WatchDirectory`).

---

## Reference implementation: ResearchTBR

Study these before coding (do not copy arXiv-specific logic blindly):

| Piece | Path | Reuse idea |
|-------|------|------------|
| Paper model + stages | `ResearchTbr/Models/Paper.cs` | Opportunity model + `Ingested → Triaged → Ranked` |
| Preferences / votes | `ResearchTbr/Models/Preferences.cs` | Theme weights, keyword ±, vote learning |
| Ranking blend | `ResearchTbr/Services/RankingService.cs` | Same structure; new themes/keywords |
| Embeddings | `ResearchTbr/Services/EmbeddingService.cs` | Nomic + `search_document:` / `search_query:` prefixes |
| Vector index | `ResearchTbr/Services/EmbeddingIndex.cs` | `embeddings.bin` + `embeddings-index.json` |
| JSON store | `ResearchTbr/Services/JsonDataStore.cs` | Atomic write under `Data/` |
| LM Studio guard | `ResearchTbr/Services/LmStudioModelGuard.cs` | Cap LLM instances; don’t remount nomic |
| Ranking skill | `ResearchTbr/.cursor/skills/research-tbr-ranking/SKILL.md` | Analogous skill lives under SamRank |
| README / config | `ResearchTbr/README.md`, `appsettings.json` | Ports, batch sizes |

**Spark services:**

- LM Studio embeddings: `http://127.0.0.1:1234/v1` (model `text-embedding-nomic-embed-text-v1.5`)
- SamRank: `:5190` · Lynx/Cobecium: `:9560` · Spark dashboard: `:8080`

---

## Project shape (as-built)

`/home/jmartinez/Projects/SamRank/`

```text
SamRank/
  Models/Opportunity.cs, Preferences.cs, Tenant.cs, …
  Services/
    CsvIngestService.cs, RankingService.cs, EmbeddingService.cs, EmbeddingIndex.cs,
    OpportunityApiService.cs, PipelineService.cs, TenantService.cs,
    SamLinkEnrichmentService.cs, SamDescriptionEnrichmentService.cs, …
  Data/                 # opportunities.json, embeddings.*, users/, teams/, enrich statuses
  ApiEndpoints.cs
  appsettings.json
  .cursor/skills/sam-opportunity-ranking/SKILL.md
```

Config knobs (excerpt):

```json
{
  "Ingest": {
    "WatchDirectory": "/home/jmartinez/Projects/cobecium/samoutput",
    "FileGlob": "*.csv",
    "RescanSeconds": 60
  },
  "LmStudio": {
    "BaseUrl": "http://127.0.0.1:1234/v1",
    "EmbeddingModel": "text-embedding-nomic-embed-text-v1.5",
    "MaxLlmInstances": 1
  },
  "AgentLoop": {
    "FeedTopN": 10,
    "FeedMinScore": 0.20
  },
  "Firecrawl": {
    "BaseUrl": "http://127.0.0.1:3002",
    "Parallel": 3,
    "DescriptionParallel": 2,
    "ChainDescriptionEnrichment": true
  }
}
```

---

## Pipeline (canonical)

```text
samoutput/*.csv
    → parse + header normalize
    → upsert by NoticeId → Data/opportunities.json
    → (optional) Firecrawl: search URL → detail samUrl + samOppId
    → (optional) Firecrawl: detail page → full DescriptionText/Html
    → strip HTML description → DocumentText
    → embed (batched) → embeddings.bin + embeddings-index.json
    → heuristic triage + rank score → preferences-aware RankScore
    → feed batch of top unvoted
    → Yes/No (+ optional feedback) → update preferences/votes → re-rank
```

### 1. Ingest

- Read all `*.csv` with a real CSV parser (quotes, multiline Description cells).
- Trim column names; map case-insensitively.
- Skip rows without `Notice ID`.
- Dedupe: keep richest / newest row.
- Store structured JSON; preserve Description HTML/text; set search-style `SamUrl` until enriched.
- Record `SourceFiles[]` and `IngestedAt` on each opportunity.

### 2. Document text for embeddings

```text
search_document: {Title}
Type: {OpportunityType} | Set-aside: {SetAside} | NAICS: {Naics} | PSC: {Psc}
Office: {ContractingOffice} | Sub-tier: {SubTierName}
PoP: {City}, {State} {Zip}
{plain-text Description truncated ~6k chars}
```

Query side: `search_query: {user text}`.

After description enrichment, re-embed notices with `NeedsReembed` (pipeline embed phase).

### 3. Triage / themes (govcon BD)

| Theme key | Intent |
|-----------|--------|
| `small_business_setaside` | SB / 8(a) / HUBZone / SDVOSB / WOSB set-asides |
| `services_it` | IT, software, cyber, cloud |
| `construction_facilities` | Construction, repair, facilities |
| `professional_services` | Advisory, training, A&E, support |
| `supplies_commodities` | Parts, equipment buys |
| `local_pop` | PoP near team footprint |
| `prime_teaming` | Large primes / IDVs |
| `compliance_heavy` | FedRAMP, NIST, CMMC, 508 |
| `short_fuse` | Response deadline soon |

### 4. Rank score blend

```text
score = 0.30*triage + 0.30*fit + 0.25*normalizedThemeWeight + keywordAdj + deadlineAdj
```

Per-team overlays under `Data/teams/{id}/ranking.json`.

### 5. Votes / learning

Yes/No (+ optional feedback). Shared corpus; per-user votes/batch under `Data/users/{id}/`.

### 6. Semantic search

Cosine search over embedding index. Lynx → `samRank.search`.

---

## UI surfaces

| Surface | Purpose |
|---------|---------|
| Lynx `/opps` | Yes/No/Feedback on ranked batch + semantic search |
| Lynx `/opps/approved` | Yes votes |
| Lynx `/opps/status` | Ingest/embed/rank health + Rescan |
| SamRank Blazor (optional) | Engine-side UI on `:5190` |

Deep links after enrichment: `https://sam.gov/workspace/contract/opp/{uuid}/view`.

---

## Spark / ops checklist

1. LM Studio up with nomic embed loaded.  
2. SamRank systemd user unit enabled; visible on Spark dashboard.  
3. Firecrawl reachable on `:3002` if running enrich jobs.  
4. Convex `SAMRANK_BASE_URL` points at SamRank from the backend network.  
5. Re-scan `samoutput` when new CSVs appear (watcher / Rescan / pipeline).

---

## Acceptance criteria

1. New CSV in `samoutput/` → upserted opportunities (deduped by Notice ID).  
2. Embeddings without OOM / duplicate llama-server storms.  
3. Feed shows top-ranked unvoted items; Yes/No updates ranking.  
4. Semantic search works.  
5. Lynx `/opps` works for signed-in users via Convex → SamRank.  
6. Link/description Firecrawl enrichment can fix search URLs and truncated CSV text (POC: ~1932/1969 detail URLs; residual failures documented in [`OPPORTUNITIES_INTEGRATION.md`](./OPPORTUNITIES_INTEGRATION.md#poc-enrich-results-corpus-1969-notices-jul-2026)).  
7. SamRank skill documents themes, blend, and vote learning.

---

## Related docs

- **Integration (Lynx wiring):** [`OPPORTUNITIES_INTEGRATION.md`](./OPPORTUNITIES_INTEGRATION.md)  
- Cobecium docs UI: `/docs` on Lynx  
- SamOpps (optional API): `/home/jmartinez/Projects/SamOpps/docs/POLICY.md`
