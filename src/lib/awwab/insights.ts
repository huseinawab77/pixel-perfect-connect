// Deterministic insight engine — no AI. Every insight is traceable to calculated data.
import { ACTIVITY_BY_ID, DOMAIN_BY_ID, DOMAINS, activitiesFor, type DomainId } from "./config";
import { compare, computePeriod, TREND_THRESHOLD, type PeriodResult } from "./calc";
import { previousPeriod, type Period } from "./dates";
import type { Entries } from "./store";

export type InsightType =
  | "domain_decline"
  | "domain_improvement"
  | "activity_decline"
  | "activity_improvement"
  | "recurring_weakness"
  | "recurring_strength"
  | "strongest_domain"
  | "weakest_domain"
  | "insufficient_data";

export interface Insight {
  id: string;
  type: InsightType;
  priority: "primary" | "secondary";
  title: string;
  description: string;
  domainId?: DomainId;
  activityId?: string;
  period: string;
  evidence: string[];
  severity: "positive" | "neutral" | "attention";
}

const pts = (n: number) => `${Math.abs(Math.round(n))} point${Math.abs(Math.round(n)) === 1 ? "" : "s"}`;
const pct = (n: number | null) => (n === null ? "—" : `${Math.round(n)}%`);
const listNames = (names: string[]) => (names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

export function generateInsights(period: Period, entries: Entries, today: string): Insight[] {
  const word = period.kind === "week" ? "this week" : "this month";
  const prevWord = period.kind === "week" ? "last week" : "last month";
  const c = compare(period, entries, today);
  const cur = c.current;
  const prev = c.previous;
  const out: Omit<Insight, "priority">[] = [];
  const usedActivities = new Set<string>();

  if (cur.lifeScore === null) {
    return [{
      id: "insufficient", type: "insufficient_data", priority: "primary", period: period.label, severity: "neutral",
      title: "Not enough data yet",
      description: `Track a few activities ${word} and AWWAB will start explaining what's happening.`,
      evidence: [],
    }];
  }

  const activityDelta = (id: string) => {
    const a = cur.activities[id].performance;
    const b = prev.activities[id].performance;
    return a === null || b === null ? null : a - b;
  };

  // 1–2. Domain declines / improvements with weighted contributors
  const domainChanges = DOMAINS.map((d) => ({ d, t: c.domainTrends[d.id] })).filter((x) => x.t && x.t.dir !== "stable");
  domainChanges.sort((a, b) => Math.abs(b.t!.diff) - Math.abs(a.t!.diff));
  for (const { d, t } of domainChanges) {
    const down = t!.diff < 0;
    const contributors = activitiesFor(d.id)
      .map((a) => ({ a, delta: activityDelta(a.id) }))
      .filter((x) => x.delta !== null && (down ? x.delta <= -TREND_THRESHOLD : x.delta >= TREND_THRESHOLD))
      .sort((x, y) => Math.abs(y.delta!) * y.a.weight - Math.abs(x.delta!) * x.a.weight)
      .slice(0, 2);
    contributors.forEach((x) => usedActivities.add(x.a.id));
    const evidence = [
      `${d.name}: ${Math.round(prev.domains[d.id]!)} → ${Math.round(cur.domains[d.id]!)} (${t!.diff > 0 ? "+" : ""}${Math.round(t!.diff)})`,
      ...contributors.map((x) => `${x.a.name}: ${pct(prev.activities[x.a.id].performance)} → ${pct(cur.activities[x.a.id].performance)}`),
    ];
    out.push({
      id: `${down ? "dd" : "di"}-${d.id}`,
      type: down ? "domain_decline" : "domain_improvement",
      domainId: d.id,
      period: period.label,
      severity: down ? "attention" : "positive",
      title: `${d.name} ${down ? "declined" : "improved"} ${pts(t!.diff)} ${word}.`,
      description: contributors.length
        ? `${listNames(contributors.map((x) => x.a.name))} ${contributors.length > 1 ? "were" : "was"} the largest contributor${contributors.length > 1 ? "s" : ""} to the ${down ? "decline" : "improvement"}.`
        : `Compared with ${prevWord}.`,
      evidence,
    });
  }

  // 3. Lowest-performing domain with its largest weighted weakness
  if (c.weakest) {
    const d = DOMAIN_BY_ID[c.weakest.id];
    const weak = activitiesFor(d.id)
      .map((a) => ({ a, p: cur.activities[a.id].performance }))
      .filter((x) => x.p !== null && x.p < 100)
      .sort((x, y) => y.a.weight * (100 - y.p!) - x.a.weight * (100 - x.p!))[0];
    out.push({
      id: `wd-${d.id}`, type: "weakest_domain", domainId: d.id, period: period.label, severity: "attention",
      title: `${d.name} is your lowest area ${word} at ${Math.round(c.weakest.score)}.`,
      description: weak ? `${weak.a.name} (${pct(weak.p)}) carries the largest weighted gap in this area.` : "Its tracked activities sit below the others.",
      evidence: activitiesFor(d.id).map((a) => `${a.name}: ${pct(cur.activities[a.id].performance)} · weight ${a.weight}%`),
    });
  }

  // 4. Recurring patterns — require 3 comparable periods with data
  const p1 = previousPeriod(period);
  const p2 = previousPeriod(p1);
  const results: PeriodResult[] = [cur, prev, computePeriod(p2, entries, today)];
  const unit = period.kind === "week" ? "weeks" : "months";
  const recurring: Omit<Insight, "priority">[] = [];
  for (const id of Object.keys(cur.activities)) {
    if (usedActivities.has(id)) continue;
    const series = results.map((r) => r.activities[id]);
    if (series.some((s) => s.performance === null || s.recorded < 2)) continue;
    const a = ACTIVITY_BY_ID[id];
    const vals = series.map((s) => s.performance as number);
    if (vals.every((v) => v < 100)) {
      recurring.push({
        id: `rw-${id}`, type: "recurring_weakness", activityId: id, domainId: a.domain, period: period.label, severity: "attention",
        title: `${a.name} has remained below target for three consecutive ${unit}.`,
        description: `Target: ${a.targetLabel}.`,
        evidence: vals.slice().reverse().map((v, i) => `${i === 2 ? "Current" : `${2 - i} ${unit.slice(0, -1)}${i === 0 ? "s" : ""} ago`}: ${pct(v)}`),
      });
    } else if (vals.every((v) => v >= 100)) {
      recurring.push({
        id: `rs-${id}`, type: "recurring_strength", activityId: id, domainId: a.domain, period: period.label, severity: "positive",
        title: `${a.name} has remained consistently on target for three ${unit}.`,
        description: `Target: ${a.targetLabel}.`,
        evidence: vals.slice().reverse().map((v, i) => `${i === 2 ? "Current" : `${2 - i} ${unit.slice(0, -1)}${i === 0 ? "s" : ""} ago`}: ${pct(v)}`),
      });
    }
  }
  recurring.sort((x, y) => ACTIVITY_BY_ID[y.activityId!].weight - ACTIVITY_BY_ID[x.activityId!].weight);
  out.push(...recurring.filter((r) => r.type === "recurring_weakness").slice(0, 2));

  // Standalone activity changes not already explained by a domain insight
  for (const id of Object.keys(cur.activities)) {
    if (usedActivities.has(id)) continue;
    const delta = activityDelta(id);
    if (delta === null || Math.abs(delta) < TREND_THRESHOLD) continue;
    if (domainChanges.some((x) => x.d.id === ACTIVITY_BY_ID[id].domain)) continue;
    const a = ACTIVITY_BY_ID[id];
    out.push({
      id: `${delta < 0 ? "ad" : "ai"}-${id}`, type: delta < 0 ? "activity_decline" : "activity_improvement", activityId: id, domainId: a.domain,
      period: period.label, severity: delta < 0 ? "attention" : "positive",
      title: `${a.name} consistency ${delta < 0 ? "dropped" : "rose"} from ${pct(prev.activities[id].performance)} to ${pct(cur.activities[id].performance)}.`,
      description: `Compared with ${prevWord}.`,
      evidence: [`${prevWord}: ${pct(prev.activities[id].performance)}`, `${word}: ${pct(cur.activities[id].performance)}`],
    });
  }

  out.push(...recurring.filter((r) => r.type === "recurring_strength").slice(0, 2));

  if (c.strongest) {
    const d = DOMAIN_BY_ID[c.strongest.id];
    out.push({
      id: `sd-${d.id}`, type: "strongest_domain", domainId: d.id, period: period.label, severity: "positive",
      title: `${d.name} is your strongest area ${word} at ${Math.round(c.strongest.score)}.`,
      description: "Based on the activities you've recorded.",
      evidence: activitiesFor(d.id).map((a) => `${a.name}: ${pct(cur.activities[a.id].performance)}`),
    });
  }

  const priority = ["domain_decline", "domain_improvement", "weakest_domain", "recurring_weakness", "activity_decline", "activity_improvement", "recurring_strength", "strongest_domain"];
  const seen = new Set<string>();
  const ordered = out
    .map((x, i) => ({ x, i }))
    .sort((a, b) => priority.indexOf(a.x.type) - priority.indexOf(b.x.type) || a.i - b.i)
    .map((o) => o.x)
    .filter((x) => (seen.has(x.id) ? false : (seen.add(x.id), true)));
  return ordered.map((x, i) => ({ ...x, priority: i === 0 ? "primary" : "secondary" }));
}

/** Home shows at most 1 primary + 2 secondary. */
export const topInsights = (all: Insight[]) => all.slice(0, 3);
