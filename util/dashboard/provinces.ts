// South African provinces used by country-wide notifiable-conditions dashboards.
// Population weights mirror real SA distribution and are reused by widget synthesis
// (e.g. NotifiableConditionsByProvince) so per-province bubble sizes look plausible.

import type { Organization } from '../../scripts/generate_dashboard_fixtures.ts'
import { ORGANIZATIONS } from './fixtures.ts'

export type Province = 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC'

export const PROVINCES: readonly Province[] = ['EC', 'FS', 'GP', 'KZN', 'LP', 'MP', 'NC', 'NW', 'WC'] as const

export const PROVINCE_LABELS: Record<Province, string> = {
  EC: 'Eastern Cape',
  FS: 'Free State',
  GP: 'Gauteng',
  KZN: 'KwaZulu-Natal',
  LP: 'Limpopo',
  MP: 'Mpumalanga',
  NC: 'Northern Cape',
  NW: 'North West',
  WC: 'Western Cape',
}

export const PROVINCE_POPULATION_WEIGHT: Record<Province, number> = {
  GP: 0.26,
  KZN: 0.19,
  WC: 0.12,
  EC: 0.11,
  LP: 0.10,
  MP: 0.08,
  NW: 0.07,
  FS: 0.05,
  NC: 0.02,
}

const ORG_PROVINCE_INDEX = new Map<string, Province>(
  (ORGANIZATIONS as readonly Organization[])
    .filter((o): o is Organization & { province: Province } => typeof (o as Partial<{ province: Province }>).province === 'string')
    .map((o) => [o.id, o.province]),
)

export function provinceForOrganization(organization_id: string): Province | null {
  return ORG_PROVINCE_INDEX.get(organization_id) ?? null
}
