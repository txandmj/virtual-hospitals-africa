import type { TrxOrDb } from '../../types.ts'

export const dashboard_metrics = {
  // TODO: per-org timezone — "today" is currently server UTC.
  // Revisit when an org timezone column lands in the schema.

  async patientsCurrentlyInEncounter(
    trx: TrxOrDb,
    { organization_id }: { organization_id: string },
  ): Promise<number> {
    const row = await trx
      .selectFrom('patient_encounters')
      .where('organization_id', '=', organization_id)
      .where('closed_at', 'is', null)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },

  async encountersInRange(
    trx: TrxOrDb,
    { organization_id, from, to }: { organization_id: string; from: Date; to: Date },
  ): Promise<number> {
    // End bound is the next UTC day at 00:00 so that encounters on `to` itself count.
    const end_exclusive = new Date(to)
    end_exclusive.setUTCDate(end_exclusive.getUTCDate() + 1)

    const row = await trx
      .selectFrom('patient_encounters')
      .where('organization_id', '=', organization_id)
      .where('created_at', '>=', from)
      .where('created_at', '<',  end_exclusive)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },

  async staffOnShift(
    trx: TrxOrDb,
    { organization_id }: { organization_id: string },
  ): Promise<number> {
    const row = await trx
      .selectFrom('employment')
      .innerJoin('employment_presence', 'employment_presence.id', 'employment.id')
      .where('employment.organization_id', '=', organization_id)
      .where('employment_presence.at_work', '=', true)
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .executeTakeFirstOrThrow()
    return Number(row.count)
  },
}
