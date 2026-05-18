// Style 1 — Circular avatars on a light background, name + title + organization centered beneath.

const SPEAKERS = [
  { slug: 'arthur-phukubye', name: 'Dr. Arthur Phukuybe', title: 'Speaker', organization: 'University of Limpopo' },
  { slug: 'melitah-rasweswe', name: 'Dr. Melitah Rasweswe', title: 'Prof. of Nursing Practice', organization: 'University of Limpopo' },
  { slug: 'clint-hendrikse', name: 'Clint Hendrikse', title: 'Division Head of Emergency Medicine', organization: 'University of Cape Town' },
  { slug: 'sikhululiwe-ngwenya', name: 'Dr. Sikhululiwe Ngwenya', title: 'Chief Medical Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'will-weiss', name: 'Will Weiss', title: 'CTO', organization: 'Virtual Hospitals Africa' },
  { slug: 'nondumiso-makhunga', name: 'Dr. Nondumiso Makhunga', title: 'Moderator', organization: 'Virtual Hospitals Africa' },
]

export default function SpeakersStyle1() {
  return (
    <div class='bg-white grid grid-cols-2 grid-rows-3 gap-6 p-8 font-sans'>
      {SPEAKERS.map((s) => (
        <div class='flex flex-col items-center justify-start text-center'>
          <img
            src={`/images/team/square-headshots/${s.slug}.png`}
            alt={s.name}
            class='rounded-full object-cover ring-8 ring-indigo-100'
            style={{ width: '600px', height: '600px' }}
          />
          <div class='mt-6 text-[44px] font-semibold leading-tight text-slate-900'>
            {s.name}
          </div>
          <div class='mt-1 text-[28px] uppercase tracking-wider text-indigo-600'>
            {s.title}
          </div>
          <div class='mt-1 text-[24px] text-slate-500'>
            {s.organization}
          </div>
        </div>
      ))}
    </div>
  )
}
