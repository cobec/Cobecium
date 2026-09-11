import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LynxHeader } from "@/components/LynxHeader";
import { loadDocManifest, type DocManifestEntry } from "./DocsIndexPage";

/**
 * Resolve the dynamic docs slug from `/docs/:slug` or `/docs/*` splat.
 */
export function useDocsSlug(): string {
  const params = useParams();
  const splat = params["*"];
  const single = params.slug;
  const raw = (splat ?? single ?? "").replace(/^\/+|\/+$/g, "");
  return decodeURIComponent(raw);
}

/**
 * Renders a single HTML-converted doc inside the Lynx shell.
 * Route: `/docs/:slug` (flat slug from manifest).
 */
export function DocsViewerPage() {
  const slug = useDocsSlug();
  const [meta, setMeta] = useState<DocManifestEntry | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Missing doc slug");
      return;
    }
    let cancelled = false;

    void (async () => {
      try {
        setHtml(null);
        setError(null);
        const manifest = await loadDocManifest();
        const entry =
          manifest.docs.find((d) => d.slug === slug) ??
          manifest.docs.find((d) => d.slug === slug.toLowerCase());
        if (!entry) {
          if (!cancelled) setError(`Doc not found: ${slug}`);
          return;
        }
        if (!cancelled) setMeta(entry);

        const fragment = entry.fragmentFile ?? `${entry.slug}.fragment.html`;
        const res = await fetch(`/docs/${fragment}`, { cache: "no-cache" });
        if (!res.ok) throw new Error(`Failed to load ${entry.slug} (${res.status})`);
        const body = await res.text();
        if (!cancelled) {
          setHtml(body);
          setError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setMeta(null);
          setError(e instanceof Error ? e.message : "Failed to load document");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 pointer-events-none opacity-30 base-pattern" aria-hidden />
      <LynxHeader subtitle="Documentation" activePage="docs" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {meta.title}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
              {meta.source} · /docs/{meta.slug}
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

        {!html && !error && (
          <p className="text-muted-foreground text-sm">Loading…</p>
        )}

        {html && (
          <div
            className="lynx-doc-prose"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
