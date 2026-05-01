# Country-wide dashboard widgets — design

Adds the two remaining widgets called out in `docs/country-wide-dashboard.md`: a weekly-trends small-multiples chart and a condition-by-province bubble plot. Country-wide widgets move to a dedicated route. Real-data wiring (priority #3 in the handoff doc) is deferred — fixtures stay the source of truth for this iteration.

## Scope

In:
- New route `routes/dashboard-country.tsx` with a date-range-only filter bar.
- New widget: weekly trends small-multiples (Figure 1 in source report).
- New widget: condition × province bubble plot (Figures 2 & 4 in source report) with a Cat 1 / Cat 2 / All toggle.
- Add `province` to organization fixtures with realistic SA distribution.
- Synthesize a `suspected` vs `confirmed` split deterministically at widget-render time.
- Relocate the existing `NotifiableConditions` bar chart from `/dashboard-preview` to `/dashboard-country`.

Out:
- Real DB queries against encounters / SNOMED-tagged diagnoses.
- Patient-address-based province attribution.
- Role-gated mount under `routes/app/`.

## Architecture

### Route

`routes/dashboard-country.tsx` mirrors `dashboard-preview.tsx` but stripped: filter bar contains only `<DateRangeInput>`. Iterates `COUNTRY_DASHBOARD_WIDGETS` and lays them out via the existing 12-col grid pattern. No nav links — standalone preview page.

### Widget contract

`util/dashboard/country.ts` introduces the country-scoped parallel of the existing preview types:

```ts
type CountryFilters = { date_range: DateRange }
type CountryWidgetDef<Data> = {
  id: string
  title: string
  span?: number
  fetch: (filters: CountryFilters) => Data
  render: (data: Data) => JSX.Element
}
```

Country widgets live in `components/dashboard/widgets/country/`:
- `NotifiableConditions.tsx` (relocated from `widgets/preview/`).
- `NotifiableConditionsTrends.tsx` (new).
- `NotifiableConditionsByProvince.tsx` (new).
- `index.ts` exports `COUNTRY_DASHBOARD_WIDGETS`.

`PREVALENCE_WEIGHT` and the `expectedCount` / `hashCount` helpers move from `NotifiableConditions.tsx` into `util/dashboard/notifiable_conditions.ts` so all three widgets share them.

### Province data

Generator change (`scripts/generate_dashboard_fixtures.ts`):

- Add `Province = 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC'`.
- Add `province: Province` to the `Organization` type.
- Pick each org's province via the deterministic RNG using these population-weighted probabilities:

  ```
  GP: 0.26, KZN: 0.19, WC: 0.12, EC: 0.11, LP: 0.10,
  MP: 0.08,  NW: 0.07,  FS: 0.05,  NC: 0.02
  ```

- Re-run `deno run -A scripts/generate_dashboard_fixtures.ts` to refresh `fixtures/dashboard/organizations.json`.

`Encounter` and `Patient` are unchanged — encounter province is derived via the org lookup at widget-render time.

New shared util `util/dashboard/provinces.ts`:
- `PROVINCES` — readonly tuple in display order.
- `PROVINCE_LABELS: Record<Province, string>` — full names ("Gauteng", etc.).
- `PROVINCE_POPULATION_WEIGHT: Record<Province, number>` — same SA population weights used by the generator.
- `provinceForOrganization(org_id) → Province | null` — `Map`-based lookup over `ORGANIZATIONS`.

### Suspected vs confirmed

Synthesized at widget-render time using the same FNV-1a hash pattern that already powers the existing `NotifiableConditions` widget. For each (condition, week, province) tuple: a `confirmed` count is hashed; `suspected` is `round(confirmed * (0.25 + hash01))`. No fixture/DB changes — keeps the migration path obvious for the future real-data swap.

## Chart components

Both are pure presentational SVG components — no signals, no fixture access — so the islands can render them on the client.

### `components/dashboard/charts/SmallMultiplesLineChart.tsx`

```ts
type SmallMultiplesRow = {
  key: string
  label: string
  series: readonly LineSeries[]   // reuses LineSeries from LineChart.tsx
  expected_band?: { lower: readonly number[]; upper: readonly number[] }
}
type Props = {
  x_labels: readonly string[]
  rows: readonly SmallMultiplesRow[]
  format?: (n: number) => string
  row_height?: number              // default 64
}
```

Single SVG, one panel per row stacked vertically, sharing one bottom x-axis. Per-row independent y-scale (auto-scales to that row's max — matches the source report). Row label rendered to the left of each panel. Optional shaded band drawn behind series lines. Empty state: "No data" if `rows.length === 0`.

### `components/dashboard/charts/BubbleMatrix.tsx`

```ts
type BubbleRow = {
  key: string
  label: string
  color: string
  cells: readonly { col_key: string; value: number }[]
}
type Props = {
  col_keys: readonly string[]
  col_labels: readonly string[]
  rows: readonly BubbleRow[]
  reference_sizes?: readonly number[]
}
```

SVG grid: rows = conditions, columns = provinces. Bubble radius is area-proportional: `sqrt(value / max) * cell_radius_max`. Row label left of grid, column labels rotated -45° at top. Empty cells render nothing (not a zero dot). Bottom-right legend shows reference bubble sizes derived from the visible data's quantiles (e.g., p50 / p90 / max) when `reference_sizes` is omitted.

## Widgets

### `NotifiableConditionsTrends` widget

Server-side `fetch(filters)`:

- Generate ~3 years (156 weeks) of ISO-8601 week labels (Mon-start, e.g., `"2024-W12"`) ending at `filters.date_range.to ?? today`. Document the ISO-week choice in a leading comment.
- For each (condition, week): `confirmed = hashCount(seed=week_index, condition.key, ceiling=Math.max(2, Math.round(PREVALENCE_WEIGHT[condition.key] * 0.6)))`; `suspected = round(confirmed * (0.25 + hash01))`. The `0.6` weekly scale is empirical — keeps trends widget bars readable without dwarfing the bar chart's totals.
- Compute `default_keys = NOTIFIABLE_CONDITIONS.filter(c => c.nmc_category === 1).map(c => c.key)` — the 8 Cat-1 keys.

Output:

```ts
type TrendsRow = {
  condition_key: string
  condition_label: string
  nmc_category: 1 | 2
  confirmed: readonly number[]
  suspected: readonly number[]
}
type TrendsData = {
  weeks: readonly string[]
  rows: readonly TrendsRow[]            // all 32 conditions
  default_keys: readonly string[]       // the 8 Cat-1 keys
}
```

`render` returns `<WidgetCard><NotifiableConditionsTrendsIsland data={…} /></WidgetCard>`. `span: 12`.

### `NotifiableConditionsByProvince` widget

Server-side `fetch(filters)`: for each (condition, province) inside the `date_range`, hash a `confirmed` count weighted by `PREVALENCE_WEIGHT[condition.key] × PROVINCE_POPULATION_WEIGHT[province]` (the same population weights used by the fixture generator: `GP 0.26, KZN 0.19, …, NC 0.02`). Derive `suspected` as above. Provinces in fixed `PROVINCES` order.

Output:

```ts
type ProvinceCell = { province: Province; confirmed: number; suspected: number }
type ProvinceRow = {
  condition_key: string
  condition_label: string
  nmc_category: 1 | 2
  cells: readonly ProvinceCell[]
}
type ProvinceData = {
  provinces: readonly Province[]
  rows: readonly ProvinceRow[]            // all 32 conditions
}
```

`render` returns `<WidgetCard><NotifiableConditionsByProvinceIsland data={…} /></WidgetCard>`. `span: 12`.

## Islands

### `islands/dashboard/NotifiableConditionsTrendsIsland.tsx`

State signals:
- `query: useSignal('')` — search input value.
- `selected_keys: useSignal<readonly string[]>(data.default_keys)` — currently displayed condition keys.

UI:
- Header: text input ("Search conditions…"), counter ("8 of 32 shown"), and "Reset" restoring `default_keys`.
- Chip list of currently-selected conditions; clicking a chip removes it.
- When `query` is non-empty: dropdown listing matching unselected conditions (case-insensitive substring on label); clicking adds.
- `<SmallMultiplesLineChart>` filtered to rows where `condition_key ∈ selected_keys`. Two series per row: `confirmed` (solid `#dc2626`), `suspected` (dashed `#f87171`).

Edge cases: empty selection → "Select a condition to view trends"; search with zero matches → "No matching conditions".

### `islands/dashboard/NotifiableConditionsByProvinceIsland.tsx`

State signals:
- `category: useSignal<'1' | '2' | 'all'>('1')`.
- `metric: useSignal<'confirmed' | 'suspected'>('confirmed')`.

UI:
- Header: segmented control "Cat 1 / Cat 2 / All" plus a "Confirmed / Suspected" toggle.
- `<BubbleMatrix>` with rows filtered by category, cell values pulled from the chosen metric.
- Per-condition bubble color from a deterministic palette keyed off `condition_key` (consistent across toggles).

## Testing

Pure-data tests, no JSX rendering, no DB:

- `util/dashboard/provinces.test.ts` — `provinceForOrganization` returns the expected province for known org ids and `null` for unknown ids.
- `util/dashboard/notifiable_conditions.test.ts` — `expectedCount` deterministic for same seed/key; `PREVALENCE_WEIGHT` covers all 32 keys.
- `components/dashboard/widgets/country/NotifiableConditionsTrends.test.ts` — `fetch` produces 156 weeks, 32 rows, `default_keys.length === 8`, all default keys are Cat 1.
- `components/dashboard/widgets/country/NotifiableConditionsByProvince.test.ts` — `fetch` produces 9 cells per row, 32 rows, 8 / 24 split by category.

Type checks: `deno check` on every new and modified file. `deno task check` will still surface the pre-existing s-expression error documented in the handoff; success criterion is "no new type errors".

Manual smoke: start dev server, visit `/dashboard-country`, exercise the search input, the chip toggling, the Cat 1 / Cat 2 / All segmented control, and the Confirmed / Suspected toggle. Confirm the bar-chart `NotifiableConditions` no longer renders at `/dashboard-preview` and now appears at `/dashboard-country`.

Format with `deno fmt` on all new and modified files before commit.

## File summary

New:
- `routes/dashboard-country.tsx`
- `util/dashboard/country.ts`
- `util/dashboard/provinces.ts`
- `components/dashboard/charts/SmallMultiplesLineChart.tsx`
- `components/dashboard/charts/BubbleMatrix.tsx`
- `components/dashboard/widgets/country/NotifiableConditions.tsx` (relocated)
- `components/dashboard/widgets/country/NotifiableConditionsTrends.tsx`
- `components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx`
- `components/dashboard/widgets/country/index.ts`
- `islands/dashboard/NotifiableConditionsTrendsIsland.tsx`
- `islands/dashboard/NotifiableConditionsByProvinceIsland.tsx`
- Tests: `util/dashboard/{provinces,notifiable_conditions}.test.ts`, `components/dashboard/widgets/country/{NotifiableConditionsTrends,NotifiableConditionsByProvince}.test.ts`

Modified:
- `scripts/generate_dashboard_fixtures.ts` (province field + generation)
- `fixtures/dashboard/organizations.json` (regenerated)
- `util/dashboard/notifiable_conditions.ts` (move shared helpers in)
- `components/dashboard/widgets/preview/index.ts` (drop `notifiable_conditions_widget`)

Deleted:
- `components/dashboard/widgets/preview/NotifiableConditions.tsx` (relocated)
