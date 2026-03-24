// =============================================================================
// FILE: /islands/LindiweGuidance.tsx
// Lindiwe guidance overlay: spotlight an element + dialogue with "Got it!" button.
// Accepts either a CSS selector or an element ref (not both).
// Positions Lindiwe in the viewport corner farthest from the highlighted element.
// =============================================================================

import { useComputed, useSignal } from '@preact/signals'
import { useEffect } from 'preact/hooks'
import { SPEAKERS } from '../shared/tutorial/types.ts'
import { TutorialDialogue } from './tutorial/TutorialDialogue.tsx'

const PADDING = 8
const BORDER_RADIUS = 12

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

type Props = {
  text: string
  selector: string
  onDismiss?: () => void
}

function getFarthestCorner(bounds: DOMRect): Position {
  const vw = globalThis.innerWidth
  const vh = globalThis.innerHeight
  const cx = bounds.left + bounds.width / 2
  const cy = bounds.top + bounds.height / 2
  const h = cx < vw / 2 ? 'right' : 'left'
  const v = cy < vh / 2 ? 'bottom' : 'top'
  return `${v}-${h}` as Position
}

export default function LindiweGuidance({ text, onDismiss, selector }: Props) {
  const storage_key = `guidance-seen-${selector}`
  const show_guidance = globalThis.Deno ? false : !localStorage.getItem(storage_key)
  const visible = useSignal(show_guidance)
  const target_bounds = useSignal<DOMRect | null>(null)

  useEffect(() => {
    function getElement(): Element | null {
      return document.querySelector(selector)
    }

    const updateBounds = () => {
      const el = getElement()
      if (!el) return
      target_bounds.value = el.getBoundingClientRect()
    }

    // Retry until element is found (handles hydration timing)
    let raf_id: number
    let attempts = 0
    const tryFind = () => {
      const el = getElement()
      if (el) {
        updateBounds()
        const bounds = el.getBoundingClientRect()
        const fills_page = bounds.height >= globalThis.innerHeight
        if (!fills_page) el.scrollIntoView({ behavior: 'smooth', block: 'center' })

        const handleUpdate = () => requestAnimationFrame(updateBounds)
        self.addEventListener('scroll', handleUpdate, true)
        self.addEventListener('resize', handleUpdate)

        const observer = new ResizeObserver(handleUpdate)
        observer.observe(el)

        return () => {
          self.removeEventListener('scroll', handleUpdate, true)
          self.removeEventListener('resize', handleUpdate)
          observer.disconnect()
        }
      }
      if (attempts++ < 20) {
        raf_id = requestAnimationFrame(tryFind)
      }
    }

    const cleanup = tryFind()
    return () => {
      if (cleanup) cleanup()
      cancelAnimationFrame(raf_id)
    }
  }, [selector])

  const cutout = useComputed(() => {
    const b = target_bounds.value
    if (!b) return null
    return {
      x: b.x - PADDING,
      y: b.y - PADDING,
      width: b.width + PADDING * 2,
      height: b.height + PADDING * 2,
    }
  })

  const position = useComputed<Position>(() => {
    const b = target_bounds.value
    if (!b) return 'bottom-left'
    return getFarthestCorner(b)
  })

  if (!visible.value) return null

  const c = cutout.value
  const pos = position.value

  const clipPath = c
    ? `polygon(
        0% 0%, 0% 100%,
        ${c.x}px 100%,
        ${c.x}px ${c.y}px,
        ${c.x + c.width}px ${c.y}px,
        ${c.x + c.width}px ${c.y + c.height}px,
        ${c.x}px ${c.y + c.height}px,
        ${c.x}px 100%,
        100% 100%, 100% 0%
      )`
    : undefined

  const dismiss = () => {
    if (storage_key) localStorage.setItem(storage_key, '1')
    visible.value = false
    onDismiss?.()
  }

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className='fixed inset-0 z-50' style={{ clipPath }} />
      <svg
        className='fixed inset-0 z-50 pointer-events-none'
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id='lindiwe-guidance-mask'>
            <rect x='0' y='0' width='100%' height='100%' fill='white' />
            {c && (
              <rect
                x={c.x}
                y={c.y}
                width={c.width}
                height={c.height}
                rx={BORDER_RADIUS}
                ry={BORDER_RADIUS}
                fill='black'
              />
            )}
          </mask>
        </defs>

        <rect
          x='0'
          y='0'
          width='100%'
          height='100%'
          fill='rgba(0, 0, 0, 0.6)'
          mask='url(#lindiwe-guidance-mask)'
        />

        {c && (
          <rect
            x={c.x}
            y={c.y}
            width={c.width}
            height={c.height}
            rx={BORDER_RADIUS}
            ry={BORDER_RADIUS}
            fill='none'
            stroke='#6366F1'
            strokeWidth={3}
          />
        )}
      </svg>

      <TutorialDialogue
        speaker={SPEAKERS.guide}
        text={text}
        position={pos}
        onNext={dismiss}
        button_text='Got it!'
      />
    </>
  )
}
