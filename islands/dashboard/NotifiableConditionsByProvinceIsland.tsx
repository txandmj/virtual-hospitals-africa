import { useSignal } from '@preact/signals'
import BubbleMatrix from '../../components/dashboard/charts/BubbleMatrix.tsx'
import type { ProvinceData } from '../../components/dashboard/widgets/country/NotifiableConditionsByProvince.tsx'
import { PROVINCE_LABELS } from '../../util/dashboard/provinces.ts'

const CATEGORY_PALETTE: readonly string[] = [
  '#dc2626',
  '#1d4ed8',
  '#15803d',
  '#9333ea',
  '#b45309',
  '#0e7490',
  '#be185d',
  '#4d7c0f',
  '#7c3aed',
  '#0369a1',
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
          options={[
            { value: '1', label: 'Cat 1' },
            { value: '2', label: 'Cat 2' },
            { value: 'all', label: 'All' },
          ]}
          onChange={(v) => (category.value = v as '1' | '2' | 'all')}
        />
        <Segment
          value={metric.value}
          options={[
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'suspected', label: 'Suspected' },
          ]}
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
            class={`px-3 py-1 ${active ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-50'} ${i > 0 ? 'border-l border-gray-300' : ''}`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
