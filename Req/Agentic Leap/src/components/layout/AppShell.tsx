import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Command, Search, Bell, Moon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Projects", end: true },
  { to: "/scan", label: "Scan" },
  { to: "/benchmark", label: "Benchmark" },
  { to: "/knowledge", label: "Knowledge" },
  { to: "/settings", label: "Settings" },
];

const projectTabs = [
  { to: "/project/overview", label: "Overview" },
  { to: "/project/roadmap", label: "Roadmap Prioritization" },
  { to: "/project/design", label: "Design" },
  { to: "/project/scan", label: "Opportunity Scan" },
  { to: "/project/artifacts", label: "Artifacts" },
];

export default function AppShell() {
  const { pathname } = useLocation();
  const inProject = pathname.startsWith("/project");

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-16 bg-surface/90 backdrop-blur border-b border-border">
        <div className="h-full px-6 flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent-violet grid place-items-center text-primary-foreground font-display font-bold">F</div>
            <span className="font-display font-semibold tracking-tight">Frontier <span className="text-muted-foreground font-normal">Agentic AI Platform</span></span>
          </div>
          <nav className="flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "relative px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && <span className="absolute inset-x-3 -bottom-[17px] h-0.5 bg-primary rounded-full" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-surface-muted text-sm text-muted-foreground w-72">
              <Search className="h-4 w-4" />
              <span className="flex-1 text-left">Search projects, use cases…</span>
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border flex items-center gap-0.5"><Command className="h-3 w-3" />K</kbd>
            </button>
            <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-surface-muted"><Bell className="h-4 w-4" /></button>
            <button className="h-9 w-9 grid place-items-center rounded-md hover:bg-surface-muted"><Moon className="h-4 w-4" /></button>
            <button className="h-8 px-2 text-xs font-medium rounded-md hover:bg-surface-muted">EN<span className="text-muted-foreground">/中</span></button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent-violet to-primary text-primary-foreground grid place-items-center text-xs font-semibold">JL</div>
          </div>
        </div>

        {inProject && (
          <div className="px-6 h-12 border-t border-border flex items-center gap-6">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <NavLink to="/" className="hover:text-foreground">Projects</NavLink>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">UT — Golden Example</span>
              <span className="ml-3 px-1.5 py-0.5 rounded bg-success-soft text-success text-[10px] font-semibold">Active</span>
            </div>
            <nav className="ml-4 flex items-center gap-1">
              {projectTabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  className={({ isActive }) =>
                    cn(
                      "relative px-3 h-12 inline-flex items-center text-sm font-medium",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {t.label}
                      {isActive && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
