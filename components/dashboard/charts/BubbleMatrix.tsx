export type BubbleCell = { col_key: string; value: number }

export type BubbleRow = {
  key: string
  label: string
  color: string
  cells: readonly BubbleCell[]
}

export type BubbleMatrixProps = {
  col_keys: readonly string[]
  col_labels: readonly string[]
  rows: readonly BubbleRow[]
  reference_sizes?: readonly number[]
}

const ROW_HEIGHT = 32
const COL_WIDTH = 64
const PADDING_LEFT = 220
const PADDING_TOP = 56
const PADDING_RIGHT = 140
const PADDING_BOTTOM = 24
const CELL_RADIUS_MAX = 14

export default function BubbleMatrix(
  { col_keys, col_labels, rows, reference_sizes }: BubbleMatrixProps,
) {
  if (rows.length === 0 || col_keys.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  const width = PADDING_LEFT + col_keys.length * COL_WIDTH + PADDING_RIGHT
  const height = PADDING_TOP + rows.length * ROW_HEIGHT + PADDING_BOTTOM

  let max = 0
  for (const row of rows) for (const cell of row.cells) if (cell.value > max) max = cell.value
  if (max === 0) max = 1

  function radius(value: number): number {
    if (value <= 0) return 0
    return Math.sqrt(value / max) * CELL_RADIUS_MAX
  }

  const visible_values: number[] = []
  for (const row of rows) for (const cell of row.cells) if (cell.value > 0) visible_values.push(cell.value)
  visible_values.sort((a, b) => a - b)
  function quantile(p: number): number {
    if (visible_values.length === 0) return 0
    const idx = Math.min(visible_values.length - 1, Math.floor(p * visible_values.length))
    return visible_values[idx]
  }
  const legend_sizes = reference_sizes ?? [
    Math.max(1, Math.round(quantile(0.5))),
    Math.max(2, Math.round(quantile(0.9))),
    Math.max(3, max),
  ]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} class='w-full' role='img' aria-label='Bubble matrix'>
      {col_keys.map((key, i) => {
        const cx = PADDING_LEFT + i * COL_WIDTH + COL_WIDTH / 2
        return (
          <text
            key={`col-${key}`}
            x={cx}
            y={PADDING_TOP - 16}
            textAnchor='start'
            transform={`rotate(-45 ${cx} ${PADDING_TOP - 16})`}
            class='fill-gray-600 text-[11px]'
          >
            {col_labels[i] ?? key}
          </text>
        )
      })}
      {rows.map((row, row_idx) => {
        const cy = PADDING_TOP + row_idx * ROW_HEIGHT + ROW_HEIGHT / 2
        const cells_by_col = new Map(row.cells.map((c) => [c.col_key, c.value]))
        return (
          <g key={row.key}>
            <text x={PADDING_LEFT - 12} y={cy + 4} textAnchor='end' class='fill-gray-700 text-[11px]'>
              {row.label}
            </text>
            {col_keys.map((col, col_idx) => {
              const value = cells_by_col.get(col) ?? 0
              if (value <= 0) return null
              const cx = PADDING_LEFT + col_idx * COL_WIDTH + COL_WIDTH / 2
              return (
                <circle
                  key={`${row.key}-${col}`}
                  cx={cx}
                  cy={cy}
                  r={radius(value)}
                  fill={row.color}
                  fillOpacity={0.7}
                  stroke={row.color}
                  strokeWidth={0.5}
                >
                  <title>{`${row.label} — ${col_labels[col_idx] ?? col}: ${value.toLocaleString()}`}</title>
                </circle>
              )
            })}
          </g>
        )
      })}
      {legend_sizes.map((size, i) => {
        const r = radius(size)
        const x = width - PADDING_RIGHT + 24 + i * 38
        const y = PADDING_TOP + rows.length * ROW_HEIGHT - 16
        return (
          <g key={`legend-${i}`}>
            <circle cx={x} cy={y} r={r} fill='#9ca3af' fillOpacity={0.4} stroke='#6b7280' strokeWidth={0.5} />
            <text x={x} y={y + r + 12} textAnchor='middle' class='fill-gray-500 text-[10px]'>
              n = {size.toLocaleString()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
