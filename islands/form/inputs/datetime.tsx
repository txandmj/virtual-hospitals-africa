import { Maybe } from '../../../types.ts'
import { InternalInput, WrapperInputProps } from './_internal.tsx'

type DateInputProps = Partial<WrapperInputProps<HTMLInputElement, string>> & {
  value?: Maybe<string>
  min?: Maybe<string>
  max?: Maybe<string>
}

export function DatetimeInput({
  name = 'date',
  ...props
}: DateInputProps) {
  return (
    <InternalInput
      {...props}
      name={name}
      type='datetime-local'
      onPaste={(event) => {
        const pasted_text = event.clipboardData?.getData('text')?.trim()
        if (!pasted_text) return
        event.preventDefault()
        const input = event.currentTarget as HTMLInputElement
        input.value = pasted_text
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }}
    />
  )
}
