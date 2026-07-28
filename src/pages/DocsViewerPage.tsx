import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadDocManifest, type DocManifestEntry } from "./DocsIndexPage";

/**
 * Renders a single HTML-converted doc inside the app shell.
 */
export function DocsViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [meta, setMeta] = useState<DocManifestEntry | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    void (async () => {
      try {
        const manifest = await loadDocManifest();
        const entry = manifest.docs.find((d) => d.slug === slug);
        if (!entry) {
          if (!cancelled) setError(`Doc not found: ${slug}`);
          return;
        }
        if (!cancelled) setMeta(entry);

        const res = await fetch(`/docs/${entry.slug}.fragment.html`);
        if (!res.ok) throw new Error(`Failed to load ${entry.slug} (${res.status})`);
        const body = await res.text();
        if (!cancelled) {
          setHtml(body);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load document");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <nav className="mb-6 text-xs font-semibold uppercase tracking-widest">
        <Link
          to="/docs"
          className="text-accent hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
        >
          ← All docs
        </Link>
      </nav>

      {meta && (
        <header className="border-b-4 border-primary pb-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
            {meta.source}
          </p>
          <p className="mt-2">
            <a
              href={`/docs/${meta.htmlFile}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:text-primary underline underline-offset-2"
            >
              Open standalone HTML
            </a>
          </p>
        </header>
      )}

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}

      {!html && !error && <p className="text-muted-foreground text-sm">Loading…</p>}

      {html && (
        <div
          className="lynx-doc-prose"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
