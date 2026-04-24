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
}
