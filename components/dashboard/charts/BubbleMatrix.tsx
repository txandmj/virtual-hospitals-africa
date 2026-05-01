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

const ROW_HEIGHT = 36
const COL_WIDTH = 72
const PADDING_LEFT = 240
const PADDING_TOP = 96
const PADDING_RIGHT = 32
const LEGEND_HEIGHT = 64
const CELL_RADIUS_MAX = 18

export default function BubbleMatrix(
  { col_keys, col_labels, rows, reference_sizes }: BubbleMatrixProps,
) {
  if (rows.length === 0 || col_keys.length === 0) {
    return <div class='text-sm text-gray-500'>No data</div>
  }

  const width = PADDING_LEFT + col_keys.length * COL_WIDTH + PADDING_RIGHT
  const grid_top = PADDING_TOP
  const grid_bottom = grid_top + rows.length * ROW_HEIGHT
  const height = grid_bottom + LEGEND_HEIGHT

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
      {rows.map((_row, row_idx) => (
        row_idx % 2 === 0
          ? (
            <rect
              key={`stripe-${row_idx}`}
              x={PADDING_LEFT}
              y={grid_top + row_idx * ROW_HEIGHT}
              width={col_keys.length * COL_WIDTH}
              height={ROW_HEIGHT}
              fill='#fafafa'
            />
          )
          : null
      ))}
      {col_keys.map((key, i) => {
        const cx = PADDING_LEFT + i * COL_WIDTH + COL_WIDTH / 2
        const ly = grid_top - 12
        return (
          <text
            key={`col-${key}`}
            x={cx}
            y={ly}
            textAnchor='start'
            transform={`rotate(-45 ${cx} ${ly})`}
            class='fill-gray-700 text-[11px] font-medium'
          >
            {col_labels[i] ?? key}
          </text>
        )
      })}
      {rows.map((row, row_idx) => {
        const cy = grid_top + row_idx * ROW_HEIGHT + ROW_HEIGHT / 2
        const cells_by_col = new Map(row.cells.map((c) => [c.col_key, c.value]))
        return (
          <g key={row.key}>
            <text x={PADDING_LEFT - 12} y={cy + 4} textAnchor='end' class='fill-gray-800 text-[11px]'>
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
      <line
        x1={PADDING_LEFT}
        x2={PADDING_LEFT + col_keys.length * COL_WIDTH}
        y1={grid_bottom + 12}
        y2={grid_bottom + 12}
        stroke='#e5e7eb'
        strokeWidth={1}
      />
      <text x={PADDING_LEFT} y={grid_bottom + 32} class='fill-gray-500 text-[10px] uppercase tracking-wide'>
        Bubble size
      </text>
      {legend_sizes.map((size, i) => {
        const r = radius(size)
        const x = PADDING_LEFT + 88 + i * 80
        const y = grid_bottom + 36
        return (
          <g key={`legend-${i}`}>
            <circle cx={x} cy={y} r={r} fill='#9ca3af' fillOpacity={0.4} stroke='#6b7280' strokeWidth={0.5} />
            <text x={x + r + 6} y={y + 4} class='fill-gray-600 text-[10px] tabular-nums'>
              {size.toLocaleString()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
