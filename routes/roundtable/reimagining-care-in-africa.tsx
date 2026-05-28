import { Context } from 'fresh'
import { z } from 'zod'
import { assert } from 'std/assert/assert.ts'
import MarketingLayout from '../../components/library/MarketingLayout.tsx'
import { Button } from '../../components/library/Button.tsx'
import Form from '../../components/library/Form.tsx'
import FormRow from '../../components/library/FormRow.tsx'
import { TextInput } from '../../islands/form/inputs/text.tsx'
import { postHandler } from '../../backend/postHandler.ts'
import redirect from '../../util/redirect.ts'
import { CalendarDaysIcon, ClockIcon, GlobeAltIcon, VideoCameraIcon } from '../../components/library/icons/heroicons/solid.tsx'

const ROUNDTABLE_LINK = 'https://riverside.com/studio/ubuntu-doctor-coaching?t=d5fc67fa6e6cac367879'

const meeting_is_in_future = false
const meeting_is_now = true
const meeting_is_past = false
// --- Event details -----------------------------------------------------------

const EVENT = {
  title: 'Reimagining Care in Africa',
  tagline: 'A virtual roundtable on closing the gaps in frontline care',
  // TODO: confirm exact date before launch
  date: 'Thursday, 28 May 2026',
  time: '3:30 PM SAST (South African Standard Time)',
  duration: 'one hour',
  format: 'Online · link emailed to registrants',
}

const ESSAY = {
  title: 'Why we must reimagine care in Africa',
  author: 'Dr. Sikhululiwe Ngwenya',
  href: '/blog/why-we-must-reimagine-care-in-africa',
  pull_quote:
    'Healthcare workers are not failing the system. They are holding it together. The issue is not a lack of commitment — it is the way care is organized.',
}

// --- Speakers (design from routes/roundtable/reimagining-care-in-africa/speakers/2.tsx) ---

const SPEAKERS = [
  { slug: 'sikhululiwe-ngwenya', name: 'Dr. Sikhululiwe Ngwenya', title: 'Chief Medical Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'clint-hendrikse', name: 'Clint Hendrikse', title: 'Head of Division: Emergency Medicine', organization: 'University of Cape Town' },
  { slug: 'will-weiss', name: 'Will Weiss', title: 'Chief Technology Officer', organization: 'Virtual Hospitals Africa' },
  { slug: 'melitah-rasweswe', name: 'Dr. Melitah Rasweswe', title: 'Prof. of Nursing Practice', organization: 'University of Limpopo' },
  { slug: 'nondumiso-makhunga', name: 'Dr. Nondumiso Makhunga', title: 'Moderator', organization: 'Virtual Hospitals Africa' },
  { slug: 'arthur-phukubye', name: 'Dr. Arthur Phukuybe', title: 'Speaker', organization: 'University of Limpopo' },
]

// --- MailerLite integration --------------------------------------------------
//
// Subscribers from this page are added to a dedicated MailerLite group so
// the event organizers can send a campaign just to roundtable registrants.
// Set ROUNDTABLE_MAILERLITE_GROUP_ID once the group has been created in
// MailerLite (see instructions printed at the end of this file's task notes).

const MAILERLITE_API_TOKEN = Deno.env.get('MAILERLITE_API_TOKEN')
const ROUNDTABLE_MAILERLITE_GROUP_ID = '187910070338586224'

async function subscribeToRoundtable(
  recipient: { name: string; email: string; organization?: string },
) {
  assert(MAILERLITE_API_TOKEN, 'MAILERLITE_API_TOKEN must be set')
  assert(
    ROUNDTABLE_MAILERLITE_GROUP_ID,
    'ROUNDTABLE_MAILERLITE_GROUP_ID must be set to the MailerLite group id for the "Reimagining Care in Africa" roundtable',
  )

  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MAILERLITE_API_TOKEN}`,
    },
    body: JSON.stringify({
      email: recipient.email,
      groups: [ROUNDTABLE_MAILERLITE_GROUP_ID],
      fields: {
        name: recipient.name,
        entrypoint: 'roundtable_reimagining_care_in_africa',
        ...(recipient.organization && { organization: recipient.organization }),
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`MailerLite addSubscriber (roundtable) failed: ${response.status} ${body}`)
  }
}

// --- POST handler ------------------------------------------------------------

const RegistrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().includes('@'),
  organization: z.string().optional(),
})

async function notifyDiscordOfRoundtableSignup(
  recipient: { name: string; email: string; organization?: string },
) {
  const url = Deno.env.get('DISCORD_MAILING_LIST_WEBHOOK_URL')
  if (!url) return
  let content = `🎉 **Roundtable signup — Reimagining Care in Africa**\n\n${recipient.name} ${recipient.email}`
  if (recipient.organization) content += `\norganization: ${recipient.organization}`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })
}

export const handler = postHandler(
  RegistrationSchema,
  async (_ctx, recipient) => {
    await subscribeToRoundtable(recipient)
    await notifyDiscordOfRoundtableSignup(recipient)
    const success = `You're registered, ${recipient.name}! We'll email your link and a calendar invite shortly. See you at the roundtable 🎉`
    return redirect(`/thank-you?message=${encodeURIComponent(success)}`)
  },
)

// --- Page sections -----------------------------------------------------------

function Hero() {
  return (
    <section class='relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white'>
      <div class='absolute inset-0 opacity-30'>
        <img
          src='/images/connected-network.png'
          alt=''
          class='h-full w-full object-cover'
        />
        <div class='absolute inset-0 bg-gradient-to-r from-indigo-900/95 via-indigo-900/80 to-indigo-900/40' />
      </div>

      <div class='relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8'>
        <a class='max-w-3xl' href={ROUNDTABLE_LINK}>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-4'>
            Virtual Roundtable · Live
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl'>
            {EVENT.title}
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50 sm:text-xl max-w-2xl'>
            Join leading clinicians, researchers, and technologists working to discuss a vision of connected care, what that means for practitioners on the
            frontline, and how that will affect patient outcomes.
          </p>

          <dl class='mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl'>
            <div class='flex items-start gap-3'>
              <CalendarDaysIcon class='h-6 w-6 text-indigo-200 mt-0.5' />
              <div>
                <dt class='text-xs uppercase tracking-wide text-indigo-200'>Date</dt>
                <dd class='text-base font-semibold'>{EVENT.date}</dd>
              </div>
            </div>
            <div class='flex items-start gap-3'>
              <ClockIcon class='h-6 w-6 text-indigo-200 mt-0.5' />
              <div>
                <dt class='text-xs uppercase tracking-wide text-indigo-200'>Time</dt>
                <dd class='text-base font-semibold'>{EVENT.time}</dd>
              </div>
            </div>
            <div class='flex items-start gap-3'>
              <VideoCameraIcon class='h-6 w-6 text-indigo-200 mt-0.5' />
              <div>
                <dt class='text-xs uppercase tracking-wide text-indigo-200'>Format</dt>
                <dd class='text-base font-semibold'>{EVENT.format}</dd>
              </div>
            </div>
            <div class='flex items-start gap-3'>
              <GlobeAltIcon class='h-6 w-6 text-indigo-200 mt-0.5' />
              <div>
                <dt class='text-xs uppercase tracking-wide text-indigo-200'>Duration</dt>
                <dd class='text-base font-semibold'>{EVENT.duration}</dd>
              </div>
            </div>
          </dl>

          <div class='mt-10 flex flex-wrap gap-4'>
            {meeting_is_in_future && (
              <Button href='#register' variant='secondary' size='xl'>
                Save my seat
              </Button>
            )}
            {meeting_is_now && (
              <Button href={ROUNDTABLE_LINK} variant='secondary' size='xl'>
                Join roundtable now
              </Button>
            )}
            {meeting_is_past && <>TODO: Youtube link</>}
          </div>
        </a>
      </div>
    </section>
  )
}

function About() {
  return (
    <section class='bg-white py-16 sm:py-20'>
      <div class='mx-auto max-w-4xl px-6 lg:px-8'>
        <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
          What we'll be discussing
        </h2>
        {
          /* <p class='mt-6 text-lg leading-8 text-gray-600'>
          Across well-resourced and under-resourced settings alike, the same frustrations recur: fragmented pathways, incomplete information, referrals that
          never close the loop, and patients lost between levels of care. Healthcare workers are holding the system together — but most feel it isn't working
          with them. This roundtable asks a different question: what would it take to organize care so that providers can do their best work, and patients don't
          fall through the cracks?
        </p> */
        }
        <ul class='mt-8 grid gap-4 sm:grid-cols-2'>
          {[
            'Turning chains of missed opportunities into connected pathways',
            'Shifting care from reactive to proactive at the first mile',
            'Clinical decision support that fits real-world workflows',
            'Coordinating referrals and follow-up across levels of care',
            'Building systems that support, rather than replace, providers',
            'Reimagining care from local realities — not waiting for elsewhere',
          ].map((point) => (
            <li class='flex items-start gap-3 rounded-xl bg-gray-50 p-4 ring-1 ring-gray-200'>
              <span class='mt-1 inline-block h-2 w-2 flex-none rounded-full bg-indigo-600' />
              <span class='text-base leading-6 text-gray-800 -mt-1'>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Speakers() {
  return (
    <section class='bg-slate-50 py-16 sm:py-20'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          {
            /* <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            Speakers
          </p> */
          }
          <h2 class='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Speakers
          </h2>
        </div>

        <div class='mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {SPEAKERS.map((s) => (
            <div class='flex flex-col bg-white rounded-2xl shadow-md overflow-hidden'>
              <img
                src={`/images/team/square-headshots/${s.slug}.png`}
                alt={s.name}
                class='aspect-square w-full object-cover'
              />
              <div class='flex-1 flex flex-col justify-center px-6 py-5'>
                <div class='text-xl font-semibold leading-tight text-slate-900'>
                  {s.name}
                </div>
                <div class='mt-1 text-lg leading-tight text-indigo-700 flex flex-col'>
                  {[s.title].flat().map((title) => <div key={title}>{title}</div>)}
                </div>
                <div class='text-lg text-slate-500 leading-tight pt-1'>
                  {s.organization}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Register() {
  return (
    <section
      id='register'
      class='bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-16 sm:py-24'
    >
      <div class='mx-auto max-w-3xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Reserve your seat
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            Registration is free. We'll email you the link, a calendar invite, and a follow-up with the recording and resources after the event.
          </p>
        </div>
        <div class='mt-10 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200 sm:p-8'>
          <Form
            method='POST'
            action='/roundtable/reimagining-care-in-africa'
            className='w-full'
          >
            <FormRow>
              <TextInput name='name' label='Full name' required />
            </FormRow>
            <FormRow>
              <TextInput name='email' type='email' required />
            </FormRow>
            <FormRow>
              <TextInput name='organization' label='Organization (optional)' />
            </FormRow>
            <FormRow className='container mt-2'>
              <Button type='submit'>
                Register
              </Button>
            </FormRow>
          </Form>
          <p class='mt-4 text-xs text-gray-500 text-center'>
            By registering you'll be added to event reminders. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  )
}

function JoinNow() {
  return (
    <section
      id='join_now'
      class='bg-gradient-to-br from-indigo-50 via-white to-indigo-50 py-16 sm:py-24'
    >
      <div class='mx-auto max-w-3xl px-6 lg:px-8'>
        <div class='mx-auto max-w-2xl text-center'>
          <h2 class='text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Join roundtable now
          </h2>
          <p class='mt-4 text-lg leading-8 text-gray-600'>
            Click the button below to be part of our live discussion
          </p>
          <Button className='mt-3' href={ROUNDTABLE_LINK}>
            Join Now
          </Button>
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

function Essay() {
  return (
    <section class='bg-white py-16 sm:py-20'>
      <div class='mx-auto max-w-4xl px-6 lg:px-8'>
        <div class='rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-8 shadow-sm ring-1 ring-gray-200 sm:p-10'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-600'>
            An appeal from our Chief Medical Officer
          </p>
          <h2 class='mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
            {ESSAY.title}
          </h2>
          <p class='mt-2 text-sm text-gray-500'>By {ESSAY.author}</p>
          <blockquote class='mt-6 border-l-4 border-indigo-600 pl-4 text-lg italic leading-8 text-gray-700'>
            “{ESSAY.pull_quote}”
          </blockquote>
          <div class='mt-8'>
            <Button href={ESSAY.href} size='lg'>
              Read essay
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// --- Page --------------------------------------------------------------------

// deno-lint-ignore require-await
export default async function ReimaginingCareInAfricaPage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title={`${EVENT.title} | Virtual Hospitals Africa`}
      ogImage='/images/ogimage-roundtable-reimagining.png'
    >
      <Hero />
      <About />
      <Speakers />
      {meeting_is_in_future && <Register />}
      {meeting_is_now && <JoinNow />}
      <Essay />
      <ClosingCTA />
    </MarketingLayout>
  )
}
