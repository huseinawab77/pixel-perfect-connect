import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { generateInsights } from "@/lib/awwab/insights";
import { periodFor, type PeriodKind } from "@/lib/awwab/dates";
import { useAppState } from "@/lib/awwab/store";
import { meta, useToday } from "@/lib/awwab/useToday";
import { InsightCard } from "@/components/awwab/Performance";
import { PageHeader, Segmented } from "@/components/awwab/ui";

export const Route = createFileRoute("/insights")({
  head: () => meta("Insights — AWWAB", "Evidence-based explanations of what is improving and what is declining."),
  component: InsightsPage,
});

function InsightsPage() {
  const today = useToday();
  const state = useAppState();
  const [kind, setKind] = useState<PeriodKind>("week");
  const insights = useMemo(() => generateInsights(periodFor(kind, today), state.entries, today), [state.entries, today, kind]);
  return (
    <div>
      <PageHeader eyebrow="Insights" title="Why things look this way" subtitle="What happened, and which behaviours were associated with it. Every line traces back to your data." cat="curious">
        <Segmented value={kind} onChange={setKind} options={[{ value: "week", label: "This Week" }, { value: "month", label: "This Month" }]} />
      </PageHeader>
      <div className="space-y-3">
        {insights.map((i) => <InsightCard key={i.id} insight={i} showEvidence={i.priority === "primary"} />)}
      </div>
    </div>
  );
}
