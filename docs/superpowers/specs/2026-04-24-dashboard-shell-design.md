# Dashboard Shell — Design

**Date:** 2026-04-24
**Status:** Approved
**Scope:** Minimal scaffolding for a per-organization dashboard. Three live-data cards, a role-varying widget framework, and a URL-state filter framework. Real sub-dashboards (operations, financials, epidemiology, etc.) are deferred to follow-on specs.

---

## 1. Context

The product brief describes a large hospital/healthcare admin dashboard covering operational metrics, financial indicators, epidemiological trends, and executive views. The current schema supports a subset of this (patients, encounters, organizations, employment) and does not yet have regional hierarchy, cost tracking, or readmission markers.

Rather than land a partial version of every area, this project delivers the **shell**: the page, the nav link, the filter framework, and the widget framework. Content is three honest live-data cards; every other metric listed in the brief is a follow-on project that builds on this shell.

**Hard constraints driving the design:**

- **Minimal and performant for poor-connectivity clients.** No heavy client frameworks. No large JS bundles. Server-rendered by default. Progressive enhancement only.
- **Stay inside existing conventions.** Fresh 2 routes, Kysely models, `HealthWorkerHomePage` wrapper, `promiseProps`, `assertOr403`, DB-first tests.
- **No schema changes.** The shell uses tables that already exist.

---

## 2. Scope

### In scope

- New route: `/app/organizations/[organization_id]/dashboard` — visible to all employees of the organization (existing org middleware already enforces "must be employed here").
- Three widgets rendered on the home page:
  - **Patients in care** — count of open encounters at this org.
  - **Encounters in range** — count of encounters at this org whose `created_at` falls in the selected date range. Default range: `today → today`.
  - **Staff on shift** — count of employees at this org currently present (`employees_presence.at_work = true`).
- **Widget framework** — `canSee(employment)` predicate + colocated `fetch` and `render` per widget. All three day-one widgets have `canSee: () => true`; framework exists to support role-specific widgets in follow-on specs.
- **Filter framework** — URL-state-backed, SSR-rendered, zero custom islands. Ships with `date-range` and `select` filter types. A plain `<form method="get">` changes the URL; the server re-renders. No JS required.
- **Nav integration** — one entry added to the health-worker sidebar link registry. Visible to all roles (consistent with the existing convention).
- **Tests** — DB-first tests for model queries; pure-function tests for filter parsers and widget predicates; route test covering role variance and filter plumbing.

### Out of scope (deferred to follow-on specs)

| Area | Deferred |
|---|---|
| Roles beyond clinic | Regional / Super admin, cross-org views |
| Sub-dashboards | Operations, Financials, Patient Flow, etc. |
| Filter types beyond date-range and select | multi-select, text, typeahead |
| Metrics beyond the three day-one cards | ALOS, readmissions, cost per treatment, disease incidence, etc. |
| Visualizations | map, timeline, charts beyond a count |
| Export | CSV, PDF, image |
| Alerts | threshold-based highlighting, notifications |
| Caching | none; revisit under query pressure |
| Timezone correctness | "today" = server-UTC today; fix when per-org timezone lands |
| Localization | inherits what the rest of the app has; no new i18n work |

---

## 3. Architecture

### Files added

```
routes/app/organizations/[organization_id]/dashboard/
  index.tsx                               — dashboard home route

db/models/
  dashboard_metrics.ts                    — three aggregate queries

util/dashboard/
  filters.ts                              — parseDateRange, parseSelect
  types.ts                                — WidgetDef, WidgetContext, DashboardFilters (pure types)
  dates.ts                                — todayUtc() helper

components/dashboard/
  Card.tsx                                — presentational metric card
  FilterBar.tsx                           — <form method="get" f-client-nav> wrapper
  filters/
    DateRangeInput.tsx                    — from/to date inputs
    SelectInput.tsx                       — single-value <select>
  widgets/
    index.ts                              — DASHBOARD_WIDGETS registry
    PatientsInCare.tsx                    — widget def (fetch + render + canSee)
    EncountersInRange.tsx
    StaffOnShift.tsx

components/library/sidebar/home_page_links/
  health_worker.ts                        — +1 LinkDef entry

test/
  models/dashboard_metrics.test.ts
  util/dashboard/filters.test.ts
  components/dashboard/widgets.test.ts       — canSee predicates per role
  web/organizations/[organization_id]/dashboard.test.ts
```

### Request flow

```
GET /app/organizations/:id/dashboard?from=2026-04-24&to=2026-04-24
  → routes/app/_middleware.tsx           auth, trx, health_worker
  → routes/app/organizations/[id]/_middleware.ts   attaches organization + organization_employment
  → routes/app/organizations/[id]/dashboard/index.tsx
      1. parse filters from URL (parseDateRange)
      2. filter DASHBOARD_WIDGETS by canSee(organization_employment)
      3. Promise.all(visible.map(w => w.fetch({trx, organization_id, employment}, filters)))
      4. render FilterBar + grid of widgets
```

No new middleware. No new schema. No new background jobs.

---

## 4. Data model

### `db/models/dashboard_metrics.ts`

Three named functions, each returning `Promise<number>`. Independent and composable so future sub-dashboards can reuse individual functions.

```ts
dashboard_metrics.patientsCurrentlyInEncounter(trx, { organization_id })
  // SELECT count(*) FROM patient_encounters
  // WHERE organization_id = $1 AND closed_at IS NULL

dashboard_metrics.encountersInRange(trx, { organization_id, from, to })
  // from, to: Date (non-null; caller is responsible for defaulting)
  // SELECT count(*) FROM patient_encounters
  // WHERE organization_id = $1
  //   AND created_at >= $2          -- start of `from` day
  //   AND created_at <  $3 + INTERVAL '1 day'   -- end of `to` day
  // Calendar-day inclusive semantics (both endpoints count).

dashboard_metrics.staffOnShift(trx, { organization_id })
  // SELECT count(*) FROM employment
  // JOIN employment_presence ON employment_presence.id = employment.id
  // WHERE employment.organization_id = $1
  //   AND employment_presence.at_work = true
```

### Intentional non-features (YAGNI)

1. **No caching.** Counts are cheap and freshness matters for a clinic pulse view. Revisit under measured query pressure, not speculation.
2. **No per-org timezone.** "Today" means server-UTC today. A `TODO` comment in the model flags this for follow-up when per-org timezone lands in the schema.
3. **No "% change from previous period".** Belongs to real sub-dashboards, not the home snapshot.

---

## 5. Widget framework

### Definition

```ts
// util/dashboard/types.ts  — pure types, no component imports
import type { OrganizationEmployment, TrxOrDb } from '../../types.ts'

export type DashboardFilters = {
  date_range: { from: Date | null; to: Date | null }
}

export type WidgetContext = {
  trx: TrxOrDb
  organization_id: string
  employment: OrganizationEmployment
}

export interface WidgetDef<Data> {
  id: string
  canSee(employment: OrganizationEmployment): boolean
  fetch(ctx: WidgetContext, filters: DashboardFilters): Promise<Data>
  render(data: Data): JSX.Element
}
```

```ts
// components/dashboard/widgets/index.ts  — registry
import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { patientsInCareWidget }    from './PatientsInCare.tsx'
import { encountersInRangeWidget } from './EncountersInRange.tsx'
import { staffOnShiftWidget }      from './StaffOnShift.tsx'

export const DASHBOARD_WIDGETS: WidgetDef<unknown>[] = [
  patientsInCareWidget,
  encountersInRangeWidget,
  staffOnShiftWidget,
]
```

Registry lives in `components/` because it imports widget definitions that themselves import JSX-rendering components. Pure types stay in `util/` so models and tests can import them without pulling UI code.

### Design decisions

- **`canSee` is a predicate, not a role list.** Handles "admin or doctor", "any except pharmacist", "is_admin && role === 'nurse'" without a DSL.
- **Filters are passed as one opaque `DashboardFilters` object, not per-filter named arguments.** When filters grow, widgets that don't consume new ones aren't touched. Matches the codebase convention of options-object function signatures.
- **Each widget colocates fetch + render + canSee in one file** under `components/dashboard/widgets/`. Adding a widget = one new file + one import. No scattered coupling.
- **Widgets own their data.** The route does not pre-fetch anything on a widget's behalf. Widgets run in parallel via `Promise.all`.

### Day-one widgets

All three have `canSee: () => true`. The framework proves itself on day one even though no role differentiation is visible yet.

```ts
// patientsInCareWidget — ignores filters
fetch: ({ trx, organization_id }) =>
  dashboard_metrics.patientsCurrentlyInEncounter(trx, { organization_id })

// encountersInRangeWidget — consumes date_range; defaults to today
// todayUtc() lives in util/dashboard/dates.ts — trivial wrapper returning a Date
// at 00:00:00 UTC of the current day.
fetch: ({ trx, organization_id }, { date_range }) => {
  const from = date_range.from ?? todayUtc()
  const to   = date_range.to   ?? todayUtc()
  return dashboard_metrics.encountersInRange(trx, { organization_id, from, to })
}

// staffOnShiftWidget — ignores filters
fetch: ({ trx, organization_id }) =>
  dashboard_metrics.staffOnShift(trx, { organization_id })
```

### Empty-role fallback

If `DASHBOARD_WIDGETS.filter(w => w.canSee(employment))` yields zero widgets for some role, the page renders "No widgets available for your role yet." Not reachable day one — defensive only.

---

## 6. Filter framework

### Design

URL query parameters are the source of truth for filter state. The server parses them into typed values; widgets consume the typed values; changes are expressed as form submissions that re-navigate to the same URL with new params.

- **No JavaScript required** — a plain `<form method="get">` works.
- **No custom islands.** No signals. No debounce. No client state. The browser and the server do all the work.
- **Page is small** — a full-nav GET on filter change re-renders only a few cards. Snappier optimizations (Fresh `<Partial>` / `f-client-nav`) are deliberately skipped to avoid introducing a novel pattern for marginal benefit. If the home page grows large later, revisit.

### `util/dashboard/filters.ts`

Two pure functions:

```ts
export type DateRange = { from: Date | null; to: Date | null }

// Reads `${prefix}from` and `${prefix}to` query params.
// Malformed / missing → null for that bound. No throws — filter values are user input.
export function parseDateRange(url: URL, prefix = ''): DateRange

// Returns the param value if it matches one of `allowed`, else null.
// Whitelist is the validation.
export function parseSelect<T extends string>(
  url: URL,
  param: string,
  allowed: readonly T[],
): T | null
```

### Components

- **`<FilterBar action={pathname}>`** — renders `<form method="get" action={action}>` with children + an "Apply" submit button.
- **`<DateRangeInput value={range} prefix="">`** — two `<input type="date" name="from">` and `name="to"`.
- **`<SelectInput param="" value={v} options={...}>`** — one `<select name={param}>` with `<option>` children.

### Why not ship multi-select or text filters now

Not used by any planned day-one widget. Add when the first sub-dashboard needs one.

### Use in the home route

The home page renders the filter bar with a date-range input because `encountersInRangeWidget` consumes it:

```tsx
<FilterBar action={ctx.url.pathname}>
  <DateRangeInput value={filters.date_range} />
</FilterBar>
```

---

## 7. Route

```tsx
// routes/app/organizations/[organization_id]/dashboard/index.tsx

import { Fragment } from 'preact'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import { OrganizationContext } from '../../../../../types.ts'
import { DASHBOARD_WIDGETS } from '../../../../../components/dashboard/widgets/index.ts'
import type { DashboardFilters } from '../../../../../util/dashboard/types.ts'
import { parseDateRange } from '../../../../../util/dashboard/filters.ts'
import FilterBar from '../../../../../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../../../../../components/dashboard/filters/DateRangeInput.tsx'

export default HealthWorkerHomePage<OrganizationContext>(
  async function Dashboard(ctx) {
    const { trx, organization, organization_employment } = ctx.state
    const filters: DashboardFilters = { date_range: parseDateRange(ctx.url) }

    const visible = DASHBOARD_WIDGETS.filter(w => w.canSee(organization_employment))
    const items = await Promise.all(
      visible.map(async w => ({
        id: w.id,
        element: w.render(await w.fetch(
          { trx, organization_id: organization.id, employment: organization_employment },
          filters,
        )),
      })),
    )

    return {
      title: `${organization.name} Dashboard`,
      children: (
        <>
          <FilterBar action={ctx.url.pathname}>
            <DateRangeInput value={filters.date_range} />
          </FilterBar>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {items.map(({ id, element }) => <Fragment key={id}>{element}</Fragment>)}
          </div>
        </>
      ),
    }
  },
)
```

**Access control**: none beyond what the existing org middleware already enforces ("must be employed at this organization"). The dashboard is not admin-only — role variance will arrive via widget `canSee` predicates, not a route-level gate.

---

## 8. Nav integration

Add one entry to `components/library/sidebar/home_page_links/health_worker.ts`:

```ts
{
  route: '/app/organizations/:organization_id/dashboard',
  title: 'Dashboard',
  Icon: Squares2X2Icon,
},
```

Placed at the top of the list (admins and non-admins alike will check it first). No `is_admin_only` field is added because the dashboard is visible to everyone — consistent with the existing registry shape.

---

## 9. Testing

All tests are DB-first (per project convention); only `external-clients/` is ever mocked.

### `test/models/dashboard_metrics.test.ts`

For each of the three query functions: insert fixtures that include both qualifying and non-qualifying rows (wrong org, closed encounter, out-of-range date, `at_work=false`, etc.), call the function, assert the exact count.

### `test/util/dashboard/filters.test.ts`

Pure-function tests, no DB:
- `parseDateRange` — valid ISO dates, missing params, malformed values, one-sided ranges.
- `parseSelect` — value in whitelist, value not in whitelist, missing param.

### `test/components/dashboard/widgets.test.ts`

Fabricate `OrganizationEmployment` records for each role (doctor, nurse, pharmacist, admin-with-any-role) and assert `canSee` returns the expected boolean for each day-one widget.

### `test/web/organizations/[organization_id]/dashboard.test.ts`

- Employed nurse: page renders, all three card labels are present in the HTML.
- Filter controls render (two `<input type="date">`, one submit button).
- 403 for non-employees is enforced by the existing org middleware and is covered by every per-org route's test — not duplicated here.
- Parametrized filter behavior (e.g. `?from=X&to=Y` changing the count) is verified manually in the browser for the shell; add an automated test once the first real sub-dashboard needs parametrized counts.

---

## 10. Performance notes

- **Server-side work**: 3 queries per page load, each one count with an index-friendly `WHERE`. Expected sub-100ms on a warm DB.
- **Client-side work**: one GET per page load. Page HTML is small (three cards + one form). CSS and JS are cached. No chart library, no SVG-heavy visualizations.
- **Filter changes**: full-nav GET to the same URL with new params. Page HTML re-renders; CSS/JS are cached. No partial-rendering machinery needed for a 3-card page.
- **No polling / websockets / realtime.** Freshness is on-refresh.

---

## 11. Open questions to revisit in follow-on specs

- Per-org timezone for date-range semantics.
- How widgets declare filter dependencies (today all widgets receive all filters; fine while there is one filter, may need rethinking at ≥3).
- Role-aware nav filtering (not needed today — deferred with the admin-only dashboards that will motivate it).
- Whether Fresh `<Partial>` / `f-client-nav` pays off once the home page grows past a few cards — measure before optimizing.
