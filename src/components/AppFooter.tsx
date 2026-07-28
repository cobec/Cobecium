import { Link } from "react-router-dom";

/**
 * Global app footer: attribution and "Powered By" (Convex, Netlify, Clerk).
 * Matches the app's dark theme, teal accent, and Syne typography.
 */
export function AppFooter() {
  return (
    <footer
      className="relative mt-auto border-t-4 border-primary bg-card/80 text-accent"
      aria-label="Footer"
    >
      {/* Subtle diagonal stripe overlay for continuity with main content */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(-45deg, transparent, transparent 20px, var(--base-teal) 20px, var(--base-teal) 21px),
            repeating-linear-gradient(45deg, transparent, transparent 20px, var(--base-orange) 20px, var(--base-orange) 21px)
          `,
        }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <Link
            to="/welcome"
            onClick={() => window.scrollTo(0, 0)}
            className="text-xs font-semibold uppercase tracking-widest text-accent/90 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
          >
            Why Lynx
          </Link>
          <span className="hidden sm:inline text-accent/50" aria-hidden>·</span>
          <Link
            to="/docs"
            onClick={() => window.scrollTo(0, 0)}
            className="text-xs font-semibold uppercase tracking-widest text-accent/90 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
          >
            Docs
          </Link>
          <span className="hidden sm:inline text-accent/50" aria-hidden>·</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent/90">
            Built by Justin Martinez at{" "}
            <a
              href="https://www.cobec.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-primary underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
            >
              Cobec
            </a>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent/90">
            Powered By:
          </span>
          <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-accent" role="list">
            <li>
              <a
                href="https://www.convex.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
              >
                Convex
              </a>
            </li>
            <li aria-hidden className="text-accent/50">·</li>
            <li>
              <a
                href="https://www.netlify.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
              >
                Netlify
              </a>
            </li>
            <li aria-hidden className="text-accent/50">·</li>
            <li>
              <a
                href="https://clerk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-sm"
              >
                Clerk
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
