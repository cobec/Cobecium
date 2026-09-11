import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { EntraAuthButtons, EntraSignInButton, useAppAuth } from "@/auth/EntraAuthButtons";

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
  { num: "01", title: "One hub, every portal", body: "Browse and search state and city procurement portals in one place — no more hunting across dozens of bookmarks or spreadsheets." },
  { num: "02", title: "Find by location", body: "Researchers and BD teams get fast access to official procurement links by state and city — focus on opportunities, not link-collecting." },
  { num: "03", title: "Built for teams", body: "Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth." },
];

export function LandingV3() {
  const { isSignedIn } = useAppAuth();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative bg-[var(--base-bg)] text-[var(--base-text)] overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');
        .v3-display { font-family: 'Bebas Neue', Impact, sans-serif; }
        .v3-body { font-family: 'Outfit', 'Syne', system-ui, sans-serif; }
        @keyframes v3-slice-in {
          from { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
          to   { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        }
        @keyframes v3-slide-up {
          from { opacity: 0; transform: translateY(40px) rotate(-2deg); }
          to   { opacity: 1; transform: translateY(0) rotate(0deg); }
        }
        @keyframes v3-letter-spread {
          from { letter-spacing: -0.05em; opacity: 0; }
          to   { letter-spacing: 0.08em; opacity: 1; }
        }
      `}</style>

      {/* ===== HERO SECTION with diagonal bottom edge ===== */}
      <section
        className="relative z-20 min-h-screen flex flex-col"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 100%)",
          background: `
            linear-gradient(160deg, var(--base-bg) 0%, hsl(240 6% 8%) 50%, hsl(174 80% 12% / 0.3) 100%)
          `,
        }}
      >
        {/* Diagonal accent stripe */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, transparent 40%, hsl(32 91% 50% / 0.06) 50%, transparent 60%)",
          }}
        />

        {/* Nav */}
        <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 lg:px-20 pt-8">
          <span className="v3-display text-3xl tracking-wider text-[var(--base-text)]">LYNX</span>
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link to="/app">
                  <Button size="sm" className="v3-body uppercase text-xs font-semibold tracking-widest rounded-none px-6 skew-x-[-6deg] border-2 border-black text-black hover:bg-black hover:text-white">
                    <span className="inline-block skew-x-[6deg]">Go to app</span>
                  </Button>
                </Link>
                <EntraAuthButtons />
              </>
            ) : (
              <>
                <EntraSignInButton><Button variant="ghost" size="sm" className="v3-body uppercase text-xs font-medium tracking-widest text-[var(--base-muted)] hover:text-[var(--base-text)]">
                    Sign in
                  </Button></EntraSignInButton>
                <EntraSignInButton><Button size="sm" className="v3-body uppercase text-xs font-semibold tracking-widest bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] rounded-none px-6 skew-x-[-6deg]">
                    <span className="inline-block skew-x-[6deg]">Get started</span>
                  </Button></EntraSignInButton>
              </>
            )}
          </div>
        </header>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex items-center px-6 sm:px-12 lg:px-20 py-16">
          <div className="max-w-4xl">
            <p
              className="v3-body text-[var(--base-teal)] text-xs font-semibold uppercase tracking-[0.3em] mb-6"
              style={{ animation: "v3-letter-spread 0.8s 0.2s cubic-bezier(0.16,1,0.3,1) backwards" }}
            >
              Procurement hub
            </p>

            <h1
              className="v3-display text-[clamp(4rem,14vw,12rem)] leading-[0.85] tracking-wide"
              style={{ animation: "v3-slide-up 0.8s 0.1s cubic-bezier(0.16,1,0.3,1) backwards" }}
            >
              <span className="block">ONE PLACE</span>
              <span className="block">
                FOR{" "}
                <span
                  className="inline-block skew-x-[-8deg] text-[var(--base-orange)]"
                  style={{ textShadow: "4px 4px 0 hsl(32 91% 50% / 0.15)" }}
                >
                  EVERY
                </span>
              </span>
              <span className="block text-[var(--base-teal)]">PORTAL</span>
            </h1>

            <div
              className="relative z-20 mt-8 max-w-lg"
              style={{ animation: "v3-slide-up 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) backwards" }}
            >
              <p className="v3-body text-lg text-[var(--base-muted)] leading-relaxed">
                Lynx gives your team a single hub to browse and search official procurement
                links — so you find opportunities, not chaos.
              </p>
            </div>

            <div
              className="relative z-30 mt-10 flex flex-wrap gap-4"
              style={{ animation: "v3-slide-up 0.7s 0.55s cubic-bezier(0.16,1,0.3,1) backwards" }}
            >
              {isSignedIn ? (
                <Link to="/app">
                  <Button
                    size="lg"
                    className="v3-body uppercase font-bold text-sm px-10 py-6 rounded-none bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] skew-x-[-6deg] transition-transform hover:skew-x-0 duration-300"
                  >
                    <span className="inline-block skew-x-[6deg] hover:skew-x-0 transition-transform duration-300">Go to app</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <EntraSignInButton><Button
                      size="lg"
                      className="v3-body uppercase font-bold text-sm px-10 py-6 rounded-none bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] skew-x-[-6deg] transition-transform hover:skew-x-0 duration-300"
                    >
                      <span className="inline-block skew-x-[6deg] hover:skew-x-0 transition-transform duration-300">Get started</span>
                    </Button></EntraSignInButton>
                  <Link to="/app">
                    <Button
                      size="lg"
                      variant="outline"
                      className="v3-body uppercase font-bold text-sm px-10 py-6 rounded-none border-2 border-[var(--base-teal)] text-[var(--base-teal)] hover:bg-[var(--base-teal)] hover:text-[var(--base-bg)] skew-x-[-6deg] transition-all hover:skew-x-0 duration-300"
                    >
                      <span className="inline-block skew-x-[6deg] hover:skew-x-0 transition-transform duration-300">Explore app</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES: Diagonal counter-sliced bands ===== */}
      <section className="relative z-10 -mt-20 sm:-mt-32">
        {features.map((feat, i) => {
          const isEven = i % 2 === 0;
          const RevealBlock = () => {
            const { ref, vis } = useReveal();
            return (
              <div
                ref={ref}
                key={feat.num}
                className="relative py-16 sm:py-24"
                style={{
                  clipPath: isEven
                    ? "polygon(0 8%, 100% 0, 100% 92%, 0 100%)"
                    : "polygon(0 0, 100% 8%, 100% 100%, 0 92%)",
                  background: isEven
                    ? `linear-gradient(${160 + i * 20}deg, hsl(174 80% 30% / 0.08), var(--base-card) 40%, var(--base-bg))`
                    : `linear-gradient(${200 + i * 20}deg, hsl(32 91% 50% / 0.06), var(--base-card) 40%, var(--base-bg))`,
                  marginTop: i > 0 ? "-4rem" : "0",
                }}
              >
                <div
                  className={`
                    max-w-5xl mx-auto px-6 sm:px-12 lg:px-20 py-8
                    flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} items-center gap-8 md:gap-16
                  `}
                >
                  {/* Number */}
                  <div
                    className={`flex-shrink-0 ${vis ? "" : "opacity-0"}`}
                    style={{
                      animation: vis ? `v3-slide-up 0.7s cubic-bezier(0.16,1,0.3,1) forwards` : "none",
                      transform: `skew(${isEven ? "-6" : "6"}deg)`,
                    }}
                  >
                    <span
                      className="v3-display text-8xl sm:text-9xl block"
                      style={{
                        color: isEven ? "var(--base-teal)" : "var(--base-orange)",
                        opacity: 0.15,
                        lineHeight: 1,
                      }}
                    >
                      {feat.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 ${vis ? "" : "opacity-0"}`}
                    style={{
                      animation: vis ? `v3-slide-up 0.7s 0.15s cubic-bezier(0.16,1,0.3,1) forwards` : "none",
                    }}
                  >
                    <h2
                      className="v3-display text-4xl sm:text-5xl tracking-wider mb-4"
                      style={{
                        transform: `skew(${isEven ? "-3" : "3"}deg)`,
                      }}
                    >
                      {feat.title.toUpperCase()}
                    </h2>
                    <div
                      className="h-1 w-20 mb-5"
                      style={{
                        background: isEven ? "var(--base-teal)" : "var(--base-orange)",
                        transform: `skew(${isEven ? "-12" : "12"}deg)`,
                      }}
                    />
                    <p className="v3-body text-lg text-[var(--base-muted)] leading-relaxed max-w-lg">
                      {feat.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          };
          return <RevealBlock key={feat.num} />;
        })}
      </section>

      {/* ===== WHO IT'S FOR: Angled cards ===== */}
      <section className="relative py-24 sm:py-36 px-6 sm:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="v3-body text-xs font-semibold uppercase tracking-[0.3em] text-[var(--base-teal)] mb-3">
              Who it's for
            </p>
            <h2
              className="v3-display text-5xl sm:text-7xl tracking-wider"
              style={{ transform: "skew(-3deg)" }}
            >
              YOUR <span className="text-[var(--base-orange)]">TEAM.</span>{" "}
              <span className="text-[var(--base-teal)]">YOUR</span> WORKFLOW.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { name: "Researchers & BD", desc: "Fast access to procurement links by state and city location.", color: "var(--base-teal)", skew: "-3" },
              { name: "Admins", desc: "Manage the link catalog, bulk imports, system prompts, and analytics.", color: "var(--base-orange)", skew: "2" },
              { name: "Organizations", desc: "Run AI-orchestrated hunts scoped by state with configurable prompts.", color: "var(--base-teal)", skew: "-2" },
            ].map((p, i) => {
              const { ref, vis } = useReveal();
              return (
                <div
                  ref={ref}
                  key={p.name}
                  className={`
                    p-6 sm:p-8 border-l-4 bg-[var(--base-card)]/60 backdrop-blur-sm
                    transition-all duration-500 hover:translate-y-[-4px]
                    ${vis ? "" : "opacity-0"}
                  `}
                  style={{
                    borderColor: p.color,
                    transform: `skew(${p.skew}deg)`,
                    animation: vis ? `v3-slide-up 0.6s ${i * 0.12}s cubic-bezier(0.16,1,0.3,1) forwards` : "none",
                  }}
                >
                  <div style={{ transform: `skew(${-Number(p.skew)}deg)` }}>
                    <h3 className="v3-display text-2xl tracking-wider mb-2">{p.name.toUpperCase()}</h3>
                    <p className="v3-body text-sm text-[var(--base-muted)] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== BETA + CTA ===== */}
      <section
        className="relative py-12 px-6 sm:px-12 lg:px-20"
        style={{
          clipPath: "polygon(0 15%, 100% 0, 100% 100%, 0 100%)",
          background: "linear-gradient(170deg, hsl(32 91% 50% / 0.05), var(--base-card) 30%, var(--base-bg))",
        }}
      >
        <div className="max-w-5xl mx-auto pt-16 pb-8">
          <div
            className="border border-[var(--base-orange)]/25 bg-[var(--base-orange)]/5 px-6 py-5 mb-16"
            style={{ transform: "skew(-2deg)" }}
          >
            <p className="v3-body text-sm text-center text-[var(--base-muted)]" style={{ transform: "skew(2deg)" }}>
              <strong className="text-[var(--base-text)]">Lynx is currently in beta.</strong>{" "}
              Features and workflows are subject to change. We welcome feedback.
            </p>
            <div className="text-center mt-4" style={{ transform: "skew(2deg)" }}>
              {isSignedIn ? (
                <Link to="/feedback">
                  <Button
                    size="sm"
                    className="v3-body uppercase font-semibold rounded-none border-2 border-[var(--base-orange)] text-[var(--base-orange)] hover:bg-[var(--base-orange)] hover:text-[var(--base-bg)]"
                  >
                    Send feedback / Report a bug
                  </Button>
                </Link>
              ) : (
                <EntraSignInButton><Button
                    size="sm"
                    className="v3-body uppercase font-semibold rounded-none border-2 border-[var(--base-orange)] text-[var(--base-orange)] hover:bg-[var(--base-orange)] hover:text-[var(--base-bg)]"
                  >
                    Send feedback / Report a bug
                  </Button></EntraSignInButton>
              )}
            </div>
            <p className="v3-body text-xs text-center text-[var(--base-muted)] mt-2" style={{ transform: "skew(2deg)" }}>
              Help us improve — report bugs and suggest features from your account.
            </p>
          </div>

          <div className="text-center pb-12">
            {isSignedIn ? (
              <Link to="/app">
                <Button
                  size="lg"
                  className="v3-body uppercase font-bold text-sm px-10 py-6 rounded-none bg-[var(--base-orange)] text-[var(--base-bg)] hover:bg-[var(--base-orange-hover)] skew-x-[-6deg] transition-transform hover:skew-x-0 duration-300"
                >
                  <span className="inline-block skew-x-[6deg]">Go to app</span>
                </Button>
              </Link>
            ) : (
              <>
                <p className="v3-body text-[var(--base-muted)] text-lg mb-4">Already have an account?</p>
                <EntraSignInButton><Button
                    variant="outline"
                    className="v3-body uppercase font-semibold text-sm rounded-none border-2 border-[var(--base-muted)]/40 hover:border-[var(--base-text)] px-8 py-5 skew-x-[-6deg] transition-all hover:skew-x-0 duration-300"
                  >
                    <span className="inline-block skew-x-[6deg]">Sign in</span>
                  </Button></EntraSignInButton>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
