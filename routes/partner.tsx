import { Context } from 'fresh'
import { Button } from '../components/library/Button.tsx'
import MarketingLayout from '../components/library/MarketingLayout.tsx'
import FormRow from '../components/library/FormRow.tsx'
import Form from '../components/library/Form.tsx'
import SelectWithOther from '../islands/SelectWithOther.tsx'
import { TextInput } from '../islands/form/inputs/text.tsx'
import { TextArea } from '../islands/form/inputs/textarea.tsx'
import { ArrowRightIcon, DocumentArrowDownIcon } from '../components/library/icons/heroicons/solid.tsx'
import { DONATE_HERO_IMAGE } from './donate.tsx'
import { CallToAction } from '../components/CallToAction.tsx'
import { Container } from '../components/library/Container.tsx'

const SUPPORT_OPTIONS = [
  'Government Partnership',
  'Technical/Research Partnership',
  'Industry & Technology Partnership',
  'Funding',
  'Local Health Organization Partnership',
  'Medical Support',
  'Medical Equipment',
  'Software Development',
  'Networking',
  'Media/Journalism',
  'Showcases/Events',
] as const

type SupportOption = typeof SUPPORT_OPTIONS[number]

function Hero() {
  return (
    <section class='relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white'>
      <div class='absolute inset-0 opacity-30'>
        <img
          src={DONATE_HERO_IMAGE}
          sizes='100vw'
          alt=''
          class='h-full w-full object-cover'
        />
        <div class='absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/80 to-indigo-900/40' />
      </div>

      <div class='relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32'>
        <div class='max-w-3xl'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-4'>
            Partner with us
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            Connect the<br />
            <span class='text-indigo-200'>first mile of care</span>
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50 sm:text-xl max-w-2xl'>
            Join our forward-thinking consortium of public health experts building the digital infrastructure to ensure patients in all settings get access to
            the care they need
          </p>
          <div class='mt-10 flex flex-wrap gap-4'>
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
              Simplifying care across the network
            </h2>
            <p class='mt-6 text-lg leading-8 text-gray-600'>
              Healthcare in Africa is often described as a capacity problem with doctors unavailable or overwhelmed. But even with the same levels of staffing
              there's the potential to dramatically improve outcomes by focusing on connectivity. With more cases handled at the clinic, we can catch issues
              early and smooth out care delivery.
            </p>
            <p class='mt-4 text-lg leading-8 text-gray-600'>
              We are excited to pilot Virtual Hospitals Africa in Limpopo Province to embed structured decision-making support and specialist referral pathways
              directly into the frontline workflow. Join our efforts to support the clinicians best positioned to improve patient outcomes.
            </p>
            <dl class='mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3'>
              <div class='border-l-4 border-indigo-600 pl-4'>
                <dt class='text-sm font-medium text-gray-500'>Facilities</dt>
                <dd class='mt-1 text-2xl font-bold text-gray-900'>5 clinics + hospital</dd>
              </div>
              <div class='border-l-4 border-indigo-600 pl-4'>
                <dt class='text-sm font-medium text-gray-500'>Encounters</dt>
                <dd class='mt-1 text-2xl font-bold text-gray-900'>
                  10,000 patients
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
              src='/images/telemedicine.png'
              sizes='(max-width: 1024px) 100vw, 50vw'
              alt='Frontline nurse using a digital triage tool'
              class='aspect-[4/5] w-full rounded-2xl bg-gray-100 object-cover shadow-xl'
            />
            <div class='absolute -bottom-6 -left-6 hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-xl sm:block max-w-xs'>
              <p class='text-sm font-medium uppercase tracking-wide text-indigo-200'>
                Mission
              </p>
              <p class='mt-1 text-lg font-semibold leading-snug'>
                Ensure patients who need it can see a doctor that day
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const partnership_types: Array<{
  name: string
  audience: string
  themes: string[]
  support: SupportOption
}> = [
  {
    name: 'Government',
    audience: 'Ministries, provincial health departments, and public sector agencies.',
    themes: ['Public digitization', 'Systems strengthening', 'Policy-aligned pilots'],
    support: 'Government Partnership',
  },
  {
    name: 'Academic & Research',
    audience: 'Universities, research institutes, and clinical schools.',
    themes: ['Evidence generation', 'Workforce training', 'Translational research'],
    support: 'Technical/Research Partnership',
  },
  {
    name: 'Industry & Technology',
    audience: 'Health-tech, diagnostics, device and pharmaceutical companies.',
    themes: ['Tech integration', 'Connected devices', 'Interoperability'],
    support: 'Industry & Technology Partnership',
  },
  {
    name: 'NGOs & Foundations',
    audience: 'Donors, philanthropic foundations, and mission-aligned programs.',
    themes: ['Funded impact', 'Rural access', 'ESG outcomes'],
    support: 'Funding',
  },
  {
    name: 'Healthcare Providers',
    audience: 'Hospitals, clinic networks, and community health programs.',
    themes: ['Frontline workflow', 'Clinical decision support', 'Capacity building'],
    support: 'Local Health Organization Partnership',
  },
]

function PartnershipTypes() {
  return (
    <section class='bg-gray-50 py-10 sm:py-12'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-3xl text-center'>
          {
            /* <p class='text-xs font-semibold uppercase tracking-widest text-indigo-600'>

          </p> */
          }
          <h2 class='mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
            Opportunities
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            We are ready to work with you to help advanced our shared interest in public health
          </p>
        </div>
        <div class='mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          {partnership_types.map((t) => (
            <a
              href={`/partner?support=${encodeURIComponent(t.support)}#contact`}
              class='group relative flex flex-col rounded-xl bg-white p-4 pr-8 shadow-sm ring-1 ring-gray-200 transition hover:shadow-md hover:ring-indigo-400'
            >
              <h3 class='text-sm font-semibold text-indigo-900'>{t.name}</h3>
              <p class='mt-1 text-xs leading-5 text-gray-600'>{t.audience}</p>
              <ul class='mt-3 flex flex-wrap gap-1.5'>
                {t.themes.map((th) => (
                  <li class='rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700'>
                    {th}
                  </li>
                ))}
              </ul>
              <ArrowRightIcon class='absolute bottom-3 right-3 h-4 w-4 text-indigo-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-indigo-600' />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

// const phases = [
//   {
//     label: 'Phase 1',
//     title: 'Triage & Emergency',
//     current: true,
//     body:
//       'Establish the Digital Front Door. Standardized symptom capture and virtual waiting rooms that prioritize high-risk cases for immediate stabilization.',
//   },
//   {
//     label: 'Phase 2A',
//     title: 'Outpatient Care & Referrals',
//     body: 'Formalize the link between clinics and district hospitals with clinical decision support for chronic and routine care.',
//   },
//   {
//     label: 'Phase 2B',
//     title: 'Labs, Radiology & Pharmacy',
//     body: 'Integrate diagnostics into the virtual workflow with electronic lab ordering and real-time result interpretation.',
//   },
//   {
//     label: 'Phase 3',
//     title: 'Remote Specialist Consults',
//     body: 'Telehealth-driven multidisciplinary case discussions that reduce unnecessary and expensive patient transfers.',
//   },
//   {
//     label: 'Phase 4',
//     title: 'Records & Education',
//     body: 'Build longitudinal digital patient records and use real-world data to train health workers and educate communities.',
//   },
//   {
//     label: 'Phase 5',
//     title: 'Inpatients & Critical Care',
//     body: 'Full realization of the Distributed Hospital — peri-operative and critical-care decision support from clinic bed to theater.',
//   },
// ]

// function Roadmap() {
//   return (
//     <section class='bg-gray-50 py-16 sm:py-24'>
//       <div class='mx-auto max-w-7xl px-6 lg:px-8'>
//         <div class='mx-auto max-w-2xl text-center'>
//           <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
//             The big picture
//           </p>
//           <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
//             VHA implementation roadmap
//           </h2>
//           <p class='mt-4 text-lg leading-8 text-gray-600'>
//             This funding round is dedicated to Phase 1, but you are investing in the foundation of a multi-stage clinical evolution.
//           </p>
//         </div>

//         <div class='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
//           {phases.map((p) => (
//             <div
//               class={`relative rounded-2xl border p-6 shadow-sm transition hover:shadow-md ${
//                 p.current ? 'border-indigo-600 bg-white ring-2 ring-indigo-600' : 'border-gray-200 bg-white'
//               }`}
//             >
//               {p.current && (
//                 <span class='absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white'>
//                   Current focus
//                 </span>
//               )}
//               <p class='text-xs font-semibold uppercase tracking-widest text-indigo-600'>
//                 {p.label}
//               </p>
//               <h3 class='mt-2 text-xl font-semibold text-gray-900'>
//                 {p.title}
//               </h3>
//               <p class='mt-3 text-sm leading-6 text-gray-600'>{p.body}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

// const tiers = [
//   {
//     name: 'Health Tech Lead',
//     range: 'R1.9M – R2.5M',
//     label: 'Anchor Partner',
//     body: 'Fund deployment of the core telehealth platform, triage engine, and clinical decision modules.',
//     featured: true,
//   },
//   {
//     name: 'Research & Impact',
//     range: 'R1.5M – R2.5M',
//     body: 'Fund monitoring and analytics on clinical risk reduction across the pilot.',
//   },
//   {
//     name: 'Diagnostics Lead',
//     range: 'R250k – R500k',
//     body: 'Provide connected diagnostic devices for real-time remote vitals and Point-of-Care tools.',
//   },
//   {
//     name: 'Energy & Resilience',
//     range: 'R200k – R350k',
//     body: 'Fund solar and backup systems to ensure 24/7 "always-on" triage capability.',
//   },
//   {
//     name: 'Digital Infrastructure',
//     range: 'R180k – R250k',
//     body: 'Fund hardware and connectivity — laptops, tablets, phones and other IT equipment.',
//   },
//   {
//     name: 'Training & Ops',
//     range: 'R120k – R180k',
//     body: 'Fund frontline staff training and facility-level workflow adoption.',
//   },
// ]

// function Tiers() {
//   return (
//     <section id='tiers' class='bg-white py-16 sm:py-24'>
//       <div class='mx-auto max-w-7xl px-6 lg:px-8'>
//         <div class='mx-auto max-w-2xl text-center'>
//           <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
//             Phase 1 Funding Tiers
//           </p>
//           <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
//             Partner-first infrastructure
//           </h2>
//           <p class='mt-4 text-lg leading-8 text-gray-600'>
//             We are seeking Strategic Lead Partners to own the infrastructure layers for the Triage and Emergency pilot across two clinics.
//           </p>
//         </div>

//         <div class='mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
//           {tiers.map((t) => (
//             <div
//               class={`flex flex-col rounded-2xl p-8 ring-1 ${
//                 t.featured ? 'bg-indigo-900 text-white ring-indigo-900 shadow-2xl lg:scale-[1.02]' : 'bg-white text-gray-900 ring-gray-200 shadow-sm'
//               }`}
//             >
//               {t.label && (
//                 <p
//                   class={`text-xs font-semibold uppercase tracking-widest ${t.featured ? 'text-indigo-200' : 'text-indigo-600'}`}
//                 >
//                   {t.label}
//                 </p>
//               )}
//               <h3 class='mt-2 text-xl font-semibold'>{t.name}</h3>
//               <p
//                 class={`mt-4 text-3xl font-bold tracking-tight ${t.featured ? 'text-white' : 'text-gray-900'}`}
//               >
//                 {t.range}
//               </p>
//               <p
//                 class={`mt-4 text-sm leading-6 grow ${t.featured ? 'text-indigo-100' : 'text-gray-600'}`}
//               >
//                 {t.body}
//               </p>
//               <a
//                 href='#contact'
//                 class={`mt-6 inline-flex justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${
//                   t.featured ? 'bg-white text-indigo-900 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'
//                 }`}
//               >
//                 Become this partner
//               </a>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

const partners = [
  {
    name: 'University of Limpopo',
    role: 'Lead academic partner',
    logo: '/images/logos/ul.png',
  },
  {
    name: 'Limpopo Department of Health',
    role: 'Provincial government',
    logo: '/images/logos/limpopo_doh.png',
  },
  {
    name: 'University of Cape Town',
    role: 'Clinical advisors',
    logo: '/images/logos/uct.png',
  },
  {
    name: 'Knowledge Translation Unit (KTU)',
    role: 'Training & guidelines',
    logo: '/images/logos/ktu.png',
  },
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
            <div class='flex flex-col items-center rounded-xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-200'>
              <div class='flex h-20 w-full items-center justify-center'>
                <img
                  src={p.logo}
                  alt={`${p.name} logo`}
                  class='max-h-20 max-w-full object-contain'
                />
              </div>
              <p class='mt-4 text-base font-semibold text-gray-900'>{p.name}</p>
              <p class='mt-1 text-sm text-gray-500'>{p.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// const benefits = [
//   {
//     title: 'Standard-setting leadership',
//     body: 'Your technology becomes a core operational standard scaling from Phase 1 through to full healthcare delivery modules.',
//   },
//   {
//     title: 'Access to high-value clinical data',
//     body: 'Real-world insights from structured telehealth workflows: device performance, clinician decision-making, patient pathways.',
//   },
//   {
//     title: 'Preferred procurement positioning',
//     body: 'Establish your organization as a proven, integrated partner — strengthening future government and institutional contracts.',
//   },
//   {
//     title: 'ESG, CSR & measurable impact',
//     body: 'Auditable metrics aligned to ESG and Universal Health Coverage goals through direct frontline investment.',
//   },
//   {
//     title: 'Brand visibility',
//     body: 'Position your brand at the forefront of health system transformation across government, academic and clinical ecosystems.',
//   },
//   {
//     title: 'First-mover advantage',
//     body: 'Participate at the foundation stage of a model designed for district, provincial and national rollout.',
//   },
// ]

// function Benefits() {
//   return (
//     <section class='relative overflow-hidden bg-white py-16 sm:py-24'>
//       <div class='absolute inset-0 opacity-10'>
//         <img
//           src={placeholder(ROADMAP_SEED, 1280, 720)}
//           srcset={`${placeholder(ROADMAP_SEED, 640, 360)} 640w, ${placeholder(ROADMAP_SEED, 1280, 720)} 1280w, ${placeholder(ROADMAP_SEED, 1920, 1080)} 1920w`}
//           sizes='100vw'
//           alt=''
//           class='h-full w-full object-cover'
//         />
//       </div>
//       <div class='relative mx-auto max-w-7xl px-6 lg:px-8'>
//         <div class='mx-auto max-w-2xl text-center'>
//           <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
//             What's in it for you
//           </h2>
//           <p class='mt-4 text-lg leading-8 text-gray-600'>
//             Funding the foundation of Africa's digital health future comes with tangible strategic returns.
//           </p>
//         </div>
//         <div class='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3'>
//           {benefits.map((b) => (
//             <div class='rounded-2xl bg-white/90 p-6 shadow-sm ring-1 ring-gray-200 backdrop-blur'>
//               <h3 class='text-lg font-semibold text-gray-900'>{b.title}</h3>
//               <p class='mt-2 text-sm leading-6 text-gray-600'>{b.body}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

function Brief() {
  return (
    <section class='bg-white py-16 sm:py-20'>
      <div class='mx-auto max-w-4xl px-6 lg:px-8'>
        <div class='flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-8 text-center shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:gap-8 sm:p-10 sm:text-left'>
          <div class='flex-1'>
            <h2 class='text-2xl font-bold tracking-tight text-gray-900'>
              Download our partnership brief
            </h2>
            <p class='mt-2 text-base leading-7 text-gray-600'>
              Learn more about our model, roadmap, and funding opportunities.
            </p>
          </div>
          <a
            href='/marketing/Virtual Hospitals Africa.pdf'
            download
            class='inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-700'
          >
            <DocumentArrowDownIcon class='h-5 w-5' />
            Download PDF
          </a>
        </div>
      </div>
    </section>
  )
}

function Contact({ support }: { support?: SupportOption }) {
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
            <i>Reach out to start a conversation about improving access to care</i>
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
                label='What kind of partnership are you interested in?'
                value={support}
                options={SUPPORT_OPTIONS as unknown as SupportOption[]}
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
  const support_param = ctx.url.searchParams.get('support')
  const support = support_param && (SUPPORT_OPTIONS as readonly string[]).includes(support_param) ? support_param as SupportOption : undefined
  return (
    <MarketingLayout
      url={ctx.url}
      title='Partner With Us | Virtual Hospitals Africa'
    >
      <Hero />
      <PartnershipTypes />
      {/* <Benefits /> */}
      <Crisis />
      {
        /* <Roadmap />
      <Tiers /> */
      }
      <Partners />
      <Brief />
      <Contact support={support} />
      <Container>
        <CallToAction />
      </Container>
      <ClosingCTA />
    </MarketingLayout>
  )
}
