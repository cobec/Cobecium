"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ExternalLink, Loader2, RefreshCw, Search, ThumbsDown, ThumbsUp } from "lucide-react";

type FeedItem = {
  noticeId: string;
  title: string;
  descriptionPreview?: string | null;
  descriptionText?: string | null;
  opportunityType?: string;
  naics?: string;
  psc?: string;
  subTierName?: string;
  status?: string;
  pocEmail?: string;
  pocName?: string;
  procurementAac?: string;
  popCountry?: string;
  popZip?: string;
  popCity?: string;
  popState?: string;
  responseDate?: string | null;
  inactiveDate?: string | null;
  samUrl?: string | null;
};

type FeedResponse = {
  user?: { id: string; displayName: string; teamId: string };
  batchNumber?: number;
  remaining?: number;
  items?: FeedItem[];
};

type BatchResponse = {
  batchNumber: number;
  remaining: number;
  votedCount: number;
  isComplete: boolean;
  links: Array<{
    noticeId: string;
    title: string;
    voteYes?: boolean | null;
  }>;
};

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function decodeHtmlEntities(value?: string | null): string {
  if (!value) return "";
  if (typeof document === "undefined") {
    return value
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/&ndash;/gi, "–")
      .replace(/&mdash;/gi, "—")
      .replace(/&rsquo;/gi, "’")
      .replace(/&lsquo;/gi, "‘")
      .replace(/&rdquo;/gi, "”")
      .replace(/&ldquo;/gi, "“");
  }
  const el = document.createElement("textarea");
  el.innerHTML = value;
  return el.value;
}

function MetaField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: ReactNode;
}) {
  const display = value?.trim() ? value : "—";
  return (
    <div className="min-w-0">
      <dt className="text-[11px] text-muted-foreground mb-1">{label}</dt>
      <dd className="text-sm text-foreground leading-snug break-words">
        {children ?? display}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 mb-2.5">
        {title}
      </p>
      {children}
    </section>
  );
}

function formatStatus(value?: string | null): string {
  if (!value?.trim()) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatPlaceOfPerformance(item: FeedItem): string {
  const cityState = [item.popCity?.trim(), item.popState?.trim()].filter(Boolean).join(", ");
  const withZip = [cityState, item.popZip?.trim()].filter(Boolean).join(" ");
  const parts = [withZip, item.popCountry?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

function OpportunityCard({
  item,
  busy,
  onNo,
  onYes,
  onFeedback,
}: {
  item: FeedItem;
  busy: boolean;
  onNo: () => void;
  onYes: () => void;
  onFeedback: () => void;
}) {
  const [descOpen, setDescOpen] = useState(false);
  const preview = decodeHtmlEntities(item.descriptionPreview || item.descriptionText);
  const fullDescription = decodeHtmlEntities(item.descriptionText || item.descriptionPreview);
  const type = item.opportunityType?.trim() || "Opportunity";
  const respondBy = formatDate(item.responseDate);
  const inactive = formatDate(item.inactiveDate);
  const status = formatStatus(item.status);
  const poc = item.pocEmail?.trim() || "";
  const place = formatPlaceOfPerformance(item);
  const hasDescription = Boolean(fullDescription.trim());

  return (
    <Card className="rounded-none border-2 border-border bg-card flex flex-col h-full overflow-hidden">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex-1 p-4 sm:p-5 space-y-4 min-w-0">
          {/* Top bar: type/status left · dates right */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center border border-border bg-muted/40 px-2 py-0.5 text-xs font-medium">
                {type}
              </span>
              <span className="inline-flex items-center border border-border px-2 py-0.5 text-xs font-medium">
                {status}
              </span>
            </div>
            <div className="text-right space-y-0.5 shrink-0">
              <p className="text-[11px] text-muted-foreground">
                Respond by{" "}
                <span className="font-semibold text-foreground">{respondBy}</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Inactive{" "}
                <span className="font-medium text-foreground/80">{inactive}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 min-w-0">
            <h3 className="text-base font-semibold leading-snug tracking-normal text-balance break-words">
              {item.title}
            </h3>
            {item.samUrl ? (
              <a
                href={item.samUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 border-2 border-border bg-muted/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-foreground hover:border-accent hover:text-accent transition-colors"
              >
                Open on SAM.gov
                <ExternalLink className="size-3.5 shrink-0" />
              </a>
            ) : null}
          </div>

          <div className="space-y-3.5 border-t border-border pt-3.5">
            <Section title="Identifiers">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <MetaField label="Notice ID" value={item.noticeId} />
                <MetaField label="Procurement AAC" value={item.procurementAac} />
              </dl>
            </Section>

            <Section title="Contact & location">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <MetaField label="POC email">
                  {poc ? (
                    <a
                      href={`mailto:${poc}`}
                      className="hover:text-accent hover:underline break-all"
                    >
                      {poc}
                    </a>
                  ) : (
                    "—"
                  )}
                </MetaField>
                <MetaField label="Place of performance" value={place} />
              </dl>
            </Section>

            <Section title="Classification">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <MetaField label="NAICS" value={item.naics} />
                <MetaField label="PSC" value={item.psc} />
                <MetaField label="Sub tier" value={item.subTierName} />
              </dl>
            </Section>
          </div>

          <div className="border-t border-border pt-3.5 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/80 mb-2">
              Description
            </p>
            {hasDescription ? (
              <button
                type="button"
                onClick={() => setDescOpen(true)}
                className="group w-full text-left rounded-none border border-transparent hover:border-border hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring p-2 -mx-2 transition-colors"
                title="Click to view full description"
              >
                <p className="text-sm text-foreground/85 leading-relaxed break-words line-clamp-4">
                  {preview.trim() || "—"}
                </p>
                <span className="mt-1.5 inline-block text-[11px] font-medium text-accent group-hover:underline">
                  View full description
                </span>
              </button>
            ) : (
              <p className="text-sm text-foreground/85">—</p>
            )}
          </div>
        </div>

        <div className="border-t-2 border-border px-4 py-3 flex gap-2 bg-muted/20">
          <Button
            size="sm"
            variant="outline"
            className="rounded-none flex-1"
            disabled={busy}
            onClick={onNo}
          >
            <ThumbsDown className="size-4 mr-1.5" /> No
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-none flex-1"
            disabled={busy}
            onClick={onFeedback}
          >
            Feedback
          </Button>
          <Button size="sm" className="rounded-none flex-1" disabled={busy} onClick={onYes}>
            <ThumbsUp className="size-4 mr-1.5" /> Yes
          </Button>
        </div>
      </CardContent>

      <Dialog open={descOpen} onOpenChange={setDescOpen}>
        <DialogContent className="rounded-none border-2 max-w-2xl max-h-[85vh] flex flex-col gap-3">
          <DialogHeader>
            <DialogTitle className="text-left text-base font-semibold leading-snug normal-case tracking-normal pr-6">
              {item.title}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto min-h-0 pr-1">
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">
              {fullDescription.trim() || "—"}
            </p>
          </div>
          {item.samUrl && (
            <DialogFooter className="sm:justify-start">
              <a
                href={item.samUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent hover:underline"
              >
                Open on SAM.gov
              </a>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function OpportunitiesFeedPage() {
  const getFeed = useAction(api.samRank.getFeed);
  const getBatch = useAction(api.samRank.getBatch);
  const castVote = useAction(api.samRank.castVote);
  const rerollBatch = useAction(api.samRank.rerollBatch);
  const runPipeline = useAction(api.samRank.runPipeline);
  const searchAction = useAction(api.samRank.search);

  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [batch, setBatch] = useState<BatchResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<FeedItem | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHits, setSearchHits] = useState<FeedItem[] | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [f, b] = await Promise.all([getFeed({}), getBatch({})]);
      setFeed(f as FeedResponse);
      setBatch(b as BatchResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, [getFeed, getBatch]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const vote = async (noticeId: string, yes: boolean, feedback?: string) => {
    setBusy(true);
    setError(null);
    try {
      await castVote({ noticeId, yes, feedback });
      setToast(yes ? "Yes — preferences updated" : "No — preferences updated");
      setTimeout(() => setToast(null), 3000);
      if (searchHits) {
        setSearchHits((prev) => (prev ? prev.filter((h) => h.noticeId !== noticeId) : prev));
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vote failed");
    } finally {
      setBusy(false);
    }
  };

  const onReroll = async () => {
    setBusy(true);
    try {
      await rerollBatch({});
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reroll failed");
    } finally {
      setBusy(false);
    }
  };

  const onRescan = async () => {
    setBusy(true);
    try {
      await runPipeline({});
      await refresh();
      setToast("Pipeline cycle complete");
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pipeline failed");
    } finally {
      setBusy(false);
    }
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = (await searchAction({ query: searchQuery.trim() })) as {
        items?: Array<Record<string, unknown>>;
      };
      setSearchHits(
        (res.items ?? []).map((hit) => ({
          noticeId: String(hit.noticeId ?? hit.NoticeId ?? ""),
          title: String(hit.title ?? hit.Title ?? ""),
          descriptionPreview: hit.descriptionPreview != null ? String(hit.descriptionPreview) : null,
          descriptionText: hit.descriptionText != null ? String(hit.descriptionText) : null,
          opportunityType: hit.opportunityType != null ? String(hit.opportunityType) : "",
          naics: hit.naics != null ? String(hit.naics) : "",
          psc: hit.psc != null ? String(hit.psc) : "",
          subTierName: hit.subTierName != null ? String(hit.subTierName) : "",
          status: hit.status != null ? String(hit.status) : "",
          pocEmail: hit.pocEmail != null ? String(hit.pocEmail) : "",
          pocName: hit.pocName != null ? String(hit.pocName) : "",
          procurementAac: hit.procurementAac != null ? String(hit.procurementAac) : "",
          popCountry: hit.popCountry != null ? String(hit.popCountry) : "",
          popZip: hit.popZip != null ? String(hit.popZip) : "",
          popCity: hit.popCity != null ? String(hit.popCity) : "",
          popState: hit.popState != null ? String(hit.popState) : "",
          responseDate: hit.responseDate != null ? String(hit.responseDate) : null,
          inactiveDate: hit.inactiveDate != null ? String(hit.inactiveDate) : null,
          samUrl: hit.samUrl != null ? String(hit.samUrl) : hit.SamUrl != null ? String(hit.SamUrl) : null,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const items = feed?.items ?? [];
  const gridClass = "grid grid-cols-1 xl:grid-cols-2 gap-5";

  return (
    <div className="min-h-screen flex flex-col">
      <LynxHeader subtitle="Federal contract opportunities" activePage="opportunities" />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Opportunities</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Team-ranked SAM notices · personal Yes/No learning
              {feed?.user ? ` · ${feed.user.displayName}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/opps/approved">
              <Button variant="outline" className="uppercase font-semibold rounded-none border-2">
                Approved
              </Button>
            </Link>
            <Link to="/opps/status">
              <Button variant="outline" className="uppercase font-semibold rounded-none border-2">
                Status
              </Button>
            </Link>
            <Button
              variant="outline"
              className="uppercase font-semibold rounded-none border-2"
              disabled={busy}
              onClick={() => void onRescan()}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              <span className="ml-2">Rescan</span>
            </Button>
          </div>
        </div>

        <form onSubmit={onSearch} className="flex flex-wrap gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Semantic search the shared corpus…"
            className="rounded-none border-2 flex-1 min-w-[200px]"
          />
          <Button type="submit" disabled={busy || !searchQuery.trim()} className="rounded-none uppercase font-semibold">
            <Search className="size-4 mr-2" />
            Search
          </Button>
          {searchHits && (
            <Button
              type="button"
              variant="outline"
              className="rounded-none"
              onClick={() => setSearchHits(null)}
            >
              Clear
            </Button>
          )}
        </form>

        {toast && (
          <div className="border-2 border-accent bg-accent/10 px-3 py-2 text-sm font-medium">{toast}</div>
        )}
        {error && (
          <div className="border-2 border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-12 justify-center">
            <Loader2 className="size-5 animate-spin" /> Loading feed…
          </div>
        ) : searchHits ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {searchHits.length} search results
            </p>
            <div className={gridClass}>
              {searchHits.map((hit) => (
                <OpportunityCard
                  key={hit.noticeId}
                  item={hit}
                  busy={busy}
                  onNo={() => void vote(hit.noticeId, false)}
                  onYes={() => void vote(hit.noticeId, true)}
                  onFeedback={() => {
                    setFeedbackNotice(hit);
                    setFeedbackText("");
                    setFeedbackOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        ) : batch?.isComplete ? (
          <Card className="rounded-none border-2">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold uppercase">Batch #{batch.batchNumber} complete</h3>
              <p className="text-sm text-muted-foreground">
                Reviewed {batch.votedCount} notices. Reroll for the next team-ranked batch.
              </p>
              <Button className="rounded-none uppercase font-semibold" disabled={busy} onClick={() => void onReroll()}>
                Reroll next batch
              </Button>
              <ul className="space-y-2 text-sm">
                {batch.links.map((l) => (
                  <li key={l.noticeId} className="flex gap-2 border-t border-border pt-2">
                    <span className="font-bold w-10">
                      {l.voteYes === true ? "YES" : l.voteYes === false ? "NO" : "—"}
                    </span>
                    <span>{l.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="rounded-none border-2">
            <CardContent className="p-6 text-center text-muted-foreground">
              No feed items yet. Drop CSVs into <code>samoutput/</code> and hit Rescan.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Batch #{feed?.batchNumber ?? batch?.batchNumber ?? 1} · {items.length} remaining
            </p>
            <div className={gridClass}>
              {items.map((item) => (
                <OpportunityCard
                  key={item.noticeId}
                  item={item}
                  busy={busy}
                  onNo={() => void vote(item.noticeId, false)}
                  onYes={() => void vote(item.noticeId, true)}
                  onFeedback={() => {
                    setFeedbackNotice(item);
                    setFeedbackText("");
                    setFeedbackOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="rounded-none border-2">
          <DialogHeader>
            <DialogTitle className="uppercase">Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{feedbackNotice?.title}</p>
          <div className="space-y-2">
            <Label htmlFor="fb">WANT / AVOID notes</Label>
            <textarea
              id="fb"
              className="w-full min-h-[100px] border-2 border-input bg-background p-2 text-sm"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-none"
              disabled={busy || !feedbackNotice}
              onClick={async () => {
                if (!feedbackNotice) return;
                setFeedbackOpen(false);
                await vote(feedbackNotice.noticeId, false, feedbackText);
              }}
            >
              No + note
            </Button>
            <Button
              className="rounded-none"
              disabled={busy || !feedbackNotice}
              onClick={async () => {
                if (!feedbackNotice) return;
                setFeedbackOpen(false);
                await vote(feedbackNotice.noticeId, true, feedbackText);
              }}
            >
              Yes + note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
