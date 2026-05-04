import { Context } from 'fresh'
import { Button } from '../components/library/Button.tsx'
import MarketingLayout from '../components/library/MarketingLayout.tsx'
import FormRow from '../components/library/FormRow.tsx'
import Form from '../components/library/Form.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'
import { TextInput } from '../islands/form/inputs/text.tsx'
import { TextArea } from '../islands/form/inputs/textarea.tsx'

const HERO_SEED = 'vha-clinic'
const STORY_SEED = 'vha-nurse'
const ROADMAP_SEED = 'vha-roadmap'

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
            Phase 1 Infrastructure Pilot
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Help us build the<br />
            <span class='text-indigo-200'>first mile of care</span>
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50 sm:text-xl max-w-2xl'>
            Virtual Hospitals Africa is digital health infrastructure that turns isolated rural clinics into high-performance nodes of a distributed national
            hospital system. Strategic partners co-build digital triage, remote specialist access, and standardized protocols at the moment it matters most:
            patient arrival.
          </p>
          <div class='mt-10 flex flex-wrap gap-4'>
            <Button href='#tiers' variant='secondary' size='xl'>
              See partner tiers
            </Button>
            <Button href='#contact' variant='hyperlink' size='xl'>
              Talk to our team
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Crisis() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16'>
          <div>
            <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
              A distribution crisis, not a capacity problem
            </h2>
            <p class='mt-6 text-lg leading-8 text-gray-600'>
              Healthcare in Africa is often described as a capacity problem. In reality it is a distribution problem. Patients and nurses are already at the
              facilities — what is missing is real-time access to clinical expertise and structured decision-making at the point of care.
            </p>
            <p class='mt-4 text-lg leading-8 text-gray-600'>
              The result is delayed decisions and increased risk at the exact moment patients are most vulnerable. VHA bridges this chasm by embedding
              specialist oversight directly into the frontline workflow.
            </p>
            <dl class='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3'>
              <div class='border-l-4 border-indigo-600 pl-4'>
                <dt class='text-sm font-medium text-gray-500'>Pilot scope</dt>
                <dd class='mt-1 text-2xl font-bold text-gray-900'>2 clinics</dd>
              </div>
              <div class='border-l-4 border-indigo-600 pl-4'>
                <dt class='text-sm font-medium text-gray-500'>Focus</dt>
                <dd class='mt-1 text-2xl font-bold text-gray-900'>
                  Triage & ER
                </dd>
              </div>
              <div class='border-l-4 border-indigo-600 pl-4'>
                <dt class='text-sm font-medium text-gray-500'>Uptime target</dt>
                <dd class='mt-1 text-2xl font-bold text-gray-900'>24/7</dd>
              </div>
            </dl>
          </div>

          <div class='relative'>
            <img
              src={placeholder(STORY_SEED, 800, 1000)}
              srcset={`${placeholder(STORY_SEED, 480, 600)} 480w, ${placeholder(STORY_SEED, 800, 1000)} 800w, ${placeholder(STORY_SEED, 1200, 1500)} 1200w`}
              sizes='(max-width: 1024px) 100vw, 50vw'
              alt='Frontline nurse using a digital triage tool'
              class='aspect-[4/5] w-full rounded-2xl bg-gray-100 object-cover shadow-xl'
            />
            <div class='absolute -bottom-6 -left-6 hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-xl sm:block max-w-xs'>
              <p class='text-sm font-medium uppercase tracking-wide text-indigo-200'>
                Mission
              </p>
              <p class='mt-1 text-lg font-semibold leading-snug'>
                End the geographic lottery of healthcare.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const phases = [
  {
    label: 'Phase 1',
    title: 'Triage & Emergency',
    current: true,
    body:
      'Establish the Digital Front Door. Standardized symptom capture and virtual waiting rooms that prioritize high-risk cases for immediate stabilization.',
  },
  {
    label: 'Phase 2A',
    title: 'Outpatient Care & Referrals',
    body: 'Formalize the link between clinics and district hospitals with clinical decision support for chronic and routine care.',
  },
  {
    label: 'Phase 2B',
    title: 'Labs, Radiology & Pharmacy',
    body: 'Integrate diagnostics into the virtual workflow with electronic lab ordering and real-time result interpretation.',
  },
  {
    label: 'Phase 3',
    title: 'Remote Specialist Consults',
    body: 'Telehealth-driven multidisciplinary case discussions that reduce unnecessary and expensive patient transfers.',
  },
  {
    label: 'Phase 4',
    title: 'Records & Education',
    body: 'Build longitudinal digital patient records and use real-world data to train health workers and educate communities.',
  },
  {
    label: 'Phase 5',
    title: 'Inpatients & Critical Care',
    body: 'Full realization of the Distributed Hospital — peri-operative and critical-care decision support from clinic bed to theater.',
  },
]

function Roadmap() {
  return (
    <section class='bg-gray-50 py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            The big picture
          </p>
          <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            VHA implementation roadmap
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            This funding round is dedicated to Phase 1, but you are investing in the foundation of a multi-stage clinical evolution.
          </p>
        </div>

        <div class='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {phases.map((p) => (
            <div
              class={`relative rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
                p.current ? 'border-indigo-600 bg-white ring-2 ring-indigo-600' : 'border-gray-200 bg-white'
              }`}
            >
              {p.current && (
                <span class='absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
                  Current focus
                </span>
              )}
              <p class='text-xs font-semibold uppercase tracking-widest text-indigo-600'>
                {p.label}
              </p>
              <h3 class='mt-2 text-xl font-semibold text-gray-900'>
                {p.title}
              </h3>
              <p class='mt-3 text-sm leading-6 text-gray-600'>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const tiers = [
  {
    name: 'Health Tech Lead',
    range: 'R1.9M – R2.5M',
    label: 'Anchor Partner',
    body: 'Fund deployment of the core telehealth platform, triage engine, and clinical decision modules.',
    featured: true,
  },
  {
    name: 'Research & Impact',
    range: 'R1.5M – R2.5M',
    body: 'Fund monitoring and analytics on clinical risk reduction across the pilot.',
  },
  {
    name: 'Diagnostics Lead',
    range: 'R250k – R500k',
    body: 'Provide connected diagnostic devices for real-time remote vitals and Point-of-Care tools.',
  },
  {
    name: 'Energy & Resilience',
    range: 'R200k – R350k',
    body: 'Fund solar and backup systems to ensure 24/7 "always-on" triage capability.',
  },
  {
    name: 'Digital Infrastructure',
    range: 'R180k – R250k',
    body: 'Fund hardware and connectivity — laptops, tablets, phones and other IT equipment.',
  },
  {
    name: 'Training & Ops',
    range: 'R120k – R180k',
    body: 'Fund frontline staff training and facility-level workflow adoption.',
  },
]

function Tiers() {
  return (
    <section id='tiers' class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            Phase 1 Funding Tiers
          </p>
          <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Partner-first infrastructure
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            We are seeking Strategic Lead Partners to own the infrastructure layers for the Triage and Emergency pilot across two clinics.
          </p>
        </div>

        <div class='mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {tiers.map((t) => (
            <div
              class={`flex flex-col rounded-2xl p-8 ring-1 ${
                t.featured ? 'bg-indigo-900 text-white ring-indigo-900 shadow-2xl lg:scale-[1.02]' : 'bg-white text-gray-900 ring-gray-200 shadow-sm'
              }`}
            >
              {t.label && (
                <p
                  class={`text-xs font-semibold uppercase tracking-widest ${t.featured ? 'text-indigo-200' : 'text-indigo-600'}`}
                >
                  {t.label}
                </p>
              )}
              <h3 class='mt-2 text-xl font-semibold'>{t.name}</h3>
              <p
                class={`mt-4 text-3xl font-bold tracking-tight ${t.featured ? 'text-white' : 'text-gray-900'}`}
              >
                {t.range}
              </p>
              <p
                class={`mt-4 text-sm leading-6 grow ${t.featured ? 'text-indigo-100' : 'text-gray-600'}`}
              >
                {t.body}
              </p>
              <a
                href='#contact'
                class={`mt-6 inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  t.featured ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                Become this partner
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const partners = [
  { name: 'University of Limpopo', role: 'Lead academic partner' },
  { name: 'Limpopo Department of Health', role: 'Provincial government' },
  { name: 'UCT Division of Emergency Medicine', role: 'Clinical advisors' },
  { name: 'Knowledge Translation Unit (KTU)', role: 'Training & guidelines' },
]

function Partners() {
  return (
    <section class='bg-gray-50 py-16 sm:py-20'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <h2 class='text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
          Backed by South Africa's premier institutions
        </h2>
        <div class='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {partners.map((p) => (
            <div class='rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200'>
              <p class='text-base font-semibold text-gray-900'>{p.name}</p>
              <p class='mt-1 text-sm text-gray-500'>{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const benefits = [
  {
    title: 'Standard-setting leadership',
    body: 'Your technology becomes a core operational standard scaling from Phase 1 through to full healthcare delivery modules.',
  },
  {
    title: 'Access to high-value clinical data',
    body: 'Real-world insights from structured telehealth workflows: device performance, clinician decision-making, patient pathways.',
  },
  {
    title: 'Preferred procurement positioning',
    body: 'Establish your organization as a proven, integrated partner — strengthening future government and institutional contracts.',
  },
  {
    title: 'ESG, CSR & measurable impact',
    body: 'Auditable metrics aligned to ESG and Universal Health Coverage goals through direct frontline investment.',
  },
  {
    title: 'Brand visibility',
    body: 'Position your brand at the forefront of health system transformation across government, academic and clinical ecosystems.',
  },
  {
    title: 'First-mover advantage',
    body: 'Participate at the foundation stage of a model designed for district, provincial and national rollout.',
  },
]

function Benefits() {
  return (
    <section class='relative overflow-hidden bg-white py-16 sm:py-24'>
      <div class='absolute inset-0 opacity-10'>
        <img
          src={placeholder(ROADMAP_SEED, 1280, 720)}
          srcset={`${placeholder(ROADMAP_SEED, 640, 360)} 640w, ${placeholder(ROADMAP_SEED, 1280, 720)} 1280w, ${placeholder(ROADMAP_SEED, 1920, 1080)} 1920w`}
          sizes='100vw'
          alt=''
          class='h-full w-full object-cover'
        />
      </div>
      <div class='relative mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            What's in it for you
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            Funding the foundation of Africa's digital health future comes with tangible strategic returns.
          </p>
        </div>
        <div class='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
          {benefits.map((b) => (
            <div class='rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-gray-200 backdrop-blur'>
              <h3 class='text-lg font-semibold text-gray-900'>{b.title}</h3>
              <p class='mt-2 text-sm leading-6 text-gray-600'>{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section
      id='contact'
      class='bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-16 sm:py-24'
    >
      <div class='mx-auto max-w-3xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Talk to our team
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            <i>With your help, we can improve healthcare in Africa.</i>
          </p>
        </div>
        <div class='mt-10 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200 sm:p-8'>
          <Form
            method='POST'
            action='/interest'
            className='w-full'
          >
            <FormRow>
              <TextInput name='name' required />
            </FormRow>
            <FormRow>
              <TextInput name='email' type='email' required />
            </FormRow>
            <FormRow>
              <SelectWithOther
                name='support'
                label='What kind of support might you be interested in offering?'
                options={[
                  'Funding',
                  'Technical/Research Partnership',
                  'Local Health Organization Partnership',
                  'Medical Support',
                  'Medical Equipment',
                  'Software Development',
                  'Networking',
                  'Media/Journalism',
                  'Showcases/Events',
                ]}
              >
              </SelectWithOther>
            </FormRow>
            <FormRow>
              <TextArea name='message' rows={3} />
            </FormRow>
            <FormRow className='container mt-2'>
              <Button type='submit'>
                Submit
              </Button>
            </FormRow>
          </Form>
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
          A seat at the table for Africa's digital health future
        </h2>
        <p class='mt-6 text-lg leading-8 text-indigo-100'>
          VHA is ready to move from concept to clinic. Co-build and own the backbone of the most ambitious health infrastructure project on the continent.
        </p>
        <div class='mt-8 flex flex-wrap justify-center gap-4'>
          <Button href='#contact' variant='secondary' size='xl'>
            Partner with us
          </Button>
          <Button href='/donate' variant='hyperlink' size='xl'>
            Make a donation
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
export default async function PartnerPage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title='Partner With Us | Virtual Hospitals Africa'
    >
      <Hero />
      <Crisis />
      <Roadmap />
      <Tiers />
      <Partners />
      <Benefits />
      <Contact />
      <ClosingCTA />
    </MarketingLayout>
  )
}
