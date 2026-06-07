import { Context } from 'fresh'
import MarketingLayout from '../components/library/MarketingLayout.tsx'
import { ChartBarIcon, GlobeEuropeAfricaIcon, RocketLaunchIcon, Squares2x2Icon, WrenchScrewdriverIcon } from '../components/library/icons/heroicons/solid.tsx'
import { JSX } from 'preact'

type IconComponent = (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element

type Phase = {
  phase: string
  icon: IconComponent
  timeline: string
  activity: string
  module: string
}

const phase_groups: Array<{ label: string; phases: Phase[] }> = [
  {
    label: 'Pilot',
    phases: [
      {
        phase: 'Phase 1',
        icon: WrenchScrewdriverIcon,
        timeline: 'Months 1–2',
        activity: 'Technical setup + onboarding',
        module: 'Finalizing baseline clinical protocol digitization, workflow mapping, and academic MoU execution.',
      },
      {
        phase: 'Phase 2',
        icon: RocketLaunchIcon,
        timeline: 'Months 3–6',
        activity: 'Active screening deployment',
        module: 'Hardware provisioning, nurse training via UL, and localized facility launch for Core NCDs.',
      },
      {
        phase: 'Phase 3',
        icon: ChartBarIcon,
        timeline: 'Months 6–12',
        activity: 'Longitudinal monitoring + RWE',
        module: 'Continuous care loop tracking and implementation science research led by UL for Hypertension/CKD.',
      },
    ],
  },
  {
    label: 'Post-pilot',
    phases: [
      {
        phase: 'Phase 4',
        icon: Squares2x2Icon,
        timeline: 'Year 2',
        activity: 'Multi-module clinical expansion',
        module:
          "Add more health facilities, treatment guidelines, and full tracking of essential medicines across levels of care. Embed government's pharmaceutical and laboratory systems — supply chain, quality assurance, and stock monitoring — onto the proven VHA architecture.",
      },
      {
        phase: 'Phase 5',
        icon: GlobeEuropeAfricaIcon,
        timeline: 'Year 3+',
        activity: 'Continental scale & NHI integration',
        module: 'National NHI data registry integration analysis and launchpad activities for broader African expansion.',
      },
    ],
  },
]

function Hero() {
  return (
    <section class='bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white'>
      <div class='mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8'>
        <div class='max-w-3xl'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-4'>
            Pilot roadmap
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl'>
            From first clinic to continental scale
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50'>
            A staged plan to take Virtual Hospitals Africa from initial deployment in Limpopo to integration with the National Health Insurance data registry
            and expansion across the continent.
          </p>
        </div>
      </div>
    </section>
  )
}

function ScheduleTable() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Desktop table */}
        <div class='hidden md:block overflow-hidden rounded-2xl ring-1 ring-gray-200'>
          <table class='w-full border-collapse'>
            <thead>
              <tr class='bg-gray-50'>
                <th class='w-1/6 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Phase
                </th>
                <th class='w-1/6 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Timeline
                </th>
                <th class='w-1/4 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Activities
                </th>
                <th class='bg-indigo-50 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-indigo-700'>
                  Milestones
                </th>
              </tr>
            </thead>
            <tbody class='divide-y divide-gray-200'>
              {phase_groups.map((group) => (
                <>
                  <tr class='bg-indigo-900'>
                    <td
                      colSpan={4}
                      class='px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white'
                    >
                      {group.label}
                    </td>
                  </tr>
                  {group.phases.map((p) => {
                    const Icon = p.icon
                    return (
                      <tr class='transition hover:bg-gray-50/60'>
                        <td class='px-6 py-6 align-middle'>
                          <div class='flex items-center gap-3'>
                            <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                              <Icon class='h-6 w-6' />
                            </span>
                            <span class='text-base font-semibold text-gray-900'>
                              {p.phase}
                            </span>
                          </div>
                        </td>
                        <td class='px-6 py-6 align-middle text-base font-medium text-gray-700'>
                          {p.timeline}
                        </td>
                        <td class='px-6 py-6 align-middle text-base text-gray-600'>
                          {p.activity}
                        </td>
                        <td class='bg-indigo-50/40 px-6 py-6 align-middle text-base font-medium text-indigo-900'>
                          {p.module}
                        </td>
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div class='md:hidden flex flex-col gap-6'>
          {phase_groups.map((group) => (
            <div class='flex flex-col gap-4'>
              <div class='rounded-lg bg-indigo-900 px-4 py-2 text-center text-sm font-semibold uppercase tracking-widest text-white'>
                {group.label}
              </div>
              {group.phases.map((p) => {
                const Icon = p.icon
                return (
                  <div class='rounded-2xl bg-white p-5 ring-1 ring-gray-200'>
                    <div class='flex items-center gap-3 border-b border-gray-200 pb-3'>
                      <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                        <Icon class='h-6 w-6' />
                      </span>
                      <div>
                        <h3 class='text-base font-semibold text-gray-900'>
                          {p.phase}
                        </h3>
                        <p class='text-xs font-medium text-gray-500'>
                          {p.timeline}
                        </p>
                      </div>
                    </div>
                    <dl class='mt-4 grid grid-cols-1 gap-3'>
                      <div class='rounded-lg bg-gray-50 p-3'>
                        <dt class='text-xs font-semibold uppercase tracking-wider text-gray-500'>
                          Primary Operational Activity
                        </dt>
                        <dd class='mt-1 text-sm text-gray-700'>
                          {p.activity}
                        </dd>
                      </div>
                      <div class='rounded-lg bg-indigo-50 p-3'>
                        <dt class='text-xs font-semibold uppercase tracking-wider text-indigo-700'>
                          Clinical Module Focus & Milestones
                        </dt>
                        <dd class='mt-1 text-sm font-medium text-indigo-900'>
                          {p.module}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// deno-lint-ignore require-await
export default async function PilotSchedulePage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title='Pilot Schedule | Virtual Hospitals Africa'
    >
      <Hero />
      <ScheduleTable />
    </MarketingLayout>
  )
}
