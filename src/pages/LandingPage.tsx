import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EntraSignInButton } from "@/auth/EntraAuthButtons";

const valueBlocks = [
  {
    title: "One hub, every portal",
    body: "Browse and search state and city procurement portals in one place—no more hunting across dozens of bookmarks or spreadsheets.",
  },
  {
    title: "Find by location",
    body: "Researchers and BD teams get fast access to official procurement links by state and city, so you can focus on opportunities, not link-collecting.",
  },
  {
    title: "AI-assisted hunts",
    body: "Pair Lynx with your AI Orchestrator to run workflow hunts—lead generation and sourcing scoped to a state, with configurable prompts and optional RAG or web search.",
  },
  {
    title: "Built for teams",
    body: "Admins maintain the catalog, import bulk data, manage system prompts, and view analytics. Everyone gets a single source of truth.",
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background: base dark + subtle diagonal stripe atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(-45deg, transparent, transparent 24px, var(--base-teal) 24px, var(--base-teal) 25px),
            repeating-linear-gradient(45deg, transparent, transparent 24px, var(--base-orange) 24px, var(--base-orange) 25px)
          `,
        }}
      />
      {/* Gradient vignette for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--accent) / 0.08) 0%, transparent 55%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-20">
        {/* Top bar: logo + auth */}
        <header className="flex items-center justify-between mb-16 sm:mb-24">
          <span className="text-xl sm:text-2xl font-extrabold text-foreground uppercase tracking-tight">
            Lynx
          </span>
          <div className="flex items-center gap-2">
            <EntraSignInButton><Button variant="ghost" size="sm" className="uppercase font-semibold text-muted-foreground hover:text-foreground">
                Sign in
              </Button></EntraSignInButton>
            <EntraSignInButton><Button size="sm" className="uppercase font-semibold bg-primary text-primary-foreground hover:bg-primary/90">
                Get started
              </Button></EntraSignInButton>
          </div>
        </header>

        {/* Hero */}
        <section
          className="mb-20 sm:mb-28 animate-in opacity-0 fill-mode-forwards"
          style={{ animation: "fade-in 0.6s ease-out 0.1s forwards" }}
        >
          <p className="text-accent text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] mb-4">
            Procurement hub for government & public-sector sourcing
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground uppercase tracking-tight leading-[1.1] max-w-3xl">
            One place for every state and city procurement portal.
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Lynx gives your team a single hub to browse and search official procurement links—so researchers, business developers, and proposal teams can find opportunities without the chaos.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <EntraSignInButton><Button size="lg" className="uppercase font-bold text-base px-8 rounded-none border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90">
                Get started
              </Button></EntraSignInButton>
            <Link to="/app">
              <Button
                size="lg"
                variant="outline"
                className="uppercase font-bold text-base px-8 rounded-none border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                Go to app
              </Button>
            </Link>
          </div>
        </section>

        {/* Value grid */}
        <section className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-24">
          {valueBlocks.map((block, i) => (
            <div
              key={block.title}
              className="rounded-none border-2 border-border bg-card/60 p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_0_1px_hsl(var(--accent)/0.2)] opacity-0"
              style={{
                animation: "fade-in 0.5s ease-out forwards",
                animationDelay: `calc(0.35s + ${i * 0.08}s)`,
                animationFillMode: "forwards",
              }}
            >
              <h2 className="text-lg font-bold uppercase tracking-tight text-foreground mb-2">
                {block.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {block.body}
              </p>
            </div>
          ))}
        </section>

        {/* Who it's for */}
        <section
          className="mb-20 opacity-0 fill-mode-forwards"
          style={{ animation: "fade-in 0.5s ease-out 0.6s forwards" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent mb-6">
            Who it’s for
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5" aria-hidden>—</span>
              <span><strong className="text-foreground">Researchers and BD teams</strong> who need fast access to state and city procurement links by location.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5" aria-hidden>—</span>
              <span><strong className="text-foreground">Admins</strong> who maintain the link catalog, import bulk data, manage system prompts for AI-assisted hunts, and view analytics.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-0.5" aria-hidden>—</span>
              <span><strong className="text-foreground">Organizations</strong> that pair Lynx with an external AI Orchestrator to run hunts—workflow runs scoped to a state, with configurable prompts and optional RAG or web search.</span>
            </li>
          </ul>
        </section>

        {/* Beta disclaimer */}
        <aside
          role="status"
          className="rounded-none border-2 border-primary/40 bg-primary/5 px-5 py-4 text-center opacity-0 fill-mode-forwards"
          style={{ animation: "fade-in 0.5s ease-out 0.75s forwards" }}
        >
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Lynx is currently in beta.</strong> Features and workflows are subject to change. We welcome feedback as we improve the product.
          </p>
        </aside>

        {/* Final CTA */}
        <section
          className="mt-16 text-center opacity-0 fill-mode-forwards"
          style={{ animation: "fade-in 0.5s ease-out 0.85s forwards" }}
        >
          <p className="text-muted-foreground mb-4">Already have an account?</p>
          <EntraSignInButton><Button variant="outline" size="sm" className="uppercase font-semibold">
              Sign in
            </Button></EntraSignInButton>
        </section>
      </div>
    </div>
  );
}
