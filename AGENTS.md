<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## AWWAB architecture
- All scoring formulas live in `src/lib/awwab/calc.ts` (pure functions); UI never computes scores — single source of truth per spec.
- Activity/domain config (`src/lib/awwab/config.ts`) is the only place targets and weights are defined; targets are versioned by `effectiveFrom` so history won't silently change.
- Data persists via the localStorage abstraction in `src/lib/awwab/store.ts`, storing raw input only (null = no data, false = not done, 0 = zero) — no backend was requested.
- Insights are deterministic (`insights.ts`), never AI.
- Pages render client-side only (AppShell mount gate) because they depend on local date and localStorage.
- `noUncheckedIndexedAccess` is off: config lookups by known IDs made it pure noise.
