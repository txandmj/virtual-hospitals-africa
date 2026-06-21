import { sql } from 'kysely'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'
import { health_workers } from './health_workers.ts'

export const employment = {
  addOne(
    trx: TrxOrDbOrQueryCreator,
    { department_ids, seniority_order, organization_id, ...employee }: {
      health_worker_id: string
      role: string
      organization_id: string
      is_admin: boolean
      department_ids?: string[]
      seniority_order?: number
    },
  ) {
    health_workers.invalidateCacheOne(employee.health_worker_id)
    const id = generateUUID()

    return trx.with(
      'employment_insert',
      (qb) =>
        qb.insertInto('employment')
          .values({
            id,
            organization_id,
            seniority_order: seniority_order || trx.selectFrom('employment')
              .select(sql<number>`
                coalesce(1 + max(employment.seniority_order), 1)
              `.as('seniority_order'))
              .where('employment.organization_id', '=', organization_id),
            ...employee,
          })
          .returningAll(),
    ).with(
      'department_insert',
      (qb) =>
        department_ids?.length
          ? qb.insertInto('department_employment')
            .values(department_ids.map((department_id) => ({
              department_id,
              employment_id: id,
            })))
          : blankSelection(qb),
    )
      .selectFrom('employment_insert')
      .selectAll('employment_insert')
      .executeTakeFirstOrThrow()
  },
}
