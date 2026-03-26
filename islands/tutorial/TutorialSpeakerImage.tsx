import { memo } from 'preact/compat'
import { SPEAKERS } from '../../shared/tutorial/types.ts'

const ALL_SPEAKER_SRCS = Object.values(SPEAKERS).map((s) => ({ avatar_src: s.avatar_src, name: s.name }))

export const SpeakerImage = memo(function SpeakerImage({ avatar_src, name }: { avatar_src: string; name: string }) {
  return (
    <div className='flex-shrink-0'>
      {/* Preload all other speaker images so they're cached before speaker switches */}
      {ALL_SPEAKER_SRCS.filter((s) => s.avatar_src !== avatar_src).map((s) => (
        <img key={s.avatar_src} src={s.avatar_src} alt='' aria-hidden='true' className='hidden' />
      ))}
      <div className='w-20 h-20 md:w-44 md:h-44 rounded-lg overflow-hidden border-4 border-[#1a1a2e] shadow-[4px_4px_0px_#1a1a2e] [image-rendering:pixelated]'>
        <img
          src={avatar_src}
          alt={name}
          className={`w-full h-full object-cover [image-rendering:pixelated]`}
        />
      </div>
    </div>
  )
})
