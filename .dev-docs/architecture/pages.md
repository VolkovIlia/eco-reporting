# Page Structure — Next.js App Router

## Route Map

```
src/app/
  layout.tsx                  — Root layout (HTML shell, providers)
  page.tsx                    — Landing page (public)
  globals.css                 — Tailwind imports

  auth/
    login/page.tsx            — Login form
    register/page.tsx         — Registration form

  (dashboard)/                — Route group: authenticated layout
    layout.tsx                — Sidebar + header + session guard
    dashboard/page.tsx        — Main dashboard (deadlines timeline + progress)

    facilities/
      page.tsx                — Facility list (cards)
      new/page.tsx            — Create facility form
      [id]/page.tsx           — Facility detail + required reports

    reports/
      page.tsx                — Reports list (all, filterable)
      waste/
        new/page.tsx          — Create 2-TP Waste report (wizard)
        [id]/page.tsx         — Edit 2-TP Waste report (wizard)
        [id]/pdf/page.tsx     — PDF preview + download
      air/
        new/page.tsx          — Create 2-TP Air report (wizard)
        [id]/page.tsx         — Edit 2-TP Air report
        [id]/pdf/page.tsx     — PDF preview + download
      water/
        new/page.tsx          — Create 2-TP Water report (wizard)
        [id]/page.tsx         — Edit 2-TP Water report
        [id]/pdf/page.tsx     — PDF preview + download

    calendar/page.tsx         — Deadline calendar (annual timeline)

    settings/
      page.tsx                — Organization settings (profile, billing placeholder)

  api/
    auth/[...nextauth]/route.ts  — NextAuth handler
    register/route.ts            — Registration endpoint
    organization/route.ts        — Org CRUD
    facilities/route.ts          — Facilities list + create
    facilities/[id]/route.ts     — Facility get/update/delete
    reports/route.ts             — Reports list + create
    reports/[id]/route.ts        — Report get/update/delete
    reports/[id]/validate/route.ts — Validate report
    reports/[id]/pdf/route.ts    — Generate PDF
    reports/[id]/submit/route.ts — Mark submitted
    reference/waste/route.ts     — FKKO search
    reference/pollutants/route.ts — Pollutant search
    dashboard/route.ts           — Dashboard summary
    deadlines/route.ts           — Deadlines list
```

## Route Groups

| Group | Auth Required | Layout |
|-------|--------------|--------|
| `/` (root) | No | Minimal (landing) |
| `/auth/*` | No | Centered card |
| `/(dashboard)/*` | Yes | Sidebar + header |
| `/api/*` | Mixed | None (JSON responses) |

## Key Components

```
src/components/
  layout/
    sidebar.tsx               — Navigation sidebar
    header.tsx                — Top bar (user menu, notifications bell)

  reports/
    waste-wizard.tsx          — Multi-step waste form (4 steps)
    air-wizard.tsx            — Multi-step air form
    water-wizard.tsx          — Multi-step water form
    validation-panel.tsx      — Side panel with validation results
    fkko-autocomplete.tsx     — FKKO code search + autocomplete
    pollutant-autocomplete.tsx — Pollutant search + autocomplete

  facilities/
    facility-card.tsx         — Facility card (name, category badge, status)
    facility-form.tsx         — Create/edit facility form

  dashboard/
    deadline-timeline.tsx     — Horizontal deadline timeline (Jan-Apr)
    facility-progress.tsx     — Progress cards per facility
    notification-list.tsx     — Recent notifications

  ui/                         — shadcn/ui primitives (button, input, card, etc.)
```

## Server Actions

```
src/app/actions/
  auth.ts                     — register, login helpers
  facilities.ts               — createFacility, updateFacility, deleteFacility
  reports.ts                  — createReport, updateReport, deleteReport, submitReport
  validation.ts               — validateReport (server-side validation logic)
  pdf.ts                      — generatePdf (server-side PDF generation)
```

## Middleware

```
src/middleware.ts              — Redirect unauthenticated users from (dashboard)/* to /auth/login
```
