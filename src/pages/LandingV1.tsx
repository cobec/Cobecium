import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { EntraSignInButton } from "@/auth/EntraAuthButtons";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e?.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const features = [
  {
    label: "01",
    title: "One hub,\nevery portal",
    body: "Browse and search state and city procurement portals in one place — no more hunting across dozens of bookmarks or spreadsheets.",
    align: "left" as const,
  },
  {
    label: "02",
    title: "Find by\nlocation",
    body: "Researchers and BD teams get fast access to official procurement links by state and city, so you can focus on opportunities, not link-collecting.",
    align: "right" as const,
  },
  {
    label: "03",
    title: "AI-assisted\nhunts",
    body: "Pair Lynx with your AI Orchestrator to run workflow hunts — lead generation and sourcing scoped to a state, with configurable prompts and optional RAG or web search.",
    align: "left" as const,
  },
  {
    label: "04",
    title: "Built for\nteams",
    body: "Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth.",
    align: "right" as const,
  },
];

const personas = [
  { name: "Researchers & BD teams", desc: "Fast access to procurement links by location." },
  { name: "Admins", desc: "Manage the catalog, bulk imports, prompts, and analytics." },
  { name: "Organizations", desc: "Run AI-orchestrated hunts scoped by state with configurable workflows." },
];

export function LandingV1() {
  const heroReveal = useScrollReveal();
  const ctaReveal = useScrollReveal();

  return (
    <div className="relative bg-[var(--base-bg)] text-[var(--base-text)] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
        .v1-serif { font-family: 'Playfair Display', Georgia, serif; }
        .v1-sans { font-family: 'Syne', system-ui, sans-serif; }
        @keyframes v1-rise {
          from { opacity: 0; transform: translateY(60px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes v1-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes v1-slide-right {
          from { opacity: 0; transform: translateX(-80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes v1-slide-left {
          from { opacity: 0; transform: translateX(80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes v1-scale-line {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        .v1-reveal { opacity: 0; }
        .v1-reveal.visible { animation: v1-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .v1-reveal-right { opacity: 0; }
        .v1-reveal-right.visible { animation: v1-slide-left 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .v1-reveal-left { opacity: 0; }
        .v1-reveal-left.visible { animation: v1-slide-right 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* Atmospheric grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ============= HERO: Full viewport ============= */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 sm:px-10 md:px-16 lg:px-24">
        {/* Teal glow top-right */}
        <div
          className="absolute top-0 right-0 w-[60vw] h-[60vh] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 80% 10%, hsl(174 80% 30% / 0.12), transparent 60%)",
          }}
        />
        {/* Orange glow bottom-left */}
        <div
          className="absolute bottom-0 left-0 w-[50vw] h-[40vh] pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 20% 90%, hsl(32 91% 50% / 0.08), transparent 50%)",
          }}
        />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between pt-8 pb-4">
          <span className="v1-sans text-xl font-extrabold uppercase tracking-tight">Lynx</span>
          <div className="flex items-center gap-3">
            <EntraSignInButton><Button variant="ghost" size="sm" className="v1-sans uppercase text-xs font-semibold tracking-wider text-[var(--base-muted)] hover:text-[var(--base-text)]">
                Sign in
              </Button></EntraSignInButton>
            <EntraSignInButton><Button size="sm" className="v1-sans uppercase text-xs font-semibold tracking-wider bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] rounded-none px-5">
                Get started
              </Button></EntraSignInButton>
          </div>
        </header>

        {/* Hero content */}
        <div
          ref={heroReveal.ref}
          className={`relative z-10 flex-1 flex flex-col justify-center py-16 ${heroReveal.visible ? "visible" : ""}`}
        >
          <p
            className="v1-sans text-[var(--base-teal)] text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] mb-6 opacity-0"
            style={{ animation: heroReveal.visible ? "v1-fade-in 0.6s 0.2s forwards" : "none" }}
          >
            Procurement hub for government & public-sector sourcing
          </p>

          {/* Oversized title that bleeds */}
          <h1
            className="v1-serif text-[clamp(3rem,10vw,9rem)] font-black leading-[0.9] tracking-tight opacity-0"
            style={{
              animation: heroReveal.visible ? "v1-rise 1s cubic-bezier(0.16,1,0.3,1) 0.15s forwards" : "none",
              marginLeft: "-0.04em",
            }}
          >
            <span className="block">One place</span>
            <span className="block text-[var(--base-orange)]">for every</span>
            <span className="block italic text-[var(--base-teal)]">portal.</span>
          </h1>

          <p
            className="v1-sans text-lg sm:text-xl text-[var(--base-muted)] max-w-xl mt-8 leading-relaxed opacity-0"
            style={{ animation: heroReveal.visible ? "v1-fade-in 0.8s 0.5s forwards" : "none" }}
          >
            Lynx gives your team a single hub to browse and search official procurement
            links — so you find opportunities, not chaos.
          </p>

          <div
            className="mt-10 flex flex-wrap gap-4 opacity-0"
            style={{ animation: heroReveal.visible ? "v1-rise 0.7s cubic-bezier(0.16,1,0.3,1) 0.7s forwards" : "none" }}
          >
            <EntraSignInButton><Button size="lg" className="v1-sans uppercase font-bold text-sm px-10 py-6 rounded-none border-2 border-[var(--base-orange)] bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-transparent hover:text-[var(--base-orange)] transition-colors duration-300">
                Get started
              </Button></EntraSignInButton>
            <Link to="/app">
              <Button size="lg" variant="outline" className="v1-sans uppercase font-bold text-sm px-10 py-6 rounded-none border-2 border-[var(--base-teal)] text-[var(--base-teal)] hover:bg-[var(--base-teal)] hover:text-[var(--base-bg)] transition-colors duration-300">
                Explore app
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 pb-10 flex justify-center">
          <div
            className="w-px h-16 bg-gradient-to-b from-transparent via-[var(--base-teal)] to-transparent opacity-0"
            style={{ animation: "v1-fade-in 1s 1.5s forwards" }}
          />
        </div>
      </section>

      {/* ============= EDITORIAL FEATURES ============= */}
      <section className="relative py-20 sm:py-32">
        {/* Horizontal rule */}
        <div className="mx-6 sm:mx-10 md:mx-16 lg:mx-24 mb-20">
          <div
            className="h-px bg-gradient-to-r from-[var(--base-teal)] via-[var(--base-orange)]/30 to-transparent"
            style={{ transformOrigin: "left" }}
          />
        </div>

        {features.map((feat) => {
          const Reveal = () => {
            const r = useScrollReveal();
            const isLeft = feat.align === "left";
            return (
              <div
                ref={r.ref}
                key={feat.label}
                className={`
                  mx-6 sm:mx-10 md:mx-16 lg:mx-24 mb-28 sm:mb-40
                  flex flex-col ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} 
                  items-start gap-8 md:gap-16
                `}
              >
                {/* Number + Title */}
                <div
                  className={`flex-shrink-0 md:w-1/2 ${isLeft ? "v1-reveal-left" : "v1-reveal-right"} ${r.visible ? "visible" : ""}`}
                  style={{ animationDelay: "0.1s" }}
                >
                  <span className="v1-sans text-xs font-bold text-[var(--base-teal)] tracking-[0.3em] uppercase mb-4 block">
                    {feat.label}
                  </span>
                  <h2
                    className="v1-serif text-4xl sm:text-5xl md:text-6xl font-black leading-[0.95] tracking-tight whitespace-pre-line"
                  >
                    {feat.title}
                  </h2>
                  {/* Accent bar under title */}
                  <div
                    className="mt-5 h-1 w-16 bg-[var(--base-orange)]"
                    style={{
                      transformOrigin: isLeft ? "left" : "right",
                      animation: r.visible ? "v1-scale-line 0.6s 0.4s cubic-bezier(0.16,1,0.3,1) forwards" : "none",
                      transform: "scaleX(0)",
                    }}
                  />
                </div>

                {/* Body */}
                <div
                  className={`md:w-1/2 md:pt-14 ${isLeft ? "v1-reveal-right" : "v1-reveal-left"} ${r.visible ? "visible" : ""}`}
                  style={{ animationDelay: "0.25s" }}
                >
                  <p className="v1-sans text-lg text-[var(--base-muted)] leading-relaxed max-w-md">
                    {feat.body}
                  </p>
                </div>
              </div>
            );
          };
          return <Reveal key={feat.label} />;
        })}
      </section>

      {/* ============= WHO IT'S FOR — overlapping cards ============= */}
      <section className="relative py-20 sm:py-32 px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="mb-16">
          <p className="v1-sans text-xs font-semibold uppercase tracking-[0.3em] text-[var(--base-teal)] mb-3">
            Who it's for
          </p>
          <h2 className="v1-serif text-4xl sm:text-5xl font-black leading-[0.95]">
            Built for the people<br />
            <span className="italic text-[var(--base-orange)]">who do the work.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 md:gap-0">
          {personas.map((p, i) => {
            const r = useScrollReveal();
            return (
              <div
                ref={r.ref}
                key={p.name}
                className={`
                  v1-reveal ${r.visible ? "visible" : ""}
                  border-2 border-[var(--base-card)] bg-[var(--base-card)]/40 backdrop-blur-sm
                  p-8 sm:p-10 
                  transition-all duration-500
                  hover:border-[var(--base-teal)]/40 hover:bg-[var(--base-card)]/70
                  ${i === 1 ? "md:-mt-6 md:mb-6 md:z-10 md:scale-[1.03]" : ""}
                `}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <span className="v1-sans text-xs font-bold text-[var(--base-orange)] tracking-[0.2em] uppercase block mb-4">
                  0{i + 1}
                </span>
                <h3 className="v1-serif text-2xl font-bold mb-3">{p.name}</h3>
                <p className="v1-sans text-[var(--base-muted)] leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============= BETA BANNER ============= */}
      <section className="px-6 sm:px-10 md:px-16 lg:px-24 py-10">
        <div className="border border-[var(--base-orange)]/30 bg-[var(--base-orange)]/5 px-8 py-6">
          <p className="v1-sans text-sm text-center text-[var(--base-muted)]">
            <strong className="text-[var(--base-text)]">Lynx is currently in beta.</strong>{" "}
            Features and workflows are subject to change. We welcome feedback as we improve the product.
          </p>
        </div>
      </section>

      {/* ============= FINAL CTA ============= */}
      <section
        ref={ctaReveal.ref}
        className={`relative py-28 sm:py-40 px-6 sm:px-10 md:px-16 lg:px-24 text-center v1-reveal ${ctaReveal.visible ? "visible" : ""}`}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(174 80% 30% / 0.06), transparent 70%)",
          }}
        />
        <p className="v1-sans text-[var(--base-muted)] text-lg mb-3">Already have an account?</p>
        <EntraSignInButton><Button variant="outline" className="v1-sans uppercase font-semibold text-sm rounded-none border-2 border-[var(--base-muted)]/40 hover:border-[var(--base-text)] px-8 py-5 transition-colors duration-300">
            Sign in
          </Button></EntraSignInButton>
      </section>
    </div>
  );
}
