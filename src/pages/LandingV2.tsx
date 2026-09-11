import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EntraSignInButton } from "@/auth/EntraAuthButtons";

export function LandingV2() {
  return (
    <div className="relative min-h-screen bg-[var(--base-bg)] text-[var(--base-text)]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,400&display=swap');
        .v2-display { font-family: 'DM Serif Display', Georgia, serif; }
        .v2-body { font-family: 'DM Sans', 'Syne', system-ui, sans-serif; }
        @keyframes v2-pop {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes v2-pulse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .v2-tile {
          animation: v2-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }
        .v2-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        }
        .v2-glow-dot {
          animation: v2-pulse-glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Nav bar */}
      <header className="relative z-20 flex items-center justify-between px-5 sm:px-8 pt-6 pb-4">
        <span className="v2-body text-xl font-bold uppercase tracking-tight">Lynx</span>
        <div className="flex items-center gap-2">
          <EntraSignInButton><Button variant="ghost" size="sm" className="v2-body uppercase text-xs font-semibold tracking-wider text-[var(--base-muted)] hover:text-[var(--base-text)]">
              Sign in
            </Button></EntraSignInButton>
          <EntraSignInButton><Button size="sm" className="v2-body uppercase text-xs font-bold tracking-wider bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] rounded-full px-5">
              Get started
            </Button></EntraSignInButton>
        </div>
      </header>

      {/* BENTO GRID */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8">
        <div
          className="grid gap-3 sm:gap-4 max-w-7xl mx-auto"
          style={{
            gridTemplateColumns: "repeat(12, 1fr)",
            gridAutoRows: "minmax(80px, auto)",
          }}
        >
          {/* ——— HERO TILE: spans 8 cols, 4 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-8 sm:p-12 flex flex-col justify-end relative overflow-hidden"
            style={{
              gridColumn: "span 8",
              gridRow: "span 4",
              animationDelay: "0.05s",
              background: `
                linear-gradient(145deg, hsl(174 80% 30% / 0.15) 0%, transparent 40%),
                linear-gradient(to bottom, var(--base-card), var(--base-bg))
              `,
            }}
          >
            <div
              className="absolute top-6 right-8 w-40 h-40 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, hsl(32 91% 50% / 0.15), transparent 70%)",
              }}
            />
            <p className="v2-body text-[var(--base-teal)] text-xs font-bold uppercase tracking-[0.25em] mb-4">
              Procurement hub
            </p>
            <h1 className="v2-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5">
              One place for every state{" "}
              <span className="text-[var(--base-orange)]">&</span> city
              procurement portal
            </h1>
            <p className="v2-body text-[var(--base-muted)] text-base sm:text-lg max-w-lg leading-relaxed">
              Lynx gives your team a single hub to browse and search official procurement links — find opportunities, not chaos.
            </p>
          </div>

          {/* ——— CTA TILE: spans 4 cols, 2 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            style={{
              gridColumn: "span 4",
              gridRow: "span 2",
              animationDelay: "0.12s",
              background: "linear-gradient(135deg, hsl(32 91% 50% / 0.12), var(--base-card))",
              border: "1px solid hsl(32 91% 50% / 0.2)",
            }}
          >
            <p className="v2-body text-sm text-[var(--base-muted)] mb-4">
              Ready to simplify procurement research?
            </p>
            <div className="flex flex-col gap-2">
              <EntraSignInButton><Button className="v2-body w-full uppercase font-bold text-sm rounded-full bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] py-5">
                  Get started free
                </Button></EntraSignInButton>
              <Link to="/app">
                <Button variant="outline" className="v2-body w-full uppercase font-bold text-sm rounded-full border-[var(--base-teal)] text-[var(--base-teal)] hover:bg-[var(--base-teal)] hover:text-[var(--base-bg)] py-5">
                  Explore app
                </Button>
              </Link>
            </div>
          </div>

          {/* ——— DECORATIVE: pattern tile — 4 cols, 2 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl relative overflow-hidden"
            style={{
              gridColumn: "span 4",
              gridRow: "span 2",
              animationDelay: "0.18s",
              background: "var(--base-card)",
            }}
          >
            {/* Diagonal pattern fill */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(-45deg, transparent, transparent 8px, var(--base-teal) 8px, var(--base-teal) 9px),
                  repeating-linear-gradient(45deg, transparent, transparent 8px, var(--base-orange) 8px, var(--base-orange) 9px)
                `,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="v2-display text-5xl sm:text-6xl text-[var(--base-orange)] opacity-30">50</div>
                <p className="v2-body text-xs uppercase tracking-widest text-[var(--base-muted)] mt-1">States covered</p>
              </div>
            </div>
          </div>

          {/* ——— FEATURE 1: One hub — 6 cols, 2 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            style={{
              gridColumn: "span 6",
              gridRow: "span 2",
              animationDelay: "0.24s",
              background: "var(--base-card)",
              borderLeft: "3px solid var(--base-teal)",
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--base-teal)]/20 flex items-center justify-center text-[var(--base-teal)] v2-body text-xs font-bold">01</span>
                <h2 className="v2-display text-xl sm:text-2xl">One hub, every portal</h2>
              </div>
              <p className="v2-body text-sm text-[var(--base-muted)] leading-relaxed">
                Browse and search state and city procurement portals in one place — no more hunting across dozens of bookmarks.
              </p>
            </div>
          </div>

          {/* ——— FEATURE 2: Find by location — 6 cols, 2 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            style={{
              gridColumn: "span 6",
              gridRow: "span 2",
              animationDelay: "0.3s",
              background: "var(--base-card)",
              borderLeft: "3px solid var(--base-orange)",
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--base-orange)]/20 flex items-center justify-center text-[var(--base-orange)] v2-body text-xs font-bold">02</span>
                <h2 className="v2-display text-xl sm:text-2xl">Find by location</h2>
              </div>
              <p className="v2-body text-sm text-[var(--base-muted)] leading-relaxed">
                Fast access to official procurement links by state and city — focus on opportunities, not link-collecting.
              </p>
            </div>
          </div>

          {/* ——— FEATURE 3: AI hunts — 4 cols, 3 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden"
            style={{
              gridColumn: "span 4",
              gridRow: "span 3",
              animationDelay: "0.36s",
              background: `linear-gradient(to bottom, var(--base-card), hsl(174 80% 30% / 0.08))`,
              border: "1px solid hsl(174 80% 30% / 0.15)",
            }}
          >
            <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
              <div
                className="w-full h-full rounded-tl-full opacity-10"
                style={{ background: "var(--base-teal)" }}
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--base-teal)]/20 flex items-center justify-center text-[var(--base-teal)] v2-body text-xs font-bold">03</span>
                <h2 className="v2-display text-xl sm:text-2xl">AI-assisted hunts</h2>
              </div>
              <p className="v2-body text-sm text-[var(--base-muted)] leading-relaxed mb-4">
                Pair Lynx with your AI Orchestrator to run workflow hunts — lead generation scoped to a state, with configurable prompts and optional RAG or web search.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-auto">
              <span className="v2-glow-dot w-2 h-2 rounded-full bg-[var(--base-teal)]" />
              <span className="v2-body text-xs text-[var(--base-teal)] uppercase tracking-wider font-semibold">AI-powered</span>
            </div>
          </div>

          {/* ——— FEATURE 4: Built for teams — 4 cols, 3 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            style={{
              gridColumn: "span 4",
              gridRow: "span 3",
              animationDelay: "0.42s",
              background: "var(--base-card)",
              borderLeft: "3px solid var(--base-orange)",
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-[var(--base-orange)]/20 flex items-center justify-center text-[var(--base-orange)] v2-body text-xs font-bold">04</span>
                <h2 className="v2-display text-xl sm:text-2xl">Built for teams</h2>
              </div>
              <p className="v2-body text-sm text-[var(--base-muted)] leading-relaxed mb-4">
                Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-xs v2-body text-[var(--base-muted)]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--base-orange)]" />
                <span>Researchers & BD teams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--base-teal)]" />
                <span>Admin users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--base-orange)]" />
                <span>Organizations</span>
              </div>
            </div>
          </div>

          {/* ——— WHO ITS FOR: 4 cols, 3 rows ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl p-6 sm:p-8 flex flex-col justify-between"
            style={{
              gridColumn: "span 4",
              gridRow: "span 3",
              animationDelay: "0.48s",
              background: `
                linear-gradient(180deg, var(--base-card) 0%, hsl(32 91% 50% / 0.06) 100%)
              `,
            }}
          >
            <div>
              <p className="v2-body text-xs font-bold uppercase tracking-[0.2em] text-[var(--base-teal)] mb-4">
                Who it's for
              </p>
              <div className="space-y-4">
                <div>
                  <h3 className="v2-display text-lg mb-1">Researchers</h3>
                  <p className="v2-body text-xs text-[var(--base-muted)]">Fast access to procurement links by location.</p>
                </div>
                <div className="h-px bg-[var(--base-muted)]/10" />
                <div>
                  <h3 className="v2-display text-lg mb-1">Admins</h3>
                  <p className="v2-body text-xs text-[var(--base-muted)]">Manage catalog, imports, prompts, analytics.</p>
                </div>
                <div className="h-px bg-[var(--base-muted)]/10" />
                <div>
                  <h3 className="v2-display text-lg mb-1">Organizations</h3>
                  <p className="v2-body text-xs text-[var(--base-muted)]">AI-orchestrated hunts with configurable workflows.</p>
                </div>
              </div>
            </div>
          </div>

          {/* ——— BETA BANNER: spans 8 cols, 1 row ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl px-6 py-4 flex items-center justify-center"
            style={{
              gridColumn: "span 8",
              gridRow: "span 1",
              animationDelay: "0.54s",
              background: "hsl(32 91% 50% / 0.06)",
              border: "1px solid hsl(32 91% 50% / 0.15)",
            }}
          >
            <p className="v2-body text-sm text-center text-[var(--base-muted)]">
              <strong className="text-[var(--base-text)]">Lynx is currently in beta.</strong>{" "}
              Features and workflows are subject to change. We welcome feedback.
            </p>
          </div>

          {/* ——— SIGN IN: spans 4 cols, 1 row ——— */}
          <div
            className="v2-tile transition-all duration-300 rounded-2xl px-6 py-4 flex items-center justify-center gap-3"
            style={{
              gridColumn: "span 4",
              gridRow: "span 1",
              animationDelay: "0.6s",
              background: "var(--base-card)",
            }}
          >
            <span className="v2-body text-sm text-[var(--base-muted)]">Have an account?</span>
            <EntraSignInButton><Button variant="outline" size="sm" className="v2-body uppercase text-xs font-semibold rounded-full border-[var(--base-muted)]/30 hover:border-[var(--base-text)] px-5">
                Sign in
              </Button></EntraSignInButton>
          </div>
        </div>
      </div>
    </div>
  );
}
