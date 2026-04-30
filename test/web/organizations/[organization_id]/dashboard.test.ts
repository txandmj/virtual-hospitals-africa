import { afterAll, describe } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assert } from 'std/assert/assert.ts'
import * as cheerio from 'cheerio'
import db from '../../../../db/db.ts'
import { itUsesTrxAnd } from '../../../_helpers/transaction.ts'
import { addTestEmployeeWithSession } from '../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../_helpers/organizations.ts'
import { DASHBOARD_WIDGETS } from '../../../../backend/dashboard/widgets/index.ts'

const ORG = TEST_ORGANIZATION_UUIDS.ZA.clinic

describe('/app/organizations/[organization_id]/dashboard', () => {
  afterAll(() => db.destroy())

  itUsesTrxAnd('registry has the three day-one widgets', () => {
    const ids = DASHBOARD_WIDGETS.map((w) => w.id).sort()
    assertEquals(ids, ['encounters_in_range', 'patients_in_care', 'staff_on_shift'])
    return Promise.resolve()
  })

  itUsesTrxAnd('renders all three cards for an employed nurse', async () => {
    const { fetchOk } = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: ORG,
    })
    const response = await fetchOk(`/app/organizations/${ORG}/dashboard`)
    const $ = cheerio.load(await response.text())
    const body = $('body').text()
    assert(body.includes('Patients in care'), 'missing "Patients in care" card')
    assert(body.includes('Encounters in range'), 'missing "Encounters in range" card')
    assert(body.includes('Staff on shift'), 'missing "Staff on shift" card')
  })

  itUsesTrxAnd('renders the date-range filter', async () => {
    const { fetchOk } = await addTestEmployeeWithSession(db, {
      role: 'nurse',
      organization_id: ORG,
    })
    const response = await fetchOk(`/app/organizations/${ORG}/dashboard`)
    const $ = cheerio.load(await response.text())
    assertEquals($('input[name="from"][type="date"]').length, 1)
    assertEquals($('input[name="to"][type="date"]').length, 1)
    assertEquals($('button[type="submit"]').length >= 1, true)
  })
})
