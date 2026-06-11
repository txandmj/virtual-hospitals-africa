import { Context } from 'fresh'
import MarketingLayout from '../../components/library/MarketingLayout.tsx'
import { ArrowPathIcon, BoltIcon, PuzzlePieceIcon, RocketLaunchIcon, UserGroupIcon, XMarkIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { CheckIcon } from '../../components/library/icons/heroicons/solid.tsx'
import { JSX } from 'preact'

type IconComponent = (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element

const rows: Array<{
  feature: string
  icon: IconComponent
  conventional: string
  vha: string
}> = [
  {
    feature: 'Care Delivery',
    icon: ArrowPathIcon,
    conventional: 'Fragmented care events; ad hoc or nonexistent',
    vha: 'Longitudinal care loops: risk stratification → case escalation → adherence monitoring',
  },
  {
    feature: 'Primary Focus',
    icon: UserGroupIcon,
    conventional: 'Urban, private-sector consumers',
    vha: 'Rural public clinics; augments frontline nurses in low-bandwidth environments',
  },
  {
    feature: 'Interoperability',
    icon: PuzzlePieceIcon,
    conventional: 'Standalone disease- or vaccination-centered apps with disjointed data capture',
    vha: 'SNOMED CT clinical core, ready for national EHR and NHI registry ingestion',
  },
  {
    feature: 'Deployment',
    icon: RocketLaunchIcon,
    conventional: 'Per-facility multi-year custom software development lifecycle',
    vha: 'Pre-configured digital public good; plugs into primary care with minimal technical overhead',
  },
  {
    feature: 'Time to Impact',
    icon: BoltIcon,
    conventional: 'Theoretical health models with slow rollout',
    vha: 'Screening and protecting patients within days of facility onboarding',
  },
]

function Hero() {
  return (
    <section class='bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 text-white'>
      <div class='mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8'>
        <div class='max-w-3xl'>
          <p class='text-sm font-semibold uppercase tracking-widest text-indigo-200 mb-4'>
            How we compare
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl'>
            A different model for digital health
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50'>
            Most digital health tools serve well-resourced consumers. Virtual Hospitals Africa was designed for the rural public clinics that need it most.
          </p>
        </div>
      </div>
    </section>
  )
}

function ComparisonTable() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Desktop table */}
        <div class='hidden md:block overflow-hidden rounded-2xl ring-1 ring-gray-200'>
          <table class='w-full border-collapse'>
            <thead>
              <tr class='bg-gray-50'>
                <th class='w-1/4 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Focus Area
                </th>
                <th class='w-3/8 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  <div class='flex items-center gap-2'>
                    Conventional Approaches
                    <XMarkIcon class='h-5 w-5 text-gray-400' />
                  </div>
                </th>
                <th class='w-3/8 bg-indigo-50 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-indigo-700'>
                  <div class='flex items-center gap-2'>
                    VHA Model
                    <CheckIcon class='h-5 w-5 text-indigo-600' />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class='divide-y divide-gray-200'>
              {rows.map((row) => {
                const Icon = row.icon
                return (
                  <tr class='transition hover:bg-gray-50/60'>
                    <td class='px-6 py-6 align-middle'>
                      <div class='flex items-center gap-3'>
                        <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                          <Icon class='h-6 w-6' />
                        </span>
                        <span class='text-base font-semibold text-gray-900'>
                          {row.feature}
                        </span>
                      </div>
                    </td>
                    <td class='px-6 py-6 align-middle text-base text-gray-600'>
                      {row.conventional}
                    </td>
                    <td class='bg-indigo-50/40 px-6 py-6 align-middle text-base font-medium text-indigo-900'>
                      {row.vha}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div class='md:hidden flex flex-col gap-4'>
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div class='rounded-2xl bg-white p-5 ring-1 ring-gray-200'>
                <div class='flex items-center gap-3 border-b border-gray-200 pb-3'>
                  <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                    <Icon class='h-6 w-6' />
                  </span>
                  <h3 class='text-base font-semibold text-gray-900'>
                    {row.feature}
                  </h3>
                </div>
                <dl class='mt-4 grid grid-cols-1 gap-3'>
                  <div class='rounded-lg bg-gray-50 p-3'>
                    <dt class='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500'>
                      <XMarkIcon class='h-4 w-4 text-gray-400' />
                      Conventional
                    </dt>
                    <dd class='mt-1 text-sm text-gray-700'>
                      {row.conventional}
                    </dd>
                  </div>
                  <div class='rounded-lg bg-indigo-50 p-3'>
                    <dt class='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700'>
                      <CheckIcon class='h-4 w-4 text-indigo-600' />
                      VHA Model
                    </dt>
                    <dd class='mt-1 text-sm font-medium text-indigo-900'>
                      {row.vha}
                    </dd>
                  </div>
                </dl>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// deno-lint-ignore require-await
export default async function ModelComparisonPage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title='Model Comparison | Virtual Hospitals Africa'
    >
      <Hero />
      <ComparisonTable />
    </MarketingLayout>
  )
}
