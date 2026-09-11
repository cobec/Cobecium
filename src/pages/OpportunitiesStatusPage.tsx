"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Loader2, RefreshCw } from "lucide-react";

type StatusPayload = {
  phase?: string;
  isRunning?: boolean;
  opportunitiesIngested?: number;
  opportunitiesRanked?: number;
  opportunitiesEmbedded?: number;
  embedBacklog?: number;
  lastStartedAt?: string | null;
  lastCompletedAt?: string | null;
  lastError?: string | null;
  recentMessages?: string[];
  ingest?: {
    watchDirectory?: string;
    totalUniqueNotices?: number;
    lastScanAt?: string | null;
    lastScanUpserted?: number;
    files?: Array<{
      fileName: string;
      rowsRead: number;
      rowsAccepted: number;
      lastIngestedAt?: string | null;
      lastError?: string | null;
    }>;
  };
};

type ExportMeta = {
  exportedAt?: string;
  source?: string;
  schemaVersion?: number;
  purpose?: string;
  count?: number;
  stats?: {
    totalInStore?: number;
    exported?: number;
    withDetailSamUrl?: number;
    withEnrichedDescription?: number;
    stillSearchUrl?: number;
    missingEnrichedDescription?: number;
  };
};

type SeedRow = Record<string, unknown>;

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsToCsv(rows: SeedRow[]): string {
  const headers = [
    "noticeId",
    "title",
    "descriptionText",
    "descriptionHtml",
    "opportunityType",
    "setAside",
    "naics",
    "psc",
    "contractingOffice",
    "subTierName",
    "subTierCode",
    "procurementAac",
    "responseDate",
    "inactiveDate",
    "lastPublishedDate",
    "lastUpdatedDate",
    "popCountry",
    "popZip",
    "popCity",
    "popState",
    "pocName",
    "pocEmail",
    "status",
    "initiative",
    "samUrl",
    "samOppId",
    "hasDetailUrl",
    "descriptionEnriched",
    "descriptionEnrichedAt",
    "rankScore",
    "fitScore",
    "matchedThemes",
    "whyRanked",
    "ingestedAt",
    "updatedAt",
  ];
  const lines = [headers.join(",")];
  for (const r of rows) {
    const themes = Array.isArray(r.matchedThemes) ? (r.matchedThemes as string[]).join("|") : "";
    const cells = headers.map((h) => {
      if (h === "matchedThemes") return csvEscape(themes);
      return csvEscape(r[h]);
    });
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

export function OpportunitiesStatusPage() {
  const getStatus = useAction(api.samRank.getStatus);
  const runPipeline = useAction(api.samRank.runPipeline);
  const exportMeta = useAction(api.samRank.exportCorpusMeta);
  const exportPage = useAction(api.samRank.exportCorpusPage);
  const writeExport = useAction(api.samRank.writeCorpusExport);

  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [meta, setMeta] = useState<ExportMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, m] = await Promise.all([getStatus({}), exportMeta({})]);
      setStatus(s as StatusPayload);
      setMeta(m as ExportMeta);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [getStatus, exportMeta]);

  useEffect(() => {
    void load();
  }, [load]);

  const onRun = async () => {
    setBusy(true);
    setError(null);
    try {
      setStatus((await runPipeline({})) as StatusPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pipeline failed");
    } finally {
      setBusy(false);
    }
  };

  const fetchAllRows = async (opts?: {
    enrichedLinksOnly?: boolean;
    enrichedDescriptionsOnly?: boolean;
  }) => {
    const pageSize = 150;
    let offset = 0;
    let total = Infinity;
    const rows: SeedRow[] = [];
    let header: Record<string, unknown> | null = null;

    while (offset < total) {
      setExportProgress(`Fetching ${Math.min(offset + pageSize, total === Infinity ? offset + pageSize : total)} / ${total === Infinity ? "…" : total}`);
      const page = (await exportPage({
        offset,
        limit: pageSize,
        enrichedLinksOnly: opts?.enrichedLinksOnly,
        enrichedDescriptionsOnly: opts?.enrichedDescriptionsOnly,
      })) as {
        total?: number;
        count?: number;
        hasMore?: boolean;
        opportunities?: SeedRow[];
        exportedAt?: string;
        source?: string;
        schemaVersion?: number;
        purpose?: string;
        stats?: ExportMeta["stats"];
      };
      if (!header) {
        header = {
          exportedAt: page.exportedAt,
          source: page.source,
          schemaVersion: page.schemaVersion,
          purpose: page.purpose,
          stats: page.stats,
        };
      }
      total = page.total ?? 0;
      const batch = page.opportunities ?? [];
      rows.push(...batch);
      offset += batch.length;
      if (!page.hasMore || batch.length === 0) break;
    }
    return { header, rows, total };
  };

  const onDownloadJson = async (enrichedOnly: boolean) => {
    setExporting(true);
    setError(null);
    setToast(null);
    try {
      const { header, rows, total } = await fetchAllRows(
        enrichedOnly
          ? { enrichedLinksOnly: true, enrichedDescriptionsOnly: true }
          : undefined
      );
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const payload = {
        ...header,
        count: rows.length,
        opportunities: rows,
      };
      downloadBlob(
        `lynx-opportunities-seed${enrichedOnly ? "-enriched" : ""}-${stamp}.json`,
        new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
      );
      setToast(`Downloaded ${rows.length} of ${total} notices as JSON seed`);
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  const onDownloadCsv = async (enrichedOnly: boolean) => {
    setExporting(true);
    setError(null);
    setToast(null);
    try {
      const { rows, total } = await fetchAllRows(
        enrichedOnly
          ? { enrichedLinksOnly: true, enrichedDescriptionsOnly: true }
          : undefined
      );
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      downloadBlob(
        `lynx-opportunities-seed${enrichedOnly ? "-enriched" : ""}-${stamp}.csv`,
        new Blob([rowsToCsv(rows)], { type: "text/csv;charset=utf-8" })
      );
      setToast(`Downloaded ${rows.length} of ${total} notices as CSV seed`);
      setTimeout(() => setToast(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  const onWriteServer = async () => {
    setExporting(true);
    setError(null);
    setToast(null);
    try {
      const res = (await writeExport({ format: "json" })) as {
        path?: string;
        fileName?: string;
        bytes?: number;
      };
      setToast(
        `Wrote ${res.fileName ?? "export"} on SamRank (${res.bytes ?? "?"} bytes)${res.path ? ` · ${res.path}` : ""}`
      );
      setTimeout(() => setToast(null), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Server write failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LynxHeader subtitle="Federal contract opportunities" activePage="opportunities" />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Pipeline status</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ingest / embed / rank health (SamRank engine)
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/opps">
              <Button variant="outline" className="uppercase font-semibold rounded-none border-2">
                Feed
              </Button>
            </Link>
            <Button
              className="uppercase font-semibold rounded-none border-2"
              disabled={busy}
              onClick={() => void onRun()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              <span className="ml-2">Run cycle</span>
            </Button>
          </div>
        </div>

        {toast && (
          <div className="border-2 border-accent bg-accent/10 px-3 py-2 text-sm font-medium">{toast}</div>
        )}
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {exportProgress && (
          <div className="border-2 border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            {exportProgress}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="size-5 animate-spin" /> Loading…
          </div>
        ) : status ? (
          <>
            <Card className="rounded-none border-2">
              <CardContent className="p-4 space-y-2 text-sm">
                <p>
                  <span className="font-semibold uppercase">Phase:</span> {status.phase}
                  {status.isRunning ? " (running)" : ""}
                </p>
                <p>
                  <span className="font-semibold uppercase">Notices:</span>{" "}
                  {status.opportunitiesIngested ?? 0} ingested · {status.opportunitiesRanked ?? 0}{" "}
                  ranked · {status.opportunitiesEmbedded ?? 0} embedded
                </p>
                <p>
                  <span className="font-semibold uppercase">Embed backlog:</span>{" "}
                  {status.embedBacklog ?? 0}
                </p>
                <p>
                  <span className="font-semibold uppercase">Last started:</span>{" "}
                  {status.lastStartedAt ?? "—"}
                </p>
                <p>
                  <span className="font-semibold uppercase">Last completed:</span>{" "}
                  {status.lastCompletedAt ?? "—"}
                </p>
                {status.lastError && (
                  <p className="text-destructive">{status.lastError}</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none border-2">
              <CardContent className="p-4 space-y-3 text-sm">
                <h3 className="font-bold uppercase">Export corpus for prod seed</h3>
                <p className="text-muted-foreground">
                  Download the enriched SamRank corpus (workspace SAM links + full descriptions when
                  available). Prefer this over re-uploading legacy Databank CSVs.
                </p>
                {meta?.stats && (
                  <p>
                    Store: {meta.stats.totalInStore ?? "—"} · detail URLs:{" "}
                    {meta.stats.withDetailSamUrl ?? "—"} · enriched descriptions:{" "}
                    {meta.stats.withEnrichedDescription ?? "—"}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="rounded-none border-2 uppercase font-semibold"
                    disabled={exporting}
                    onClick={() => void onDownloadJson(false)}
                  >
                    {exporting ? (
                      <Loader2 className="size-4 animate-spin mr-2" />
                    ) : (
                      <Download className="size-4 mr-2" />
                    )}
                    JSON (all)
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none border-2 uppercase font-semibold"
                    disabled={exporting}
                    onClick={() => void onDownloadCsv(false)}
                  >
                    <Download className="size-4 mr-2" />
                    CSV (all)
                  </Button>
                  <Button
                    className="rounded-none border-2 uppercase font-semibold"
                    disabled={exporting}
                    onClick={() => void onDownloadJson(true)}
                  >
                    <Download className="size-4 mr-2" />
                    JSON (enriched only)
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none border-2 uppercase font-semibold"
                    disabled={exporting}
                    onClick={() => void onDownloadCsv(true)}
                  >
                    <Download className="size-4 mr-2" />
                    CSV (enriched only)
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none border-2 uppercase font-semibold"
                    disabled={exporting}
                    onClick={() => void onWriteServer()}
                  >
                    Write JSON on SamRank disk
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  “Enriched only” = has workspace detail <code>samUrl</code> and{" "}
                  <code>descriptionEnrichedAt</code>. Server write lands under{" "}
                  <code>SamRank/Data/exports/</code>.
                </p>
              </CardContent>
            </Card>

            {status.ingest && (
              <Card className="rounded-none border-2">
                <CardContent className="p-4 space-y-2 text-sm">
                  <h3 className="font-bold uppercase">Ingest manifest</h3>
                  <p>Watch: {status.ingest.watchDirectory}</p>
                  <p>
                    Unique notices: {status.ingest.totalUniqueNotices} · last upserts:{" "}
                    {status.ingest.lastScanUpserted}
                  </p>
                  <p>Last scan: {status.ingest.lastScanAt ?? "—"}</p>
                  <ul className="space-y-1 mt-2">
                    {(status.ingest.files ?? []).map((f) => (
                      <li key={f.fileName}>
                        <code>{f.fileName}</code> — {f.rowsAccepted} accepted / {f.rowsRead} rows
                        {f.lastError ? (
                          <span className="text-destructive"> · {f.lastError}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {(status.recentMessages?.length ?? 0) > 0 && (
              <Card className="rounded-none border-2">
                <CardContent className="p-4 space-y-2 text-sm">
                  <h3 className="font-bold uppercase">Recent messages</h3>
                  <ul className="space-y-1 font-mono text-xs">
                    {(status.recentMessages ?? []).slice(0, 12).map((m, i) => (
                      <li key={`${i}-${m}`}>{m}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
