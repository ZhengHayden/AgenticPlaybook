import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppShell from "@/components/layout/AppShell";
import Projects from "./pages/Projects";
import ProjectOverview from "./pages/ProjectOverview";
import Roadmap from "./pages/Roadmap";
import Knowledge from "./pages/Knowledge";
import Scan from "./pages/Scan";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Projects />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/benchmark" element={<Placeholder title="Benchmark" sub="Percentile vs sector cohort across maturity dimensions" />} />
            <Route path="/knowledge" element={<Knowledge />} />
            <Route path="/settings" element={<Placeholder title="Settings" sub="Workspace · Members · SSO · Rubrics · Variants · Integrations · Audit" />} />
            <Route path="/project" element={<Navigate to="/project/overview" replace />} />
            <Route path="/project/overview" element={<ProjectOverview />} />
            <Route path="/project/roadmap" element={<Roadmap />} />
            <Route path="/project/design" element={<Placeholder title="Design" sub="Canvas workflow editor · Blueprint · Data Contracts · Guardrails · Eval · Cost Model" />} />
            <Route path="/project/scan" element={<Placeholder title="Opportunity Scan" sub="Sources and detected opportunities with citation evidence" />} />
            <Route path="/project/artifacts" element={<Placeholder title="Artifacts" sub="Document library with type/gate/phase/owner filters" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
