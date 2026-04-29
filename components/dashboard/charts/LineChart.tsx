export type LineSeries = {
  key: string
  label: string
  color: string
  points: readonly number[]
}

export type LineChartProps = {
  x_labels: readonly string[]
  series: readonly LineSeries[]
  format?: (value: number) => string
  height?: number
}

export default function LineChart({ x_labels, series, format, height = 200 }: LineChartProps) {
  const fmt = format ?? ((v: number) => v.toLocaleString())
  const width = 720
  const padding_left = 40
  const padding_right = 12
  const padding_top = 12
  const padding_bottom = 28
  const inner_w = width - padding_left - padding_right
  const inner_h = height - padding_top - padding_bottom

  const all_values = series.flatMap((s) => s.points)
  const max = all_values.reduce((m, v) => Math.max(m, v), 0)
  const min = 0
  const max_x = Math.max(0, x_labels.length - 1)

  if (series.length === 0 || x_labels.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  function xCoord(i: number): number {
    if (max_x === 0) return padding_left
    return padding_left + (i / max_x) * inner_w
  }
  function yCoord(v: number): number {
    if (max === min) return padding_top + inner_h / 2
    return padding_top + (1 - (v - min) / (max - min)) * inner_h
  }

  // Y-axis ticks at 0, 50%, 100% of max.
  const y_ticks = [0, max / 2, max]

  // X-axis ticks: first, middle, last.
  const x_tick_indices = max_x <= 1 ? [0, max_x] : [0, Math.floor(max_x / 2), max_x]

  return (
    <div class='space-y-2'>
      <svg viewBox={`0 0 ${width} ${height}`} class='w-full' role='img' aria-label='Line chart'>
        {/* Y grid */}
        {y_ticks.map((tick, idx) => {
          const y = yCoord(tick)
          return (
            <g key={`y-${idx}`}>
              <line x1={padding_left} x2={width - padding_right} y1={y} y2={y} stroke='#f3f4f6' strokeWidth={1} />
              <text x={padding_left - 6} y={y + 4} textAnchor='end' class='fill-gray-500 text-[10px]'>
                {fmt(tick)}
              </text>
            </g>
          )
        })}
        {/* X labels */}
        {x_tick_indices.map((i) => {
          const label = x_labels.at(i)
          if (!label) return null
          return (
            <text key={`x-${i}`} x={xCoord(i)} y={height - 8} textAnchor='middle' class='fill-gray-500 text-[10px]'>
              {label}
            </text>
          )
        })}
        {/* Series lines */}
        {series.map((s) => {
          const path = s.points
            .map((v, i) => {
              const cmd = i === 0 ? 'M' : 'L'
              return `${cmd}${xCoord(i).toFixed(1)},${yCoord(v).toFixed(1)}`
            })
            .join(' ')
          return <path key={s.key} d={path} stroke={s.color} strokeWidth={1.6} fill='none' />
        })}
      </svg>
      <ul class='flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600'>
        {series.map((s) => (
          <li key={s.key} class='flex items-center gap-1.5'>
            <span class='inline-block h-2.5 w-2.5 rounded-sm' style={{ backgroundColor: s.color }} />
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
