import { ComponentChildren } from 'preact'
import type { HTMLAttributes } from 'preact/compat'

import SectionHeader from './typography/SectionHeader.tsx'
import cls from '../../util/cls.ts'

export default function FormSection(
  { className, always_column, header, children, ...props }: HTMLAttributes<HTMLElement> & {
    header: string
    always_column?: boolean
    children: ComponentChildren
    className?: string
  },
) {
  return (
    <section
      {...props}
      className={cls(
        'flex flex-col gap-4 items-start w-full',
        !always_column && 'xl:flex-row xl:gap-12',
        className,
      )}
    >
      <SectionHeader className='w-full xl:w-60'>
        {header}
      </SectionHeader>
      <div className='flex flex-col gap-8 grow min-w-0 w-full'>
        {children}
      </div>
    </section>
  )
}
