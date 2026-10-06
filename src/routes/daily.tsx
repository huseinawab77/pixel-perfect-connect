import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { DOMAINS, activitiesFor, targetOn, type Activity } from "@/lib/awwab/config";
import { addDays, formatLong } from "@/lib/awwab/dates";
import { setEntry, useAppState, type DailyEntry } from "@/lib/awwab/store";
import { meta, useToday } from "@/lib/awwab/useToday";
import { PageHeader, Stepper } from "@/components/awwab/ui";

export const Route = createFileRoute("/daily")({
  head: () => meta("Daily — AWWAB", "Log today's activities in under three minutes."),
  component: DailyPage,
});

function DailyPage() {
  const today = useToday();
  const [date, setDate] = useState(today);
  const state = useAppState();
  const day = state.entries[date] ?? {};
  const isFuture = date > today;
  const filled = Object.keys(day).length;

  return (
    <div>
      <PageHeader eyebrow="Daily" title={date === today ? "Today" : formatLong(date).split(",")[0]} subtitle={formatLong(date)} cat="focused">
        <Stepper label={date === today ? "Today" : formatLong(date).split(", ").slice(1).join(", ")} onPrev={() => setDate(addDays(date, -1))} onNext={() => setDate(addDays(date, 1))}>
          {date !== today && (
            <button className="btn btn-ghost" onClick={() => setDate(today)}>Today</button>
          )}
        </Stepper>
      </PageHeader>

      {isFuture && (
        <p className="mb-6 rounded-md bg-orange-soft px-4 py-3 text-sm">This day hasn't happened yet. Entries here won't count until it does.</p>
      )}
      <p className="mb-6 text-sm text-muted-foreground">
        {filled} of 21 recorded · tap once for done, twice for not done, three times to clear.
      </p>

      <div className="space-y-8">
        {DOMAINS.map((d) => (
          <section key={d.id}>
            <h2 className="text-h3 mb-2 text-muted-foreground">{d.name}</h2>
            <ul className="divide-y rounded-lg border bg-cream">
              {activitiesFor(d.id).map((a) => (
                <ActivityRow key={a.id} a={a} date={date} entry={day[a.id]} />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ActivityRow({ a, date, entry }: { a: Activity; date: string; entry: DailyEntry | undefined }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{a.name}</p>
        <p className="text-xs text-muted-foreground">{a.targetLabel}</p>
      </div>
      {a.inputType === "checklist" ? <CheckboxActivity a={a} date={date} entry={entry} /> : <NumericActivity a={a} date={date} entry={entry} />}
    </li>
  );
}

function CheckboxActivity({ a, date, entry }: { a: Activity; date: string; entry: DailyEntry | undefined }) {
  const v = entry?.completed ?? null;
  const next = v === null ? true : v === true ? false : null;
  const label = v === true ? "Done" : v === false ? "Not done" : "No data";
  return (
    <button
      role="checkbox"
      aria-checked={v === true ? true : v === false ? false : "mixed"}
      aria-label={`${a.name}: ${label}`}
      onClick={() => setEntry(date, a.id, { completed: next })}
      className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-bold transition-all ${
        v === true ? "border-sage bg-sage-soft" : v === false ? "border-rose bg-rose-soft" : "border-input bg-background text-muted-foreground"
      }`}
    >
      <span className={`grid h-5 w-5 place-items-center rounded-sm ${v === true ? "bg-sage text-cream" : v === false ? "bg-rose text-cream" : "border border-muted"}`}>
        {v === true && <Check className="h-3.5 w-3.5" />}
        {v === false && <Minus className="h-3.5 w-3.5" />}
      </span>
      <span className="hidden w-16 text-left sm:inline">{label}</span>
    </button>
  );
}

function NumericActivity({ a, date, entry }: { a: Activity; date: string; entry: DailyEntry | undefined }) {
  const stored = entry?.value ?? null;
  const [text, setText] = useState(stored === null ? "" : String(stored));
  useEffect(() => setText(stored === null ? "" : String(stored)), [stored, date]);
  const commit = () => {
    const trimmed = text.trim();
    if (trimmed === "") return setEntry(date, a.id, { value: null });
    const n = Number(trimmed);
    if (Number.isFinite(n) && n >= 0) setEntry(date, a.id, { value: n });
    else setText(stored === null ? "" : String(stored));
  };
  const hit = stored !== null && a.scoring === "daily_threshold" && stored >= targetOn(a, date);
  return (
    <label className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={text}
        placeholder="—"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
        aria-label={`${a.name} in ${a.unit}`}
        className={`field !w-24 text-right font-bold ${hit ? "!border-sage" : ""}`}
      />
      <span className="w-10 text-xs text-muted-foreground">{a.unit}</span>
    </label>
  );
}
