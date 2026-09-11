import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LynxHeader } from "@/components/LynxHeader";

export type DocManifestEntry = {
  slug: string;
  title: string;
  description?: string;
  source: string;
  htmlFile: string;
  fragmentFile?: string;
};

export type DocManifest = {
  generatedAt: string;
  docs: DocManifestEntry[];
};

let cachedManifest: DocManifest | null = null;

/** Load docs manifest from the HTML build output (public/docs/manifest.json). */
export async function loadDocManifest(force = false): Promise<DocManifest> {
  if (!force && cachedManifest) return cachedManifest;
  const res = await fetch("/docs/manifest.json", { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load docs manifest (${res.status})`);
  cachedManifest = (await res.json()) as DocManifest;
  return cachedManifest;
}

export function clearDocManifestCache() {
  cachedManifest = null;
}

/**
 * Index of HTML-converted project docs (from Markdown).
 * Linked from `/docs`; each entry routes to `/docs/:slug`.
 */
export function DocsIndexPage() {
  const [manifest, setManifest] = useState<DocManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadDocManifest(true)
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
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none opacity-30 base-pattern" aria-hidden />
      <LynxHeader subtitle="Documentation" activePage="docs" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <header className="border-b-4 border-primary pb-6 mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Lynx
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight">
            Documentation
          </h1>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            All project Markdown docs are converted to HTML and served under{" "}
            <code className="font-mono text-xs bg-card px-1 py-0.5">/docs/:slug</code>.
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
          <ul className="space-y-0 divide-y divide-border border-2 border-border">
            {manifest.docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  to={`/docs/${doc.slug}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                >
                  <span className="font-semibold text-foreground">{doc.title}</span>
                  {doc.description ? (
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {doc.description}
                    </span>
                  ) : null}
                  <span className="text-xs uppercase tracking-wider text-accent font-mono">
                    /docs/{doc.slug}
                    <span className="text-muted-foreground"> · {doc.source}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {manifest && (
          <p className="mt-6 text-xs text-muted-foreground">
            {manifest.docs.length} documents · generated{" "}
            {new Date(manifest.generatedAt).toLocaleString()} · run{" "}
            <code className="font-mono">bun run docs:html</code> to regenerate
          </p>
        )}
      </div>
    </div>
  );
}
