import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { EntraSignInButton } from "@/auth/EntraAuthButtons";

function useReveal(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, vis };
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const handleScroll = useCallback(() => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(h > 0 ? window.scrollY / h : 0);
  }, []);
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);
  return progress;
}

export function LandingV4() {
  const progress = useScrollProgress();

  return (
    <div className="relative bg-[var(--base-bg)] text-[var(--base-text)] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap');
        .v4-serif { font-family: 'Instrument Serif', Georgia, serif; }
        .v4-mono { font-family: 'Space Mono', 'Courier New', monospace; }
        @keyframes v4-draw-down {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes v4-fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .v4-reveal { opacity: 0; }
        .v4-reveal.vis { animation: v4-fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Scroll progress bar at top */}
      <div
        className="fixed top-0 left-0 h-[2px] z-50"
        style={{
          width: `${progress * 100}%`,
          background: "linear-gradient(90deg, var(--base-teal), var(--base-orange))",
          transition: "width 0.1s linear",
        }}
      />

      {/* Vertical rule — the spine of the monument */}
      <div
        className="fixed left-[50px] sm:left-[80px] top-0 bottom-0 w-px z-10 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, hsl(174 80% 30% / 0.2) 20%, hsl(32 91% 50% / 0.15) 80%, transparent)",
          transformOrigin: "top",
          animation: "v4-draw-down 1.2s 0.3s cubic-bezier(0.16,1,0.3,1) backwards",
        }}
      />

      <div className="relative z-20 max-w-3xl mx-auto pl-[70px] sm:pl-[110px] pr-6 sm:pr-10">
        {/* ===== NAV ===== */}
        <header className="flex items-center justify-between pt-10 pb-4">
          <span className="v4-mono text-sm font-bold uppercase tracking-[0.3em] text-[var(--base-text)]">
            Lynx
          </span>
          <div className="flex items-center gap-3">
            <EntraSignInButton><Button variant="ghost" size="sm" className="v4-mono uppercase text-[10px] font-bold tracking-[0.2em] text-[var(--base-muted)] hover:text-[var(--base-text)]">
                Sign in
              </Button></EntraSignInButton>
            <EntraSignInButton><Button size="sm" className="v4-mono uppercase text-[10px] font-bold tracking-[0.2em] bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] rounded-none px-5">
                Start
              </Button></EntraSignInButton>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="pt-24 sm:pt-40 pb-32 sm:pb-48 relative">
          {/* Left margin label */}
          <div
            className="absolute -left-[50px] sm:-left-[80px] top-24 sm:top-40 v4-mono text-[10px] text-[var(--base-teal)] uppercase tracking-[0.3em] writing-mode-vertical"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Procurement hub
          </div>

          <h1
            className="v4-serif text-[clamp(3.5rem,9vw,7rem)] leading-[1.0] tracking-[-0.02em] mb-10"
            style={{ animation: "v4-fade-up 1s 0.3s cubic-bezier(0.16,1,0.3,1) backwards" }}
          >
            One place<br />
            for <em className="text-[var(--base-orange)]">every</em><br />
            portal.
          </h1>

          {/* Hairline */}
          <div
            className="w-24 h-px bg-[var(--base-teal)] mb-10"
            style={{
              transformOrigin: "left",
              animation: "v4-draw-down 0.6s 0.6s cubic-bezier(0.16,1,0.3,1) backwards",
              transform: "scaleX(1)",
            }}
          />

          <p
            className="v4-serif text-xl sm:text-2xl text-[var(--base-muted)] leading-[1.6] max-w-lg italic"
            style={{ animation: "v4-fade-up 0.8s 0.7s cubic-bezier(0.16,1,0.3,1) backwards" }}
          >
            Lynx gives your team a single hub to browse and search official procurement
            links — so you find opportunities, not chaos.
          </p>

          <div
            className="mt-12 flex items-center gap-6"
            style={{ animation: "v4-fade-up 0.7s 0.9s cubic-bezier(0.16,1,0.3,1) backwards" }}
          >
            <EntraSignInButton><Button size="lg" className="v4-mono uppercase font-bold text-xs tracking-[0.15em] px-8 py-6 rounded-none bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-transparent hover:text-[var(--base-orange)] border-2 border-[var(--base-orange)] transition-colors duration-300">
                Get started
              </Button></EntraSignInButton>
            <Link to="/app" className="v4-mono text-xs uppercase tracking-[0.15em] text-[var(--base-teal)] hover:text-[var(--base-text)] transition-colors border-b border-[var(--base-teal)]/40 pb-1">
              Explore app →
            </Link>
          </div>
        </section>

        {/* ===== FEATURES: pure typographic rhythm ===== */}
        {[
          { num: "I", title: "One hub,\nevery portal", body: "Browse and search state and city procurement portals in one place — no more hunting across dozens of bookmarks or spreadsheets." },
          { num: "II", title: "Find by\nlocation", body: "Researchers and BD teams get fast access to official procurement links by state and city, so you can focus on opportunities, not link-collecting." },
          { num: "III", title: "AI-assisted\nhunts", body: "Pair Lynx with your AI Orchestrator to run workflow hunts — lead generation and sourcing scoped to a state, with configurable prompts and optional RAG or web search." },
          { num: "IV", title: "Built for\nteams", body: "Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth." },
        ].map((feat, i) => {
          const r = useReveal();
          return (
            <section
              ref={r.ref}
              key={feat.num}
              className={`pb-28 sm:pb-40 v4-reveal ${r.vis ? "vis" : ""}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Roman numeral in the margin */}
              <div
                className="absolute -left-[44px] sm:-left-[72px] v4-mono text-[10px] text-[var(--base-orange)] tracking-[0.2em]"
                style={{ position: "relative", left: "-44px", marginBottom: "8px" }}
              >
                {feat.num}
              </div>

              <h2 className="v4-serif text-4xl sm:text-5xl md:text-6xl leading-[1.0] tracking-[-0.01em] whitespace-pre-line mb-6">
                {feat.title}
              </h2>

              <div className="w-12 h-px bg-[var(--base-orange)]/40 mb-6" />

              <p className="v4-serif text-lg text-[var(--base-muted)] leading-[1.7] max-w-md">
                {feat.body}
              </p>
            </section>
          );
        })}

        {/* ===== WHO IT'S FOR ===== */}
        {(() => {
          const r = useReveal();
          return (
            <section
              ref={r.ref}
              className={`pb-28 sm:pb-40 v4-reveal ${r.vis ? "vis" : ""}`}
            >
              <p className="v4-mono text-[10px] uppercase tracking-[0.3em] text-[var(--base-teal)] mb-8">
                Who it's for
              </p>

              <div className="space-y-10">
                {[
                  { who: "Researchers & BD teams", what: "Fast access to procurement links by state and city location." },
                  { who: "Admins", what: "Manage the catalog, bulk imports, system prompts, and analytics." },
                  { who: "Organizations", what: "AI-orchestrated hunts scoped by state with configurable workflows." },
                ].map((p) => (
                  <div key={p.who}>
                    <h3 className="v4-serif text-2xl sm:text-3xl mb-2">{p.who}</h3>
                    <p className="v4-serif text-base text-[var(--base-muted)] italic leading-relaxed">
                      {p.what}
                    </p>
                    <div className="mt-4 w-full h-px bg-[var(--base-muted)]/10" />
                  </div>
                ))}
              </div>
            </section>
          );
        })()}

        {/* ===== BETA ===== */}
        {(() => {
          const r = useReveal();
          return (
            <section
              ref={r.ref}
              className={`pb-16 v4-reveal ${r.vis ? "vis" : ""}`}
            >
              <div className="py-6 border-t border-b border-[var(--base-orange)]/20">
                <p className="v4-serif text-base text-center text-[var(--base-muted)] italic">
                  <strong className="text-[var(--base-text)] not-italic">Lynx is currently in beta.</strong>{" "}
                  Features and workflows are subject to change. We welcome feedback.
                </p>
              </div>
            </section>
          );
        })()}

        {/* ===== FINAL CTA ===== */}
        <section className="pb-32 sm:pb-48 text-center">
          <p className="v4-mono text-[10px] uppercase tracking-[0.3em] text-[var(--base-muted)] mb-6">
            Already have an account?
          </p>
          <EntraSignInButton><Button variant="outline" className="v4-mono uppercase text-[10px] font-bold tracking-[0.2em] rounded-none border border-[var(--base-muted)]/30 hover:border-[var(--base-text)] px-8 py-5 transition-colors duration-300">
              Sign in
            </Button></EntraSignInButton>
        </section>
      </div>
    </div>
  );
}
