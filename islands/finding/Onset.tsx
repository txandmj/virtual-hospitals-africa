import FormRow from '../../components/library/FormRow.tsx'
import { computed, useSignal, useSignalEffect } from '@preact/signals'
import { Duration, Maybe } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { approximateDuration, date_regex, durationEndDate, rfc3339_regex } from '../../util/date.ts'
import { CheckboxInput } from '../form/inputs/checkbox.tsx'
import { DateInput } from '../form/inputs/date.tsx'
import { DurationInput } from '../symptoms/DurationInput.tsx'

export function OnsetRow({
  symptom,
  today,
  onChange,
}: {
  symptom?: Maybe<{
    start_date: Maybe<string>
    end_date: Maybe<string>
  }>
  today: string
  onChange?: (onset: { start_date: string; end_date: string | null }) => void
}) {
  assert(date_regex.test(today))
  if (symptom?.start_date) {
    assert(rfc3339_regex.test(symptom.start_date))
  }
  if (symptom?.end_date) {
    assert(rfc3339_regex.test(symptom.end_date))
  }

  const yesterday = durationEndDate(today, {
    duration: -1,
    duration_unit: 'days',
  })!

  const start_date = useSignal(
    symptom?.start_date ||
      durationEndDate(today, { duration: -1, duration_unit: 'days' })!,
  )
  const end_date = useSignal(symptom?.end_date || null)
  const ongoing = computed(() => !end_date.value)

  const entered_duration = useSignal<Duration | null>(null)

  useSignalEffect(() => {
    onChange?.({ start_date: start_date.value, end_date: end_date.value })
  })

  const duration = computed(() =>
    entered_duration.value ||
    approximateDuration(start_date.value, end_date.value || today)
  )

  return (
    <FormRow className='w-full justify-normal items-end'>
      <div className='pb-4'>
        <CheckboxInput
          name={null}
          label='Ongoing'
          checked={!end_date.value}
          onInput={(e) => {
            entered_duration.value = null
            end_date.value = e.currentTarget.checked ? null : yesterday
          }}
        />
      </div>
      <DurationInput
        value={duration.value}
        onChange={(duration) => {
          entered_duration.value = duration
          if (ongoing.value) {
            return start_date.value = durationEndDate(today, {
              duration: -duration.duration,
              duration_unit: duration.duration_unit,
            })!
          }
          return end_date.value = durationEndDate(
            start_date.value,
            duration,
          )!
        }}
      />
      <DateInput
        name='start_date'
        value={start_date.value}
        label='Onset'
        max={today}
        required
        onInput={(e) => {
          start_date.value = e.currentTarget.value
          if (ongoing.value) {
            return entered_duration.value = null
          }
          if (entered_duration.value) {
            return end_date.value = durationEndDate(
              start_date.value,
              entered_duration.value,
            )!
          }
        }}
      />
      {!ongoing.value && (
        <DateInput
          name='end_date'
          value={end_date.value}
          label='End'
          min={start_date.value}
          max={today}
          onInput={(e) => {
            end_date.value = e.currentTarget.value
            entered_duration.value = null
          }}
        />
      )}
    </FormRow>
  )
}
