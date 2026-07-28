import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { ProcurementGrid } from "@/components/ProcurementGrid";
import { SystemPromptsGrid } from "@/components/SystemPromptsGrid";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { AdminPage } from "@/pages/AdminPage";
import { AdminOnlyRoute } from "@/components/AdminOnlyRoute";
import { AuthenticatedRoute } from "@/components/AuthenticatedRoute";
import { AppFooter } from "@/components/AppFooter";
import { useStoreUserEffect } from "@/hooks/useStoreUserEffect";
import { LandingV1 } from "@/pages/LandingV1";
import { LandingV2 } from "@/pages/LandingV2";
import { LandingV3 } from "@/pages/LandingV3";
import { LandingV4 } from "@/pages/LandingV4";
import { LandingV5 } from "@/pages/LandingV5";
import { FeedbackPage } from "@/pages/FeedbackPage";
import { FeedbackDetailPage } from "@/pages/FeedbackDetailPage";
import { Style6Page } from "@/pages/Style6Page";
import { Style7Page } from "@/pages/Style7Page";
import { Style8Page } from "@/pages/Style8Page";
import { Style9Page } from "@/pages/Style9Page";
import { StylePath10Page } from "@/pages/StylePath10Page";
import { DocsIndexPage } from "@/pages/DocsIndexPage";
import { DocsViewerPage } from "@/pages/DocsViewerPage";
import { OpportunitiesFeedPage } from "@/pages/OpportunitiesFeedPage";
import { OpportunitiesApprovedPage } from "@/pages/OpportunitiesApprovedPage";
import { OpportunitiesStatusPage } from "@/pages/OpportunitiesStatusPage";

function HomeOrRedirect() {
  const { isSignedIn } = useAuth();
  if (isSignedIn) return <Navigate to="/app" replace />;
  return <LandingV3 />;
}

function App() {
  useStoreUserEffect();

  return (
    <BrowserRouter>
      <main className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="flex-1 flex flex-col">
          <Routes>
          <Route path="/" element={<HomeOrRedirect />} />
          <Route path="/welcome" element={<LandingV3 />} />
          <Route path="/app" element={<ProcurementGrid />} />
          <Route
            path="/system-prompts"
            element={
              <AdminOnlyRoute>
                <SystemPromptsGrid />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <AdminOnlyRoute>
                <AnalyticsPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminOnlyRoute>
                <AdminPage />
              </AdminOnlyRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <AuthenticatedRoute>
                <FeedbackPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/feedback/:id"
            element={
              <AuthenticatedRoute>
                <FeedbackDetailPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/opps"
            element={
              <AuthenticatedRoute>
                <OpportunitiesFeedPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/opps/approved"
            element={
              <AuthenticatedRoute>
                <OpportunitiesApprovedPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/opps/status"
            element={
              <AuthenticatedRoute>
                <OpportunitiesStatusPage />
              </AuthenticatedRoute>
            }
          />
          <Route path="/1" element={<LandingV1 />} />
          <Route path="/2" element={<LandingV2 />} />
          <Route path="/3" element={<LandingV3 />} />
          <Route path="/4" element={<LandingV4 />} />
          <Route path="/5" element={<LandingV5 />} />
          <Route path="/6" element={<Style6Page />} />
          <Route path="/7" element={<Style7Page />} />
          <Route path="/8" element={<Style8Page />} />
          <Route path="/9" element={<Style9Page />} />
          <Route path="/10" element={<StylePath10Page />} />
          <Route path="/docs" element={<DocsIndexPage />} />
          <Route path="/docs/:slug" element={<DocsViewerPage />} />
          </Routes>
        </div>
        <AppFooter />
      </main>
    </BrowserRouter>
  );
}

export default App;
