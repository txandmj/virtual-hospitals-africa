export type BarChartDatum = {
  label: string
  value: number
  hint?: string
}

export type BarChartProps = {
  data: readonly BarChartDatum[]
  format?: (value: number) => string
}

const BAR_COLOR = '#1f2937'
const TRACK_COLOR = '#e5e7eb'

export default function BarChart({ data, format }: BarChartProps) {
  const max = data.reduce((m, d) => Math.max(m, d.value), 0)
  const fmt = format ?? ((v: number) => v.toLocaleString())
  if (data.length === 0) return <div class='text-sm text-gray-500'>No data</div>

  return (
    <div class='space-y-2'>
      {data.map((d) => {
        const pct = max === 0 ? 0 : (d.value / max) * 100
        return (
          <div key={d.label} class='space-y-1'>
            <div class='flex justify-between text-xs text-gray-600'>
              <span>{d.label}</span>
              <span class='font-medium text-gray-900'>{fmt(d.value)}{d.hint ? <span class='ml-1 text-gray-500'>{d.hint}</span> : null}</span>
            </div>
            <div class='h-2 w-full rounded-full' style={{ backgroundColor: TRACK_COLOR }}>
              <div class='h-2 rounded-full' style={{ width: `${pct}%`, backgroundColor: BAR_COLOR }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
