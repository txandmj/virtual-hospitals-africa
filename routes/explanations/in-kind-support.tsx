import { Context } from 'fresh'
import MarketingLayout from '../components/library/MarketingLayout.tsx'
import {
  AcademicCapIcon,
  BeakerIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  ScaleIcon,
  UserGroupIcon,
} from '../components/library/icons/heroicons/solid.tsx'
import { JSX } from 'preact'

type IconComponent = (props: JSX.SVGAttributes<SVGSVGElement>) => JSX.Element

type Asset = {
  asset: string
  icon: IconComponent
  description: string
  bullets?: string[]
}

const partner_groups: Array<{
  partner: string
  icon: IconComponent
  assets: Asset[]
}> = [
  {
    partner: 'Limpopo Department of Health',
    icon: BuildingOfficeIcon,
    assets: [
      {
        asset: 'Physical Infrastructure & Facility Access',
        icon: BuildingOfficeIcon,
        description: 'Provision of community health centers and primary care clinics as active clinical testing grounds.',
      },
      {
        asset: 'Frontline Public Health Workforce',
        icon: UserGroupIcon,
        description: 'Daily operational hours of facility clinical managers, staff nurses, and community health workers executing the digital care pathways.',
      },
      {
        asset: 'Medical Equipment & Consumables',
        icon: BeakerIcon,
        description:
          'Utilization of existing point-of-care diagnostics, automated blood pressure cuffs, glucometers, laboratory sample transport sheets, and active clinical spaces.',
      },
    ],
  },
  {
    partner: 'University of Limpopo (UL) & University of Cape Town (UCT)',
    icon: AcademicCapIcon,
    assets: [
      {
        asset: 'Proprietary & Standardized Clinical Guidelines',
        icon: BookOpenIcon,
        description:
          'In-kind contribution, licensing, and sharing of existing, globally recognized clinical guidelines and primary care localized frameworks to form the backbone of the digital logic. This includes:',
        bullets: [
          'APC (Adult Primary Care)',
          'SATS (South African Triage Scale)',
          'PACK (Practical Approach to Care Kit)',
        ],
      },
      {
        asset: 'Ethical & Administrative Infrastructure',
        icon: ScaleIcon,
        description:
          'Institutional backing for the management of institutional review board (IRB) clearances and formal provincial health data data-sharing protocols.',
      },
    ],
  },
  {
    partner: 'Virtual Hospitals Africa (VHA)',
    icon: CpuChipIcon,
    assets: [
      {
        asset: 'Pre-Built Software Architecture Core',
        icon: CodeBracketIcon,
        description: 'Over 50,000 hours of existing software engineering, including pre-configured data schemas and SNOMED CT clinical dictionaries.',
      },
      {
        asset: 'Consortium Technical Management',
        icon: Cog6ToothIcon,
        description: 'Dedicated executive and technical oversight to manage platform stability and user interface adjustments based on frontline feedback.',
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
            Consortium contributions
          </p>
          <h1 class='text-4xl font-bold tracking-tight sm:text-5xl'>
            In-kind support powering the pilot
          </h1>
          <p class='mt-6 text-lg leading-8 text-indigo-50'>
            Each partner brings the assets they're uniquely positioned to provide — facilities, expertise, guidelines, and software — combining into a single
            digital care pathway for the public health system.
          </p>
        </div>
      </div>
    </section>
  )
}

function AssetDescription({ description, bullets }: { description: string; bullets?: string[] }) {
  return (
    <>
      <p>{description}</p>
      {bullets && (
        <ul class='mt-2 list-disc space-y-1 pl-5 marker:text-indigo-400'>
          {bullets.map((b) => <li key={b}>{b}</li>)}
        </ul>
      )}
    </>
  )
}

function SupportTable() {
  return (
    <section class='bg-white py-16 sm:py-24'>
      <div class='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Desktop table */}
        <div class='hidden md:block overflow-hidden rounded-2xl ring-1 ring-gray-200'>
          <table class='w-full border-collapse'>
            <thead>
              <tr class='bg-gray-50'>
                <th class='w-1/3 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-gray-500'>
                  Contributed In-Kind Asset / Resource
                </th>
                <th class='bg-indigo-50 px-6 py-5 text-left text-sm font-semibold uppercase tracking-wider text-indigo-700'>
                  Operational Function & Clinical Value
                </th>
              </tr>
            </thead>
            <tbody class='divide-y divide-gray-200'>
              {partner_groups.map((group) => {
                const GroupIcon = group.icon
                return (
                  <>
                    <tr class='bg-indigo-900'>
                      <td
                        colSpan={2}
                        class='px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-white'
                      >
                        <span class='inline-flex items-center gap-2'>
                          <GroupIcon class='h-5 w-5 text-indigo-200' />
                          {group.partner}
                        </span>
                      </td>
                    </tr>
                    {group.assets.map((a) => {
                      const Icon = a.icon
                      return (
                        <tr class='transition hover:bg-gray-50/60'>
                          <td class='px-6 py-6 align-middle'>
                            <div class='flex items-center gap-3'>
                              <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                                <Icon class='h-6 w-6' />
                              </span>
                              <span class='text-base font-semibold text-gray-900'>
                                {a.asset}
                              </span>
                            </div>
                          </td>
                          <td class='bg-indigo-50/40 px-6 py-6 align-middle text-base font-medium text-indigo-900'>
                            <AssetDescription description={a.description} bullets={a.bullets} />
                          </td>
                        </tr>
                      )
                    })}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked cards */}
        <div class='md:hidden flex flex-col gap-6'>
          {partner_groups.map((group) => {
            const GroupIcon = group.icon
            return (
              <div class='flex flex-col gap-4'>
                <div class='flex items-center justify-center gap-2 rounded-lg bg-indigo-900 px-4 py-2 text-center text-sm font-semibold uppercase tracking-widest text-white'>
                  <GroupIcon class='h-5 w-5 text-indigo-200' />
                  {group.partner}
                </div>
                {group.assets.map((a) => {
                  const Icon = a.icon
                  return (
                    <div class='rounded-2xl bg-white p-5 ring-1 ring-gray-200'>
                      <div class='flex items-center gap-3 border-b border-gray-200 pb-3'>
                        <span class='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700'>
                          <Icon class='h-6 w-6' />
                        </span>
                        <h3 class='text-base font-semibold text-gray-900'>
                          {a.asset}
                        </h3>
                      </div>
                      <div class='mt-4 rounded-lg bg-indigo-50 p-3 text-sm font-medium text-indigo-900'>
                        <AssetDescription description={a.description} bullets={a.bullets} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// deno-lint-ignore require-await
export default async function InKindSupportPage(ctx: Context<unknown>) {
  return (
    <MarketingLayout
      url={ctx.url}
      title='In-Kind Support | Virtual Hospitals Africa'
    >
      <Hero />
      <SupportTable />
    </MarketingLayout>
  )
}
