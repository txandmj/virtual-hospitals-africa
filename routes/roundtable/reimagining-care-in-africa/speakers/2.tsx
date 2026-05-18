// Style 2 — Headshot cards with name + title + organization stacked underneath inside a soft card.

const SPEAKERS = [
  { slug: 'sikhululiwe-ngwenya', name: 'Dr. Sikhululiwe Ngwenya', title: 'Chief Medical Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'clint-hendrikse', name: 'Clint Hendrikse', title: ['Head of Division:', 'Emergency Medicine'], organization: 'University of Cape Town' },
  { slug: 'will-weiss', name: 'Will Weiss', title: 'Chief Technology Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'melitah-rasweswe', name: 'Dr. Melitah Rasweswe', title: 'Prof. of Nursing Practice', organization: 'University of Limpopo' },
  { slug: 'nondumiso-makhunga', name: 'Dr. Nondumiso Makhunga', title: 'Moderator', organization: 'Virtual Hospitals Africa' },
  { slug: 'arthur-phukubye', name: 'Dr. Arthur Phukuybe', title: 'Speaker', organization: 'University of Limpopo' },
]

export default function SpeakersStyle2() {
  return (
    <div class='bg-slate-50 grid grid-cols-2 grid-rows-3 gap-4 p-4 font-sans w-fit'>
      {SPEAKERS.map((s) => (
        <div class='flex flex-col bg-white rounded-2xl shadow-md overflow-hidden w-fit'>
          <img
            src={`/images/team/square-headshots/${s.slug}.png`}
            alt={s.name}
            class='object-cover w-full'
            style={{ width: '484px', height: '540px' }}
          />
          <div class='flex-1 flex flex-col justify-center px-6 py-5'>
            <div class='text-[36px] font-semibold leading-tight text-slate-900'>
              {s.name}
            </div>
            <div class='mt-1 text-[32px] leading-tight text-indigo-700 flex flex-col'>
              {[s.title].flat().map((title) => <div>{title}</div>)}
            </div>
            <div class='text-[32px] text-slate-500 leading-tight pt-1'>
              {s.organization}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
