// Style 3 — Full-bleed headshots with a gradient overlay carrying the name + title at the bottom of each tile.

const SPEAKERS = [
  { slug: 'arthur-phukubye', name: 'Dr. Arthur Phukuybe', title: 'Speaker', organization: 'University of Limpopo' },
  { slug: 'melitah-rasweswe', name: 'Dr. Melitah Rasweswe', title: 'Prof. of Nursing Practice', organization: 'University of Limpopo' },
  { slug: 'clint-hendrikse', name: 'Clint Hendrikse', title: 'Division Head of Emergency Medicine', organization: 'University of Cape Town' },
  { slug: 'sikhululiwe-ngwenya', name: 'Dr. Sikhululiwe Ngwenya', title: 'Chief Medical Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'will-weiss', name: 'Will Weiss', title: 'CTO', organization: 'Virtual Hospitals Africa' },
  { slug: 'nondumiso-makhunga', name: 'Dr. Nondumiso Makhunga', title: 'Moderator', organization: 'Virtual Hospitals Africa' },
]

export default function SpeakersStyle3() {
  return (
    <div // style={{ width: '286px', height: '446px' }}
     class='bg-slate-900 grid grid-cols-2 grid-rows-3 gap-1 p-1 font-sans'>
      {SPEAKERS.map((s) => (
        <div class='relative overflow-hidden rounded-md'>
          <img
            src={`/images/team/square-headshots/${s.slug}.png`}
            alt={s.name}
            class='block object-cover'
            style={{ width: '976px', height: '1080px' }}
          />
          <div class='absolute inset-x-0 bottom-0 from-black/85 via-black/55 to-transparent px-8 pt-24 pb-6'>
            <div class='text-[52px] font-semibold leading-tight text-white truncate'>
              {s.name}
            </div>
            <div class='text-[36px] uppercase tracking-wider text-indigo-200'>
              {s.title}
            </div>
            <div class='text-[32px] uppercase tracking-wider text-indigo-200'>
              {s.organization}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
