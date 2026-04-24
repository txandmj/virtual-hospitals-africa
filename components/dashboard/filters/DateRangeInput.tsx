import type { DateRange } from '../../../util/dashboard/types.ts'

function toInputValue(d: Date | null): string {
  if (!d) return ''
  // yyyy-mm-dd, UTC
  return d.toISOString().slice(0, 10)
}

export type DateRangeInputProps = {
  value: DateRange
  prefix?: string
}

export default function DateRangeInput({ value, prefix = '' }: DateRangeInputProps) {
  return (
    <div class='flex items-end gap-2'>
      <label class='flex flex-col text-sm text-gray-600'>
        From
        <input
          type='date'
          name={`${prefix}from`}
          defaultValue={toInputValue(value.from)}
          class='rounded border border-gray-300 px-2 py-1'
        />
      </label>
      <label class='flex flex-col text-sm text-gray-600'>
        To
        <input
          type='date'
          name={`${prefix}to`}
          defaultValue={toInputValue(value.to)}
          class='rounded border border-gray-300 px-2 py-1'
        />
      </label>
    </div>
  )
}
