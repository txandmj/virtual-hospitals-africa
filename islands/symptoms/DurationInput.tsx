import { Duration } from '../../types.ts'
import { NumberInput } from '../form/inputs/number.tsx'
import { NoLabelButSpaceAsPlaceholder } from '../form/inputs/labelled.tsx'
import { SelectWithOptions } from '../form/inputs/select_with_options.tsx'
import assertOneOf from '../../util/assertOneOf.ts'

export function DurationInput(
  { value, onChange }: {
    value: Duration
    onChange(duration: Duration): void
  },
) {
  return (
    <div className='flex flex-col gap-2 md:flex-row md:items-center'>
      <NumberInput
        name={null}
        label='Duration'
        min={0}
        max={999}
        inputClassName='w-6'
        value={value.duration}
        onInput={(e) => {
          onChange({
            duration: Number(e.currentTarget.value),
            duration_unit: value.duration_unit,
          })
        }}
      />
      <SelectWithOptions
        name={null}
        label={NoLabelButSpaceAsPlaceholder}
        value={value.duration_unit}
        className='max-w-20'
        selectClassName='!pr-2'
        options={[
          {
            value: 'seconds',
            label: value.duration === 1 ? 'second' : 'seconds',
          },
          {
            value: 'minutes',
            label: value.duration === 1 ? 'minute' : 'minutes',
          },
          {
            value: 'hours',
            label: value.duration === 1 ? 'hour' : 'hours',
          },
          {
            value: 'days',
            label: value.duration === 1 ? 'day' : 'days',
          },
          {
            value: 'weeks',
            label: value.duration === 1 ? 'week' : 'weeks',
          },
          {
            value: 'months',
            label: value.duration === 1 ? 'month' : 'months',
          },
          {
            value: 'years',
            label: value.duration === 1 ? 'year' : 'years',
          },
        ]}
        onChange={(e) => {
          assertOneOf(
            e.currentTarget.value,
            [
              'seconds' as const,
              'minutes' as const,
              'hours' as const,
              'days' as const,
              'weeks' as const,
              'months' as const,
              'years' as const,
            ],
          )
          onChange({
            duration: value.duration,
            duration_unit: e.currentTarget.value,
          })
        }}
      />
    </div>
  )
}
