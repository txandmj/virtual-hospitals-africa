import { memo } from 'preact/compat'

export const SpeakerImage = memo(function SpeakerImage({ avatar_src, name }: { avatar_src: string; name: string }) {
  return (
    <div className='flex-shrink-0'>
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
