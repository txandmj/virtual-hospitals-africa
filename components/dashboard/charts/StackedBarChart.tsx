export type StackedSegment = {
  key: string
  label: string
  value: number
  color: string
}

export type StackedRow = {
  label: string
  segments: readonly StackedSegment[]
}

export type StackedBarChartProps = {
  rows: readonly StackedRow[]
  format?: (value: number) => string
  legend?: ReadonlyArray<{ key: string; label: string; color: string }>
}

export default function StackedBarChart({ rows, format, legend }: StackedBarChartProps) {
  const fmt = format ?? ((v: number) => v.toLocaleString())
  const max = rows.reduce((m, row) => Math.max(m, row.segments.reduce((s, seg) => s + seg.value, 0)), 0)
  if (max === 0) return <div class='text-sm text-gray-500'>No data</div>

  return (
    <div class='space-y-3'>
      <div class='space-y-2'>
        {rows.map((row) => {
          const total = row.segments.reduce((s, seg) => s + seg.value, 0)
          return (
            <div key={row.label} class='space-y-1'>
              <div class='flex justify-between text-xs text-gray-600'>
                <span>{row.label}</span>
                <span class='font-medium text-gray-900'>{fmt(total)}</span>
              </div>
              <div class='flex h-3 w-full overflow-hidden rounded-full bg-gray-100'>
                {row.segments.map((seg) => {
                  const pct = max === 0 ? 0 : (seg.value / max) * 100
                  if (pct === 0) return null
                  return (
                    <div
                      key={seg.key}
                      title={`${seg.label}: ${fmt(seg.value)}`}
                      style={{ width: `${pct}%`, backgroundColor: seg.color }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      {legend
        ? (
          <ul class='flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600'>
            {legend.map((entry) => (
              <li key={entry.key} class='flex items-center gap-1.5'>
                <span class='inline-block h-2.5 w-2.5 rounded-sm' style={{ backgroundColor: entry.color }} />
                {entry.label}
              </li>
            ))}
          </ul>
        )
        : null}
    </div>
  )
}
