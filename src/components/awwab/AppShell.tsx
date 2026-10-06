import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, CalendarDays, CalendarRange, Home, Lightbulb, NotebookPen, PenLine, Target } from "lucide-react";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/daily", label: "Daily", icon: PenLine },
  { to: "/weekly", label: "Weekly", icon: BarChart3 },
  { to: "/monthly", label: "Monthly", icon: CalendarRange },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/review", label: "Review", icon: NotebookPen },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function AppShell({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-cream px-4 py-8 md:flex">
        <Link to="/home" className="mb-10 px-3">
          <span className="font-display text-3xl font-semibold tracking-tight">awwab</span>
          <span className="block text-xs text-muted-foreground">simple to use, deep underneath</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-beige hover:text-foreground"
              activeProps={{ className: "bg-beige !text-foreground" }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-cream/95 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/home" className="font-display text-2xl font-semibold">awwab</Link>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-8 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-4xl">
          {mounted ? children : <div className="h-64 animate-pulse rounded-xl bg-beige/60" aria-label="Loading" />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-8 border-t bg-cream/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-muted-foreground"
            activeProps={{ className: "!text-foreground" }}
          >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
