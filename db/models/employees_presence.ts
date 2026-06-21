import { sql } from 'kysely'
import { RenderedEmployeeWithPresence, RenderedEmployeeWithPresenceAndSeniority, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { base } from './_base.ts'
import { employees, EmployeesSearch } from './employees.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { jsonObjectFrom } from '../helpers.ts'
import { patient_encounters } from './patient_encounters.ts'
import { minBy } from '../../util/maxBy.ts'
import { assert } from 'std/assert/assert.ts'

export const employees_presence = base({
  top_level_table: 'employment',
  baseQuery(trx: TrxOrDbOrQueryCreator, opts: EmployeesSearch) {
    return employees.baseQuery(trx, opts)
      .leftJoin('employment_presence', 'employment_presence.id', 'employment.id')
      .select((eb) => [
        eb.fn.coalesce('employment_presence.at_work', sql.lit(false)).as('at_work'),
        jsonObjectFrom(
          patient_encounters.baseQuery(trx, { is_open: true })
            .where('patient_encounters.patient_id', '=', eb.ref('employment_presence.with_patient_id')),
        ).as('open_encounter'),
        eb.selectFrom('appointment_employees')
          .innerJoin('appointments', 'appointments.id', 'appointment_employees.appointment_id')
          .select('appointments.start')
          .whereRef('appointment_employees.employee_id', '=', 'employment.id')
          .where('appointments.start', '>=', sql<Date>`now()`)
          .where('appointments.start', '<=', sql<Date>`now() + interval '1 hour'`)
          .orderBy('appointments.start', 'asc')
          .limit(1)
          .as('next_appointment_within_hour'),
      ])
      .orderBy('at_work', 'desc')
      .orderBy('seniority_order', 'asc')
  },
  formatResult({ open_encounter, ...employee }): RenderedEmployeeWithPresence {
    if (!open_encounter) {
      return { ...employee, open_encounter: null }
    }
    return {
      ...employee,
      open_encounter: patient_encounters.existsOpen(patient_encounters.formatResult(open_encounter)),
    }
  },
  async getAllAtOrganization(
    trx: TrxOrDb,
    { organization_id, excluding_health_worker }: {
      organization_id: string
      excluding_health_worker?: {
        health_worker_id: string
        seniority_order: number
        at_work: boolean
      }
    },
  ): Promise<RenderedEmployeeWithPresenceAndSeniority[]> {
    const employees = await employees_presence.findAll(trx, {
      organization_id,
      excluding_health_worker_id: excluding_health_worker?.health_worker_id,
    })

    const min_seniority_order_on_staff = employees.find((employee) => employee.seniority_order === 1)
    if (!min_seniority_order_on_staff && excluding_health_worker) {
      assert(excluding_health_worker.seniority_order === 1, 'Organization must have exactly one most senior staff member')
    }

    let min_seniority_order_at_work: { seniority_order: number } | undefined = minBy(
      employees,
      (employee) => employee.at_work ? employee.seniority_order : Infinity,
    )
    if (min_seniority_order_at_work && excluding_health_worker && min_seniority_order_at_work.seniority_order > excluding_health_worker.seniority_order) {
      min_seniority_order_at_work = excluding_health_worker
    }

    return employees.map((employee) => ({
      ...employee,
      senior_on_staff: employee === min_seniority_order_on_staff,
      senior_on_duty: employee === min_seniority_order_at_work,
    }))
  },
  getForClinicAssumingTestHospital(
    trx: TrxOrDb,
    { organization_id, excluding_health_worker }: {
      organization_id: string
      excluding_health_worker: {
        health_worker_id: string
        seniority_order: number
        at_work: boolean
      }
    },
  ): Promise<{
    clinic_employees: RenderedEmployeeWithPresenceAndSeniority[]
    hospital_employees: RenderedEmployeeWithPresenceAndSeniority[]
  }> {
    // TODO get this for real
    const nearest_hospital_id = TEST_ORGANIZATION_UUIDS.ZA.hospital

    return promiseProps({
      clinic_employees: employees_presence.getAllAtOrganization(trx, {
        organization_id,
        excluding_health_worker,
      }),

      hospital_employees: employees_presence.getAllAtOrganization(trx, {
        organization_id: nearest_hospital_id,
        // If this worker does work at the hospital, but is at the clinic today
        // we don't consider them the senior worker on staff
        excluding_health_worker: {
          health_worker_id: excluding_health_worker.health_worker_id,
          seniority_order: Infinity,
          at_work: false,
        },
      }),
    })
  },
})
