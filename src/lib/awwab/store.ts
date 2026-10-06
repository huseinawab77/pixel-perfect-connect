// Persistent local-storage abstraction. Raw user input only — never calculated values.
import { useSyncExternalStore } from "react";

export interface DailyEntry {
  date: string;
  activityId: string;
  value: number | null; // quantitative
  completed: boolean | null; // checklist: null = no data, false = explicitly not done
  createdAt: string;
  updatedAt: string;
}
export type Entries = Record<string, Record<string, DailyEntry>>; // date -> activityId -> entry

export type GoalStatus = "active" | "completed" | "archived";
export interface Goal {
  id: string;
  title: string;
  description: string;
  domainId: string | null;
  status: GoalStatus;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export type ProjectStatus = "not_started" | "in_progress" | "completed" | "archived";
export interface Project {
  id: string;
  goalId: string;
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string | null;
  status: "pending" | "completed";
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Review {
  id: string;
  period: string; // YYYY-MM
  snapshot: {
    lifeScore: number | null;
    strongestDomain: string | null;
    needsAttention: string | null;
    biggestImprovement: string | null;
    biggestDecline: string | null;
    goalProgress: Record<string, number | null>;
  };
  wentWell: string;
  difficult: string;
  change: string;
  stop: string;
  continue: string;
  nextFocus: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  version: 1;
  entries: Entries;
  goals: Goal[];
  projects: Project[];
  milestones: Milestone[];
  reviews: Review[];
}

const KEY = "awwab:v1";
const EMPTY: AppState = { version: 1, entries: {}, goals: [], projects: [], milestones: [], reviews: [] };

let state: AppState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    state = EMPTY;
  }
}

function commit(next: AppState) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full / unavailable */
  }
  listeners.forEach((l) => l());
}

export function getState() {
  load();
  return state;
}

export function useAppState(): AppState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getState,
    () => EMPTY,
  );
}

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

// ---------- Daily entries ----------
export function setEntry(date: string, activityId: string, patch: { value?: number | null; completed?: boolean | null }) {
  const s = getState();
  const day = { ...(s.entries[date] ?? {}) };
  const prev = day[activityId];
  const e: DailyEntry = {
    date,
    activityId,
    value: prev?.value ?? null,
    completed: prev?.completed ?? null,
    createdAt: prev?.createdAt ?? now(),
    updatedAt: now(),
    ...patch,
  };
  if (e.value === null && e.completed === null) delete day[activityId];
  else day[activityId] = e;
  commit({ ...s, entries: { ...s.entries, [date]: day } });
}

// ---------- Goals / projects / milestones ----------
export function saveGoal(g: Partial<Goal> & { title: string; id?: string | undefined }) {
  const s = getState();
  if (g.id && s.goals.some((x) => x.id === g.id)) {
    commit({ ...s, goals: s.goals.map((x) => (x.id === g.id ? { ...x, ...g, updatedAt: now() } : x)) });
    return g.id;
  }
  const goal: Goal = { id: uid(), description: "", domainId: null, status: "active", targetDate: null, createdAt: now(), updatedAt: now(), ...g };
  commit({ ...s, goals: [...s.goals, goal] });
  return goal.id;
}

export function saveProject(p: Partial<Project> & { title: string; goalId: string; id?: string | undefined }) {
  const s = getState();
  if (p.id && s.projects.some((x) => x.id === p.id)) {
    commit({ ...s, projects: s.projects.map((x) => (x.id === p.id ? { ...x, ...p, updatedAt: now() } : x)) });
    return p.id;
  }
  const proj: Project = { id: uid(), description: "", status: "not_started", startDate: null, targetDate: null, createdAt: now(), updatedAt: now(), ...p };
  commit({ ...s, projects: [...s.projects, proj] });
  return proj.id;
}

export function saveMilestone(m: Partial<Milestone> & { title: string; projectId: string }) {
  const s = getState();
  if (m.id && s.milestones.some((x) => x.id === m.id)) {
    commit({ ...s, milestones: s.milestones.map((x) => (x.id === m.id ? { ...x, ...m, updatedAt: now() } : x)) });
    return m.id;
  }
  const ms: Milestone = { id: uid(), description: "", dueDate: null, status: "pending", completedAt: null, createdAt: now(), updatedAt: now(), ...m };
  commit({ ...s, milestones: [...s.milestones, ms] });
  return ms.id;
}

export function toggleMilestone(id: string) {
  const s = getState();
  commit({
    ...s,
    milestones: s.milestones.map((m) =>
      m.id === id
        ? { ...m, status: m.status === "completed" ? "pending" : "completed", completedAt: m.status === "completed" ? null : now(), updatedAt: now() }
        : m,
    ),
  });
}

export function deleteMilestone(id: string) {
  const s = getState();
  commit({ ...s, milestones: s.milestones.filter((m) => m.id !== id) });
}

// ---------- Reviews ----------
export function saveReview(r: Omit<Review, "id" | "createdAt" | "updatedAt">) {
  const s = getState();
  const existing = s.reviews.find((x) => x.period === r.period);
  if (existing) {
    commit({ ...s, reviews: s.reviews.map((x) => (x.id === existing.id ? { ...x, ...r, updatedAt: now() } : x)) });
  } else {
    commit({ ...s, reviews: [...s.reviews, { ...r, id: uid(), createdAt: now(), updatedAt: now() }] });
  }
}
