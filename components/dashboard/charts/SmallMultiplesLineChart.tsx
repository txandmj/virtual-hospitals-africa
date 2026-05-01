import type { LineSeries } from './LineChart.tsx'

export type SmallMultiplesRow = {
  key: string
  label: string
  series: readonly LineSeries[]
  expected_band?: { lower: readonly number[]; upper: readonly number[] }
}

export type SmallMultiplesProps = {
  x_labels: readonly string[]
  rows: readonly SmallMultiplesRow[]
  format?: (n: number) => string
  row_height?: number
}

const PADDING_LEFT = 120
const PADDING_RIGHT = 12
const PADDING_TOP = 8
const X_AXIS_HEIGHT = 24

export default function SmallMultiplesLineChart(
  { x_labels, rows, format, row_height = 64 }: SmallMultiplesProps,
) {
  if (rows.length === 0 || x_labels.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  const fmt = format ?? ((v: number) => v.toLocaleString())
  const width = 960
  const height = PADDING_TOP + rows.length * row_height + X_AXIS_HEIGHT
  const inner_w = width - PADDING_LEFT - PADDING_RIGHT
  const max_x = Math.max(0, x_labels.length - 1)

  function xCoord(i: number): number {
    if (max_x === 0) return PADDING_LEFT
    return PADDING_LEFT + (i / max_x) * inner_w
  }

  const x_tick_indices = max_x <= 1 ? [0, max_x] : [0, Math.floor(max_x / 2), max_x]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} class='w-full' role='img' aria-label='Small multiples line chart'>
      {rows.map((row, row_idx) => {
        const top = PADDING_TOP + row_idx * row_height
        const inner_h = row_height - 8
        const all_values = [
          ...row.series.flatMap((s) => s.points),
          ...(row.expected_band ? [...row.expected_band.upper] : []),
        ]
        const max = all_values.reduce((m, v) => Math.max(m, v), 0) || 1

        function yCoord(v: number): number {
          return top + (1 - v / max) * inner_h
        }

        const band_path = row.expected_band
          ? [
            ...row.expected_band.upper.map((v, i) => `${i === 0 ? 'M' : 'L'}${xCoord(i).toFixed(1)},${yCoord(v).toFixed(1)}`),
            ...row.expected_band.lower
              .map((_, i) => {
                const reverse_idx = row.expected_band!.lower.length - 1 - i
                return `L${xCoord(reverse_idx).toFixed(1)},${yCoord(row.expected_band!.lower[reverse_idx]).toFixed(1)}`
              }),
            'Z',
          ].join(' ')
          : null

        return (
          <g key={row.key}>
            <text
              x={PADDING_LEFT - 8}
              y={top + inner_h / 2 + 4}
              textAnchor='end'
              class='fill-gray-700 text-[11px] font-medium'
            >
              {row.label}
            </text>
            <line
              x1={PADDING_LEFT}
              x2={width - PADDING_RIGHT}
              y1={top + inner_h}
              y2={top + inner_h}
              stroke='#e5e7eb'
              strokeWidth={1}
            />
            <text x={PADDING_LEFT - 4} y={top + 8} textAnchor='end' class='fill-gray-400 text-[9px]'>
              {fmt(max)}
            </text>
            {band_path && <path d={band_path} fill='#fde68a' fillOpacity={0.4} stroke='none' />}
            {row.series.map((s, i) => {
              const path = s.points
                .map((v, idx) => `${idx === 0 ? 'M' : 'L'}${xCoord(idx).toFixed(1)},${yCoord(v).toFixed(1)}`)
                .join(' ')
              return (
                <path
                  key={s.key}
                  d={path}
                  stroke={s.color}
                  strokeWidth={1.4}
                  strokeDasharray={i === 1 ? '3 3' : undefined}
                  fill='none'
                />
              )
            })}
          </g>
        )
      })}
      {x_tick_indices.map((i) => {
        const label = x_labels.at(i)
        if (!label) return null
        return (
          <text
            key={`x-${i}`}
            x={xCoord(i)}
            y={height - 6}
            textAnchor='middle'
            class='fill-gray-500 text-[10px]'
          >
            {label}
          </text>
        )
      })}
    </svg>
  )
}
