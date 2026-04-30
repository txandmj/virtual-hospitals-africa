export type DonutSlice = {
  label: string
  value: number
  color: string
}

export type DonutChartProps = {
  slices: readonly DonutSlice[]
  format?: (value: number) => string
  centerLabel?: string
}

const RADIUS = 42
const STROKE = 16
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function DonutChart({ slices, format, centerLabel }: DonutChartProps) {
  const total = slices.reduce((s, slice) => s + slice.value, 0)
  const fmt = format ?? ((v: number) => v.toLocaleString())
  if (total === 0) return <div class='text-sm text-gray-500'>No data</div>

  let cumulative = 0
  const segments = slices.map((slice) => {
    const fraction = slice.value / total
    const dash = fraction * CIRCUMFERENCE
    const offset = -cumulative
    cumulative += dash
    return { slice, dash, offset }
  })

  return (
    <div class='flex items-center gap-4'>
      <svg viewBox='0 0 120 120' width='120' height='120' class='shrink-0' role='img' aria-label='Donut chart'>
        <circle cx='60' cy='60' r={RADIUS} fill='none' stroke='#f3f4f6' strokeWidth={STROKE} />
        <g transform='rotate(-90 60 60)'>
          {segments.map(({ slice, dash, offset }) => (
            <circle
              key={slice.label}
              cx='60'
              cy='60'
              r={RADIUS}
              fill='none'
              stroke={slice.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={offset}
            />
          ))}
        </g>
        {centerLabel
          ? (
            <text x='60' y='64' textAnchor='middle' class='fill-gray-900 text-sm font-semibold'>
              {centerLabel}
            </text>
          )
          : null}
      </svg>
      <ul class='space-y-1 text-sm'>
        {slices.map((slice) => (
          <li key={slice.label} class='flex items-center gap-2'>
            <span class='inline-block h-3 w-3 rounded-sm' style={{ backgroundColor: slice.color }} />
            <span class='text-gray-700'>{slice.label}</span>
            <span class='ml-auto text-gray-500'>{fmt(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
