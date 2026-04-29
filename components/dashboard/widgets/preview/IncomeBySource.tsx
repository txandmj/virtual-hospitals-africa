import type { PreviewWidgetDef } from '../../../../util/dashboard/preview.ts'
import { BILLING, filterEncounters } from '../../../../util/dashboard/fixtures.ts'
import WidgetCard from '../../WidgetCard.tsx'
import DonutChart from '../../charts/DonutChart.tsx'

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

type Data = {
  total_usd: number
  slices: Array<{ payer: string; value: number }>
}

function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString()}`
}

export const incomeBySourceWidget: PreviewWidgetDef<Data> = {
  id: 'income_by_source',
  title: 'Income by source',
  span: 4,
  fetch: (filters) => {
    const { encounters } = filterEncounters(filters)
    const encounter_ids = new Set(encounters.map((e) => e.id))
    const totals = new Map<string, number>()
    let total = 0
    for (const line of BILLING) {
      if (!encounter_ids.has(line.encounter_id)) continue
      totals.set(line.payer, (totals.get(line.payer) ?? 0) + line.total_charge_usd)
      total += line.total_charge_usd
    }
    const slices = Array.from(totals.entries())
      .map(([payer, value]) => ({ payer, value }))
      .sort((a, b) => b.value - a.value)
    return { total_usd: total, slices }
  },
  render: ({ total_usd, slices }) => (
    <WidgetCard title='Income by source' subtitle={`Total ${formatUsd(total_usd)}`}>
      <DonutChart
        slices={slices.map((s) => ({
          label: PAYER_LABELS[s.payer] ?? s.payer,
          value: s.value,
          color: PAYER_COLORS[s.payer] ?? '#6b7280',
        }))}
        format={formatUsd}
        centerLabel={formatUsd(total_usd)}
      />
    </WidgetCard>
  ),
}
