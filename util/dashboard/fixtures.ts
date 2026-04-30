// Loads the dashboard preview fixtures and exposes filter helpers shared by all preview widgets.
// JSON imports are bundled at build time so widget fetch() functions stay synchronous and pure.

import organizations_json from '../../fixtures/dashboard/organizations.json' with { type: 'json' }
import employees_json from '../../fixtures/dashboard/employees.json' with { type: 'json' }
import patients_json from '../../fixtures/dashboard/patients.json' with { type: 'json' }
import encounters_json from '../../fixtures/dashboard/encounters.json' with { type: 'json' }
import beds_json from '../../fixtures/dashboard/beds.json' with { type: 'json' }
import billing_json from '../../fixtures/dashboard/billing.json' with { type: 'json' }

import type { PreviewFilters } from './preview.ts'
import type { BedCapacity, BillingLine, Department, Employee, Encounter, Organization, Patient, Payer } from '../../scripts/generate_dashboard_fixtures.ts'

// The generator emits flat JSON; cast through unknown so we keep the structural type without any `as` widening at call sites.
function asTyped<T>(value: unknown): T {
  return value as T
}

export const ORGANIZATIONS: readonly Organization[] = asTyped<Organization[]>(organizations_json)
export const EMPLOYEES: readonly Employee[] = asTyped<Employee[]>(employees_json)
export const PATIENTS: readonly Patient[] = asTyped<Patient[]>(patients_json)
export const ENCOUNTERS: readonly Encounter[] = asTyped<Encounter[]>(encounters_json)
export const BEDS: readonly BedCapacity[] = asTyped<BedCapacity[]>(beds_json)
export const BILLING: readonly BillingLine[] = asTyped<BillingLine[]>(billing_json)

const BILLING_BY_ENCOUNTER = new Map<string, BillingLine>(BILLING.map((line) => [line.encounter_id, line]))

export function billingFor(encounter_id: string): BillingLine | null {
  return BILLING_BY_ENCOUNTER.get(encounter_id) ?? null
}

export function findOrganization(id: string): Organization | null {
  return ORGANIZATIONS.find((o) => o.id === id) ?? null
}

export function findEmployee(id: string): Employee | null {
  return EMPLOYEES.find((e) => e.id === id) ?? null
}

export type FilteredEncounters = {
  encounters: readonly Encounter[]
  organization_id: string | null
  department: string | null
  doctor_id: string | null
  payer: string | null
}

// Apply the current filter set to the full encounter list. Date range filters by created_at.
export function filterEncounters(filters: PreviewFilters): FilteredEncounters {
  const from_iso = filters.date_range.from?.toISOString() ?? null
  const to_iso = filters.date_range.to ? endOfDayIso(filters.date_range.to) : null
  const matched: Encounter[] = []
  for (const enc of ENCOUNTERS) {
    if (filters.organization_id && enc.organization_id !== filters.organization_id) continue
    if (filters.department && enc.department !== filters.department) continue
    if (filters.doctor_id && enc.primary_doctor_id !== filters.doctor_id) continue
    if (from_iso && enc.created_at < from_iso) continue
    if (to_iso && enc.created_at >= to_iso) continue
    if (filters.payer) {
      const line = BILLING_BY_ENCOUNTER.get(enc.id)
      if (!line || line.payer !== filters.payer) continue
    }
    matched.push(enc)
  }
  return {
    encounters: matched,
    organization_id: filters.organization_id,
    department: filters.department,
    doctor_id: filters.doctor_id,
    payer: filters.payer,
  }
}

function endOfDayIso(d: Date): string {
  const next = new Date(d)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString()
}

export function filterEmployees(filters: PreviewFilters): readonly Employee[] {
  return EMPLOYEES.filter((e) => {
    if (filters.organization_id && e.organization_id !== filters.organization_id) return false
    if (filters.department && e.specialty !== filters.department) return false
    if (filters.doctor_id && e.id !== filters.doctor_id) return false
    return true
  })
}

export function filterBeds(filters: PreviewFilters): readonly BedCapacity[] {
  return BEDS.filter((b) => {
    if (filters.organization_id && b.organization_id !== filters.organization_id) return false
    if (filters.department && b.department !== filters.department) return false
    return true
  })
}

export type DepartmentKey = Department
export type PayerKey = Payer
