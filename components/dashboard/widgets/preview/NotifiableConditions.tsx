import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { NOTIFIABLE_CONDITIONS, type NotifiableCondition } from '../../../../util/dashboard/notifiable_conditions.ts'
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

type Row = {
  condition: NotifiableCondition
  count: number
}

type Data = {
  rows: readonly Row[]
  total: number
}

// FNV-1a hash so preview counts are stable per (encounter pool size, condition key).
function hashCount(seed: number, key: string, ceiling: number): number {
  let hash = 0x811c9dc5 ^ seed
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % ceiling
}

// Conditions with broad surveillance (TB pulmonary, Malaria, Hep B) skew higher than rare ones.
const PREVALENCE_WEIGHT: Record<string, number> = {
  tb_pulmonary: 60,
  tb_extrapulmonary: 18,
  hepatitis_b: 14,
  bilharzia: 12,
  hepatitis_a: 8,
  congenital_syphilis: 6,
  malaria: 25,
  measles: 4,
  pertussis: 3,
  rubella: 1,
  mpox: 1,
  diphtheria: 1,
  cholera: 0.5,
  covid_19: 5,
}

function expectedCount(seed: number, condition: NotifiableCondition): number {
  const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
  const ceiling = Math.max(2, Math.round(seed * weight / 100))
  return hashCount(seed + condition.snomed_id.length, condition.key, ceiling + 1)
}

export const notifiable_conditions_widget: PreviewWidgetDef<Data> = {
  id: 'notifiable_conditions',
  title: 'Notifiable conditions',
  span: 12,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const seed = encounters.length
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
