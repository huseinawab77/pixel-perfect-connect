// Single source of truth for domains, activities, targets and weights.

export type DomainId =
  | "academic"
  | "health"
  | "finance"
  | "career"
  | "personal"
  | "social"
  | "life";

export interface Domain {
  id: DomainId;
  name: string;
  weight: number; // Life Score weight (%)
}

export const DOMAINS: Domain[] = [
  { id: "academic", name: "Academic", weight: 20 },
  { id: "health", name: "Health & Fitness", weight: 20 },
  { id: "finance", name: "Finance", weight: 10 },
  { id: "career", name: "Career", weight: 20 },
  { id: "personal", name: "Personal Development", weight: 10 },
  { id: "social", name: "Social & Relationships", weight: 10 },
  { id: "life", name: "Life Management", weight: 10 },
];

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<
  DomainId,
  Domain
>;

/**
 * How raw input is turned into performance:
 * - daily_check:     checklist, each recorded day is success/not (completed days / recorded days)
 * - frequency:       checklist, completed occurrences / target occurrences (prorated to eligible days)
 * - daily_threshold: numeric, successful days (value >= target) / recorded days
 * - weekly_sum:      numeric, accumulated total / target (prorated to eligible days)
 */
export type ScoringMode = "daily_check" | "frequency" | "daily_threshold" | "weekly_sum";

export interface TargetVersion {
  effectiveFrom: string; // YYYY-MM-DD — enables future target history
  value: number;
}

export interface Activity {
  id: string;
  name: string;
  domain: DomainId;
  inputType: "checklist" | "quantitative";
  targets: TargetVersion[];
  unit: string;
  frequency: "day" | "week" | "month";
  scoring: ScoringMode;
  weight: number; // within domain (%)
  active: boolean;
  targetLabel: string;
}

const t = (value: number): TargetVersion[] => [{ effectiveFrom: "1970-01-01", value }];

export const ACTIVITIES: Activity[] = [
  // Academic
  { id: "study_session", name: "Study Session", domain: "academic", inputType: "checklist", targets: t(5), unit: "sessions", frequency: "week", scoring: "frequency", weight: 30, active: true, targetLabel: "5× / week" },
  { id: "deep_work", name: "Deep Work", domain: "academic", inputType: "quantitative", targets: t(600), unit: "min", frequency: "week", scoring: "weekly_sum", weight: 40, active: true, targetLabel: "600 min / week" },
  { id: "task_completion", name: "Task Completion", domain: "academic", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 30, active: true, targetLabel: "100% on-time" },
  // Health
  { id: "gym", name: "Gym", domain: "health", inputType: "checklist", targets: t(3), unit: "sessions", frequency: "week", scoring: "frequency", weight: 30, active: true, targetLabel: "3× / week" },
  { id: "daily_steps", name: "Daily Steps", domain: "health", inputType: "quantitative", targets: t(6000), unit: "steps", frequency: "day", scoring: "daily_threshold", weight: 20, active: true, targetLabel: "6,000 / day" },
  { id: "protein", name: "Protein Intake", domain: "health", inputType: "quantitative", targets: t(120), unit: "g", frequency: "day", scoring: "daily_threshold", weight: 30, active: true, targetLabel: "120 g / day" },
  { id: "fruit_veg", name: "Fruit & Vegetable", domain: "health", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 20, active: true, targetLabel: "2 occasions / day" },
  // Finance
  { id: "expense_tracking", name: "Expense Tracking", domain: "finance", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 100, active: true, targetLabel: "100% recorded" },
  // Career
  { id: "skill_dev", name: "Skill Development", domain: "career", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 30, active: true, targetLabel: "30 min / day" },
  { id: "competition", name: "Competition", domain: "career", inputType: "checklist", targets: t(2), unit: "times", frequency: "month", scoring: "frequency", weight: 15, active: true, targetLabel: "2× / month" },
  { id: "project_completion", name: "Project Completion", domain: "career", inputType: "checklist", targets: t(1), unit: "projects", frequency: "month", scoring: "frequency", weight: 30, active: true, targetLabel: "1 / month" },
  { id: "professional_event", name: "Professional Event", domain: "career", inputType: "checklist", targets: t(1), unit: "events", frequency: "month", scoring: "frequency", weight: 10, active: true, targetLabel: "1× / month" },
  { id: "networking", name: "Networking", domain: "career", inputType: "checklist", targets: t(5), unit: "connections", frequency: "week", scoring: "frequency", weight: 15, active: true, targetLabel: "5 / week" },
  // Personal
  { id: "reading", name: "Reading", domain: "personal", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 50, active: true, targetLabel: "10 pages / day" },
  { id: "journaling", name: "Journaling", domain: "personal", inputType: "checklist", targets: t(1), unit: "day", frequency: "day", scoring: "daily_check", weight: 50, active: true, targetLabel: "1 page / day" },
  // Social
  { id: "family_time", name: "Quality Time Family", domain: "social", inputType: "checklist", targets: t(2), unit: "times", frequency: "month", scoring: "frequency", weight: 30, active: true, targetLabel: "2× / month" },
  { id: "helping_others", name: "Helping Others", domain: "social", inputType: "checklist", targets: t(3), unit: "acts", frequency: "week", scoring: "frequency", weight: 30, active: true, targetLabel: "3 / week" },
  { id: "friendship_followup", name: "Friendship Follow-up", domain: "social", inputType: "checklist", targets: t(2), unit: "times", frequency: "month", scoring: "frequency", weight: 20, active: true, targetLabel: "2× / month" },
  { id: "relationship_followup", name: "Relationship Follow-up", domain: "social", inputType: "checklist", targets: t(2), unit: "times", frequency: "month", scoring: "frequency", weight: 20, active: true, targetLabel: "2× / month" },
  // Life management
  { id: "laundry", name: "Laundry", domain: "life", inputType: "checklist", targets: t(1), unit: "times", frequency: "week", scoring: "frequency", weight: 30, active: true, targetLabel: "1× / week" },
  { id: "meal_planning", name: "Weekly Meal Planning", domain: "life", inputType: "checklist", targets: t(1), unit: "times", frequency: "week", scoring: "frequency", weight: 70, active: true, targetLabel: "1× / week" },
];

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a])) as Record<
  string,
  Activity
>;

export const activitiesFor = (domain: DomainId) => ACTIVITIES.filter((a) => a.domain === domain && a.active);

/** Target in effect on a given date (supports future target history). */
export function targetOn(a: Activity, date: string): number {
  let v = a.targets[0].value;
  for (const tv of a.targets) if (tv.effectiveFrom <= date) v = tv.value;
  return v;
}

/** Validates weights — never silently normalized. */
export function validateConfig(): string[] {
  const errors: string[] = [];
  const dsum = DOMAINS.reduce((s, d) => s + d.weight, 0);
  if (dsum !== 100) errors.push(`Domain weights total ${dsum}, expected 100`);
  for (const d of DOMAINS) {
    const s = activitiesFor(d.id).reduce((x, a) => x + a.weight, 0);
    if (s !== 100) errors.push(`${d.name} activity weights total ${s}, expected 100`);
  }
  return errors;
}
