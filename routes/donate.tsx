import { Context } from 'fresh'
import { Button } from '../components/library/Button.tsx'
import MarketingLayout from '../components/library/MarketingLayout.tsx'

const HERO_SEED = 'vha-clinic'

function placeholder(seed: string, w: number, h: number) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

function Hero() {
  return (
    <section class='relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white'>
      <div class='absolute inset-0 opacity-30'>
        <img
          src={placeholder(HERO_SEED, 1280, 720)}
          srcset={`${placeholder(HERO_SEED, 640, 480)} 640w, ${placeholder(HERO_SEED, 1024, 640)} 1024w, ${placeholder(HERO_SEED, 1920, 960)} 1920w`}
          sizes='100vw'
          alt=''
          class='h-full w-full object-cover'
        />
        <div class='absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/80 to-indigo-900/40' />
      </div>

      <div class='relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32'>
        <div class='max-w-3xl'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-4'>
            Support frontline care
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Every dollar funds<br />
            <span class='text-indigo-200'>the first mile of care</span>
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50 sm:text-xl max-w-2xl'>
            Virtual Hospitals Africa turns isolated rural clinics into high-performance nodes of a distributed national hospital system. Your gift directly
            funds the software, hardware, and connectivity that gets specialist-grade decision support to nurses on the frontline.
          </p>
          <div class='mt-10 flex flex-wrap gap-4'>
            <Button href='#donate' variant='secondary' size='xl'>
              Donate now
            </Button>
            <Button href='/partner' variant='hyperlink' size='xl'>
              Larger commitment? Partner with us
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const gift_levels = [
  {
    usd: '$5',
    zar: 'R95',
    title: 'Keep the lights on',
    body: 'Covers hosting fees for 1,000 patient encounters per month — the digital backbone every triage runs on.',
  },
  {
    usd: '$50',
    zar: 'R950',
    title: 'A month of connectivity',
    body: 'Mobile data and connectivity for one rural clinic for a month, keeping the platform online 24/7.',
  },
  {
    usd: '$200',
    zar: 'R3,800',
    title: 'A tablet for a nurse',
    body: "A ruggedized tablet placed in a nurse's hands — the device they use to triage, chart, and consult specialists.",
    featured: true,
  },
  {
    usd: '$500',
    zar: 'R9,500',
    title: 'Always-on power',
    body: 'A solar backup module so triage and emergency workflows never go dark during a load-shedding window.',
  },
  {
    usd: '$1,000',
    zar: 'R19,000',
    title: 'A clinic for a month',
    body: 'Funds a full month of frontline operations at one pilot clinic — software, devices, connectivity, and training.',
  },
]

function GiftLevels() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            What your gift unlocks
          </p>
          <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Real impact at every level
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            Funds go directly to triage software, devices, connectivity, solar backup and frontline training — not overhead.
          </p>
        </div>

        <div class='mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5'>
          {gift_levels.map((g) => (
            <div
              class={`flex flex-col rounded-2xl p-6 ring-1 ${
                g.featured ? 'bg-indigo-900 text-white ring-indigo-900 shadow-2xl lg:scale-[1.04]' : 'bg-white text-gray-900 ring-gray-200 shadow-sm'
              }`}
            >
              <p
                class={`text-3xl font-bold tracking-tight ${g.featured ? 'text-white' : 'text-gray-900'}`}
              >
                {g.usd}
              </p>
              <p
                class={`text-sm font-medium ${g.featured ? 'text-indigo-200' : 'text-gray-500'}`}
              >
                {g.zar}
              </p>
              <h3
                class={`mt-4 text-lg font-semibold ${g.featured ? 'text-white' : 'text-gray-900'}`}
              >
                {g.title}
              </h3>
              <p
                class={`mt-2 text-sm leading-6 grow ${g.featured ? 'text-indigo-100' : 'text-gray-600'}`}
              >
                {g.body}
              </p>
              <a
                href='#donate'
                class={`mt-6 inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  g.featured ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Give {g.usd}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Donate() {
  return (
    <section
      id='donate'
      class='bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-16 sm:py-24'
    >
      <div class='mx-auto max-w-5xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            From concept to clinic
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            Any contribution — from $5 to $1,000 — helps us co-build the backbone of Africa's digital health future.
          </p>
        </div>

        <div class='mt-12 grid gap-8 lg:grid-cols-5'>
          <div class='lg:col-span-2'>
            <h3 class='text-xl font-semibold text-gray-900'>
              Why give today?
            </h3>
            <ul class='mt-4 space-y-3 text-sm leading-6 text-gray-600'>
              <li class='flex gap-3'>
                <span class='mt-1 h-2 w-2 flex-none rounded-full bg-indigo-600' />
                <span>
                  Two pilot clinics are ready to deploy — every dollar shortens the timeline.
                </span>
              </li>
              <li class='flex gap-3'>
                <span class='mt-1 h-2 w-2 flex-none rounded-full bg-indigo-600' />
                <span>
                  Funds go to triage software, devices, connectivity, solar backup and frontline training — not overhead.
                </span>
              </li>
              <li class='flex gap-3'>
                <span class='mt-1 h-2 w-2 flex-none rounded-full bg-indigo-600' />
                <span>
                  Backed by University of Limpopo, the Limpopo Department of Health, UCT and the Knowledge Translation Unit.
                </span>
              </li>
            </ul>
            <div class='mt-8 rounded-xl bg-indigo-900 p-6 text-white'>
              <p class='text-sm uppercase tracking-widest text-indigo-200'>
                Larger commitment?
              </p>
              <p class='mt-2 text-base leading-6'>
                Strategic partners can sponsor an entire infrastructure vertical.
              </p>
              <Button
                href='/partner'
                variant='secondary'
                size='md'
                className='mt-4'
              >
                Talk to our team
              </Button>
            </div>
          </div>

          {/* Donorbox placeholder */}
          <div class='lg:col-span-3'>
            <div class='rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200 sm:p-8'>
              <div class='mb-4 flex items-center justify-between'>
                <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
                  Secure donation
                </p>
                <p class='text-xs text-gray-400'>Powered by Donorbox</p>
              </div>

              {
                /* TODO: replace with real Donorbox embed once campaign is live.
                  Expected markup:
                  <iframe
                    src="https://donorbox.org/embed/virtual-hospitals-africa"
                    name="donorbox"
                    seamless
                    frameborder="0"
                    scrolling="no"
                    height="900px"
                    width="100%"
                    style="max-width:500px; min-width:250px; max-height:none!important"
                    allow="payment"
                  /> */
              }
              <div
                id='donorbox-embed-placeholder'
                class='flex min-h-[520px] flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center'
              >
                <div class='rounded-full bg-indigo-100 p-4'>
                  <svg
                    class='h-8 w-8 text-indigo-600'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    stroke-width='2'
                  >
                    <path
                      stroke-linecap='round'
                      stroke-linejoin='round'
                      d='M21 12a9 9 0 11-18 0 9 9 0 0118 0z M12 8v4l3 2'
                    />
                  </svg>
                </div>
                <p class='text-base font-semibold text-gray-900'>
                  Donorbox embed
                </p>
                <p class='max-w-sm text-sm text-gray-600'>
                  The Donorbox campaign iframe will mount here once the campaign is published. Replace
                  <code class='mx-1 rounded bg-white px-1.5 py-0.5 text-xs text-indigo-700'>
                    #donorbox-embed-placeholder
                  </code>
                  with the embed snippet.
                </p>
                <div class='mt-2 grid w-full max-w-sm grid-cols-3 gap-2 text-sm font-semibold'>
                  <div class='rounded-lg border border-indigo-200 bg-white py-3 text-indigo-700'>
                    $5
                  </div>
                  <div class='rounded-lg border-2 border-indigo-600 bg-indigo-600 py-3 text-white'>
                    $50
                  </div>
                  <div class='rounded-lg border border-indigo-200 bg-white py-3 text-indigo-700'>
                    $200
                  </div>
                </div>
                <Button href='#' variant='primary' size='lg' className='mt-2'>
                  Continue to Donorbox
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ClosingCTA() {
  return (
    <section class='bg-indigo-900 py-16 text-white sm:py-20'>
      <div class='mx-auto max-w-4xl px-6 text-center lg:px-8'>
        <h2 class='text-3xl font-bold tracking-tight sm:text-4xl'>
          Stand with frontline care
        </h2>
        <p class='mt-6 text-lg leading-8 text-indigo-100'>
          Whether you give $5 or sponsor a full infrastructure vertical, you are funding the most ambitious health infrastructure project on the continent.
        </p>
        <div class='mt-8 flex flex-wrap justify-center gap-4'>
          <Button href='#donate' variant='secondary' size='xl'>
            Donate
          </Button>
          <Button href='/partner' variant='hyperlink' size='xl'>
            Partner with us
          </Button>
        </div>
        <p class='mt-10 text-sm text-indigo-200'>
          13 Gemini Street, Sterpark, Polokwane, Limpopo 0699 ·{' '}
          <a href='mailto:info@virtualhospitalsafrica.org' class='underline'>
            info@virtualhospitalsafrica.org
          </a>
        </p>
      </div>
    </section>
  )
}

// deno-lint-ignore require-await
export default async function DonatePage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title='Donate | Virtual Hospitals Africa'
    >
      <Hero />
      <GiftLevels />
      <Donate />
      <ClosingCTA />
    </MarketingLayout>
  )
}
