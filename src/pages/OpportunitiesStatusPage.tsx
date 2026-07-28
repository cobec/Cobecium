"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";

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

export function OpportunitiesStatusPage() {
  const getStatus = useAction(api.samRank.getStatus);
  const runPipeline = useAction(api.samRank.runPipeline);
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStatus((await getStatus({})) as StatusPayload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  }, [getStatus]);

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

        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
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
