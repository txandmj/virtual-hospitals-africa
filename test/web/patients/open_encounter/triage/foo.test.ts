import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import { setupTriageNewPatient } from './_setup.ts'
import { events } from '../../../../../db/models/events.ts'
import keys from '../../../../../util/keys.ts'
import { getGridDisplay } from 'test/_helpers/grid.ts'
import { logToFileIfOnServer } from '../../../../../util/logToFileIfOnServer.ts'

describeParallel('triage/warning_signs', () => {
  before(waitUntilTestServerUp)
  afterAll(() => db.destroy())
  afterAll(() => events.closeAllProcessedPubSub({ graceful: false }))

  describeParallel('GET', () => {
    itParallel(
      'renders a warning signs page when patient not known to be pregnant',
      async () => {
        const { $ } = await setupTriageNewPatient({
          patient_demographics: {},
        })

        const expected = {
          'Emergency': [
            'Obstructed airwayNot breathing',
            'Cardiac arrestHeart attack',
            'SeizureCurrent',
            'BurnFacial',
            'BurnInhalation',
          ],
          'Very urgent': [
            'Shortness of breathacute',
            'Chest pain',
            'SeizurePost ictal',
            'Focal neurologyacute; Stroke',
            'BurnChemical',
            'Coughing blood',
            'PoisoningOverdose',
            'Aggression',
            'Severe limb ischemiaThreatened limb',
            'BurnCircumferential',
            'Vomiting fresh blood',
            'High energy transferSevere mechanism of injury',
            'Stabbed neck',
            'Eye injury',
            'BurnOver 20%',
            'HaemorrhageUncontrolled',
            'Dislocation of larger jointnot finger or toe',
            'Compound fracturewith a break in the skin',
            'Severe pain',
            'BurnModerate severity',
          ],
          'Urgent': [
            'Persistent vomiting',
            'Dislocation of finger',
            'Closed fractureno break in the skin',
            'Moderate pain',
            'BurnOther',
            'HaemorrhageControlled',
            'Dislocation of toe joint',
            'Abdominal pain',
          ],
          'Common Symptoms': [
            'Nasal discharge',
            'Fever',
            'Cough',
            'Sore throat',
            'Headache',
            'Fatigue',
            'Shortness of breath',
            'Nausea',
            'Vomiting',
            'Diarrhea',
            'Dizziness',
            'Muscle pain',
            'Insect bite',
            'Back pain',
            'Constipation',
          ],
        }

        logToFileIfOnServer($.html(), {
          filename: 'page.html'
        })

        assertEquals($('.priority-table').length, Object.keys(expected).length)

        const actual: typeof expected = {} as unknown as typeof expected
        for (const category of keys(expected)) {
          const grid_display = getGridDisplay($, `.priority-table[data-category="${category}"] > .grid`)
          actual[category] = grid_display
        }

        assertEquals(actual, expected)
      },
    )
  })
})
