import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, CalendarDays, CalendarRange, Home, Lightbulb, NotebookPen, PenLine, Settings, Target } from "lucide-react";
import { useT } from "@/lib/awwab/i18n";
import { LangSwitch } from "./ui";

const NAV = [
  { to: "/home", key: "nav.home", icon: Home },
  { to: "/daily", key: "nav.daily", icon: PenLine },
  { to: "/weekly", key: "nav.weekly", icon: BarChart3 },
  { to: "/monthly", key: "nav.monthly", icon: CalendarRange },
  { to: "/insights", key: "nav.insights", icon: Lightbulb },
  { to: "/goals", key: "nav.goals", icon: Target },
  { to: "/review", key: "nav.review", icon: NotebookPen },
  { to: "/calendar", key: "nav.calendar", icon: CalendarDays },
] as const;

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function AppShell({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  const t = useT();
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-cream px-4 py-8 md:flex">
        <Link to="/home" className="mb-10 px-3">
          <span className="font-display text-3xl font-semibold tracking-tight">awwab</span>
          <span className="block text-xs text-muted-foreground">{t("app.tagline")}</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {[...NAV, { to: "/settings", key: "nav.settings", icon: Settings } as const].map(({ to, key, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-beige hover:text-foreground"
              activeProps={{ className: "bg-beige !text-foreground" }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(key)}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3">{mounted && <LangSwitch />}</div>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-cream/95 px-4 py-2 backdrop-blur md:hidden">
        <Link to="/home" className="font-display text-2xl font-semibold">awwab</Link>
        <div className="flex items-center gap-2">
          {mounted && <LangSwitch />}
          <Link to="/settings" className="btn btn-ghost !p-2" aria-label={t("nav.settings")} activeProps={{ className: "bg-beige" }}>
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <main className="min-w-0 px-4 pb-28 pt-6 sm:px-8 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-4xl">
          {mounted ? children : <div className="h-64 animate-pulse rounded-xl bg-beige/60" aria-label={t("common.loading")} />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-8 border-t bg-cream/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(({ to, key, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex min-w-0 flex-col items-center gap-0.5 py-2 text-[10px] font-bold text-muted-foreground"
            activeProps={{ className: "!text-foreground" }}
          >
            <Icon className="h-5 w-5" />
            <span className="w-full truncate text-center">{t(key)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
