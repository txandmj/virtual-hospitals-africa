import { ComponentChildren, JSX } from 'preact'
import { MinusCircleIcon, PlusCircleIcon } from '../components/library/icons/heroicons/outline.tsx'
import cls from '../util/cls.ts'
import words from '../util/words.ts'

// TODO: Make an AddRemoveRow that smoothly animates from one to the other
export function AddRow({
  text,
  size = 'md',
  onClick,
}: {
  text: string
  size?: 'sm' | 'md' | 'lg'
  onClick(): void
  labelled?: boolean
}): JSX.Element {
  const id = words(text)
    .map((word) => word.toLowerCase())
    .join('_')

  return (
    <a
      id={id}
      className='text-indigo-600 flex align-center cursor-pointer gap-2 py-[6px] px-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-max rounded-md'
      onClick={(event) => {
        onClick()
        event.currentTarget.blur()
      }}
    >
      <div className='grid place-items-center'>
        <PlusCircleIcon
          className={cls({
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'h-6 w-6': size === 'lg',
          })}
        />
      </div>
      <span
        className={cls({
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
        })}
      >
        {text}
      </span>
    </a>
  )
}

export function RemoveRow({
  children,
  labelled,
  centered,
  size = 'md',
  className,
  onClick,
}: {
  children: ComponentChildren
  size?: 'sm' | 'md' | 'lg'
  onClick(): void
  className?: string
  labelled?: boolean
  centered?: boolean
}): JSX.Element {
  return (
    <div className={cls('flex gap-2', className)}>
      <a
        role='button'
        className={cls(
          'text-indigo-600 flex cursor-pointer gap-2 py-[6px] px-[4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-max rounded-md',
          centered && 'items-center',
        )}
        onClick={onClick}
      >
        <div className='grid place-items-center'>
          <MinusCircleIcon
            className={cls(
              {
                'h-3 w-3': size === 'sm',
                'h-4 w-4': size === 'md',
                'h-6 w-6': size === 'lg',
              },
              !centered && (labelled ? 'mt-[30px]' : 'mt-[6px]'),
            )}
          />
        </div>
      </a>
      <span
        className={cls('min-w-0 grow', {
          'text-xs': size === 'sm',
          'text-sm': size === 'md',
          'text-base': size === 'lg',
        })}
      >
        {children}
      </span>
    </div>
  )
}
