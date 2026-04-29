import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { BILLING, filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import { DEPARTMENT_LABELS } from '../../../../scripts/generate_dashboard_fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import StackedBarChart from '../../charts/StackedBarChart.tsx'

const PAYER_LABELS: Record<string, string> = {
  insurance: 'Insurance',
  government: 'Government',
  self_pay: 'Self-pay',
  ngo: 'NGO',
}

const PAYER_COLORS: Record<string, string> = {
  insurance: '#1d4ed8',
  government: '#0f766e',
  self_pay: '#b45309',
  ngo: '#7c3aed',
}

const PAYER_ORDER = ['insurance', 'government', 'self_pay', 'ngo'] as const

type Data = {
  rows: Array<{ department: string; segments: Array<{ payer: string; value: number }> }>
}

function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`
}

export const costByDepartmentWidget: PreviewWidgetDef<Data> = {
  id: 'cost_by_department',
  title: 'Cost distribution by department',
  span: 6,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const encounter_index = new Map(encounters.map((e) => [e.id, e]))
    const dept_payer = new Map<string, Map<string, number>>()
    for (const line of BILLING) {
      const enc = encounter_index.get(line.encounter_id)
      if (!enc) continue
      const payer_map = dept_payer.get(enc.department) ?? new Map<string, number>()
      payer_map.set(line.payer, (payer_map.get(line.payer) ?? 0) + line.total_charge_usd)
      dept_payer.set(enc.department, payer_map)
    }
    const rows = Array.from(dept_payer.entries())
      .map(([dept, payer_map]) => ({
        department: DEPARTMENT_LABELS[dept as keyof typeof DEPARTMENT_LABELS] ?? dept,
        total: Array.from(payer_map.values()).reduce((s, v) => s + v, 0),
        segments: PAYER_ORDER.map((payer) => ({ payer, value: payer_map.get(payer) ?? 0 })),
      }))
      .sort((a, b) => b.total - a.total)
      .map(({ department, segments }) => ({ department, segments }))
    return { rows }
  },
  render: ({ rows }) => (
    <WidgetCard title='Cost distribution by department' subtitle='Stacked by payer'>
      <StackedBarChart
        rows={rows.map((row) => ({
          label: row.department,
          segments: row.segments.map((seg) => ({
            key: seg.payer,
            label: PAYER_LABELS[seg.payer] ?? seg.payer,
            value: seg.value,
            color: PAYER_COLORS[seg.payer] ?? '#6b7280',
          })),
        }))}
        format={formatUsd}
        legend={PAYER_ORDER.map((payer) => ({
          key: payer,
          label: PAYER_LABELS[payer] ?? payer,
          color: PAYER_COLORS[payer] ?? '#6b7280',
        }))}
      />
    </WidgetCard>
  ),
}
