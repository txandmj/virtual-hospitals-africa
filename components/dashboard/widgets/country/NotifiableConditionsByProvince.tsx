// Synthesizes per-(condition, province) case counts using PREVALENCE_WEIGHT × PROVINCE_POPULATION_WEIGHT.
// The fixture pool only includes 4 organizations spread across 2 countries, so we don't join
// encounters → orgs → provinces — the bubble plot would be sparse. The 9-province axis is
// purely categorical here; real attribution is deferred to the encounter/SNOMED wiring effort.

import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import {
  hashCount,
  NOTIFIABLE_CONDITIONS,
  type NotifiableCategory,
  PREVALENCE_WEIGHT,
  syntheticHash01,
} from '../../../../util/dashboard/notifiable_conditions.ts'
import { type Province, PROVINCE_POPULATION_WEIGHT, PROVINCES } from '../../../../util/dashboard/provinces.ts'
import WidgetCard from '../../WidgetCard.tsx'
import NotifiableConditionsByProvinceIsland from '../../../../islands/dashboard/NotifiableConditionsByProvinceIsland.tsx'

export type ProvinceCell = { province: Province; confirmed: number; suspected: number }

export type ProvinceRow = {
  condition_key: string
  condition_label: string
  nmc_category: NotifiableCategory
  cells: readonly ProvinceCell[]
}

export type ProvinceData = {
  provinces: readonly Province[]
  rows: readonly ProvinceRow[]
}

export const notifiable_conditions_by_province_widget: CountryWidgetDef<ProvinceData> = {
  id: 'notifiable_conditions_by_province',
  title: 'Conditions by province',
  span: 12,
  fetch: (filters) => {
    // The fixture date range affects the volume scale only — same hash determinism.
    const days = filters.date_range.from && filters.date_range.to
      ? Math.max(
        1,
        Math.round(
          (filters.date_range.to.getTime() - filters.date_range.from.getTime()) / 86_400_000,
        ),
      )
      : 30
    const rows: ProvinceRow[] = NOTIFIABLE_CONDITIONS.map((condition) => {
      const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
      const cells: ProvinceCell[] = PROVINCES.map((province, idx) => {
        const pw = PROVINCE_POPULATION_WEIGHT[province]
        const ceiling = Math.max(2, Math.round(weight * pw * days * 0.7)) + 1
        const seed = idx * 31 + condition.snomed_id.length
        const confirmed = hashCount(seed, condition.key, ceiling)
        const noise = 0.25 + syntheticHash01(seed, condition.key, 4861)
        return {
          province,
          confirmed,
          suspected: Math.round(confirmed * noise),
        }
      })
      return {
        condition_key: condition.key,
        condition_label: condition.label,
        nmc_category: condition.nmc_category,
        cells,
      }
    })
    return { provinces: PROVINCES, rows }
  },
  render: (data) => (
    <WidgetCard
      title='Conditions by province'
      subtitle={`${data.rows.length} conditions × ${data.provinces.length} provinces — toggle category and metric`}
    >
      <NotifiableConditionsByProvinceIsland data={data} />
    </WidgetCard>
  ),
}
