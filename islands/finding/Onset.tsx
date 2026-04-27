import { useSignal } from '@preact/signals'
import { Maybe } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { nowDatetimeLocalInJohannesburg, rfc3339_regex, yesterdayAtNoonInJohannesburg } from '../../util/date.ts'
import { CheckboxInput } from '../form/inputs/checkbox.tsx'
import { DatetimeInput } from '../form/inputs/datetime.tsx'

export function OnsetRow({
  symptom,
  onChange,
}: {
  symptom?: Maybe<{
    onset: Maybe<string>
    resolved: Maybe<string>
  }>
  onChange?: (symptom: { onset: string; resolved: string | null }) => void
}) {
  const now = nowDatetimeLocalInJohannesburg()
  if (symptom?.onset) {
    assert(rfc3339_regex.test(symptom.onset))
  }
  if (symptom?.resolved) {
    assert(rfc3339_regex.test(symptom.resolved))
  }
  const onset = useSignal(symptom?.onset || yesterdayAtNoonInJohannesburg())
  const resolved = useSignal(symptom?.resolved)
  const ongoing = useSignal(!symptom?.resolved)
  const callback = () => {
    onChange?.({
      onset: onset.value,
      resolved: resolved.value || null,
    })
  }

  return (
    <div className='grid grid-cols-2 grid-rows-2 gap-x-3 gap-y-2'>
      <DatetimeInput
        id='onset'
        value={onset.value}
        max={now}
        label='Onset'
        required
        onInput={(e) => {
          onset.value = e.currentTarget.value
          callback()
        }}
      />
      <DatetimeInput
        id='resolved'
        value={resolved.value}
        label='Resolved'
        min={onset.value}
        max={now}
        onInput={(e) => {
          resolved.value = e.currentTarget.value
          callback()
        }}
        disabled={ongoing.value}
        required={!ongoing.value}
      />
      <div />
      <CheckboxInput
        name={null}
        className='h-min'
        label='Ongoing'
        checked={ongoing.value}
        onInput={(e) => {
          ongoing.value = e.currentTarget.checked
        }}
      />
    </div>
  )
}
