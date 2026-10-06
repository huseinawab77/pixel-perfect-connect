import { describe, expect, it } from "vitest";
import { ACTIVITY_BY_ID, validateConfig } from "@/lib/awwab/config";
import { activityPerformance, trend, weightedAverage, computePeriod } from "@/lib/awwab/calc";
import { periodFor } from "@/lib/awwab/dates";
import type { Entries } from "@/lib/awwab/store";

const e = (date: string, id: string, v: { value?: number | null; completed?: boolean | null }): Entries => ({
  [date]: { [id]: { date, activityId: id, value: v.value ?? null, completed: v.completed ?? null, createdAt: "", updatedAt: "" } },
});
const merge = (...xs: Entries[]): Entries => xs.reduce((acc, x) => {
  for (const [d, m] of Object.entries(x)) acc[d] = { ...(acc[d] ?? {}), ...m };
  return acc;
}, {} as Entries);

// 2026-09-07 is a Monday
const week = periodFor("week", "2026-09-09");
const after = "2026-10-01";

describe("calculation engine", () => {
  it("weights are valid", () => expect(validateConfig()).toEqual([]));
  it("week starts Monday", () => expect(week.start).toBe("2026-09-07"));
  it("gym 2/3 = 66.7, 4/3 capped at 100", () => {
    const two = merge(e("2026-09-07", "gym", { completed: true }), e("2026-09-09", "gym", { completed: true }));
    expect(activityPerformance(ACTIVITY_BY_ID["gym"], week, two, after).performance).toBe(66.7);
    const four = merge(two, e("2026-09-10", "gym", { completed: true }), e("2026-09-11", "gym", { completed: true }));
    const r = activityPerformance(ACTIVITY_BY_ID["gym"], week, four, after);
    expect(r.performance).toBe(100);
    expect(r.actual).toBe(4);
  });
  it("steps use successful days", () => {
    const x = merge(e("2026-09-07", "daily_steps", { value: 7200 }), e("2026-09-08", "daily_steps", { value: 5400 }), e("2026-09-09", "daily_steps", { value: 8100 }));
    expect(activityPerformance(ACTIVITY_BY_ID["daily_steps"], week, x, after).performance).toBe(66.7);
  });
  it("deep work accumulates weekly", () => {
    const x = merge(...[100, 90, 120, 80].map((v, i) => e(`2026-09-${String(7 + i).padStart(2, "0")}`, "deep_work", { value: v })));
    expect(activityPerformance(ACTIVITY_BY_ID["deep_work"], week, x, after).performance).toBe(65);
  });
  it("blank is no data, zero is data", () => {
    expect(activityPerformance(ACTIVITY_BY_ID["protein"], week, {}, after).status).toBe("no_data");
    expect(activityPerformance(ACTIVITY_BY_ID["protein"], week, e("2026-09-07", "protein", { value: 0 }), after).performance).toBe(0);
  });
  it("weighted averages exclude missing", () => {
    expect(weightedAverage([{ score: 80, weight: 30 }, { score: 60, weight: 40 }, { score: null, weight: 30 }])).toBe(68.6);
    expect(weightedAverage([{ score: 80, weight: 30 }, { score: 70, weight: 40 }, { score: 100, weight: 30 }])).toBe(82);
    expect(weightedAverage([80, 70, 90, 60, 80, 70, 100].map((s, i) => ({ score: s, weight: [20, 20, 20, 10, 10, 10, 10][i] })))).toBe(79); // spec example says 80; its weights compute to 79
  });
  it("trend thresholds", () => {
    expect(trend(78, 70)?.dir).toBe("improving");
    expect(trend(76, 80)?.dir).toBe("stable");
    expect(trend(72, 85)?.dir).toBe("declining");
  });
  it("no data → null life score", () => expect(computePeriod(week, {}, after).lifeScore).toBeNull());
});
