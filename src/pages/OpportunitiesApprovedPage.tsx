"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { LynxHeader } from "@/components/LynxHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

type ApprovedItem = {
  noticeId: string;
  title: string;
  samUrl?: string | null;
  setAside?: string;
  responseDate?: string | null;
  descriptionPreview?: string | null;
  themes?: string[];
  feedback?: string | null;
  votedAt: string;
  rankScore: number;
};

export function OpportunitiesApprovedPage() {
  const getApproved = useAction(api.samRank.getApproved);
  const [scope, setScope] = useState<"mine" | "team">("mine");
  const [items, setItems] = useState<ApprovedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await getApproved({ scope })) as { items?: ApprovedItem[] };
      setItems(res.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load approved");
    } finally {
      setLoading(false);
    }
  }, [getApproved, scope]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen flex flex-col">
      <LynxHeader subtitle="Federal contract opportunities" activePage="opportunities" />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold uppercase tracking-tight">Approved</h2>
            <p className="text-sm text-muted-foreground mt-1">Yes votes — yours or the whole team.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/opps">
              <Button variant="outline" className="uppercase font-semibold rounded-none border-2">
                Feed
              </Button>
            </Link>
            <Button
              className="uppercase font-semibold rounded-none border-2"
              variant={scope === "mine" ? "default" : "outline"}
              onClick={() => setScope("mine")}
            >
              Mine
            </Button>
            <Button
              className="uppercase font-semibold rounded-none border-2"
              variant={scope === "team" ? "default" : "outline"}
              onClick={() => setScope("team")}
            >
              Team
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
        ) : items.length === 0 ? (
          <Card className="rounded-none border-2">
            <CardContent className="p-6 text-center text-muted-foreground">
              No approvals yet. Vote Yes on the feed.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {items.length} approved · {scope === "mine" ? "personal" : "team rollup"}
            </p>
            {items.map((item) => (
              <Card key={`${item.noticeId}-${item.votedAt}`} className="rounded-none border-2">
                <CardContent className="p-4 space-y-2">
                  <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                    <span className="text-accent font-bold">{item.rankScore.toFixed(2)}</span>
                    <span>{new Date(item.votedAt).toLocaleString()}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug">
                    {item.samUrl ? (
                      <a href={item.samUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.noticeId}
                    {item.setAside ? ` · ${item.setAside}` : ""}
                    {item.responseDate ? ` · due ${item.responseDate}` : ""}
                  </p>
                  {item.themes && item.themes.length > 0 && (
                    <p className="text-xs uppercase tracking-wide text-accent">{item.themes.join(" · ")}</p>
                  )}
                  {item.feedback && <p className="text-sm">{item.feedback}</p>}
                  {item.descriptionPreview && (
                    <p className="text-sm text-foreground/80">{item.descriptionPreview}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
