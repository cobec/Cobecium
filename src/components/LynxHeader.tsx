import { Link } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

const ORCHESTRATOR_DOCS_URL =
  import.meta.env.VITE_ORCHESTRATOR_DOCS_URL || "http://cobec-spark:5180/api/docs";

type ActivePage = "procurement" | "system-prompts" | "analytics" | "admin" | "feedback" | "feedbackDetail" | "opportunities";

interface LynxHeaderProps {
  subtitle: string;
  activePage: ActivePage;
}

export function LynxHeader({ subtitle, activePage }: LynxHeaderProps) {
  const docsStatus = useQuery(api.orchestratorDocsSync.getOrchestratorDocsStatus);
  const markDocsSeen = useMutation(api.orchestratorDocsSync.markOrchestratorDocsSeen);
  const myRole = useQuery(api.users.getMyRole);
  const isAdmin = myRole?.role === "admin";

  const navButtonClasses = (isActive: boolean) =>
    `border-2 font-semibold uppercase rounded-none transition-colors ${
      isActive
        ? "bg-accent text-accent-foreground border-accent"
        : "border-accent text-accent hover:bg-accent hover:text-accent-foreground"
    }`;

  const handleDocsIndicatorClick = () => {
    window.open(ORCHESTRATOR_DOCS_URL, "_blank", "noopener,noreferrer");
    void markDocsSeen();
  };

  const hasUnseenDocsChanges = docsStatus?.hasUnseenChanges ?? false;

  return (
    <header>
      {/* Top band: logo + tagline centered; auth buttons top-right */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 border-b-4 border-primary relative">
        <div className="absolute top-4 right-4 sm:top-5 sm:right-6 flex items-center gap-2 z-10">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="uppercase font-semibold">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" size="sm" className="uppercase font-semibold">
                Sign up
              </Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
        <div className="text-center relative">
          <div className="inline-flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground uppercase tracking-tight">
              Lynx
            </h1>
            {hasUnseenDocsChanges && (
              <button
                type="button"
                onClick={handleDocsIndicatorClick}
                title="Orchestrator API docs have changed — click to open"
                className="flex items-center justify-center size-7 rounded-full bg-accent text-accent-foreground text-xs font-bold shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="Orchestrator docs updated; open docs"
              >
                1
              </button>
            )}
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm uppercase tracking-widest mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>
      {/* Nav row under the orange line */}
      <div className="bg-primary/5">
        <nav
          className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3"
          aria-label="Primary"
        >
          <Link to="/app">
            <Button
              variant="outline"
              className={navButtonClasses(activePage === "procurement")}
            >
              Procurement links
            </Button>
          </Link>
          <Link to="/opps">
            <Button
              variant="outline"
              className={navButtonClasses(activePage === "opportunities")}
            >
              Opportunities
            </Button>
          </Link>
          <Link to="/feedback">
            <Button
              variant="outline"
              className={navButtonClasses(activePage === "feedback" || activePage === "feedbackDetail")}
            >
              Feedback
            </Button>
          </Link>
          {isAdmin && (
            <Link to="/system-prompts">
              <Button
                variant="outline"
                className={navButtonClasses(activePage === "system-prompts")}
              >
                System prompts
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/analytics">
              <Button
                variant="outline"
                className={navButtonClasses(activePage === "analytics")}
              >
                Analytics
              </Button>
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="outline"
                className={navButtonClasses(activePage === "admin")}
              >
                Admin
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

