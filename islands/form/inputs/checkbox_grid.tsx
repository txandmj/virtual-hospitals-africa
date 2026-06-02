import { ComponentChildren } from 'preact'
import { Label } from '../../../components/library/Label.tsx'

export function CheckboxGrid(
  { title, children, id }: { title: string; children: ComponentChildren; id?: string },
) {
  return (
    <div id={id} className='border border-gray-300 rounded-lg overflow-hidden'>
      <div className='text-sm font-medium text-indigo-900 capitalize bg-indigo-50 border-b border-gray-300 pl-4 py-4'>
        {title}
      </div>
      <div className='flex flex-col gap-2 xl:gap-4 p-4'>
        {children}
      </div>
    </div>
  )
}

export function CheckboxGridItem({
  name,
  label,
  required,
  disabled,
  checked,
  onChange,
  children,
}: {
  name?: string
  label: string
  required?: boolean
  disabled?: boolean
  checked?: boolean
  onChange?(value: boolean): void
  children?: ComponentChildren
}) {
  return (
    <div className='relative flex justify-start w-full gap-2 break-before-avoid'>
      <div className='grid items-center'>
        <input
          name={name}
          type='checkbox'
          checked={checked}
          required={required}
          disabled={disabled}
          className='w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-600'
          onInput={(e) => onChange?.(e.currentTarget.checked)}
        />
      </div>
      <Label label={label} htmlFor={name} />
      {children}
    </div>
  )
}
