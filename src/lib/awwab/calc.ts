// Calculation engine — pure functions. The only place scoring formulas live.
import { ACTIVITIES, DOMAINS, activitiesFor, targetOn, type Activity, type DomainId } from "./config";
import { addDays, daysInMonth, eligibleDates, fromKey, periodFor, previousPeriod, type Period } from "./dates";
import type { Entries } from "./store";

export type PerfStatus = "no_data" | "below_target" | "on_target";

export interface ActivityResult {
  activityId: string;
  target: number; // target for the eligible part of the period
  actual: number; // raw actual (count, total, or successful days)
  recorded: number; // days with data
  eligible: number; // eligible days in period
  denominator: number; // what actual is compared against
  performance: number | null; // 0–100, capped
  status: PerfStatus;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function activityPerformance(a: Activity, period: Period, entries: Entries, today: string): ActivityResult {
  const dates = eligibleDates(period, today);
  const target = targetOn(a, period.start);
  const base = { activityId: a.id, eligible: dates.length };
  const vals = dates.map((d) => entries[d]?.[a.id]).filter(Boolean);
  const none = (): ActivityResult => ({ ...base, target, actual: 0, recorded: 0, denominator: 0, performance: null, status: "no_data" });
  const finish = (actual: number, denominator: number, recorded: number, tgt: number): ActivityResult => {
    const performance = denominator > 0 ? round1(Math.min(actual / denominator, 1) * 100) : null;
    return { ...base, target: tgt, actual, recorded, denominator, performance, status: performance === null ? "no_data" : performance >= 100 ? "on_target" : "below_target" };
  };

  switch (a.scoring) {
    case "daily_check": {
      const rec = vals.filter((e) => e!.completed !== null);
      if (!rec.length) return none();
      const done = rec.filter((e) => e!.completed === true).length;
      return finish(done, rec.length, rec.length, target);
    }
    case "frequency": {
      const rec = vals.filter((e) => e!.completed !== null);
      if (!rec.length) return none();
      const done = rec.filter((e) => e!.completed === true).length;
      const ps = fromKey(period.start);
      const perDay = a.frequency === "week" ? target / 7 : target / daysInMonth(ps.getFullYear(), ps.getMonth());
      const expected = round1(perDay * dates.length);
      return finish(done, expected, rec.length, expected);
    }
    case "daily_threshold": {
      const rec = vals.filter((e) => typeof e!.value === "number");
      if (!rec.length) return none();
      const ok = rec.filter((e) => (e!.value as number) >= target).length;
      return finish(ok, rec.length, rec.length, target);
    }
    case "weekly_sum": {
      const rec = vals.filter((e) => typeof e!.value === "number");
      if (!rec.length) return none();
      const total = rec.reduce((s, e) => s + (e!.value as number), 0);
      const expected = Math.round((target * dates.length) / 7);
      return finish(total, expected, rec.length, expected);
    }
  }
}

/** Weighted average of available scores; missing items excluded from the denominator. */
export function weightedAverage(items: { score: number | null; weight: number }[]): number | null {
  const avail = items.filter((i) => i.score !== null);
  const w = avail.reduce((s, i) => s + i.weight, 0);
  if (!w) return null;
  return round1(avail.reduce((s, i) => s + (i.score as number) * i.weight, 0) / w);
}

export interface PeriodResult {
  period: Period;
  activities: Record<string, ActivityResult>;
  domains: Record<DomainId, number | null>;
  lifeScore: number | null; // = Overall Consistency (MVP)
  recordedActivities: number;
}

export function computePeriod(period: Period, entries: Entries, today: string): PeriodResult {
  const activities: Record<string, ActivityResult> = {};
  for (const a of ACTIVITIES) if (a.active) activities[a.id] = activityPerformance(a, period, entries, today);
  const domains = {} as Record<DomainId, number | null>;
  for (const d of DOMAINS)
    domains[d.id] = weightedAverage(activitiesFor(d.id).map((a) => ({ score: activities[a.id].performance, weight: a.weight })));
  const lifeScore = weightedAverage(DOMAINS.map((d) => ({ score: domains[d.id], weight: d.weight })));
  const recordedActivities = Object.values(activities).filter((r) => r.status !== "no_data").length;
  return { period, activities, domains, lifeScore, recordedActivities };
}

export type TrendDir = "improving" | "stable" | "declining";
export const TREND_THRESHOLD = 5;
export function trend(current: number | null, previous: number | null): { diff: number; dir: TrendDir } | null {
  if (current === null || previous === null) return null;
  const diff = round1(current - previous);
  return { diff, dir: diff >= TREND_THRESHOLD ? "improving" : diff <= -TREND_THRESHOLD ? "declining" : "stable" };
}

export interface Comparison {
  current: PeriodResult;
  previous: PeriodResult;
  life: ReturnType<typeof trend>;
  domainTrends: Record<DomainId, ReturnType<typeof trend>>;
  strongest: { id: DomainId; score: number } | null;
  weakest: { id: DomainId; score: number } | null;
  biggestImprovement: { id: DomainId; diff: number } | null;
  biggestDecline: { id: DomainId; diff: number } | null;
}

export function compare(period: Period, entries: Entries, today: string): Comparison {
  const current = computePeriod(period, entries, today);
  const previous = computePeriod(previousPeriod(period), entries, today);
  const domainTrends = {} as Comparison["domainTrends"];
  for (const d of DOMAINS) domainTrends[d.id] = trend(current.domains[d.id], previous.domains[d.id]);
  const valid = DOMAINS.filter((d) => current.domains[d.id] !== null).map((d) => ({ id: d.id, score: current.domains[d.id] as number }));
  const strongest = valid.length ? valid.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const weakest = valid.length >= 2 ? valid.reduce((a, b) => (b.score < a.score ? b : a)) : null;
  const diffs = DOMAINS.filter((d) => domainTrends[d.id]).map((d) => ({ id: d.id, diff: domainTrends[d.id]!.diff }));
  const ups = diffs.filter((x) => x.diff >= TREND_THRESHOLD);
  const downs = diffs.filter((x) => x.diff <= -TREND_THRESHOLD);
  return {
    current,
    previous,
    life: trend(current.lifeScore, previous.lifeScore),
    domainTrends,
    strongest,
    weakest: weakest && strongest && weakest.id !== strongest.id ? weakest : null,
    biggestImprovement: ups.length ? ups.reduce((a, b) => (b.diff > a.diff ? b : a)) : null,
    biggestDecline: downs.length ? downs.reduce((a, b) => (b.diff < a.diff ? b : a)) : null,
  };
}

/** Life Scores of each week in a month (only weeks that have started). */
export function weeklyLifeScoresInMonth(month: Period, entries: Entries, today: string) {
  const out: { label: string; score: number | null }[] = [];
  let k = month.start;
  let i = 1;
  while (k <= month.end && k <= today) {
    const wp = periodFor("week", k);
    out.push({ label: `Week ${i}`, score: computePeriod(wp, entries, today).lifeScore });
    i++;
    k = addDays(wp.end, 1);
  }
  return out;
}
