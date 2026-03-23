import { ComponentChildren } from 'preact'
import cls from '../../util/cls.ts'

export default function FormRow(
  { className, children }: { className?: string; children: ComponentChildren },
) {
  return (
    <div className={cls('flex w-full gap-6', className)}>
      {children}
    </div>
  )
}
