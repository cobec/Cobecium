import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { EntraSignInButton } from "@/auth/EntraAuthButtons";

function useReveal(threshold = 0.2) {
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

const features = [
  {
    num: "01",
    title: "One hub, every portal",
    body: "Browse and search state and city procurement portals in one place — no more hunting across dozens of bookmarks or spreadsheets.",
    accent: "var(--base-teal)",
  },
  {
    num: "02",
    title: "Find by location",
    body: "Researchers and BD teams get fast access to official procurement links by state and city — focus on opportunities, not link-collecting.",
    accent: "var(--base-orange)",
  },
  {
    num: "03",
    title: "AI-assisted hunts",
    body: "Pair Lynx with your AI Orchestrator to run workflow hunts — lead generation scoped to a state, with configurable prompts and optional RAG or web search.",
    accent: "var(--base-teal)",
  },
  {
    num: "04",
    title: "Built for teams",
    body: "Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth.",
    accent: "var(--base-orange)",
  },
];

export function LandingV5() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    const vCenter = window.innerHeight / 2;
    let closest = 0;
    let closestDist = Infinity;
    sectionRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - vCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIdx(closest);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const bgColors = [
    "radial-gradient(ellipse at 30% 40%, hsl(174 80% 30% / 0.12), transparent 60%)",
    "radial-gradient(ellipse at 70% 60%, hsl(32 91% 50% / 0.10), transparent 60%)",
    "radial-gradient(ellipse at 40% 70%, hsl(174 80% 30% / 0.15), transparent 55%)",
    "radial-gradient(ellipse at 60% 30%, hsl(32 91% 50% / 0.12), transparent 55%)",
  ];

  return (
    <div className="relative bg-[var(--base-bg)] text-[var(--base-text)] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .v5-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .v5-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        @keyframes v5-enter {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .v5-in { animation: v5-enter 0.7s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
        .v5-no-scrollbar::-webkit-scrollbar { display: none; }
        .v5-no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ===== TOP NAV (spans full width above the split) ===== */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 border-b border-[var(--base-muted)]/10">
        <span className="v5-mono text-sm font-bold uppercase tracking-[0.2em]">Lynx</span>
        <div className="flex items-center gap-3">
          <EntraSignInButton><Button variant="ghost" size="sm" className="v5-mono uppercase text-[10px] font-medium tracking-[0.15em] text-[var(--base-muted)] hover:text-[var(--base-text)]">
              Sign in
            </Button></EntraSignInButton>
          <EntraSignInButton><Button size="sm" className="v5-mono uppercase text-[10px] font-bold tracking-[0.15em] bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] rounded-none px-5">
              Get started
            </Button></EntraSignInButton>
        </div>
      </header>

      {/* ===== SPLIT LAYOUT ===== */}
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* LEFT: Sticky panel */}
        <div className="md:w-[45%] md:sticky md:top-0 md:h-screen flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 md:py-0 relative overflow-hidden">
          {/* Animated background glow that shifts */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-out"
            style={{ background: bgColors[activeIdx] || bgColors[0] }}
          />

          {/* Subtle cross-hatch pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 30px, var(--base-teal) 30px, var(--base-teal) 31px),
                repeating-linear-gradient(90deg, transparent, transparent 30px, var(--base-orange) 30px, var(--base-orange) 31px)
              `,
            }}
          />

          <div className="relative z-10">
            <p
              className="v5-mono text-[10px] uppercase tracking-[0.3em] text-[var(--base-teal)] mb-6 v5-in"
              style={{ animationDelay: "0.2s" }}
            >
              Procurement hub for government
            </p>

            <h1
              className="v5-serif text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.05] mb-8 v5-in"
              style={{ animationDelay: "0.35s" }}
            >
              One place<br />
              for <em className="font-semibold text-[var(--base-orange)]">every</em><br />
              portal.
            </h1>

            <p
              className="v5-serif text-lg sm:text-xl text-[var(--base-muted)] leading-relaxed max-w-sm mb-10 v5-in"
              style={{ animationDelay: "0.5s" }}
            >
              Lynx gives your team a single hub to browse and search official procurement
              links — so you find opportunities, not chaos.
            </p>

            <div
              className="flex flex-wrap gap-4 v5-in"
              style={{ animationDelay: "0.65s" }}
            >
              <EntraSignInButton><Button size="lg" className="v5-mono uppercase font-bold text-[11px] tracking-[0.1em] px-8 py-6 rounded-none bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-transparent hover:text-[var(--base-orange)] border-2 border-[var(--base-orange)] transition-colors duration-300">
                  Get started
                </Button></EntraSignInButton>
              <Link to="/app">
                <Button size="lg" variant="outline" className="v5-mono uppercase font-bold text-[11px] tracking-[0.1em] px-8 py-6 rounded-none border-2 border-[var(--base-teal)] text-[var(--base-teal)] hover:bg-[var(--base-teal)] hover:text-[var(--base-bg)] transition-colors duration-300">
                  Explore
                </Button>
              </Link>
            </div>

            {/* Active feature indicator (desktop only) */}
            <div className="hidden md:flex items-center gap-2 mt-14">
              {features.map((f, i) => (
                <div
                  key={f.num}
                  className="h-1 rounded-full transition-all duration-500"
                  style={{
                    width: activeIdx === i ? "32px" : "8px",
                    background: activeIdx === i ? f.accent : "hsl(240 2% 55% / 0.3)",
                  }}
                />
              ))}
              <span className="v5-mono text-[10px] text-[var(--base-muted)] ml-3 tracking-wider">
                {features[activeIdx]?.num} / 04
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Scrolling panel */}
        <div className="md:w-[55%] border-l border-[var(--base-muted)]/10">
          {/* Feature sections */}
          {features.map((feat, i) => {
            const r = useReveal();
            return (
              <div
                ref={(el) => {
                  (r.ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  sectionRefs.current[i] = el;
                }}
                key={feat.num}
                className="min-h-[70vh] md:min-h-screen flex items-center border-b border-[var(--base-muted)]/10 px-8 sm:px-12 lg:px-16 py-16"
              >
                <div
                  className={`max-w-lg transition-all duration-700 ${r.vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="v5-mono text-[10px] font-bold tracking-[0.2em] px-3 py-1"
                      style={{
                        color: feat.accent,
                        border: `1px solid ${feat.accent}`,
                        opacity: 0.7,
                      }}
                    >
                      {feat.num}
                    </span>
                    <div className="flex-1 h-px" style={{ background: `${feat.accent}` , opacity: 0.2 }} />
                  </div>

                  <h2 className="v5-serif text-4xl sm:text-5xl font-semibold leading-[1.1] mb-5">
                    {feat.title}
                  </h2>

                  <p className="v5-serif text-lg text-[var(--base-muted)] leading-relaxed">
                    {feat.body}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Who it's for */}
          <div className="border-b border-[var(--base-muted)]/10 px-8 sm:px-12 lg:px-16 py-20">
            <p className="v5-mono text-[10px] uppercase tracking-[0.3em] text-[var(--base-teal)] mb-10">
              Who it's for
            </p>

            <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory v5-no-scrollbar">
              {[
                { name: "Researchers & BD", desc: "Fast access to procurement links by state and city.", accent: "var(--base-teal)" },
                { name: "Admins", desc: "Manage the catalog, bulk imports, prompts, and analytics.", accent: "var(--base-orange)" },
                { name: "Organizations", desc: "Run AI-orchestrated hunts scoped by state with configurable workflows.", accent: "var(--base-teal)" },
              ].map((p, i) => {
                const r = useReveal(0.1);
                return (
                  <div
                    ref={r.ref}
                    key={p.name}
                    className={`
                      flex-shrink-0 w-[280px] snap-center
                      border-t-2 pt-6
                      transition-all duration-500
                      ${r.vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
                    `}
                    style={{
                      borderColor: p.accent,
                      transitionDelay: `${i * 0.1}s`,
                    }}
                  >
                    <h3 className="v5-serif text-2xl font-semibold mb-2">{p.name}</h3>
                    <p className="v5-serif text-sm text-[var(--base-muted)] leading-relaxed">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Beta + CTA */}
          <div className="px-8 sm:px-12 lg:px-16 py-16">
            <div className="border border-[var(--base-orange)]/20 bg-[var(--base-orange)]/5 px-6 py-5 mb-12">
              <p className="v5-serif text-sm text-center text-[var(--base-muted)]">
                <strong className="text-[var(--base-text)]">Lynx is currently in beta.</strong>{" "}
                Features and workflows are subject to change. We welcome feedback.
              </p>
            </div>

            <div className="text-center">
              <p className="v5-mono text-[10px] uppercase tracking-[0.2em] text-[var(--base-muted)] mb-4">
                Already have an account?
              </p>
              <EntraSignInButton><Button variant="outline" className="v5-mono uppercase text-[10px] font-bold tracking-[0.15em] rounded-none border border-[var(--base-muted)]/30 hover:border-[var(--base-text)] px-8 py-5 transition-colors duration-300">
                  Sign in
                </Button></EntraSignInButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
