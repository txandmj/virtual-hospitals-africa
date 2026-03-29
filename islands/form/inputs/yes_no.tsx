import { ComponentChild, ComponentChildren } from 'preact'
import { Existence, Maybe } from '../../../types.ts'
import { useEffect, useRef } from 'preact/hooks'
import cls from '../../../util/cls.ts'
import LindiweGuidance from '../../LindiweGuidance.tsx'
import { useSignal } from '@preact/signals'

export function YesNoQuestion({
  name,
  label,
  most_recent_finding,
  value,
  onChange,
  required = false,
}: {
  name?: string
  label: ComponentChild
  most_recent_finding?: ComponentChild
  value?: Maybe<Existence>
  required?: boolean
  onChange?(value: Existence | null): void
}) {
  function Input({ existence }: { existence: Existence }) {
    return (
      <div className='yes-no-question-input flex justify-center align-top' data-question={name} data-existence={existence}>
        <input
          id={`${name}-${existence.toLowerCase()}`}
          name={name}
          type='radio'
          checked={value === existence}
          className='w-5 h-5 text-indigo-600 border-gray-400 focus:ring-indigo-600'
          value={existence}
          required={required}
          aria-labelledby={`${name}-label`}
          onChange={() => onChange?.(existence)}
        />
      </div>
    )
  }

  return (
    <>
      <div className='yes-no-question-label flex flex-col gap-0.5 pl-4' data-question={name}>
        <label
          id={`${name}-label`}
          className='text-sm font-medium text-gray-600'
        >
          {label}
          {required ? '*' : ''}
        </label>
        {most_recent_finding}
      </div>
      <Input existence='Yes' />
      <Input existence='No' />
      <Input existence='Unknown' />
    </>
  )
}

export function YesNoGrid(
  { title, children, id }: { title: string; children: ComponentChildren; id?: string },
) {
  const ref = useRef<HTMLInputElement>(null)
  const show_guidance_on_clicking_all_nos = useSignal(false)

  useEffect(() => {
    function listener(event: Event) {
      if ((event.target as HTMLInputElement)?.closest('[data-existence="No"]')) {
        show_guidance_on_clicking_all_nos.value = true
      }
    }
    document.addEventListener('change', listener)
    return () => document.removeEventListener('change', listener)
  }, [])

  function Header({ existence, placement }: { existence: Existence; placement: 'top' | 'bottom' }) {
    function checkAllWithoutValues() {
      const container = ref.current!
      const inputs = container.querySelectorAll<HTMLInputElement>(`input[type="radio"][value="${existence}"]`)
      for (const input of inputs) {
        const group = container.querySelectorAll<HTMLInputElement>(`input[type="radio"][name="${input.name}"]:checked`)
        const has_different_value_checked = Array.from(group).some((sibling) => sibling.checked && sibling.value !== existence)
        if (!has_different_value_checked) {
          input.click()
        }
      }
      document.querySelector<HTMLElement>('.primary-form-submit-button')?.focus()
    }

    return (
      <button
        type='button'
        className={cls('yes-no-header cursor-pointer text-sm font-medium text-center text-indigo-900 bg-indigo-50 py-4 border-gray-300', {
          'border-b': placement === 'top',
          'border-t': placement === 'bottom',
        })}
        data-placement={placement}
        onClick={checkAllWithoutValues}
        data-existence={existence}
      >
        {existence}
      </button>
    )
  }

  function Title({ title, placement }: { title: string; placement: 'top' | 'bottom' }) {
    return (
      <div
        className={cls('text-sm font-medium text-indigo-900 capitalize bg-indigo-50 border-gray-300 pl-4 py-4', {
          'border-b': placement === 'top',
          'border-t': placement === 'bottom',
        })}
      >
        {title}
      </div>
    )
  }

  return (
    <>
      <div
        id={id}
        className='overflow-scroll border border-gray-300 rounded-lg grid grid-cols-[auto_minmax(80px,1fr)_minmax(80px,1fr)_minmax(80px,1fr)] gap-y-2 xl:gap-y-4 items-start'
        ref={ref}
      >
        <Title title={title} placement='top' />
        <Header existence='Yes' placement='top' />
        <Header existence='No' placement='top' />
        <Header existence='Unknown' placement='top' />
        {children}
        <Title title={title} placement='bottom' />
        <Header existence='Yes' placement='bottom' />
        <Header existence='No' placement='bottom' />
        <Header existence='Unknown' placement='bottom' />
      </div>
      {show_guidance_on_clicking_all_nos.value && (
        <LindiweGuidance
          text="By the way, if none of the rest of the findings apply, you can click 'No' to fill that in for the rest. Everything you marked 'Yes' will stay put."
          selector='.yes-no-header[data-placement="bottom"][data-existence="No"]'
        />
      )}
    </>
  )
}
