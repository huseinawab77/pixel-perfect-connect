import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { compare } from "@/lib/awwab/calc";
import { DOMAIN_BY_ID, type DomainId } from "@/lib/awwab/config";
import { addDays, formatShort, monthKey, periodFor, previousPeriod } from "@/lib/awwab/dates";
import { goalProgress, goalStatus, isOverdue, milestonesOf, projectStatus, projectsOf } from "@/lib/awwab/goals";
import { saveReview, useAppState } from "@/lib/awwab/store";
import { meta, useToday } from "@/lib/awwab/useToday";
import { TrendChip, fmtScore, PageHeader, Stepper } from "@/components/awwab/ui";

export const Route = createFileRoute("/review")({
  head: () => meta("Monthly Review — AWWAB", "Look back, understand, reflect and choose your next focus."),
  component: ReviewPage,
});

const PROMPTS = [
  { key: "wentWell", label: "What went well?" },
  { key: "difficult", label: "What was difficult?" },
  { key: "change", label: "What should I change next month?" },
  { key: "stop", label: "What should I stop doing?" },
  { key: "continue", label: "What should I continue doing?" },
] as const;
type PromptKey = (typeof PROMPTS)[number]["key"];

function ReviewPage() {
  const today = useToday();
  const state = useAppState();
  const [anchor, setAnchor] = useState(today);
  const month = periodFor("month", anchor);
  const key = monthKey(month.start);
  const c = useMemo(() => compare(month, state.entries, today), [state.entries, today, month.start]);
  const name = (id: DomainId | undefined) => (id ? DOMAIN_BY_ID[id].name : null);
  const existing = state.reviews.find((r) => r.period === key);
  const prevReview = state.reviews.find((r) => r.period === monthKey(previousPeriod(month).start));

  const [form, setForm] = useState<Record<PromptKey | "nextFocus", string>>({ wentWell: "", difficult: "", change: "", stop: "", continue: "", nextFocus: "" });
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  useEffect(() => {
    setForm({
      wentWell: existing?.wentWell ?? "", difficult: existing?.difficult ?? "", change: existing?.change ?? "",
      stop: existing?.stop ?? "", continue: existing?.continue ?? "", nextFocus: existing?.nextFocus ?? "",
    });
    setSaved("idle");
  }, [key, existing?.id]);

  const inMonth = (d: string | null) => !!d && d >= month.start && d <= month.end;
  const completedMs = state.milestones.filter((m) => m.status === "completed" && m.completedAt && inMonth(m.completedAt.slice(0, 10)));
  const completedProjects = state.projects.filter((p) => projectStatus(state, p) === "completed" && milestonesOf(state, p.id).some((m) => inMonth(m.completedAt?.slice(0, 10) ?? null)));
  const overdue = state.milestones.filter((m) => isOverdue(m.dueDate, m.status === "completed", today));
  const nearDeadline = state.projects.filter((p) => p.targetDate && projectStatus(state, p) !== "completed" && p.status !== "archived" && p.targetDate >= today && p.targetDate <= addDays(today, 14));
  const goals = state.goals.filter((g) => goalStatus(state, g) !== "archived");

  const save = () => {
    saveReview({
      period: key,
      snapshot: {
        lifeScore: c.current.lifeScore,
        strongestDomain: name(c.strongest?.id),
        needsAttention: name(c.weakest?.id),
        biggestImprovement: name(c.biggestImprovement?.id),
        biggestDecline: name(c.biggestDecline?.id),
        goalProgress: Object.fromEntries(goals.map((g) => [g.id, goalProgress(state, g)])),
      },
      ...form,
    });
    setSaved("saved");
  };

  const pastReviews = [...state.reviews].sort((a, b) => b.period.localeCompare(a.period));

  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Monthly Review" title={month.label} subtitle="Look back, understand, reflect, look forward." cat="resting">
        <Stepper label={month.label} onPrev={() => setAnchor(previousPeriod(month).start)} onNext={() => setAnchor(addDays(month.end, 1))} nextDisabled={month.end >= today} />
      </PageHeader>

      <section className="surface-strong grid gap-6 p-6 sm:grid-cols-3">
        <div>
          <p className="text-caption">Life Score</p>
          <p className="text-display mt-1 !text-6xl">{c.current.lifeScore === null ? "—" : fmtScore(c.current.lifeScore)}</p>
          {c.current.lifeScore === null && <p className="text-sm text-muted-foreground">Not enough data.</p>}
        </div>
        <div>
          <p className="text-caption">Previous month</p>
          <p className="font-display mt-1 text-3xl font-semibold">{fmtScore(c.previous.lifeScore)}</p>
          <div className="mt-2">{c.life ? <TrendChip t={c.life} /> : <span className="text-sm text-muted-foreground">No comparison</span>}</div>
        </div>
        <div className="space-y-2 text-sm">
          <p><span className="text-caption block">Strongest</span>{name(c.strongest?.id) ?? "Not enough data"}</p>
          <p><span className="text-caption block">Needs attention</span>{name(c.weakest?.id) ?? "Not enough data"}</p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-h2 mb-3">What went well</h2>
          <ul className="space-y-2 text-sm">
            {c.strongest && <li>· Strongest area: <b>{name(c.strongest.id)}</b> ({fmtScore(c.strongest.score)})</li>}
            {c.biggestImprovement && <li>· {name(c.biggestImprovement.id)} improved +{Math.round(c.biggestImprovement.diff)} pts</li>}
            {completedProjects.map((p) => <li key={p.id}>· Completed project: <b>{p.title}</b></li>)}
            {completedMs.length > 0 && <li>· {completedMs.length} milestone{completedMs.length > 1 ? "s" : ""} completed</li>}
            {!c.strongest && !c.biggestImprovement && !completedProjects.length && !completedMs.length && <li className="text-muted-foreground">Nothing recorded yet for this month.</li>}
          </ul>
        </section>
        <section>
          <h2 className="text-h2 mb-3">Needs attention</h2>
          <ul className="space-y-2 text-sm">
            {c.biggestDecline && <li>· {name(c.biggestDecline.id)} declined {Math.round(c.biggestDecline.diff)} pts</li>}
            {c.weakest && <li>· Lowest area: <b>{name(c.weakest.id)}</b> ({fmtScore(c.weakest.score)})</li>}
            {overdue.map((m) => <li key={m.id}>· Overdue milestone: {m.title} ({formatShort(m.dueDate!)})</li>)}
            {nearDeadline.map((p) => <li key={p.id}>· {p.title} is due {formatShort(p.targetDate!)}</li>)}
            {!c.biggestDecline && !c.weakest && !overdue.length && !nearDeadline.length && <li className="text-muted-foreground">Nothing flagged.</li>}
          </ul>
        </section>
      </div>

      <section>
        <h2 className="text-h2 mb-3">Goals</h2>
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No goals yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-cream">
            <table className="w-full text-sm">
              <thead className="text-caption text-left">
                <tr><th className="px-4 py-2">Goal</th><th className="px-4 py-2">Previous</th><th className="px-4 py-2">Current</th><th className="px-4 py-2">Next milestone</th></tr>
              </thead>
              <tbody className="divide-y">
                {goals.map((g) => {
                  const cur = goalProgress(state, g);
                  const prev = prevReview?.snapshot.goalProgress[g.id];
                  const nextMs = projectsOf(state, g.id).flatMap((p) => milestonesOf(state, p.id)).filter((m) => m.status !== "completed").sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"))[0];
                  return (
                    <tr key={g.id}>
                      <td className="px-4 py-2 font-semibold">{g.title}</td>
                      <td className="px-4 py-2">{prev === undefined || prev === null ? "—" : `${prev}%`}</td>
                      <td className="px-4 py-2">{cur === null ? "—" : `${cur}%`}{cur !== null && typeof prev === "number" && <span className="ml-1 text-muted-foreground">({cur - prev >= 0 ? "+" : ""}{cur - prev})</span>}</td>
                      <td className="px-4 py-2 text-muted-foreground">{nextMs ? `${nextMs.title}${nextMs.dueDate ? ` · ${formatShort(nextMs.dueDate)}` : ""}` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-h2 mb-3">Reflection</h2>
        <div className="space-y-4">
          {PROMPTS.map((p) => (
            <label key={p.key} className="block">
              <span className="mb-1 block text-sm font-bold">{p.label}</span>
              <textarea className="field" rows={3} value={form[p.key]} onChange={(e) => { setForm({ ...form, [p.key]: e.target.value }); setSaved("idle"); }} />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-sm font-bold">My one focus for next month</span>
            <input className="field" placeholder="e.g. Academic, or Finish AWWAB MVP" value={form.nextFocus} onChange={(e) => { setForm({ ...form, nextFocus: e.target.value }); setSaved("idle"); }} />
          </label>
          <div className="flex items-center gap-3">
            <button className="btn btn-primary" onClick={save}>{existing ? "Update review" : "Save review"}</button>
            {saved === "saved" && <span className="text-sm text-muted-foreground">Saved.</span>}
          </div>
        </div>
      </section>

      {pastReviews.length > 0 && (
        <section>
          <h2 className="text-h2 mb-3">Past reviews</h2>
          <ul className="flex flex-wrap gap-2">
            {pastReviews.map((r) => (
              <li key={r.id}>
                <button className={`btn ${r.period === key ? "btn-primary" : "btn-soft"}`} onClick={() => setAnchor(`${r.period}-01`)}>
                  {periodFor("month", `${r.period}-01`).label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
