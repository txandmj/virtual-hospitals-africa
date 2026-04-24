# Dashboard Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land a per-organization dashboard scaffolding (route + role-varying widget framework + URL-state filter framework + 3 live-data cards) that follow-on sub-dashboards can build on.

**Architecture:** SSR Fresh 2 route under `/app/organizations/[organization_id]/dashboard`. Widgets are objects (`canSee` / `fetch` / `render`) collected in a registry. Filters are URL query params parsed by pure helpers. No custom islands, no new middleware, no schema changes. Spec: `docs/superpowers/specs/2026-04-24-dashboard-shell-design.md`.

**Tech Stack:** Deno 2.6.1, Fresh 2, Preact, Kysely over PostgreSQL 16, Tailwind.

**Before starting any task:** read the spec and confirm orientation with:
```bash
cat docs/superpowers/specs/2026-04-24-dashboard-shell-design.md
```

---

## File Structure

**Create:**
```
util/dashboard/types.ts                                    (Task 1)
util/dashboard/dates.ts                                    (Task 2)
util/dashboard/filters.ts                                  (Tasks 3–4)
test/util/dashboard/dates.test.ts                          (Task 2)
test/util/dashboard/filters.test.ts                        (Tasks 3–4)

db/models/dashboard_metrics.ts                             (Tasks 5–7)
test/models/dashboard_metrics.test.ts                      (Tasks 5–7)

components/dashboard/Card.tsx                              (Task 8)
components/dashboard/filters/DateRangeInput.tsx            (Task 9)
components/dashboard/filters/SelectInput.tsx               (Task 10)
components/dashboard/FilterBar.tsx                         (Task 11)

components/dashboard/widgets/PatientsInCare.tsx            (Task 12)
components/dashboard/widgets/EncountersInRange.tsx         (Task 13)
components/dashboard/widgets/StaffOnShift.tsx              (Task 14)
components/dashboard/widgets/index.ts                      (Task 15)
test/components/dashboard/widgets.test.ts                  (Tasks 12–14)

routes/app/organizations/[organization_id]/dashboard/index.tsx    (Task 16)
test/web/organizations/[organization_id]/dashboard.test.ts        (Task 16)
```

**Modify:**
```
components/library/sidebar/home_page_links/health_worker.ts   (Task 17, +1 entry)
```

---

## Task 1: Scaffolding & pure types

No tests — this task only creates type definitions.

**Files:**
- Create: `util/dashboard/types.ts`

- [ ] **Step 1: Create the types file**

Write `util/dashboard/types.ts`:

```ts
import type { JSX } from 'preact'
import type { OrganizationEmployment, TrxOrDb } from '../../types.ts'

export type DateRange = {
  from: Date | null
  to: Date | null
}

export type DashboardFilters = {
  date_range: DateRange
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

- [ ] **Step 2: Verify `OrganizationEmployment` is exported from root `types.ts`**

Run: `grep -n "^export.*OrganizationEmployment\b\|HealthWorkerOrganization" /home/withak/virtual-hospitals-africa/types.ts | head -5`

If `OrganizationEmployment` is NOT exported, use the existing `HealthWorkerOrganization` type instead (it's the same concept — health worker's employment at a single org). Replace both occurrences in the file. Don't invent a new type.

- [ ] **Step 3: Type-check**

Run: `deno task check 2>&1 | tail -30`
Expected: no errors pointing at `util/dashboard/types.ts`.

- [ ] **Step 4: Commit**

```bash
git add util/dashboard/types.ts
git commit -m "dashboard: add filter + widget type definitions"
```

---

## Task 2: `todayUtc()` date helper

**Files:**
- Create: `util/dashboard/dates.ts`
- Test: `test/util/dashboard/dates.test.ts`

- [ ] **Step 1: Write the failing test**

Write `test/util/dashboard/dates.test.ts`:

```ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { todayUtc } from '../../../util/dashboard/dates.ts'

describe('util/dashboard/dates.ts', () => {
  describe('todayUtc', () => {
    it('returns a Date at 00:00:00.000 UTC of the current day', () => {
      const result = todayUtc()
      assertEquals(result.getUTCHours(), 0)
      assertEquals(result.getUTCMinutes(), 0)
      assertEquals(result.getUTCSeconds(), 0)
      assertEquals(result.getUTCMilliseconds(), 0)
    })

    it('matches the current UTC year/month/date', () => {
      const now = new Date()
      const result = todayUtc()
      assertEquals(result.getUTCFullYear(), now.getUTCFullYear())
      assertEquals(result.getUTCMonth(), now.getUTCMonth())
      assertEquals(result.getUTCDate(), now.getUTCDate())
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/util/dashboard/dates.test.ts 2>&1 | tail -20`
Expected: FAIL, "module not found" or similar — the source file doesn't exist yet.

- [ ] **Step 3: Implement the helper**

Write `util/dashboard/dates.ts`:

```ts
export function todayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ))
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/util/dashboard/dates.test.ts 2>&1 | tail -20`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add util/dashboard/dates.ts test/util/dashboard/dates.test.ts
git commit -m "dashboard: add todayUtc helper"
```

---

## Task 3: `parseDateRange` URL parser

**Files:**
- Create: `util/dashboard/filters.ts`
- Test: `test/util/dashboard/filters.test.ts`

- [ ] **Step 1: Write the failing tests**

Write `test/util/dashboard/filters.test.ts`:

```ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { parseDateRange } from '../../../util/dashboard/filters.ts'

function url(query: string): URL {
  return new URL(`https://example.test/x?${query}`)
}

describe('util/dashboard/filters.ts', () => {
  describe('parseDateRange', () => {
    it('returns { null, null } when neither param is present', () => {
      const r = parseDateRange(url(''))
      assertEquals(r.from, null)
      assertEquals(r.to, null)
    })

    it('parses valid ISO date params (from, to)', () => {
      const r = parseDateRange(url('from=2026-04-01&to=2026-04-24'))
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
      assertEquals(r.to?.toISOString(),   '2026-04-24T00:00:00.000Z')
    })

    it('accepts only one side of the range', () => {
      const r = parseDateRange(url('from=2026-04-01'))
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
      assertEquals(r.to, null)
    })

    it('returns null for malformed values', () => {
      const r = parseDateRange(url('from=not-a-date&to=also-bad'))
      assertEquals(r.from, null)
      assertEquals(r.to, null)
    })

    it('honors the prefix', () => {
      const r = parseDateRange(url('encounter_from=2026-04-01'), 'encounter_')
      assertEquals(r.from?.toISOString(), '2026-04-01T00:00:00.000Z')
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/util/dashboard/filters.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `parseDateRange`**

Write `util/dashboard/filters.ts`:

```ts
import type { DateRange } from './types.ts'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDate(value: string | null): Date | null {
  if (!value || !ISO_DATE.test(value)) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function parseDateRange(url: URL, prefix = ''): DateRange {
  return {
    from: parseIsoDate(url.searchParams.get(`${prefix}from`)),
    to:   parseIsoDate(url.searchParams.get(`${prefix}to`)),
  }
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/util/dashboard/filters.test.ts 2>&1 | tail -20`
Expected: all 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add util/dashboard/filters.ts test/util/dashboard/filters.test.ts
git commit -m "dashboard: parseDateRange URL helper"
```

---

## Task 4: `parseSelect` URL parser

**Files:**
- Modify: `util/dashboard/filters.ts`
- Modify: `test/util/dashboard/filters.test.ts`

- [ ] **Step 1: Add the failing tests**

Append to `test/util/dashboard/filters.test.ts` inside the top-level `describe` (before the closing `})`):

```ts
  describe('parseSelect', () => {
    const allowed = ['a', 'b', 'c'] as const

    it('returns null when param is absent', () => {
      assertEquals(parseSelect(url(''), 'kind', allowed), null)
    })

    it('returns the value when it is in the whitelist', () => {
      assertEquals(parseSelect(url('kind=b'), 'kind', allowed), 'b')
    })

    it('returns null when value is not in the whitelist', () => {
      assertEquals(parseSelect(url('kind=zzz'), 'kind', allowed), null)
    })
  })
```

And add to the top of that file (merge into the existing import):

```ts
import { parseDateRange, parseSelect } from '../../../util/dashboard/filters.ts'
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/util/dashboard/filters.test.ts 2>&1 | tail -20`
Expected: FAIL — `parseSelect` is not exported.

- [ ] **Step 3: Implement `parseSelect`**

Append to `util/dashboard/filters.ts`:

```ts
export function parseSelect<T extends string>(
  url: URL,
  param: string,
  allowed: readonly T[],
): T | null {
  const value = url.searchParams.get(param)
  return (value !== null && (allowed as readonly string[]).includes(value)) ? value as T : null
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/util/dashboard/filters.test.ts 2>&1 | tail -20`
Expected: all 8 tests PASS (5 from Task 3 + 3 new).

- [ ] **Step 5: Commit**

```bash
git add util/dashboard/filters.ts test/util/dashboard/filters.test.ts
git commit -m "dashboard: parseSelect URL helper"
```

---

## Task 5: `patientsCurrentlyInEncounter` query

**Files:**
- Create: `db/models/dashboard_metrics.ts`
- Test: `test/models/dashboard_metrics.test.ts`

- [ ] **Step 1: Write the failing test**

Write `test/models/dashboard_metrics.test.ts`:

```ts
import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import generateUUID from '../../util/uuid.ts'
import { patients } from '../../db/models/patients.ts'
import { dashboard_metrics } from '../../db/models/dashboard_metrics.ts'
import { itUsesTrxAnd } from '../_helpers/transaction.ts'
import { TEST_ORGANIZATION_UUIDS } from '../_helpers/organizations.ts'

const ORG_A = TEST_ORGANIZATION_UUIDS.ZA.clinic
const ORG_B = TEST_ORGANIZATION_UUIDS.ZA.hospital

describe('db/models/dashboard_metrics.ts', () => {
  afterAll(() => db.destroy())

  describe('patientsCurrentlyInEncounter', () => {
    itUsesTrxAnd('counts only open encounters at this org', async (trx) => {
      const [p1, p2, p3] = await Promise.all([
        patients.insert(trx, { name: generateUUID() }),
        patients.insert(trx, { name: generateUUID() }),
        patients.insert(trx, { name: generateUUID() }),
      ])

      // open at ORG_A — counts
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p1.id, organization_id: ORG_A,
        location: 'POINT(0 0)', reason: 'seeking treatment',
      }).execute()

      // closed at ORG_A — does NOT count
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p2.id, organization_id: ORG_A,
        location: 'POINT(0 0)', reason: 'seeking treatment', closed_at: new Date(),
      }).execute()

      // open at ORG_B — does NOT count for ORG_A
      await trx.insertInto('patient_encounters').values({
        id: generateUUID(), patient_id: p3.id, organization_id: ORG_B,
        location: 'POINT(0 0)', reason: 'seeking treatment',
      }).execute()

      const count = await dashboard_metrics.patientsCurrentlyInEncounter(
        trx, { organization_id: ORG_A },
      )
      assertEquals(count, 1)
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the model**

Write `db/models/dashboard_metrics.ts`:

```ts
import type { TrxOrDb } from '../../types.ts'

export const dashboard_metrics = {
  // TODO: per-org timezone — "today" is currently server UTC.
  // Revisit when an org timezone column lands in the schema.

  async patientsCurrentlyInEncounter(
    trx: TrxOrDb,
    { organization_id }: { organization_id: string },
  ): Promise<number> {
    const row = await trx
      .selectFrom('patient_encounters')
      .where('organization_id', '=', organization_id)
      .where('closed_at', 'is', null)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: 1 test PASS.

- [ ] **Step 5: Commit**

```bash
git add db/models/dashboard_metrics.ts test/models/dashboard_metrics.test.ts
git commit -m "dashboard_metrics: patientsCurrentlyInEncounter"
```

---

## Task 6: `encountersInRange` query

**Files:**
- Modify: `db/models/dashboard_metrics.ts`
- Modify: `test/models/dashboard_metrics.test.ts`

- [ ] **Step 1: Write the failing test**

Append this `describe` block inside the top-level `describe('db/models/dashboard_metrics.ts', ...)` block of `test/models/dashboard_metrics.test.ts` (before its closing `})`):

```ts
  describe('encountersInRange', () => {
    itUsesTrxAnd('counts encounters at this org with created_at in the day-inclusive range', async (trx) => {
      const [p1, p2, p3] = await Promise.all([
        patients.insert(trx, { name: generateUUID() }),
        patients.insert(trx, { name: generateUUID() }),
        patients.insert(trx, { name: generateUUID() }),
      ])

      const insertAt = (patient_id: string, organization_id: string, created_at: Date) =>
        trx.insertInto('patient_encounters').values({
          id: generateUUID(), patient_id, organization_id,
          location: 'POINT(0 0)', reason: 'seeking treatment', created_at,
        }).execute()

      await insertAt(p1.id, ORG_A, new Date('2026-04-20T10:00:00Z'))  // IN range
      await insertAt(p2.id, ORG_A, new Date('2026-04-24T23:59:00Z'))  // IN range (end of day)
      await insertAt(p3.id, ORG_A, new Date('2026-04-25T00:00:00Z'))  // OUT (day after)
      await insertAt(p1.id, ORG_B, new Date('2026-04-22T10:00:00Z'))  // OUT (wrong org)

      const count = await dashboard_metrics.encountersInRange(trx, {
        organization_id: ORG_A,
        from: new Date('2026-04-20T00:00:00Z'),
        to:   new Date('2026-04-24T00:00:00Z'),
      })
      assertEquals(count, 2)
    })
  })
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: FAIL — `encountersInRange` is not a function.

- [ ] **Step 3: Add the function to the model**

Append to the object literal in `db/models/dashboard_metrics.ts` (inside the `export const dashboard_metrics = { ... }`, right after `patientsCurrentlyInEncounter`):

```ts
  async encountersInRange(
    trx: TrxOrDb,
    { organization_id, from, to }: { organization_id: string; from: Date; to: Date },
  ): Promise<number> {
    // End bound is the next UTC day at 00:00 so that encounters on `to` itself count.
    const end_exclusive = new Date(to)
    end_exclusive.setUTCDate(end_exclusive.getUTCDate() + 1)

    const row = await trx
      .selectFrom('patient_encounters')
      .where('organization_id', '=', organization_id)
      .where('created_at', '>=', from)
      .where('created_at', '<',  end_exclusive)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add db/models/dashboard_metrics.ts test/models/dashboard_metrics.test.ts
git commit -m "dashboard_metrics: encountersInRange"
```

---

## Task 7: `staffOnShift` query

**Files:**
- Modify: `db/models/dashboard_metrics.ts`
- Modify: `test/models/dashboard_metrics.test.ts`

- [ ] **Step 1: Write the failing test**

Append this `describe` block inside the top-level describe in `test/models/dashboard_metrics.test.ts`:

```ts
  describe('staffOnShift', () => {
    itUsesTrxAnd('counts employees at this org whose employment_presence.at_work = true', async (trx) => {
      const { addTestEmployee } = await import('../_helpers/employees.ts')

      const [present_a, absent_a, present_b] = await Promise.all([
        addTestEmployee(trx, { organization_id: ORG_A, role: 'nurse' }),
        addTestEmployee(trx, { organization_id: ORG_A, role: 'doctor' }),
        addTestEmployee(trx, { organization_id: ORG_B, role: 'nurse' }),
      ])

      // Mark present_a and present_b as at work. Leave absent_a absent.
      await trx.insertInto('employment_presence')
        .values({ id: present_a.employee_id, at_work: true })
        .execute()
      await trx.insertInto('employment_presence')
        .values({ id: present_b.employee_id, at_work: true })
        .execute()
      await trx.insertInto('employment_presence')
        .values({ id: absent_a.employee_id, at_work: false })
        .execute()

      const count = await dashboard_metrics.staffOnShift(trx, { organization_id: ORG_A })
      assertEquals(count, 1)
    })
  })
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: FAIL — `staffOnShift` is not a function.

- [ ] **Step 3: Add the function**

Append to the `dashboard_metrics` object in `db/models/dashboard_metrics.ts`:

```ts
  async staffOnShift(
    trx: TrxOrDb,
    { organization_id }: { organization_id: string },
  ): Promise<number> {
    const row = await trx
      .selectFrom('employment')
      .innerJoin('employment_presence', 'employment_presence.id', 'employment.id')
      .where('employment.organization_id', '=', organization_id)
      .where('employment_presence.at_work', '=', true)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/models/dashboard_metrics.test.ts 2>&1 | tail -20`
Expected: all 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add db/models/dashboard_metrics.ts test/models/dashboard_metrics.test.ts
git commit -m "dashboard_metrics: staffOnShift"
```

---

## Task 8: `Card` presentational component

No tests — presentational component, matching the project's existing component convention.

**Files:**
- Create: `components/dashboard/Card.tsx`

- [ ] **Step 1: Create the component**

Write `components/dashboard/Card.tsx`:

```tsx
export type CardProps = {
  label: string
  value: number | string
}

export default function Card({ label, value }: CardProps) {
  return (
    <div class='rounded-md border border-gray-200 bg-white p-4 shadow-sm'>
      <div class='text-sm text-gray-500'>{label}</div>
      <div class='mt-1 text-3xl font-semibold text-gray-900'>{value}</div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at `components/dashboard/Card.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/Card.tsx
git commit -m "dashboard: Card presentational component"
```

---

## Task 9: `DateRangeInput` component

**Files:**
- Create: `components/dashboard/filters/DateRangeInput.tsx`

- [ ] **Step 1: Create the component**

Write `components/dashboard/filters/DateRangeInput.tsx`:

```tsx
import type { DateRange } from '../../../util/dashboard/types.ts'

function toInputValue(d: Date | null): string {
  if (!d) return ''
  // yyyy-mm-dd, UTC
  return d.toISOString().slice(0, 10)
}

export type DateRangeInputProps = {
  value: DateRange
  prefix?: string
}

export default function DateRangeInput({ value, prefix = '' }: DateRangeInputProps) {
  return (
    <div class='flex items-end gap-2'>
      <label class='flex flex-col text-sm text-gray-600'>
        From
        <input
          type='date'
          name={`${prefix}from`}
          defaultValue={toInputValue(value.from)}
          class='rounded border border-gray-300 px-2 py-1'
        />
      </label>
      <label class='flex flex-col text-sm text-gray-600'>
        To
        <input
          type='date'
          name={`${prefix}to`}
          defaultValue={toInputValue(value.to)}
          class='rounded border border-gray-300 px-2 py-1'
        />
      </label>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at the new file.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/filters/DateRangeInput.tsx
git commit -m "dashboard: DateRangeInput form control"
```

---

## Task 10: `SelectInput` component

**Files:**
- Create: `components/dashboard/filters/SelectInput.tsx`

- [ ] **Step 1: Create the component**

Write `components/dashboard/filters/SelectInput.tsx`:

```tsx
export type SelectOption = { value: string; label: string }

export type SelectInputProps = {
  param: string
  value: string | null
  options: readonly SelectOption[]
  placeholder?: string
}

export default function SelectInput(
  { param, value, options, placeholder = 'All' }: SelectInputProps,
) {
  return (
    <label class='flex flex-col text-sm text-gray-600'>
      {param}
      <select
        name={param}
        class='rounded border border-gray-300 px-2 py-1'
      >
        <option value='' selected={value === null}>{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} selected={value === o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at the new file.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/filters/SelectInput.tsx
git commit -m "dashboard: SelectInput form control"
```

---

## Task 11: `FilterBar` component

**Files:**
- Create: `components/dashboard/FilterBar.tsx`

- [ ] **Step 1: Create the component**

Write `components/dashboard/FilterBar.tsx`:

```tsx
import type { ComponentChildren } from 'preact'

export type FilterBarProps = {
  action: string
  children: ComponentChildren
}

export default function FilterBar({ action, children }: FilterBarProps) {
  return (
    <form
      method='get'
      action={action}
      class='flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-3'
    >
      {children}
      <button
        type='submit'
        class='rounded bg-gray-900 px-3 py-1 text-sm text-white hover:bg-gray-700'
      >
        Apply
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at the new file.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/FilterBar.tsx
git commit -m "dashboard: FilterBar form wrapper"
```

---

## Task 12: `patientsInCareWidget`

**Files:**
- Create: `components/dashboard/widgets/PatientsInCare.tsx`
- Create: `test/components/dashboard/widgets.test.ts`

- [ ] **Step 1: Write the failing test**

Write `test/components/dashboard/widgets.test.ts`:

```ts
import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patientsInCareWidget } from '../../../components/dashboard/widgets/PatientsInCare.tsx'

type EmploymentLike = Parameters<typeof patientsInCareWidget.canSee>[0]

function employment(overrides: Partial<EmploymentLike> = {}): EmploymentLike {
  // Cast through unknown — we only exercise fields canSee actually reads.
  return {
    role: 'nurse',
    is_admin: false,
    ...overrides,
  } as unknown as EmploymentLike
}

describe('dashboard widgets: canSee', () => {
  describe('patientsInCareWidget', () => {
    it('is visible to any employee', () => {
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(patientsInCareWidget.canSee(employment({ role: 'admin', is_admin: true })), true)
    })

    it('has a stable id', () => {
      assertEquals(patientsInCareWidget.id, 'patients_in_care')
    })
  })
})
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the widget**

Write `components/dashboard/widgets/PatientsInCare.tsx`:

```tsx
import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import Card from '../Card.tsx'

export const patientsInCareWidget: WidgetDef<number> = {
  id: 'patients_in_care',
  canSee: () => true,
  fetch: ({ trx, organization_id }) =>
    dashboard_metrics.patientsCurrentlyInEncounter(trx, { organization_id }),
  render: (count) => <Card label='Patients in care' value={count} />,
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/widgets/PatientsInCare.tsx test/components/dashboard/widgets.test.ts
git commit -m "dashboard: patientsInCareWidget"
```

---

## Task 13: `encountersInRangeWidget`

**Files:**
- Create: `components/dashboard/widgets/EncountersInRange.tsx`
- Modify: `test/components/dashboard/widgets.test.ts`

- [ ] **Step 1: Add the failing test**

Append inside the top-level `describe('dashboard widgets: canSee', () => { ... })` block in `test/components/dashboard/widgets.test.ts`:

```ts
  describe('encountersInRangeWidget', () => {
    it('is visible to any employee', async () => {
      const { encountersInRangeWidget } = await import(
        '../../../components/dashboard/widgets/EncountersInRange.tsx'
      )
      assertEquals(encountersInRangeWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(encountersInRangeWidget.canSee(employment({ role: 'doctor' })), true)
      assertEquals(encountersInRangeWidget.id, 'encounters_in_range')
    })
  })
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found for `EncountersInRange.tsx`.

- [ ] **Step 3: Implement the widget**

Write `components/dashboard/widgets/EncountersInRange.tsx`:

```tsx
import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import { todayUtc } from '../../../util/dashboard/dates.ts'
import Card from '../Card.tsx'

export const encountersInRangeWidget: WidgetDef<number> = {
  id: 'encounters_in_range',
  canSee: () => true,
  fetch: ({ trx, organization_id }, { date_range }) => {
    const from = date_range.from ?? todayUtc()
    const to   = date_range.to   ?? todayUtc()
    return dashboard_metrics.encountersInRange(trx, { organization_id, from, to })
  },
  render: (count) => <Card label='Encounters in range' value={count} />,
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: all widget tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/widgets/EncountersInRange.tsx test/components/dashboard/widgets.test.ts
git commit -m "dashboard: encountersInRangeWidget"
```

---

## Task 14: `staffOnShiftWidget`

**Files:**
- Create: `components/dashboard/widgets/StaffOnShift.tsx`
- Modify: `test/components/dashboard/widgets.test.ts`

- [ ] **Step 1: Add the failing test**

Append inside the top-level describe in `test/components/dashboard/widgets.test.ts`:

```ts
  describe('staffOnShiftWidget', () => {
    it('is visible to any employee', async () => {
      const { staffOnShiftWidget } = await import(
        '../../../components/dashboard/widgets/StaffOnShift.tsx'
      )
      assertEquals(staffOnShiftWidget.canSee(employment({ role: 'nurse' })), true)
      assertEquals(staffOnShiftWidget.canSee(employment({ role: 'admin', is_admin: true })), true)
      assertEquals(staffOnShiftWidget.id, 'staff_on_shift')
    })
  })
```

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the widget**

Write `components/dashboard/widgets/StaffOnShift.tsx`:

```tsx
import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { dashboard_metrics } from '../../../db/models/dashboard_metrics.ts'
import Card from '../Card.tsx'

export const staffOnShiftWidget: WidgetDef<number> = {
  id: 'staff_on_shift',
  canSee: () => true,
  fetch: ({ trx, organization_id }) =>
    dashboard_metrics.staffOnShift(trx, { organization_id }),
  render: (count) => <Card label='Staff on shift' value={count} />,
}
```

- [ ] **Step 4: Run test — expect pass**

Run: `deno task test:one test/components/dashboard/widgets.test.ts 2>&1 | tail -20`
Expected: all widget tests PASS.

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/widgets/StaffOnShift.tsx test/components/dashboard/widgets.test.ts
git commit -m "dashboard: staffOnShiftWidget"
```

---

## Task 15: Widget registry

**Files:**
- Create: `components/dashboard/widgets/index.ts`

- [ ] **Step 1: Create the registry**

Write `components/dashboard/widgets/index.ts`:

```ts
import type { WidgetDef } from '../../../util/dashboard/types.ts'
import { patientsInCareWidget }    from './PatientsInCare.tsx'
import { encountersInRangeWidget } from './EncountersInRange.tsx'
import { staffOnShiftWidget }      from './StaffOnShift.tsx'

export const DASHBOARD_WIDGETS: WidgetDef<unknown>[] = [
  patientsInCareWidget as WidgetDef<unknown>,
  encountersInRangeWidget as WidgetDef<unknown>,
  staffOnShiftWidget as WidgetDef<unknown>,
]
```

- [ ] **Step 2: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at the new file.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/widgets/index.ts
git commit -m "dashboard: widget registry"
```

---

## Task 16: Dashboard route + web-level test

**Files:**
- Create: `routes/app/organizations/[organization_id]/dashboard/index.tsx`
- Create: `test/web/organizations/[organization_id]/dashboard.test.ts`

The test follows this codebase's web-test convention: `addTestEmployeeWithSession(db, { role })` provides a `fetchOk` that hits routes with an authenticated cookie session. HTML assertions use `cheerio`.

- [ ] **Step 1: Write the failing web-level test**

Write `test/web/organizations/[organization_id]/dashboard.test.ts`:

```ts
import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import db from '../../../../../db/db.ts'
import { itUsesTrxAnd } from '../../../../_helpers/transaction.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { DASHBOARD_WIDGETS } from '../../../../../components/dashboard/widgets/index.ts'

const ORG = TEST_ORGANIZATION_UUIDS.ZA.clinic

describe('/app/organizations/[organization_id]/dashboard', () => {
  afterAll(() => db.destroy())

  itUsesTrxAnd('registry has the three day-one widgets', () => {
    const ids = DASHBOARD_WIDGETS.map((w) => w.id).sort()
    assertEquals(ids, ['encounters_in_range', 'patients_in_care', 'staff_on_shift'])
    return Promise.resolve()
  })

  itUsesTrxAnd('renders all three cards for an employed nurse', async () => {
    const { fetchOk } = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: ORG,
    })
    const response = await fetchOk(`/app/organizations/${ORG}/dashboard`)
    const $ = cheerio.load(await response.text())
    const body = $('body').text()
    assert(body.includes('Patients in care'),    'missing "Patients in care" card')
    assert(body.includes('Encounters in range'), 'missing "Encounters in range" card')
    assert(body.includes('Staff on shift'),      'missing "Staff on shift" card')
  })

  itUsesTrxAnd('renders the date-range filter', async () => {
    const { fetchOk } = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: ORG,
    })
    const response = await fetchOk(`/app/organizations/${ORG}/dashboard`)
    const $ = cheerio.load(await response.text())
    assertEquals($('input[name="from"][type="date"]').length, 1)
    assertEquals($('input[name="to"][type="date"]').length, 1)
    assertEquals($('button[type="submit"]').length >= 1, true)
  })
})
```

Note: the full 403-for-non-member test is deferred. The middleware already enforces it (`routes/app/organizations/[organization_id]/_middleware.ts:14` — `assertOr403`) and is exercised by every other per-org route's tests.

- [ ] **Step 2: Run test — expect failure**

Run: `deno task test:one test/web/organizations/\[organization_id\]/dashboard.test.ts 2>&1 | tail -20`
Expected: FAIL — route module not found (the registry test may pass; the two `fetchOk` tests will fail).

- [ ] **Step 3: Implement the route**

Write `routes/app/organizations/[organization_id]/dashboard/index.tsx`:

```tsx
import { Fragment } from 'preact'
import { HealthWorkerHomePage } from '../../../_middleware.tsx'
import type { OrganizationContext } from '../../../../../types.ts'
import { DASHBOARD_WIDGETS } from '../../../../../components/dashboard/widgets/index.ts'
import type { DashboardFilters } from '../../../../../util/dashboard/types.ts'
import { parseDateRange } from '../../../../../util/dashboard/filters.ts'
import FilterBar from '../../../../../components/dashboard/FilterBar.tsx'
import DateRangeInput from '../../../../../components/dashboard/filters/DateRangeInput.tsx'

export default HealthWorkerHomePage<OrganizationContext>(
  async function Dashboard(ctx) {
    const { trx, organization, organization_employment } = ctx.state
    const filters: DashboardFilters = { date_range: parseDateRange(ctx.url) }

    const visible = DASHBOARD_WIDGETS.filter((w) => w.canSee(organization_employment))
    const items = await Promise.all(
      visible.map(async (w) => ({
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
          <div class='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3'>
            {items.length === 0
              ? <div class='col-span-3 text-gray-500'>No widgets available for your role yet.</div>
              : items.map(({ id, element }) => <Fragment key={id}>{element}</Fragment>)}
          </div>
        </>
      ),
    }
  },
)
```

- [ ] **Step 4: Run tests — expect pass**

Run: `deno task test:one test/web/organizations/\[organization_id\]/dashboard.test.ts 2>&1 | tail -20`
Expected: all three tests PASS.

- [ ] **Step 5: Type-check the whole project**

Run: `deno task check 2>&1 | tail -40`
Expected: no new type errors.

- [ ] **Step 6: Manual browser verification**

Start the dev server and visit the dashboard URL for a seeded org:

```bash
deno task start
```

Log in as a seeded employee, navigate to `/app/organizations/<seeded-org-id>/dashboard`. Verify:
- Three cards render with real integer values (not `NaN`, not `undefined`).
- "From" and "To" date inputs appear above the cards.
- Setting a date range and clicking "Apply" navigates to the same URL with `?from=...&to=...` and the "Encounters in range" card updates.
- Other two cards are unchanged by the date filter.

If any of the above fails, fix before committing. If the dev server isn't available in this environment, note the skipped verification in the PR description.

- [ ] **Step 7: Commit**

```bash
git add routes/app/organizations/[organization_id]/dashboard/index.tsx \
         'test/web/organizations/[organization_id]/dashboard.test.ts'
git commit -m "dashboard: route renders widgets with filters"
```

---

## Task 17: Sidebar nav entry

**Files:**
- Modify: `components/library/sidebar/home_page_links/health_worker.ts`

- [ ] **Step 1: Read the current file**

Run: `cat components/library/sidebar/home_page_links/health_worker.ts`

You'll see a `practitioner_home_page_nav_links` array and a list of heroicon imports.

- [ ] **Step 2: Add the icon import**

In `components/library/sidebar/home_page_links/health_worker.ts`, extend the existing heroicons import to include `Squares2x2Icon`. Insert it alphabetically; the full import block should look like:

```ts
import {
  AcademicCapIcon,
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  IdentificationIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
  Squares2x2Icon,
} from '../../icons/heroicons/outline.tsx'
```

(`Squares2x2Icon` is already exported from `components/library/icons/heroicons/outline.tsx` — verified while writing this plan. No changes needed there.)

- [ ] **Step 3: Prepend the dashboard link**

In the same file, add the dashboard entry as the FIRST item in `practitioner_home_page_nav_links`:

```ts
export const practitioner_home_page_nav_links: LinkDef[] = [
  {
    route: '/app/organizations/:organization_id/dashboard',
    title: 'Dashboard',
    Icon: Squares2x2Icon,
  },
  {
    route: '/app/organizations/:organization_id/waiting_room',
    title: 'Open Encounters',
    Icon: ClockIcon,
  },
  // ... (rest unchanged)
]
```

- [ ] **Step 4: Type-check**

Run: `deno task check 2>&1 | tail -20`
Expected: no errors pointing at the modified file.

- [ ] **Step 5: Run full test suite**

Run: `deno task test 2>&1 | tail -30`
Expected: all dashboard tests PASS; no regressions elsewhere.

- [ ] **Step 6: Manual verification**

Start dev server (`deno task start`), log in, confirm "Dashboard" link appears at the top of the sidebar with the grid icon, and clicking it lands on the dashboard page from Task 16.

- [ ] **Step 7: Commit**

```bash
git add components/library/sidebar/home_page_links/health_worker.ts
git commit -m "dashboard: add sidebar nav entry"
```

---

## Final verification

- [ ] **Full test run**

Run: `deno task test 2>&1 | tail -40`
Expected: no failures.

- [ ] **Full type-check**

Run: `deno task check 2>&1 | tail -40`
Expected: clean.

- [ ] **Smoke test in the browser**

Covered in Task 16 step 6 and Task 17 step 6. Re-run if any later task's code changes touched the route or sidebar.
