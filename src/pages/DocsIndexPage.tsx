import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export type DocManifestEntry = {
  slug: string;
  title: string;
  source: string;
  htmlFile: string;
};

export type DocManifest = {
  generatedAt: string;
  docs: DocManifestEntry[];
};

let cachedManifest: DocManifest | null = null;

export async function loadDocManifest(): Promise<DocManifest> {
  if (cachedManifest) return cachedManifest;
  const res = await fetch("/docs/manifest.json");
  if (!res.ok) throw new Error(`Failed to load docs manifest (${res.status})`);
  cachedManifest = (await res.json()) as DocManifest;
  return cachedManifest;
}

/**
 * Index of HTML-converted project docs (from markdown).
 */
export function DocsIndexPage() {
  const [manifest, setManifest] = useState<DocManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadDocManifest()
      .then((m) => {
        if (!cancelled) setManifest(m);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load docs");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="border-b-4 border-primary pb-6 mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          Lynx
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
          Documentation
        </h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Project docs converted from Markdown to HTML for viewing in this deploy.
        </p>
      </header>

      {error && (
        <p className="text-destructive text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      {!manifest && !error && (
        <p className="text-muted-foreground text-sm">Loading…</p>
      )}

      {manifest && (
        <ul className="space-y-0 divide-y divide-border border border-border">
          {manifest.docs.map((doc) => (
            <li key={doc.slug}>
              <Link
                to={`/docs/${doc.slug}`}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 px-4 py-3 hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
              >
                <span className="font-semibold text-foreground">{doc.title}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  {doc.source}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {manifest && (
        <p className="mt-6 text-xs text-muted-foreground">
          {manifest.docs.length} documents · generated {new Date(manifest.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}
