# Country-wide dashboard widgets — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the weekly trends small-multiples and condition-by-province bubble plot widgets, plus a dedicated `/dashboard-country` route that hosts all three notifiable-condition widgets.

**Architecture:** Hybrid SSR + Fresh islands. Each widget computes deterministic synthetic data on the server (FNV-1a hash, same pattern as the existing `NotifiableConditions` widget), then passes the full payload to a small Fresh island that owns local UI state for search and toggle interactivity. Pure presentational SVG chart components stay framework-agnostic.

**Tech Stack:** Deno 2.6.1 + Fresh 2 + Preact + Signals, SVG charts, deterministic FNV-1a/Mulberry32 hashing for fixture data.

---

## Spec reference

`docs/superpowers/specs/2026-05-01-country-wide-dashboard-widgets-design.md`

## File structure

**Foundation utils**
- `util/dashboard/provinces.ts` — `Province` type, `PROVINCES`, `PROVINCE_LABELS`, `PROVINCE_POPULATION_WEIGHT`, `provinceForOrganization`.
- `util/dashboard/country.ts` — `CountryFilters`, `CountryWidgetDef<Data>`.
- `util/dashboard/notifiable_conditions.ts` — gain shared `PREVALENCE_WEIGHT`, `hashCount`, `expectedCount` helpers (moved from the existing widget).

**Generator**
- `scripts/generate_dashboard_fixtures.ts` — adds `province` field to `Organization` type and to each org definition (no RNG-driven distribution since there are only 4 orgs; we hand-pick provinces so the data is recognisable).
- `fixtures/dashboard/organizations.json` — regenerated with the new field.

**Chart components (pure, server-renderable)**
- `components/dashboard/charts/SmallMultiplesLineChart.tsx`
- `components/dashboard/charts/BubbleMatrix.tsx`

**Country widgets**
- `components/dashboard/widgets/country/NotifiableConditions.tsx` (relocated from `widgets/preview/`).
- `components/dashboard/widgets/country/NotifiableConditionsTrends.tsx`
- `components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx`
- `components/dashboard/widgets/country/index.ts` — `COUNTRY_DASHBOARD_WIDGETS`.

**Islands**
- `islands/dashboard/NotifiableConditionsTrendsIsland.tsx`
- `islands/dashboard/NotifiableConditionsByProvinceIsland.tsx`

**Route**
- `routes/dashboard-country.tsx`

**Modified**
- `components/dashboard/widgets/preview/index.ts` — drop `notifiable_conditions_widget`.
- `components/dashboard/widgets/preview/NotifiableConditions.tsx` — deleted (relocated).

**Tests** (under `test/util/dashboard/` and `test/dashboard/widgets/country/`)
- `test/util/dashboard/provinces.test.ts`
- `test/util/dashboard/notifiable_conditions.test.ts`
- `test/dashboard/widgets/country/notifiable_conditions_trends.test.ts`
- `test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts`

## Province attribution caveat

Bubble plot does **not** join encounters → orgs → provinces. There are only 4 organizations in fixtures (Harare, Bulawayo, Durban, Mutoko); a real join would yield 4 occupied provinces and 5 empty columns. Instead, the widget synthesizes per-(condition, province) counts directly using `PROVINCE_POPULATION_WEIGHT × PREVALENCE_WEIGHT` and the existing FNV-1a hash. The `province` field on `Organization` is added for forward-compatibility with the deferred real-data wiring; nothing in this plan reads it back yet.

## Conventions

- **snake_case** for data fields, **camelCase** for functions, **PascalCase** for types/components.
- **Tests:** Deno's `std/testing/bdd.ts` `describe`/`it` + `std/assert/assert_equals.ts` `assertEquals`. No mocks, no DB hits — pure data tests.
- **Format:** run `deno fmt <files>` after each task that touches code.
- **Type-check:** `deno check <file>` for fast feedback. Project-wide `deno task check` has a known pre-existing s-expression error unrelated to this work; success means "no new errors beyond that one."
- **Commit:** at the end of each task — commit message convention is the imperative-mood `feat:` / `refactor:` / `chore:` style visible in recent commits.

---

## Task 1: Province types and shared util

**Files:**
- Create: `util/dashboard/provinces.ts`
- Create: `test/util/dashboard/provinces.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/util/dashboard/provinces.test.ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  PROVINCE_LABELS,
  PROVINCE_POPULATION_WEIGHT,
  PROVINCES,
  type Province,
} from '../../../util/dashboard/provinces.ts'

describe('util/dashboard/provinces.ts', () => {
  it('PROVINCES contains all 9 SA provinces in display order', () => {
    assertEquals(PROVINCES.length, 9)
    assertEquals(PROVINCES, ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'NC', 'NW', 'WC'])
  })

  it('PROVINCE_LABELS has a full name for every province', () => {
    for (const province of PROVINCES) {
      const label = PROVINCE_LABELS[province]
      assertEquals(typeof label, 'string')
      assertEquals(label.length > 0, true)
    }
    assertEquals(PROVINCE_LABELS.GP, 'Gauteng')
    assertEquals(PROVINCE_LABELS.KZN, 'KwaZulu-Natal')
  })

  it('PROVINCE_POPULATION_WEIGHT covers every province and sums to ~1.0', () => {
    let sum = 0
    for (const p of PROVINCES) {
      const w: number = PROVINCE_POPULATION_WEIGHT[p as Province]
      assertEquals(w > 0, true)
      sum += w
    }
    assertEquals(Math.abs(sum - 1) < 0.001, true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `deno test test/util/dashboard/provinces.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the util**

```ts
// util/dashboard/provinces.ts
// South African provinces used by country-wide notifiable-conditions dashboards.
// Population weights mirror real SA distribution and are reused by widget synthesis
// (e.g. NotifiableConditionsByProvince) so per-province bubble sizes look plausible.

import type { Organization } from '../../scripts/generate_dashboard_fixtures.ts'
import { ORGANIZATIONS } from './fixtures.ts'

export type Province = 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC'

export const PROVINCES: readonly Province[] = ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'NC', 'NW', 'WC'] as const

export const PROVINCE_LABELS: Record<Province, string> = {
  EC: 'Eastern Cape',
  FS: 'Free State',
  GP: 'Gauteng',
  KZN: 'KwaZulu-Natal',
  LP: 'Limpopo',
  MP: 'Mpumalanga',
  NC: 'Northern Cape',
  NW: 'North West',
  WC: 'Western Cape',
}

export const PROVINCE_POPULATION_WEIGHT: Record<Province, number> = {
  GP: 0.26,
  KZN: 0.19,
  WC: 0.12,
  EC: 0.11,
  LP: 0.10,
  MP: 0.08,
  NW: 0.07,
  FS: 0.05,
  NC: 0.02,
}

const ORG_PROVINCE_INDEX = new Map<string, Province>(
  (ORGANIZATIONS as readonly Organization[])
    .filter((o): o is Organization & { province: Province } =>
      typeof (o as Partial<{ province: Province }>).province === 'string'
    )
    .map((o) => [o.id, o.province]),
)

export function provinceForOrganization(organization_id: string): Province | null {
  return ORG_PROVINCE_INDEX.get(organization_id) ?? null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `deno test test/util/dashboard/provinces.test.ts`
Expected: PASS — 3 tests.

Note: `provinceForOrganization` returns `null` until Task 2 adds the field to org fixtures. We'll cover it then.

- [ ] **Step 5: Format & type-check**

```
deno fmt util/dashboard/provinces.ts test/util/dashboard/provinces.test.ts
deno check util/dashboard/provinces.ts
```

- [ ] **Step 6: Commit**

```
git add util/dashboard/provinces.ts test/util/dashboard/provinces.test.ts
git commit -m "feat: add province types and SA population weights for dashboard"
```

---

## Task 2: Add `province` to organization fixtures

**Files:**
- Modify: `scripts/generate_dashboard_fixtures.ts` (Organization type + ORGANIZATIONS)
- Modify: `fixtures/dashboard/organizations.json` (regenerated)
- Modify: `test/util/dashboard/provinces.test.ts` (extend with org coverage)

- [ ] **Step 1: Extend the test**

Append to `test/util/dashboard/provinces.test.ts`:

```ts
import { provinceForOrganization } from '../../../util/dashboard/provinces.ts'

describe('provinceForOrganization', () => {
  it('returns the province for a known org id', () => {
    assertEquals(provinceForOrganization('org_durban'), 'KZN')
  })

  it('returns null for an unknown org id', () => {
    assertEquals(provinceForOrganization('org_does_not_exist'), null)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `deno test test/util/dashboard/provinces.test.ts`
Expected: FAIL — `provinceForOrganization('org_durban')` returns `null` because the fixture doesn't have the field yet.

- [ ] **Step 3: Add `province` to the `Organization` type and existing org definitions**

Edit `scripts/generate_dashboard_fixtures.ts`. Add to the `Organization` type (around line 22):

```ts
type Province = 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC'

type Organization = {
  id: string
  name: string
  category: 'urban' | 'regional' | 'clinic'
  country: string
  city: string
  province: Province | null
  departments: Department[]
}
```

Then update each entry in the `ORGANIZATIONS` array. Only the SA org gets a real province; ZW orgs get `null`:

```ts
const ORGANIZATIONS: Organization[] = [
  {
    id: 'org_harare',
    name: 'Harare Central Hospital',
    category: 'urban',
    country: 'Zimbabwe',
    city: 'Harare',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics', 'surgery', 'cardiology'],
  },
  {
    id: 'org_bulawayo',
    name: 'Bulawayo Regional Medical Center',
    category: 'regional',
    country: 'Zimbabwe',
    city: 'Bulawayo',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics'],
  },
  {
    id: 'org_durban',
    name: 'Durban Regional Medical Center',
    category: 'regional',
    country: 'South Africa',
    city: 'Durban',
    province: 'KZN',
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics'],
  },
  {
    id: 'org_mutoko',
    name: 'Mutoko Rural Clinic',
    category: 'clinic',
    country: 'Zimbabwe',
    city: 'Mutoko',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn'],
  },
]
```

Also export `Province` so `util/dashboard/provinces.ts` can keep importing the same definition (already imported as `Organization` from this file). Add to the existing exports at the bottom or leave the type local — `util/dashboard/provinces.ts` re-defines it. To avoid drift, replace the import in `util/dashboard/provinces.ts` Step 3 with:

```ts
// At the top of util/dashboard/provinces.ts, REMOVE the type re-declaration
// and import Province from the generator instead, IF the generator exports it.
```

If `Province` isn't already exported from the generator, just leave both definitions (they're string-literal unions — TS deduplicates structurally).

- [ ] **Step 4: Regenerate fixtures**

```
deno run -A scripts/generate_dashboard_fixtures.ts
```

Expected: `fixtures/dashboard/organizations.json` updates so each entry has a `province` key.

- [ ] **Step 5: Run test to verify it passes**

Run: `deno test test/util/dashboard/provinces.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 6: Format & type-check**

```
deno fmt scripts/generate_dashboard_fixtures.ts fixtures/dashboard/organizations.json
deno check scripts/generate_dashboard_fixtures.ts util/dashboard/provinces.ts
```

- [ ] **Step 7: Commit**

```
git add scripts/generate_dashboard_fixtures.ts fixtures/dashboard/organizations.json test/util/dashboard/provinces.test.ts
git commit -m "feat: add province field to organization fixtures"
```

---

## Task 3: Move shared notifiable-conditions helpers into the util module

**Files:**
- Modify: `util/dashboard/notifiable_conditions.ts` (add helpers)
- Create: `test/util/dashboard/notifiable_conditions.test.ts`
- Modify: `components/dashboard/widgets/preview/NotifiableConditions.tsx` (import helpers from util)

- [ ] **Step 1: Write the failing test**

```ts
// test/util/dashboard/notifiable_conditions.test.ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  expectedCount,
  hashCount,
  NOTIFIABLE_CONDITIONS,
  PREVALENCE_WEIGHT,
} from '../../../util/dashboard/notifiable_conditions.ts'

describe('util/dashboard/notifiable_conditions.ts', () => {
  it('hashCount is deterministic for same inputs', () => {
    const a = hashCount(100, 'malaria', 50)
    const b = hashCount(100, 'malaria', 50)
    assertEquals(a, b)
  })

  it('hashCount stays inside [0, ceiling)', () => {
    for (let seed = 0; seed < 100; seed++) {
      const v = hashCount(seed, 'tb_pulmonary', 25)
      assertEquals(v >= 0 && v < 25, true)
    }
  })

  it('PREVALENCE_WEIGHT covers every notifiable condition', () => {
    for (const c of NOTIFIABLE_CONDITIONS) {
      const w = PREVALENCE_WEIGHT[c.key]
      assertEquals(typeof w, 'number')
      assertEquals(w > 0, true)
    }
  })

  it('expectedCount is deterministic per (seed, condition)', () => {
    const tb = NOTIFIABLE_CONDITIONS.find((c) => c.key === 'tb_pulmonary')!
    assertEquals(expectedCount(500, tb), expectedCount(500, tb))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `deno test test/util/dashboard/notifiable_conditions.test.ts`
Expected: FAIL — `hashCount`, `expectedCount`, `PREVALENCE_WEIGHT` don't exist on the module yet.

- [ ] **Step 3: Move helpers from the widget to the util module**

Append to `util/dashboard/notifiable_conditions.ts` (after the existing `NOTIFIABLE_CONDITIONS` const):

```ts
// FNV-1a hash so synthesized counts are stable per (seed, key).
export function hashCount(seed: number, key: string, ceiling: number): number {
  let hash = 0x811c9dc5 ^ seed
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ceiling <= 0 ? 0 : (hash >>> 0) % ceiling
}

// Prevalence weight per condition. Conditions with broad surveillance (TB, Malaria, Hep B)
// skew higher; rare ones (Diphtheria, Cholera) sit near the floor. Used to scale ceilings
// in expectedCount and downstream synthesis (trends, by-province).
export const PREVALENCE_WEIGHT: Record<string, number> = {
  // Cat 1
  cholera: 0.5,
  covid_19: 5,
  diphtheria: 1,
  malaria: 25,
  measles: 4,
  mpox: 1,
  pertussis: 3,
  rubella: 1,
  // Cat 2
  agricultural_or_stock_remedy_poisoning: 0.8,
  bilharzia: 12,
  brucellosis: 0.6,
  congenital_rubella_syndrome: 0.4,
  congenital_syphilis: 6,
  haemophilus_influenzae_type_b: 0.7,
  hepatitis_a: 8,
  hepatitis_b: 14,
  hepatitis_c: 4,
  hepatitis_e: 0.6,
  lead_poisoning: 0.6,
  legionellosis: 0.5,
  leprosy: 0.4,
  maternal_death: 1,
  mercury_poisoning: 0.4,
  sth_ascariasis: 2,
  sth_trichuriasis: 1.5,
  sth_ancylostoma: 1,
  sth_necator: 0.8,
  tetanus: 0.5,
  tb_pulmonary: 60,
  tb_extrapulmonary: 18,
  tb_mdr: 4,
  tb_xdr: 1,
}

// Expected case count for the bar-chart widget. Scales with encounter pool size.
export function expectedCount(seed: number, condition: NotifiableCondition): number {
  const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
  const ceiling = Math.max(2, Math.round(seed * weight / 100))
  return hashCount(seed + condition.snomed_id.length, condition.key, ceiling + 1)
}
```

- [ ] **Step 4: Update existing widget to use shared helpers**

Edit `components/dashboard/widgets/preview/NotifiableConditions.tsx`:

Remove the local `hashCount`, `expectedCount`, and `PREVALENCE_WEIGHT` definitions. Update the imports:

```ts
import {
  expectedCount,
  NOTIFIABLE_CONDITIONS,
  type NotifiableCondition,
} from '../../../../util/dashboard/notifiable_conditions.ts'
```

- [ ] **Step 5: Run all related tests to verify they pass**

```
deno test test/util/dashboard/notifiable_conditions.test.ts
deno check util/dashboard/notifiable_conditions.ts components/dashboard/widgets/preview/NotifiableConditions.tsx
```

Expected: PASS — 4 tests; no new type errors.

- [ ] **Step 6: Format**

```
deno fmt util/dashboard/notifiable_conditions.ts components/dashboard/widgets/preview/NotifiableConditions.tsx test/util/dashboard/notifiable_conditions.test.ts
```

- [ ] **Step 7: Commit**

```
git add util/dashboard/notifiable_conditions.ts components/dashboard/widgets/preview/NotifiableConditions.tsx test/util/dashboard/notifiable_conditions.test.ts
git commit -m "refactor: move notifiable-condition helpers into shared util"
```

---

## Task 4: Country widget contract

**Files:**
- Create: `util/dashboard/country.ts`

- [ ] **Step 1: Implement the type module**

There's no real test here — these are pure type definitions. `deno check` provides the verification.

```ts
// util/dashboard/country.ts
import type { JSX } from 'preact'
import type { DateRange } from './types.ts'

export type CountryFilters = {
  date_range: DateRange
}

export type CountryWidgetDef<Data> = {
  id: string
  title: string
  // Width in 12-column grid units. Defaults to 4. Country widgets typically use 12.
  span?: number
  fetch: (filters: CountryFilters) => Data
  render: (data: Data) => JSX.Element
}
```

- [ ] **Step 2: Type-check & format**

```
deno check util/dashboard/country.ts
deno fmt util/dashboard/country.ts
```

- [ ] **Step 3: Commit**

```
git add util/dashboard/country.ts
git commit -m "feat: add CountryFilters and CountryWidgetDef types"
```

---

## Task 5: Relocate `NotifiableConditions` to country widgets folder

**Files:**
- Create: `components/dashboard/widgets/country/NotifiableConditions.tsx`
- Create: `components/dashboard/widgets/country/index.ts`
- Modify: `components/dashboard/widgets/preview/index.ts`
- Delete: `components/dashboard/widgets/preview/NotifiableConditions.tsx`

- [ ] **Step 1: Create the new file using `CountryWidgetDef`**

```tsx
// components/dashboard/widgets/country/NotifiableConditions.tsx
import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { ENCOUNTERS } from '../../../../util/dashboard/fixtures.ts'
import {
  expectedCount,
  NOTIFIABLE_CONDITIONS,
  type NotifiableCondition,
} from '../../../../util/dashboard/notifiable_conditions.ts'
import WidgetCard from '../../WidgetCard.tsx'
import StackedBarChart from '../../charts/StackedBarChart.tsx'

const CATEGORY_COLORS: Record<1 | 2, string> = {
  1: '#dc2626',
  2: '#1d4ed8',
}

const CATEGORY_LABELS: Record<1 | 2, string> = {
  1: 'NMC Category 1 (acute / outbreak-prone)',
  2: 'NMC Category 2 (endemic / chronic)',
}

type Row = { condition: NotifiableCondition; count: number }
type Data = { rows: readonly Row[]; total: number }

function filteredEncounterCount(filters: { date_range: { from: Date | null; to: Date | null } }): number {
  const from_iso = filters.date_range.from?.toISOString() ?? null
  const to_iso = filters.date_range.to ? endOfDayIso(filters.date_range.to) : null
  let count = 0
  for (const enc of ENCOUNTERS) {
    if (from_iso && enc.created_at < from_iso) continue
    if (to_iso && enc.created_at >= to_iso) continue
    count++
  }
  return count
}

function endOfDayIso(d: Date): string {
  const next = new Date(d)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString()
}

export const notifiable_conditions_widget: CountryWidgetDef<Data> = {
  id: 'notifiable_conditions',
  title: 'Notifiable conditions',
  span: 12,
  fetch: (filters) => {
    const seed = filteredEncounterCount(filters)
    const rows: Row[] = NOTIFIABLE_CONDITIONS
      .map((condition) => ({ condition, count: expectedCount(seed, condition) }))
      .sort((a, b) => b.count - a.count)
    const total = rows.reduce((s, r) => s + r.count, 0)
    return { rows, total }
  },
  render: ({ rows, total }) => (
    <WidgetCard
      title='Notifiable conditions'
      subtitle={`Country-wide case counts across ${rows.length} conditions — ${total.toLocaleString()} confirmed total`}
    >
      <StackedBarChart
        rows={rows.map(({ condition, count }) => ({
          label: condition.label,
          segments: [{
            key: String(condition.nmc_category),
            label: CATEGORY_LABELS[condition.nmc_category],
            value: count,
            color: CATEGORY_COLORS[condition.nmc_category],
          }],
        }))}
        legend={[
          { key: '1', label: CATEGORY_LABELS[1], color: CATEGORY_COLORS[1] },
          { key: '2', label: CATEGORY_LABELS[2], color: CATEGORY_COLORS[2] },
        ]}
      />
    </WidgetCard>
  ),
}
```

- [ ] **Step 2: Create the country widget index (single entry for now)**

```ts
// components/dashboard/widgets/country/index.ts
import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
```

- [ ] **Step 3: Drop the widget from the preview index**

Edit `components/dashboard/widgets/preview/index.ts`. Remove the `import` line for `notifiable_conditions_widget` and remove `notifiable_conditions_widget,` from the `PREVIEW_DASHBOARD_WIDGETS` array.

- [ ] **Step 4: Delete the old widget file**

```
git rm components/dashboard/widgets/preview/NotifiableConditions.tsx
```

- [ ] **Step 5: Type-check**

```
deno check components/dashboard/widgets/country/NotifiableConditions.tsx components/dashboard/widgets/country/index.ts components/dashboard/widgets/preview/index.ts
```

Expected: clean.

- [ ] **Step 6: Format**

```
deno fmt components/dashboard/widgets/country/NotifiableConditions.tsx components/dashboard/widgets/country/index.ts components/dashboard/widgets/preview/index.ts
```

- [ ] **Step 7: Commit**

```
git add components/dashboard/widgets/country components/dashboard/widgets/preview/index.ts
git commit -m "refactor: relocate NotifiableConditions to country widgets folder"
```

---

## Task 6: `/dashboard-country` route shell

**Files:**
- Create: `routes/dashboard-country.tsx`

- [ ] **Step 1: Implement the route**

```tsx
// routes/dashboard-country.tsx
import { Fragment } from 'preact'
import { PageProps } from 'fresh'
import FilterBar from '../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../components/dashboard/filters/DateRangeInput.tsx'
import { parseDateRange } from '../util/dashboard/filters.ts'
import type { CountryFilters } from '../util/dashboard/country.ts'
import { COUNTRY_DASHBOARD_WIDGETS } from '../components/dashboard/widgets/country/index.ts'

function spanClass(span: number | undefined): string {
  switch (span ?? 4) {
    case 12:
      return 'col-span-12'
    case 6:
      return 'col-span-12 lg:col-span-6'
    case 8:
      return 'col-span-12 lg:col-span-8'
    case 3:
      return 'col-span-12 sm:col-span-6 lg:col-span-3'
    default:
      return 'col-span-12 sm:col-span-6 lg:col-span-4'
  }
}

export default function DashboardCountry({ url }: PageProps) {
  const date_range = parseDateRange(url)
  const filters: CountryFilters = { date_range }

  const items = COUNTRY_DASHBOARD_WIDGETS.map((widget) => ({
    id: widget.id,
    span: widget.span,
    element: widget.render(widget.fetch(filters)),
  }))

  return (
    <div class='min-h-screen bg-gray-50 p-6'>
      <div class='mx-auto max-w-7xl'>
        <h1 class='mb-1 text-2xl font-semibold text-gray-900'>Country-wide surveillance</h1>
        <p class='mb-4 text-sm text-gray-500'>
          Standalone preview of the country-wide notifiable-conditions dashboard. Data is loaded from{' '}
          <code>fixtures/dashboard/*.json</code> — regenerate with{' '}
          <code>deno run -A scripts/generate_dashboard_fixtures.ts</code>.
        </p>
        <FilterBar action={url.pathname}>
          <DateRangeInput value={date_range} />
        </FilterBar>
        <div class='mt-4 grid grid-cols-12 gap-4'>
          {items.map(({ id, span, element }) => (
            <div key={id} class={spanClass(span)}>
              <Fragment>{element}</Fragment>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check & format**

```
deno check routes/dashboard-country.tsx
deno fmt routes/dashboard-country.tsx
```

- [ ] **Step 3: Manual smoke**

Run `deno task start`, hit `http://localhost:8000/dashboard-country`. Expected: Notifiable Conditions bar chart visible. `/dashboard-preview` no longer shows it.

- [ ] **Step 4: Commit**

```
git add routes/dashboard-country.tsx
git commit -m "feat: add /dashboard-country route hosting notifiable-conditions widgets"
```

---

## Task 7: `SmallMultiplesLineChart` chart component

**Files:**
- Create: `components/dashboard/charts/SmallMultiplesLineChart.tsx`

This is a presentational component; we exercise it through the widget tests. No standalone test.

- [ ] **Step 1: Implement the chart**

```tsx
// components/dashboard/charts/SmallMultiplesLineChart.tsx
import type { LineSeries } from './LineChart.tsx'

export type SmallMultiplesRow = {
  key: string
  label: string
  series: readonly LineSeries[]
  expected_band?: { lower: readonly number[]; upper: readonly number[] }
}

export type SmallMultiplesProps = {
  x_labels: readonly string[]
  rows: readonly SmallMultiplesRow[]
  format?: (n: number) => string
  row_height?: number
}

const PADDING_LEFT = 120
const PADDING_RIGHT = 12
const PADDING_TOP = 8
const X_AXIS_HEIGHT = 24

export default function SmallMultiplesLineChart(
  { x_labels, rows, format, row_height = 64 }: SmallMultiplesProps,
) {
  if (rows.length === 0 || x_labels.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  const fmt = format ?? ((v: number) => v.toLocaleString())
  const width = 960
  const height = PADDING_TOP + rows.length * row_height + X_AXIS_HEIGHT
  const inner_w = width - PADDING_LEFT - PADDING_RIGHT
  const max_x = Math.max(0, x_labels.length - 1)

  function xCoord(i: number): number {
    if (max_x === 0) return PADDING_LEFT
    return PADDING_LEFT + (i / max_x) * inner_w
  }

  const x_tick_indices = max_x <= 1 ? [0, max_x] : [0, Math.floor(max_x / 2), max_x]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} class='w-full' role='img' aria-label='Small multiples line chart'>
      {rows.map((row, row_idx) => {
        const top = PADDING_TOP + row_idx * row_height
        const inner_h = row_height - 8
        const all_values = [
          ...row.series.flatMap((s) => s.points),
          ...(row.expected_band ? [...row.expected_band.upper] : []),
        ]
        const max = all_values.reduce((m, v) => Math.max(m, v), 0) || 1

        function yCoord(v: number): number {
          return top + (1 - v / max) * inner_h
        }

        const band_path = row.expected_band
          ? [
            ...row.expected_band.upper.map((v, i) => `${i === 0 ? 'M' : 'L'}${xCoord(i).toFixed(1)},${yCoord(v).toFixed(1)}`),
            ...row.expected_band.lower
              .map((v, i) => `L${xCoord(row.expected_band!.lower.length - 1 - i).toFixed(1)},${yCoord(row.expected_band!.lower[row.expected_band!.lower.length - 1 - i]).toFixed(1)}`),
            'Z',
          ].join(' ')
          : null

        return (
          <g key={row.key}>
            <text x={PADDING_LEFT - 8} y={top + inner_h / 2 + 4} textAnchor='end' class='fill-gray-700 text-[11px] font-medium'>
              {row.label}
            </text>
            <line
              x1={PADDING_LEFT}
              x2={width - PADDING_RIGHT}
              y1={top + inner_h}
              y2={top + inner_h}
              stroke='#e5e7eb'
              strokeWidth={1}
            />
            <text x={PADDING_LEFT - 4} y={top + 8} textAnchor='end' class='fill-gray-400 text-[9px]'>
              {fmt(max)}
            </text>
            {band_path && <path d={band_path} fill='#fde68a' fillOpacity={0.4} stroke='none' />}
            {row.series.map((s, i) => {
              const path = s.points
                .map((v, idx) => `${idx === 0 ? 'M' : 'L'}${xCoord(idx).toFixed(1)},${yCoord(v).toFixed(1)}`)
                .join(' ')
              return (
                <path
                  key={s.key}
                  d={path}
                  stroke={s.color}
                  strokeWidth={1.4}
                  strokeDasharray={i === 1 ? '3 3' : undefined}
                  fill='none'
                />
              )
            })}
          </g>
        )
      })}
      {x_tick_indices.map((i) => {
        const label = x_labels.at(i)
        if (!label) return null
        return (
          <text
            key={`x-${i}`}
            x={xCoord(i)}
            y={height - 6}
            textAnchor='middle'
            class='fill-gray-500 text-[10px]'
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 2: Type-check & format**

```
deno check components/dashboard/charts/SmallMultiplesLineChart.tsx
deno fmt components/dashboard/charts/SmallMultiplesLineChart.tsx
```

- [ ] **Step 3: Commit**

```
git add components/dashboard/charts/SmallMultiplesLineChart.tsx
git commit -m "feat: add SmallMultiplesLineChart component"
```

---

## Task 8: `BubbleMatrix` chart component

**Files:**
- Create: `components/dashboard/charts/BubbleMatrix.tsx`

- [ ] **Step 1: Implement the chart**

```tsx
// components/dashboard/charts/BubbleMatrix.tsx
export type BubbleCell = { col_key: string; value: number }

export type BubbleRow = {
  key: string
  label: string
  color: string
  cells: readonly BubbleCell[]
}

export type BubbleMatrixProps = {
  col_keys: readonly string[]
  col_labels: readonly string[]
  rows: readonly BubbleRow[]
  reference_sizes?: readonly number[]
}

const ROW_HEIGHT = 32
const COL_WIDTH = 64
const PADDING_LEFT = 220
const PADDING_TOP = 56
const PADDING_RIGHT = 140
const PADDING_BOTTOM = 24
const CELL_RADIUS_MAX = 14

export default function BubbleMatrix(
  { col_keys, col_labels, rows, reference_sizes }: BubbleMatrixProps,
) {
  if (rows.length === 0 || col_keys.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  const width = PADDING_LEFT + col_keys.length * COL_WIDTH + PADDING_RIGHT
  const height = PADDING_TOP + rows.length * ROW_HEIGHT + PADDING_BOTTOM

  let max = 0
  for (const row of rows) for (const cell of row.cells) if (cell.value > max) max = cell.value
  if (max === 0) max = 1

  function radius(value: number): number {
    if (value <= 0) return 0
    return Math.sqrt(value / max) * CELL_RADIUS_MAX
  }

  const visible_values: number[] = []
  for (const row of rows) for (const cell of row.cells) if (cell.value > 0) visible_values.push(cell.value)
  visible_values.sort((a, b) => a - b)
  function quantile(p: number): number {
    if (visible_values.length === 0) return 0
    const idx = Math.min(visible_values.length - 1, Math.floor(p * visible_values.length))
    return visible_values[idx]
  }
  const legend_sizes = reference_sizes ?? [
    Math.max(1, Math.round(quantile(0.5))),
    Math.max(2, Math.round(quantile(0.9))),
    Math.max(3, max),
  ]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} class='w-full' role='img' aria-label='Bubble matrix'>
      {col_keys.map((key, i) => {
        const cx = PADDING_LEFT + i * COL_WIDTH + COL_WIDTH / 2
        return (
          <text
            key={`col-${key}`}
            x={cx}
            y={PADDING_TOP - 16}
            textAnchor='start'
            transform={`rotate(-45 ${cx} ${PADDING_TOP - 16})`}
            class='fill-gray-600 text-[11px]'
          >
            {col_labels[i] ?? key}
          </text>
        )
      })}
      {rows.map((row, row_idx) => {
        const cy = PADDING_TOP + row_idx * ROW_HEIGHT + ROW_HEIGHT / 2
        const cells_by_col = new Map(row.cells.map((c) => [c.col_key, c.value]))
        return (
          <g key={row.key}>
            <text x={PADDING_LEFT - 12} y={cy + 4} textAnchor='end' class='fill-gray-700 text-[11px]'>
              {row.label}
            </text>
            {col_keys.map((col, col_idx) => {
              const value = cells_by_col.get(col) ?? 0
              if (value <= 0) return null
              const cx = PADDING_LEFT + col_idx * COL_WIDTH + COL_WIDTH / 2
              return (
                <circle
                  key={`${row.key}-${col}`}
                  cx={cx}
                  cy={cy}
                  r={radius(value)}
                  fill={row.color}
                  fillOpacity={0.7}
                  stroke={row.color}
                  strokeWidth={0.5}
                >
                  <title>{`${row.label} — ${col_labels[col_idx] ?? col}: ${value.toLocaleString()}`}</title>
                </circle>
              )
            })}
          </g>
        )
      })}
      {legend_sizes.map((size, i) => {
        const r = radius(size)
        const x = width - PADDING_RIGHT + 24 + i * 38
        const y = PADDING_TOP + rows.length * ROW_HEIGHT - 16
        return (
          <g key={`legend-${i}`}>
            <circle cx={x} cy={y} r={r} fill='#9ca3af' fillOpacity={0.4} stroke='#6b7280' strokeWidth={0.5} />
            <text x={x} y={y + r + 12} textAnchor='middle' class='fill-gray-500 text-[10px]'>
              n = {size.toLocaleString()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
```

- [ ] **Step 2: Type-check & format**

```
deno check components/dashboard/charts/BubbleMatrix.tsx
deno fmt components/dashboard/charts/BubbleMatrix.tsx
```

- [ ] **Step 3: Commit**

```
git add components/dashboard/charts/BubbleMatrix.tsx
git commit -m "feat: add BubbleMatrix chart component"
```

---

## Task 9: `NotifiableConditionsTrends` widget data

**Files:**
- Create: `components/dashboard/widgets/country/NotifiableConditionsTrends.tsx` (data + temporary placeholder render)
- Create: `test/dashboard/widgets/country/notifiable_conditions_trends.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/dashboard/widgets/country/notifiable_conditions_trends.test.ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { notifiable_conditions_trends_widget } from '../../../../components/dashboard/widgets/country/NotifiableConditionsTrends.tsx'

const empty_filters = { date_range: { from: null, to: null } }

describe('notifiable_conditions_trends_widget.fetch', () => {
  it('produces 156 weeks', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.weeks.length, 156)
  })

  it('produces 32 condition rows', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.rows.length, 32)
  })

  it('confirms each row has weeks-many points for both series', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    for (const row of data.rows) {
      assertEquals(row.confirmed.length, data.weeks.length)
      assertEquals(row.suspected.length, data.weeks.length)
    }
  })

  it('default_keys is the 8 Cat-1 conditions', () => {
    const data = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(data.default_keys.length, 8)
    for (const key of data.default_keys) {
      const row = data.rows.find((r) => r.condition_key === key)
      assertEquals(row?.nmc_category, 1)
    }
  })

  it('output is deterministic', () => {
    const a = notifiable_conditions_trends_widget.fetch(empty_filters)
    const b = notifiable_conditions_trends_widget.fetch(empty_filters)
    assertEquals(a.rows[0].confirmed, b.rows[0].confirmed)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `deno test test/dashboard/widgets/country/notifiable_conditions_trends.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the widget (placeholder render — replaced in Task 11)**

```tsx
// components/dashboard/widgets/country/NotifiableConditionsTrends.tsx
// Synthesizes 3 years (156 weeks) of deterministic case counts per notifiable condition.
// Weeks use ISO-8601 (Monday start). The trends widget hands the full payload to a Fresh
// island that owns search + chip-toggle UI; chart row count is filtered client-side.

import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import {
  hashCount,
  NOTIFIABLE_CONDITIONS,
  PREVALENCE_WEIGHT,
  type NotifiableCategory,
} from '../../../../util/dashboard/notifiable_conditions.ts'
import WidgetCard from '../../WidgetCard.tsx'

const WEEKS = 156

export type TrendsRow = {
  condition_key: string
  condition_label: string
  nmc_category: NotifiableCategory
  confirmed: readonly number[]
  suspected: readonly number[]
}

export type TrendsData = {
  weeks: readonly string[]
  rows: readonly TrendsRow[]
  default_keys: readonly string[]
}

function isoWeekLabels(end: Date, count: number): string[] {
  // Walk back `count` Mondays from the ISO week containing `end`.
  const out: string[] = []
  const cursor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
  // Move cursor to the Monday of its ISO week.
  const dow = cursor.getUTCDay()
  const monday_offset = (dow + 6) % 7
  cursor.setUTCDate(cursor.getUTCDate() - monday_offset)
  for (let i = 0; i < count; i++) {
    const { year, week } = isoWeekParts(cursor)
    out.unshift(`${year}-W${String(week).padStart(2, '0')}`)
    cursor.setUTCDate(cursor.getUTCDate() - 7)
  }
  return out
}

function isoWeekParts(d: Date): { year: number; week: number } {
  // ISO-8601 week date calculation (Thursday in same week determines year).
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const year_start = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((target.getTime() - year_start.getTime()) / 86400000) + 1) / 7)
  return { year: target.getUTCFullYear(), week }
}

function syntheticHash01(seed: number, key: string, salt: number): number {
  let hash = 0x811c9dc5 ^ (seed + salt)
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ((hash >>> 0) % 1000) / 1000
}

export const notifiable_conditions_trends_widget: CountryWidgetDef<TrendsData> = {
  id: 'notifiable_conditions_trends',
  title: 'Weekly trends',
  span: 12,
  fetch: (filters) => {
    const end = filters.date_range.to ?? new Date()
    const weeks = isoWeekLabels(end, WEEKS)
    const rows: TrendsRow[] = NOTIFIABLE_CONDITIONS.map((condition) => {
      const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
      const confirmed: number[] = []
      const suspected: number[] = []
      for (let i = 0; i < weeks.length; i++) {
        const ceiling = Math.max(2, Math.round(weight * 0.6))
        const c = hashCount(i, condition.key, ceiling + 1)
        const noise = 0.25 + syntheticHash01(i, condition.key, 7919)
        confirmed.push(c)
        suspected.push(Math.round(c * noise))
      }
      return {
        condition_key: condition.key,
        condition_label: condition.label,
        nmc_category: condition.nmc_category,
        confirmed,
        suspected,
      }
    })
    const default_keys = NOTIFIABLE_CONDITIONS
      .filter((c) => c.nmc_category === 1)
      .map((c) => c.key)
    return { weeks, rows, default_keys }
  },
  render: (data) => (
    <WidgetCard title='Weekly trends' subtitle={`${data.rows.length} notifiable conditions over ${data.weeks.length} weeks`}>
      <div class='text-sm text-gray-500'>Island wired up in Task 11.</div>
    </WidgetCard>
  ),
}
```

- [ ] **Step 4: Run test to verify it passes**

```
deno test test/dashboard/widgets/country/notifiable_conditions_trends.test.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 5: Type-check & format**

```
deno check components/dashboard/widgets/country/NotifiableConditionsTrends.tsx
deno fmt components/dashboard/widgets/country/NotifiableConditionsTrends.tsx test/dashboard/widgets/country/notifiable_conditions_trends.test.ts
```

- [ ] **Step 6: Commit**

```
git add components/dashboard/widgets/country/NotifiableConditionsTrends.tsx test/dashboard/widgets/country/notifiable_conditions_trends.test.ts
git commit -m "feat: synthesize weekly trend data for notifiable conditions"
```

---

## Task 10: `NotifiableConditionsTrendsIsland`

**Files:**
- Create: `islands/dashboard/NotifiableConditionsTrendsIsland.tsx`

Islands are interactive — full coverage requires DOM testing infra we don't have here. Verification is manual smoke; type-checking + the data-tier tests give us the safety net.

- [ ] **Step 1: Implement the island**

```tsx
// islands/dashboard/NotifiableConditionsTrendsIsland.tsx
import { useSignal } from '@preact/signals'
import SmallMultiplesLineChart from '../../components/dashboard/charts/SmallMultiplesLineChart.tsx'
import type { TrendsData } from '../../components/dashboard/widgets/country/NotifiableConditionsTrends.tsx'

const CONFIRMED_COLOR = '#dc2626'
const SUSPECTED_COLOR = '#f87171'

export type NotifiableConditionsTrendsIslandProps = {
  data: TrendsData
}

export default function NotifiableConditionsTrendsIsland(
  { data }: NotifiableConditionsTrendsIslandProps,
) {
  const query = useSignal('')
  const selected_keys = useSignal<readonly string[]>(data.default_keys)

  const all_rows = data.rows
  const all_keys_set = new Set(all_rows.map((r) => r.condition_key))
  const selected_set = new Set(selected_keys.value)

  function toggle(key: string) {
    if (!all_keys_set.has(key)) return
    selected_keys.value = selected_set.has(key)
      ? selected_keys.value.filter((k) => k !== key)
      : [...selected_keys.value, key]
  }

  function reset() {
    selected_keys.value = data.default_keys
    query.value = ''
  }

  const q = query.value.trim().toLowerCase()
  const matches = q
    ? all_rows.filter((r) => !selected_set.has(r.condition_key) && r.condition_label.toLowerCase().includes(q))
    : []

  const visible_rows = all_rows
    .filter((r) => selected_set.has(r.condition_key))
    .map((r) => ({
      key: r.condition_key,
      label: r.condition_label,
      series: [
        { key: 'confirmed', label: 'Confirmed', color: CONFIRMED_COLOR, points: r.confirmed },
        { key: 'suspected', label: 'Suspected', color: SUSPECTED_COLOR, points: r.suspected },
      ],
    }))

  return (
    <div class='space-y-3'>
      <div class='flex flex-wrap items-center gap-2'>
        <input
          type='search'
          placeholder='Search conditions…'
          value={query.value}
          onInput={(e) => (query.value = (e.target as HTMLInputElement).value)}
          class='w-64 rounded border border-gray-300 px-2 py-1 text-sm'
        />
        <span class='text-xs text-gray-500'>
          {selected_keys.value.length} of {all_rows.length} shown
        </span>
        <button
          type='button'
          onClick={reset}
          class='rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200'
        >
          Reset
        </button>
      </div>

      {matches.length > 0 && (
        <ul class='flex flex-wrap gap-1.5'>
          {matches.map((m) => (
            <li key={m.condition_key}>
              <button
                type='button'
                onClick={() => toggle(m.condition_key)}
                class='rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100'
              >
                + {m.condition_label}
              </button>
            </li>
          ))}
        </ul>
      )}
      {q && matches.length === 0 && (
        <div class='text-xs text-gray-500'>No matching conditions.</div>
      )}

      <ul class='flex flex-wrap gap-1.5'>
        {selected_keys.value.map((k) => {
          const row = all_rows.find((r) => r.condition_key === k)
          if (!row) return null
          return (
            <li key={k}>
              <button
                type='button'
                onClick={() => toggle(k)}
                class='rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200'
              >
                {row.condition_label} ✕
              </button>
            </li>
          )
        })}
      </ul>

      {visible_rows.length === 0
        ? <div class='text-sm text-gray-500'>Select a condition to view trends.</div>
        : (
          <SmallMultiplesLineChart
            x_labels={data.weeks}
            rows={visible_rows}
          />
        )}
    </div>
  )
}
```

- [ ] **Step 2: Type-check & format**

```
deno check islands/dashboard/NotifiableConditionsTrendsIsland.tsx
deno fmt islands/dashboard/NotifiableConditionsTrendsIsland.tsx
```

- [ ] **Step 3: Commit**

```
git add islands/dashboard/NotifiableConditionsTrendsIsland.tsx
git commit -m "feat: add NotifiableConditionsTrendsIsland with search and chip toggling"
```

---

## Task 11: Wire trends widget render into the route

**Files:**
- Modify: `components/dashboard/widgets/country/NotifiableConditionsTrends.tsx`
- Modify: `components/dashboard/widgets/country/index.ts`

- [ ] **Step 1: Replace the placeholder render**

Edit `components/dashboard/widgets/country/NotifiableConditionsTrends.tsx`. Replace the render function:

```tsx
import NotifiableConditionsTrendsIsland from '../../../../islands/dashboard/NotifiableConditionsTrendsIsland.tsx'
```

```tsx
  render: (data) => (
    <WidgetCard
      title='Weekly trends'
      subtitle={`${data.rows.length} notifiable conditions over ${data.weeks.length} weeks — search to add or remove`}
    >
      <NotifiableConditionsTrendsIsland data={data} />
    </WidgetCard>
  ),
```

- [ ] **Step 2: Add to `COUNTRY_DASHBOARD_WIDGETS`**

Edit `components/dashboard/widgets/country/index.ts`:

```ts
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'
import { notifiable_conditions_trends_widget } from './NotifiableConditionsTrends.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
  notifiable_conditions_trends_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
```

- [ ] **Step 3: Type-check, format, smoke**

```
deno check components/dashboard/widgets/country/NotifiableConditionsTrends.tsx components/dashboard/widgets/country/index.ts
deno fmt components/dashboard/widgets/country/NotifiableConditionsTrends.tsx components/dashboard/widgets/country/index.ts
```

Smoke test: `deno task start`, hit `/dashboard-country`. Expected:
- 8 condition rows visible by default in the trends widget.
- Typing "tb" reveals TB-related options.
- Clicking adds them.
- "Reset" returns to the 8 default rows.

- [ ] **Step 4: Commit**

```
git add components/dashboard/widgets/country/NotifiableConditionsTrends.tsx components/dashboard/widgets/country/index.ts
git commit -m "feat: wire trends widget render to interactive island"
```

---

## Task 12: `NotifiableConditionsByProvince` widget data

**Files:**
- Create: `components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx` (data + temporary placeholder render)
- Create: `test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { notifiable_conditions_by_province_widget } from '../../../../components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx'
import { PROVINCES } from '../../../../util/dashboard/provinces.ts'

const empty_filters = { date_range: { from: null, to: null } }

describe('notifiable_conditions_by_province_widget.fetch', () => {
  it('returns provinces in canonical order', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(data.provinces, [...PROVINCES])
  })

  it('emits 32 condition rows', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(data.rows.length, 32)
  })

  it('each row has 9 cells, one per province', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    for (const row of data.rows) {
      assertEquals(row.cells.length, 9)
      assertEquals(row.cells.map((c) => c.province), [...PROVINCES])
    }
  })

  it('split is 8 Cat-1 and 24 Cat-2 rows', () => {
    const data = notifiable_conditions_by_province_widget.fetch(empty_filters)
    const cat1 = data.rows.filter((r) => r.nmc_category === 1).length
    const cat2 = data.rows.filter((r) => r.nmc_category === 2).length
    assertEquals(cat1, 8)
    assertEquals(cat2, 24)
  })

  it('output is deterministic', () => {
    const a = notifiable_conditions_by_province_widget.fetch(empty_filters)
    const b = notifiable_conditions_by_province_widget.fetch(empty_filters)
    assertEquals(a.rows[0].cells, b.rows[0].cells)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `deno test test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the widget (placeholder render — replaced in Task 14)**

```tsx
// components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx
// Synthesizes per-(condition, province) case counts using PREVALENCE_WEIGHT × PROVINCE_POPULATION_WEIGHT.
// The fixture pool only includes 4 organizations spread across 2 countries, so we don't join
// encounters → orgs → provinces — the bubble plot would be sparse. The 9-province axis is
// purely categorical here; real attribution is deferred to the encounter/SNOMED wiring effort.

import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import {
  hashCount,
  NOTIFIABLE_CONDITIONS,
  PREVALENCE_WEIGHT,
  type NotifiableCategory,
} from '../../../../util/dashboard/notifiable_conditions.ts'
import {
  PROVINCE_POPULATION_WEIGHT,
  PROVINCES,
  type Province,
} from '../../../../util/dashboard/provinces.ts'
import WidgetCard from '../../WidgetCard.tsx'

export type ProvinceCell = { province: Province; confirmed: number; suspected: number }

export type ProvinceRow = {
  condition_key: string
  condition_label: string
  nmc_category: NotifiableCategory
  cells: readonly ProvinceCell[]
}

export type ProvinceData = {
  provinces: readonly Province[]
  rows: readonly ProvinceRow[]
}

function syntheticHash01(seed: number, key: string, salt: number): number {
  let hash = 0x811c9dc5 ^ (seed + salt)
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ((hash >>> 0) % 1000) / 1000
}

export const notifiable_conditions_by_province_widget: CountryWidgetDef<ProvinceData> = {
  id: 'notifiable_conditions_by_province',
  title: 'Conditions by province',
  span: 12,
  fetch: (filters) => {
    // The fixture date range affects the volume scale only — same hash determinism.
    const days = filters.date_range.from && filters.date_range.to
      ? Math.max(1, Math.round((filters.date_range.to.getTime() - filters.date_range.from.getTime()) / 86_400_000))
      : 30
    const rows: ProvinceRow[] = NOTIFIABLE_CONDITIONS.map((condition) => {
      const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
      const cells: ProvinceCell[] = PROVINCES.map((province, idx) => {
        const pw = PROVINCE_POPULATION_WEIGHT[province]
        const ceiling = Math.max(2, Math.round(weight * pw * days * 0.7)) + 1
        const seed = idx * 31 + condition.snomed_id.length
        const confirmed = hashCount(seed, condition.key, ceiling)
        const noise = 0.25 + syntheticHash01(seed, condition.key, 4861)
        return {
          province,
          confirmed,
          suspected: Math.round(confirmed * noise),
        }
      })
      return {
        condition_key: condition.key,
        condition_label: condition.label,
        nmc_category: condition.nmc_category,
        cells,
      }
    })
    return { provinces: PROVINCES, rows }
  },
  render: (data) => (
    <WidgetCard title='Conditions by province' subtitle={`${data.rows.length} conditions × ${data.provinces.length} provinces`}>
      <div class='text-sm text-gray-500'>Island wired up in Task 14.</div>
    </WidgetCard>
  ),
}
```

- [ ] **Step 4: Run test to verify it passes**

```
deno test test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts
```

Expected: PASS — 5 tests.

- [ ] **Step 5: Type-check & format**

```
deno check components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx
deno fmt components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts
```

- [ ] **Step 6: Commit**

```
git add components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx test/dashboard/widgets/country/notifiable_conditions_by_province.test.ts
git commit -m "feat: synthesize per-province case counts for notifiable conditions"
```

---

## Task 13: `NotifiableConditionsByProvinceIsland`

**Files:**
- Create: `islands/dashboard/NotifiableConditionsByProvinceIsland.tsx`

- [ ] **Step 1: Implement the island**

```tsx
// islands/dashboard/NotifiableConditionsByProvinceIsland.tsx
import { useSignal } from '@preact/signals'
import BubbleMatrix from '../../components/dashboard/charts/BubbleMatrix.tsx'
import type { ProvinceData } from '../../components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx'
import { PROVINCE_LABELS } from '../../util/dashboard/provinces.ts'

const CATEGORY_PALETTE: readonly string[] = [
  '#dc2626', '#1d4ed8', '#15803d', '#9333ea', '#b45309',
  '#0e7490', '#be185d', '#4d7c0f', '#7c3aed', '#0369a1',
]

function colorFor(condition_key: string): string {
  let hash = 0
  for (let i = 0; i < condition_key.length; i++) {
    hash = (hash * 31 + condition_key.charCodeAt(i)) >>> 0
  }
  return CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length]
}

export type NotifiableConditionsByProvinceIslandProps = {
  data: ProvinceData
}

export default function NotifiableConditionsByProvinceIsland(
  { data }: NotifiableConditionsByProvinceIslandProps,
) {
  const category = useSignal<'1' | '2' | 'all'>('1')
  const metric = useSignal<'confirmed' | 'suspected'>('confirmed')

  const filtered_rows = data.rows.filter((r) => {
    if (category.value === 'all') return true
    return String(r.nmc_category) === category.value
  })

  const bubble_rows = filtered_rows.map((r) => ({
    key: r.condition_key,
    label: r.condition_label,
    color: colorFor(r.condition_key),
    cells: r.cells.map((c) => ({
      col_key: c.province,
      value: metric.value === 'confirmed' ? c.confirmed : c.suspected,
    })),
  }))

  return (
    <div class='space-y-3'>
      <div class='flex flex-wrap items-center gap-3'>
        <Segment
          value={category.value}
          options={[{ value: '1', label: 'Cat 1' }, { value: '2', label: 'Cat 2' }, { value: 'all', label: 'All' }]}
          onChange={(v) => (category.value = v as '1' | '2' | 'all')}
        />
        <Segment
          value={metric.value}
          options={[{ value: 'confirmed', label: 'Confirmed' }, { value: 'suspected', label: 'Suspected' }]}
          onChange={(v) => (metric.value = v as 'confirmed' | 'suspected')}
        />
      </div>
      <BubbleMatrix
        col_keys={data.provinces}
        col_labels={data.provinces.map((p) => PROVINCE_LABELS[p])}
        rows={bubble_rows}
      />
    </div>
  )
}

type SegmentProps = {
  value: string
  options: ReadonlyArray<{ value: string; label: string }>
  onChange: (value: string) => void
}

function Segment({ value, options, onChange }: SegmentProps) {
  return (
    <div class='inline-flex rounded border border-gray-300 bg-white text-xs'>
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type='button'
            onClick={() => onChange(opt.value)}
            class={`px-3 py-1 ${active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'} ${
              i > 0 ? 'border-l border-gray-300' : ''
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Type-check & format**

```
deno check islands/dashboard/NotifiableConditionsByProvinceIsland.tsx
deno fmt islands/dashboard/NotifiableConditionsByProvinceIsland.tsx
```

- [ ] **Step 3: Commit**

```
git add islands/dashboard/NotifiableConditionsByProvinceIsland.tsx
git commit -m "feat: add NotifiableConditionsByProvinceIsland with cat and metric toggles"
```

---

## Task 14: Wire by-province widget render into the route

**Files:**
- Modify: `components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx`
- Modify: `components/dashboard/widgets/country/index.ts`

- [ ] **Step 1: Replace the placeholder render**

Edit `components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx`:

```tsx
import NotifiableConditionsByProvinceIsland from '../../../../islands/dashboard/NotifiableConditionsByProvinceIsland.tsx'
```

```tsx
  render: (data) => (
    <WidgetCard
      title='Conditions by province'
      subtitle={`${data.rows.length} conditions × ${data.provinces.length} provinces — toggle category and metric`}
    >
      <NotifiableConditionsByProvinceIsland data={data} />
    </WidgetCard>
  ),
```

- [ ] **Step 2: Add to `COUNTRY_DASHBOARD_WIDGETS`**

Edit `components/dashboard/widgets/country/index.ts`:

```ts
import { notifiable_conditions_widget } from './NotifiableConditions.tsx'
import { notifiable_conditions_trends_widget } from './NotifiableConditionsTrends.tsx'
import { notifiable_conditions_by_province_widget } from './NotifiableConditionsByProvince.tsx'

export const COUNTRY_DASHBOARD_WIDGETS: ReadonlyArray<CountryWidgetDef<unknown>> = [
  notifiable_conditions_widget,
  notifiable_conditions_trends_widget,
  notifiable_conditions_by_province_widget,
] as ReadonlyArray<CountryWidgetDef<unknown>>
```

- [ ] **Step 3: Type-check, format, smoke**

```
deno check components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx components/dashboard/widgets/country/index.ts
deno fmt components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx components/dashboard/widgets/country/index.ts
```

Smoke: `/dashboard-country`. Expected:
- Bubble plot shows 8 conditions × 9 provinces by default (Cat 1).
- Toggling "Cat 2" replaces with 24 rows. Toggling "All" shows 32.
- Toggling "Suspected" changes bubble sizes; "Confirmed" restores.

- [ ] **Step 4: Commit**

```
git add components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx components/dashboard/widgets/country/index.ts
git commit -m "feat: wire by-province widget render to interactive island"
```

---

## Task 15: Final verification

- [ ] **Step 1: Run all new tests**

```
deno test test/util/dashboard/provinces.test.ts test/util/dashboard/notifiable_conditions.test.ts test/dashboard/widgets/country/
```

Expected: PASS — all suites green.

- [ ] **Step 2: Project-wide type check**

```
deno task check 2>&1 | tail -40
```

Expected: only the pre-existing s-expression error documented in `docs/country-wide-dashboard.md`. No new errors in country-dashboard files.

- [ ] **Step 3: Manual smoke pass**

`deno task start`, then hit:

- `/dashboard-country` — three widgets stack vertically: bar chart, trends, bubble plot.
  - Bar chart shows 32 conditions sorted by count.
  - Trends widget defaults to 8 Cat-1 rows; search "tb", three rows show; click a chip to remove; "Reset" restores.
  - Bubble plot defaults to "Cat 1 / Confirmed"; toggle through "Cat 2", "All", and "Suspected"; bubbles sized by value.
- `/dashboard-preview` — `NotifiableConditions` is gone; other widgets still render.

- [ ] **Step 4: Format any drift**

```
deno fmt
```

- [ ] **Step 5: Final commit (if drift)**

```
git add -A
git commit -m "chore: deno fmt across country-dashboard files" || true
```

---

## Self-review pass

**Spec coverage:**
- Route at `/dashboard-country` with date-only filter — Task 6.
- Trends widget with 8 default Cat-1 + search — Tasks 9–11.
- Bubble plot with Cat 1 / Cat 2 / All toggle — Tasks 12–14.
- Suspected/confirmed split synthesized at widget time — Tasks 9 + 12.
- Province field on org fixtures — Task 2.
- `provinces.ts` shared util — Task 1.
- Helper hoist into `notifiable_conditions.ts` — Task 3.
- New chart components — Tasks 7 + 8.
- Tests covering all new data tiers — Tasks 1, 2, 3, 9, 12.

**Type consistency:**
- `TrendsData` / `TrendsRow` defined in widget, imported by the island.
- `ProvinceData` / `ProvinceRow` / `ProvinceCell` defined in widget, imported by island.
- `Province` defined in `provinces.ts`; generator uses an inline type-alias on its `Organization` shape — they're structurally identical string literal unions.
- `CountryFilters` and `CountryWidgetDef` defined in Task 4, used by the route in Task 6 and by every widget thereafter.

**Placeholder scan:** No "TBD"/"TODO"/etc. in implementation steps. Each step has runnable code or commands.
