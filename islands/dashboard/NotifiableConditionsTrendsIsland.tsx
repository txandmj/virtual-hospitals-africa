import { useSignal } from '@preact/signals'
import SmallMultiplesLineChart from '../../components/dashboard/charts/SmallMultiplesLineChart.tsx'
import type { TrendsData } from '../../components/dashboard/widgets/country/NotifiableConditionsTrends.tsx'

const CONFIRMED_COLOR = '#dc2626'
const SUSPECTED_COLOR = '#d97706'

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
    selected_keys.value = selected_set.has(key) ? selected_keys.value.filter((k) => k !== key) : [...selected_keys.value, key]
  }

  function reset() {
    selected_keys.value = data.default_keys
    query.value = ''
  }

  const q = query.value.trim().toLowerCase()
  const matches = q ? all_rows.filter((r) => !selected_set.has(r.condition_key) && r.condition_label.toLowerCase().includes(q)) : []

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
      <div class='flex flex-wrap items-center gap-3'>
        <input
          type='search'
          placeholder='Search conditions…'
          value={query.value}
          onInput={(e) => (query.value = (e.target as HTMLInputElement).value)}
          class='w-64 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500'
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
        <div class='ml-auto flex items-center gap-3 text-xs text-gray-600'>
          <span class='inline-flex items-center gap-1.5'>
            <span class='h-0.5 w-4' style={{ backgroundColor: CONFIRMED_COLOR }} /> Confirmed
          </span>
          <span class='inline-flex items-center gap-1.5'>
            <svg width='16' height='4' aria-hidden='true'>
              <line x1='0' y1='2' x2='16' y2='2' stroke={SUSPECTED_COLOR} strokeWidth='1.5' strokeDasharray='3 3' />
            </svg>
            Suspected
          </span>
        </div>
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
      {q && matches.length === 0 && <div class='text-xs text-gray-500'>No matching conditions.</div>}

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

      {visible_rows.length === 0 ? <div class='text-sm text-gray-500'>Select a condition to view trends.</div> : (
        <SmallMultiplesLineChart
          x_labels={data.weeks}
          rows={visible_rows}
        />
      )}
    </div>
  )
}
