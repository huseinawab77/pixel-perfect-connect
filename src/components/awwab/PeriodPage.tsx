import { useMemo, useState } from "react";
import { compare } from "@/lib/awwab/calc";
import { nextPeriod, periodFor, previousPeriod, type PeriodKind } from "@/lib/awwab/dates";
import { useAppState } from "@/lib/awwab/store";
import { useToday } from "@/lib/awwab/useToday";
import { DomainList, Highlights, LifeScoreBlock } from "./Performance";
import { PageHeader, Stepper } from "./ui";

export function PeriodPage({ kind }: { kind: PeriodKind }) {
  const today = useToday();
  const state = useAppState();
  const [anchor, setAnchor] = useState(today);
  const period = periodFor(kind, anchor);
  const c = useMemo(() => compare(period, state.entries, today), [state.entries, today, period.start, kind]);
  const current = period.start <= today && period.end >= today;
  const label = kind === "week" ? "week" : "month";

  return (
    <div className="space-y-8">
      <PageHeader eyebrow={kind === "week" ? "Weekly" : "Monthly"} title={current ? `This ${label}` : period.label} subtitle={current ? `${period.label} · only days so far are counted` : `Monday-to-Sunday performance`}>
        <Stepper
          label={period.label}
          onPrev={() => setAnchor(previousPeriod(period).start)}
          onNext={() => setAnchor(nextPeriod(period).start)}
          nextDisabled={period.end >= today}
        >
          {!current && <button className="btn btn-ghost" onClick={() => setAnchor(today)}>This {label}</button>}
        </Stepper>
      </PageHeader>
      {period.start > today ? null : (
        <>
          <LifeScoreBlock c={c} prevLabel={`previous ${label}`} />
          <Highlights c={c} />
          <section>
            <h2 className="text-h2 mb-1">Domains & activities</h2>
            <p className="mb-3 text-sm text-muted-foreground">Tap a domain to see how each activity contributes.</p>
            <DomainList c={c} />
          </section>
        </>
      )}
    </div>
  );
}
