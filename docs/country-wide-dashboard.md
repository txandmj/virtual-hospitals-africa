# Country-wide notifiable-conditions dashboard

Handoff doc for continuing work on the country-wide view that surfaces NMC (Notifiable Medical Conditions) case counts. Modeled after the South Africa NMC monthly surveillance report.

## What exists today

- `util/dashboard/notifiable_conditions.ts`
  Const array `NOTIFIABLE_CONDITIONS` (32 entries) with `{ key, label, snomed_id, snomed_name, nmc_category }`. SNOMED ids resolved via the **vha-snomed MCP server** (do not guess — always go through the MCP). `nmc_category` is `1` (acute / outbreak-prone) or `2` (endemic / chronic).

- `components/dashboard/widgets/preview/NotifiableConditions.tsx`
  Full-width (`span: 12`) widget that maps over `NOTIFIABLE_CONDITIONS` and renders a sorted horizontal bar chart of case counts. Color encoding: red = Category 1, blue = Category 2. Counts are deterministic-pseudo-random off the encounter pool size (FNV-1a hash + per-condition prevalence weight). This is a placeholder until real diagnosis-tagged encounters exist.

- Registered in `components/dashboard/widgets/preview/index.ts` and visible at `/dashboard-preview`.

## What is still missing — in priority order

### 1. Weekly trends small-multiples plot (Figure 1 in source report)

One row per condition, x = epiweek, y = confirmed notifications, with a shaded "expected range" band. Show ~3 years of data side-by-side.

- New chart component: `components/dashboard/charts/SmallMultiplesLineChart.tsx`. The existing `LineChart` does single-panel only — needs to be extended or a new component built that lays out N rows sharing the x-axis.
- New widget: `components/dashboard/widgets/preview/NotifiableConditionsTrends.tsx`, `span: 12`.
- Data shape: `{ condition_key, weeks: string[], counts: number[], expected_lower: number[], expected_upper: number[] }`. For preview, generate deterministic counts per (condition, week) seeded by the condition key — same approach as the current widget, scaled per condition's prevalence weight.
- Epiweek helper: ISO week number is fine; report uses CDC epiweek (week containing Jan 4). Pick one and document it.
- Show the most surveillance-relevant subset in the trends panel — the report shows Cholera, COVID-19, Diphtheria, Malaria, Measles, Mpox, Pertussis, Rubella. Extending to all 32 makes the chart unreadable.

### 2. Condition × Province bubble plot (Figures 2 & 3)

Y = condition, X = province (9 SA provinces: EC, FS, GP, KZN, LP, MP, NC, NW, WC). Bubble size = case count, color = arbitrary per-condition palette. Two variants — Category 1 and Category 2 — like the report.

- New chart component: `components/dashboard/charts/BubbleMatrix.tsx`. Nothing in `components/dashboard/charts/` is close to this; it's an SVG component with a legend showing reference bubble sizes (e.g. "n = 50", "n = 100").
- New widget(s): `NotifiableConditionsByProvince.tsx`. Either one widget with a category toggle or two widgets (cat 1 + cat 2) — the report does the latter.
- **Province data does not exist on the encounter fixtures yet.** Two options:
  - (a) Add a `province` field to organizations in `scripts/generate_dashboard_fixtures.ts` and regenerate. Pick distributions that mirror real SA population (GP and KZN are biggest).
  - (b) For preview only, hash the organization id into a province. Cleaner long-term to do (a).
- Since this is a country-wide view, the existing `organization_id`/`department`/`doctor_id` filters in `routes/dashboard-preview.tsx` are not meaningful. Consider hiding them when these widgets are visible, or split the country-wide widgets onto a separate `/dashboard-country` route with its own filter bar (date range only, plus maybe a province filter).

### 3. Real data wiring

Right now everything is fixture-driven. To go live:

- These widgets need to query real encounters and count diagnoses tagged with the matching SNOMED concepts. Look at how diagnoses/conditions are currently stored on encounters (`db/models/` and the encounter-related migrations).
- The lookup is by SNOMED concept id. Consider whether we want descendant-aware matching — e.g. an encounter tagged with `Vivax malaria` (27052006) should still count toward `Malaria` (61462000). The `snomed_concept_active_descendants_realized` table (referenced in `deno.json` migrations) is the right tool.
- Move from `util/dashboard/preview.ts` (synchronous fixture-fetch) to the real `WidgetDef` interface in `util/dashboard/types.ts` (async DB-fetch). The country-wide route should be its own page under `routes/app/`, scoped by role — only certain employments should see it (`canSee(employment)`).

## Conventions to follow

- **Always look up SNOMED ids via the vha-snomed MCP** (`mcp__vha-snomed__search_snomed`). Never invent or memory-recall ids. See `.cursor/rules/shared/fundamentals/15_snomed_mcp.mdc`.
- snake_case for data fields (`snomed_id`, `nmc_category`), camelCase for functions, PascalCase for types/components.
- Run `deno fmt path/to/file` after writing — the formatter is strict about long object literals collapsing to one line vs splitting.
- Type-check with `deno check <file>` for fast feedback. The project-wide `deno task check` currently has a pre-existing s-expression types error unrelated to dashboard work.
- Don't mock the database in tests for this work — see project test conventions.

## Design questions to resolve before building

- Should the country-wide view live at `/dashboard-preview` alongside hospital widgets, or get its own route (`/dashboard-country` or `/app/.../country-dashboard`)? The existing per-hospital filters don't apply to country-wide aggregations, which argues for a separate route.
- Do we want suspected vs confirmed split (the source table has both)? Adds another color/encoding axis.
- Is province pulled from the organization, the patient address, or the encounter? Affects the data model.

## Reference

Source report layouts that inspired this: South Africa National Institute for Communicable Diseases NMC Monthly Surveillance Report. The four figures shared by the user are:
1. Weekly trends small multiples (Category 1 conditions, 3 years)
2. Condition × Province bubble plot (Category 1, single month)
3. Notifications-by-province table (Category 2, single month, with suspected/confirmed split)
4. Condition × Province bubble plot (Category 2, single month)
