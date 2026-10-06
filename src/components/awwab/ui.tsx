import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import catResting from "@/assets/cat-resting.png";
import catFocused from "@/assets/cat-focused.png";
import catCurious from "@/assets/cat-curious.png";
import type { TrendDir } from "@/lib/awwab/calc";

const CATS = { resting: catResting, focused: catFocused, curious: catCurious };

export function CatIllustration({ mood, className = "", alt }: { mood: keyof typeof CATS; className?: string; alt?: string }) {
  return <img src={CATS[mood]} alt={alt ?? `A ${mood} cat illustration`} width={816} height={816} className={`select-none ${className}`} draggable={false} />;
}

export function PageHeader({ eyebrow, title, subtitle, cat, children }: { eyebrow?: string; title: string; subtitle?: string; cat?: keyof typeof CATS; children?: ReactNode }) {
  return (
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-caption mb-2">{eyebrow}</p>}
        <h1 className="text-h1">{title}</h1>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
      {cat && <CatIllustration mood={cat} className="h-24 w-24 shrink-0 sm:h-32 sm:w-32" />}
    </header>
  );
}

export function EmptyState({ title, body, cat = "resting", action }: { title: string; body: string; cat?: keyof typeof CATS; action?: ReactNode }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-10 text-center">
      <CatIllustration mood={cat} className="mb-4 h-28 w-28" />
      <h3 className="text-h3">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TrendChip({ t, suffix }: { t: { diff: number; dir: TrendDir } | null; suffix?: string }) {
  if (!t) return null;
  const cls = t.dir === "improving" ? "chip-up" : t.dir === "declining" ? "chip-down" : "chip-flat";
  const arrow = t.dir === "improving" ? "↑" : t.dir === "declining" ? "↓" : "→";
  const n = Math.round(t.diff);
  return (
    <span className={`chip ${cls}`}>
      {arrow} {n > 0 ? "+" : ""}{n} pts{suffix ? ` ${suffix}` : ""}
    </span>
  );
}

export function Bar({ value }: { value: number | null }) {
  return (
    <div className="bar" role="progressbar" aria-valuenow={value ?? undefined} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value ?? 0}%` }} />
    </div>
  );
}

export function Stepper({ label, onPrev, onNext, nextDisabled, children }: { label: string; onPrev: () => void; onNext: () => void; nextDisabled?: boolean; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="btn btn-soft !px-2" onClick={onPrev} aria-label="Previous">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[9rem] text-center text-sm font-bold">{label}</span>
      <button className="btn btn-soft !px-2 disabled:opacity-40" onClick={onNext} disabled={nextDisabled} aria-label="Next">
        <ChevronRight className="h-4 w-4" />
      </button>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md bg-beige p-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-sm px-3 py-1 text-sm font-bold transition-colors ${value === o.value ? "bg-cream text-foreground shadow-soft" : "text-muted-foreground"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const fmtScore = (n: number | null) => (n === null ? "—" : String(Math.round(n)));
