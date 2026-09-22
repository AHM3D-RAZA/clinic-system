# Working rules for this repo

These rules apply to every change in this project, by a human or an AI
assistant. The goal: someone new to the codebase should never have to
scroll through a huge file to understand one piece of it.

## 1. File size ceiling

- **Soft limit: ~150 lines. Hard limit: ~250 lines** for any `.ts`/`.tsx`
  source file (tests excluded).
- If a component or module is approaching that limit, split it **before**
  adding more to it, not after.
- A file that "does one thing" is the target — not a file that "fits in
  one screen" by coincidence.

## 2. How to split a component

When a component grows past the limit, prefer this shape (see
`src/components/booking/BookingForm/` for a worked example):

```
ComponentName/
  index.tsx              # assembles the pieces, minimal logic
  useComponentName.ts     # state, effects, submit/fetch logic
  SubPieceA.tsx            # one visual section, presentational
  SubPieceB.tsx            # another visual section, presentational
  types.ts                 # shared local types/constants
  styles.module.css        # shared CSS module for the folder
  ComponentName.test.tsx   # tests, alongside the code they cover
```

Rules of thumb:
- **Logic lives in a hook, not the component.** If a component has more
  than one `useState`/`useEffect` doing real work, pull that into a
  `useXxx.ts` hook and let the component just call it and render.
- **Split by visual section, not by line count.** Each sub-component
  should map to something a designer would point at and name ("the
  patient fields", "the schedule fields", "the error banner").
- **One CSS module per folder is fine** — importing the same
  `styles.module.css` from multiple sibling files is normal and
  expected, not a smell.
- Keep the **public import path unchanged** when you split a file:
  turning `Thing.tsx` into `Thing/index.tsx` means `import { Thing }
  from "./Thing"` still works everywhere. Don't touch call sites just
  to satisfy a refactor.

## 3. Where things go

- `src/app/` — routes only (Next.js App Router). No business logic here;
  call into `src/lib/` or `src/services/`.
- `src/components/<area>/<Component>/` — one folder per non-trivial
  component, following the shape above. Small, single-purpose
  components (a badge, an icon wrapper) can stay as a single file.
- `src/lib/` — framework-agnostic helpers, validators, formatting.
  Pure functions, easy to unit test.
- `src/services/` — anything that talks to data (mock DB today, a real
  API later). Components should never import `src/data/` directly —
  go through a service.
- `src/types/` — shared TypeScript types, grouped by domain
  (`booking.ts`, `clinic.ts`, `content.ts`, etc).

## 4. Naming and readability

- Component folder name matches the exported component name exactly
  (`BookingForm/` exports `BookingForm`).
- Hooks are named `useXxx` and live next to the component(s) that use
  them unless genuinely shared, in which case they move to `src/lib/`.
- Prefer several small, obviously-named functions over one long
  function with internal comments marking "sections."
- A new contributor should be able to guess which file to open from the
  folder listing alone, without opening anything.

## 5. Tests

- Test files sit next to the code they test (`Thing.test.tsx` beside
  `Thing.tsx` / inside `Thing/`).
- Every split must keep existing tests passing unchanged (import paths
  via the `@/...` alias should not need to change). Run `npm run test`
  before considering a refactor done.

## 6. Before opening a PR / finishing a change

```bash
npm run lint
npm run test
npx tsc --noEmit
```

All three must pass. If a refactor was purely structural (no behavior
change), that's the whole check — no new tests are required, but no
existing test may be edited to "make it pass."
