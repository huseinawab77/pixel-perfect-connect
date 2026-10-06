import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { compare, weeklyLifeScoresInMonth } from "@/lib/awwab/calc";
import { formatShort, monthKey, periodFor, type PeriodKind } from "@/lib/awwab/dates";
import { generateInsights, topInsights } from "@/lib/awwab/insights";
import { upcoming } from "@/lib/awwab/goals";
import { useAppState } from "@/lib/awwab/store";
import { meta, useToday } from "@/lib/awwab/useToday";
import { DomainList, InsightCard, LifeScoreBlock, WeekTrend } from "@/components/awwab/Performance";
import { Segmented } from "@/components/awwab/ui";

export const Route = createFileRoute("/home")({
  head: () => meta("Home — AWWAB", "How you're doing, what changed, and what to notice."),
  component: HomePage,
});

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Good morning" : h < 15 ? "Good afternoon" : h < 19 ? "Good evening" : "Good night";
}

function HomePage() {
  const today = useToday();
  const state = useAppState();
  const [kind, setKind] = useState<PeriodKind>("week");
  const period = periodFor(kind, today);
  const c = useMemo(() => compare(period, state.entries, today), [state.entries, today, kind]);
  const insights = useMemo(() => topInsights(generateInsights(period, state.entries, today)), [state.entries, today, kind]);
  const monthWeeks = useMemo(() => weeklyLifeScoresInMonth(periodFor("month", today), state.entries, today), [state.entries, today]);
  const next = upcoming(state, today, 3);
  const review = state.reviews.find((r) => r.period === monthKey(today)) ?? [...state.reviews].sort((a, b) => b.period.localeCompare(a.period))[0];
  const hasAnyData = Object.keys(state.entries).length > 0;

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-caption mb-2">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <h1 className="text-h1">{greeting()}.</h1>
          {!hasAnyData && <p className="mt-2 text-muted-foreground">Start tracking today. One to three minutes is enough.</p>}
        </div>
        <Segmented value={kind} onChange={setKind} options={[{ value: "week", label: "This Week" }, { value: "month", label: "This Month" }]} />
      </header>

      <LifeScoreBlock c={c} prevLabel={kind === "week" ? "last week" : "last month"} />

      {!hasAnyData && (
        <Link to="/daily" className="btn btn-primary">Open today's tracker</Link>
      )}

      <section>
        <h2 className="text-h2 mb-3">Domains</h2>
        <DomainList c={c} />
      </section>

      <section>
        <h2 className="text-h2 mb-3">What's happening?</h2>
        <div className="space-y-3">
          {insights.map((i) => <InsightCard key={i.id} insight={i} />)}
        </div>
        <Link to="/insights" className="mt-3 inline-block text-sm font-bold text-rose hover:underline">All insights →</Link>
      </section>

      <section>
        <h2 className="text-h2 mb-3">This month, week by week</h2>
        <div className="surface p-5"><WeekTrend data={monthWeeks} /></div>
      </section>

      <section>
        <h2 className="text-h2 mb-3">Next focus</h2>
        <div className="surface divide-y">
          {review?.nextFocus && (
            <div className="px-5 py-3">
              <p className="text-caption">Your chosen focus</p>
              <p className="font-semibold">{review.nextFocus}</p>
            </div>
          )}
          {next.length ? (
            next.map((i) => (
              <div key={i.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{i.title}</p>
                  <p className="text-xs capitalize text-muted-foreground">{i.type}{i.parent ? ` · ${i.parent}` : ""}</p>
                </div>
                <span className="text-sm text-muted-foreground">Due {formatShort(i.date)}</span>
              </div>
            ))
          ) : (
            <p className="px-5 py-4 text-sm text-muted-foreground">
              Nothing scheduled. <Link to="/goals" className="font-bold text-rose hover:underline">Set a goal</Link>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
