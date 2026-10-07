# Aster Clinic System

A reusable clinic website + booking product, built with Aster Dental
Studio as the first demonstration tenant. This is **not** "the Aster
website" — Aster is one clinic's configuration/content/theme layered on
top of a shared application. A second clinic should be a new
`src/content/<clinic>/` folder plus a registry entry, not a rebuild.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 for the public site, `/book` for the
booking flow.

`npm run build` / `npm run lint` / `npx tsc --noEmit` all pass clean as
of this handoff. See **Testing** below for the automated test suite.

> **Fonts:** the site loads Fraunces / Plus Jakarta Sans / Caveat from
> Google Fonts via a `<link>` tag (see `src/content/aster/clinic.ts`),
> not `next/font`. That's deliberate — `next/font` fetches and
> self-hosts fonts at **build time**, which needs outbound access to
> `fonts.googleapis.com`/`fonts.gstatic.com`. If your build environment
> can reach those domains, switching to `next/font` is a reasonable
> follow-up; just know it moves the font from "loaded per-clinic at
> runtime" to "baked in at build time," which cuts against per-clinic
> theming a little.

## Testing

```bash
npm run test        # unit/component tests (Vitest + React Testing Library), one-shot
npm run test:watch  # same, in watch mode
npm run test:e2e    # end-to-end/smoke/accessibility (Playwright) — builds + starts the app itself
npm run test:all    # both, in sequence
```

- **Unit/component** (`src/**/*.test.ts(x)`, 58 tests): form validation
  rules, the booking service's actual persistence (not just its return
  value), the assistant orchestrator's graph logic, the assistant's
  tools, and `BookingForm`'s full behavior — render, validation,
  loading/error/success states, double-submit prevention, recovery
  after a failed submission.
- **E2E/smoke/accessibility** (`e2e/*.spec.ts`, 26 tests across desktop
  + mobile viewports): a full realistic patient booking journey that
  verifies the booking actually reached the mock service/data layer
  (via a minimal read-only `GET /api/bookings/:id`, added only to make
  this verifiable — not a dashboard), refresh-doesn't-duplicate,
  resubmit-after-success, public-route smoke checks, and an automated
  axe-core accessibility scan of both routes.

`playwright.config.ts` runs tests against a real `next build` + `next
start`, not `next dev` — it exercises the same output a deployment
would. If a sandboxed/offline environment can't download Playwright's
managed browser, point `launchOptions.executablePath` in that config at
any local Chromium/Chrome binary; nothing else needs to change.

## Assistant architecture ("Front Desk")

The site's assistant is a deterministic digital-receptionist widget,
not an AI chatbot — and its code is structured so that distinction is
visible, and so a real AI agent can be dropped in later without a
rewrite:

```
components/assistant/AsterReceptionist.tsx   presentation only
              ↓
assistant/orchestrator.ts                    conversation-graph logic (pure, no React)
              ↓
assistant/tools.ts                           controlled actions (getClinicInformation,
              ↓                               findService, searchClinicKnowledge,
content/aster/assistant-flow.ts               createBookingRequestTool — wraps the REAL
content/aster/knowledge.ts                    booking service, not a stub)
```

- `types/assistant.ts` also declares (but does not implement)
  `AssistantProvider` — the seam a real LLM-backed agent would plug
  into later, given the conversation so far and the tools above.
- `content/aster/knowledge.ts` is a real, structured FAQ knowledge
  base, kept separate from both the flow graph and the UI specifically
  so a future RAG/vector-search implementation can replace
  `searchClinicKnowledge`'s keyword match without anything that calls
  it needing to change.
- The current flow is 100% deterministic multiple-choice — no free-text
  input, no LLM call, nothing that could look like it understands more
  than it does.

## Why it's structured this way

Everything under `src/` is designed around one rule: **components
never know they're rendering Aster.** They take clinic data as props.
Re-skinning a client is changing data, not code.

```
src/
  types/         Domain types (Clinic, ServiceOffering, BookingRequest,
                 assistant.ts — AssistantFlow/ClinicKnowledgeEntry...)
  content/aster/ ALL Aster-specific copy, colors, doctors, services,
                 assistant-flow.ts + knowledge.ts. A second clinic is a
                 sibling folder here.
  config/
    clinics.ts   The registry: which clinics exist, which one is active.
  lib/
    theme.ts     Turns a clinic's theme tokens into CSS custom properties.
    validators.ts  Shared booking validation (used client- AND server-side).
    useDismissablePanel.ts  Escape-to-close + focus mgmt, shared by the
                 mobile nav drawer and the assistant panel.
    utils.ts
  data/
    mockDb.ts    File-backed JSON "database" (.data/bookings.json).
                 The ONLY file that would change to swap in a real
                 database later — see "Persistence" below.
  services/
    bookingService.ts  create/get/list/updateStatus — the repository
                        boundary. UI and API routes call this, never
                        mockDb directly.
    clinicService.ts   Resolves a clinic's full content bundle.
  assistant/
    orchestrator.ts  Pure conversation-graph logic (no React) — see
                      "Assistant architecture" below.
    tools.ts         Controlled actions the assistant (and eventually a
                      real agent) can call.
  components/
    layout/      ClinicNavigation (nav + mobile drawer), Footer
    marketing/   Hero, ServiceExplorer, DoctorSection, ClinicGallery,
                 QuoteBand, AppointmentCTA, MarqueeStrip, IntroSection —
                 the public site, composed in app/page.tsx
    assistant/   AsterReceptionist — the "Front Desk" widget
    booking/     BookingExperience, BookingForm, BookingConfirmation
    shared/      RevealOnScroll, GrainOverlay — no content/theme knowledge
  app/
    page.tsx           public site (server component, assembles marketing/*)
    book/page.tsx       booking route (server component -> BookingExperience)
    api/bookings/route.ts       POST endpoint, the client/server boundary
    api/bookings/[id]/route.ts  GET endpoint — read-only, exists so
                                 tests can verify persistence; not a
                                 dashboard API
    layout.tsx          injects the active clinic's theme as CSS vars,
                         loads fonts, wraps nav/footer around every page
e2e/                 Playwright specs (smoke, booking-flow, accessibility)
```

### Theming

`lib/theme.ts` converts a `ClinicThemeTokens` object into CSS custom
properties (`--color-primary`, `--font-display`, etc.), injected via
`style={}` on `<html>` in `app/layout.tsx`. Every component's CSS
Module references `var(--color-primary)` — never a literal hex value —
so re-theming a clinic is editing one config object, not touching
component code. Layout/composition (asymmetry, tilts, the diorama, the
door) stays in the component CSS, because that's the authored personality
the brief explicitly asked us to keep — "same architecture, different
interior," not a generic template with swapped colors.

### Mock data that behaves like real data

`data/mockDb.ts` is an in-memory array standing in for a database
table. Nothing outside `services/bookingService.ts` imports it
directly. When a real database arrives, that service's four function
bodies change; its callers (the API route, eventually a dashboard)
don't.

Submitting the booking form does a real `POST /api/bookings`, which
validates server-side (same rules as the client, shared from
`lib/validators.ts`) and creates a structured `BookingRequest` — not a
form echo. It's seeded with two example historical requests so the
data layer doesn't feel like an empty shell.

### Booking vs. appointment

Per the project brief, these are kept conceptually distinct even
though the MVP doesn't yet build the step that converts one into the
other: a submitted form is always a `BookingRequest` with
`status: "pending"`. Turning it into a confirmed, time-slotted,
doctor-assigned appointment is future work the types already leave
room for (`assignedDoctorId`, the full `BookingStatus` union).

## Persistence

Booking submissions are real, structured, and durable — not component
state, not an in-memory array that resets on restart.

```
Patient → BookingForm → POST /api/bookings → bookingService.create()
  → bookingRequestsTable.insert() → .data/bookings.json (real file on disk)
```

- **Where**: `.data/bookings.json` at the project root (gitignored —
  it's local dev/demo data, not source). Created automatically on
  first run, seeded with two example bookings so the store isn't an
  empty shell.
- **Survives a page refresh**: yes (was already true even before this
  change — a refresh just re-requests from the same running server).
- **Survives a server restart**: yes. Verified for real, not just
  claimed: created a booking via the live API, hard-killed the server
  process (`kill -9`, not a graceful shutdown), restarted it as a
  fresh process, and fetched that same booking back through the
  restarted server's API. See "Manual verification" below to reproduce.
- **UI never touches the store**: `BookingForm` calls the API route,
  which calls `bookingService`, which calls `bookingRequestsTable`.
  Nothing outside `data/mockDb.ts` reads or writes the file directly.
- **Failure handling**: a failed write throws instead of silently
  succeeding — `bookingRequestsTable.insert`/`updateStatus` write to
  disk *before* updating the in-memory copy, so a failed write can
  never leave memory and disk disagreeing about whether a booking was
  actually saved. The API route catches this and returns a real error
  response instead of a false "success".

### Automated proof, not just a claim

- `src/data/mockDb.test.ts` (10 tests): a created booking is
  immediately findable, retrieved data matches exactly what was
  written, stable IDs, timestamps, correct clinicId, correct initial
  status, multiple bookings coexist without overwriting each other,
  and — the real restart proof — writing data, calling
  `vi.resetModules()` (forces the module's file-read-on-load code to
  run again, the same code path a real process restart would hit),
  and confirming the re-imported module reads the same data back from
  disk.
- `e2e/booking-flow.spec.ts` additionally reads `.data/bookings.json`
  directly off disk (bypassing the running server/API entirely) after
  a real browser-driven booking submission, and verifies three
  bookings created in sequence all coexist on disk under distinct ids.

### Manual verification

```bash
npm run build && npm run start   # real production server, not dev mode

# in another terminal:
curl -X POST http://localhost:3000/api/bookings -H "Content-Type: application/json" \
  -d '{"clinicId":"aster","fullName":"Test Patient","email":"t@example.com","phone":"555-000-1111","patientType":"new","serviceId":"checkups-cleanings","preferredDate":"2099-01-01","preferredTime":"morning"}'
# note the returned booking id, then:
cat .data/bookings.json          # confirm it's really there on disk

# kill the server (Ctrl+C, or `kill` the process — not just closing the tab)
npm run start                     # restart as a completely fresh process
curl http://localhost:3000/api/bookings/<the-id-you-noted>   # still there
```

### Path to a real database

Only `src/data/mockDb.ts` changes. Its exported shape
(`findAll`/`findById`/`findByClinic`/`insert`/`updateStatus`) stays
the same; the four function bodies become real queries against
whatever database is chosen. `bookingService.ts`, the API routes, and
every component above them stay untouched.

## What's deliberately NOT in this codebase

Per scope lock: no dashboard routes or components, no auth, no patient
management, no real WhatsApp/email/payment integration, no LLM/AI
backend. `ClinicBookingSettings` (`feeMode`, `automationMode`) and
`BookingStatus` exist as forward-compatible shape only — the MVP always
runs `feeMode: "free"`, `automationMode: "manual"`, and no UI reads or
writes the other values yet. That's intentional: the architecture
should make adding those straightforward without requiring them now.

The assistant is fully deterministic (a fixed multiple-choice
conversation graph) — no LLM call, no free-text input, nothing that
could look like it understands more than it does. `AssistantProvider`
in `types/assistant.ts` documents the future seam but has zero
implementations.

## Onboarding a second clinic (once this becomes real)

1. `src/content/<clinic>/` — copy the `aster/` folder's shape: clinic
   config + theme tokens, services, doctors, gallery, concierge flow.
2. Add it to `CLINIC_REGISTRY` in `src/config/clinics.ts`.
3. Point `DEFAULT_CLINIC_ID` (or, for real multi-tenancy, whatever
   resolves the active clinic per-request — domain, subdomain, path)
   at the new clinic id.
4. Nothing under `components/` should need to change.
