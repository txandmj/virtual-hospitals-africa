import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { system_diagnosis_rules } from '../../db/models/system_diagnosis_rules.ts'
import { assert } from 'std/assert/assert.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { measurement_comparator } from '../../shared/s_expression_schemas.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_evaluations } from '../../db/models/patient_evaluations.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'

describeParallel('db/models/system_diagnosis_rules.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'yields a possible anaphylaxis diagnosis for an insect bite + low blood pressure',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Insect bite - wound" "disorder"))`,
          ],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_findings.finding_ids[0])
      const diagnoses_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.finding_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
        ],
      })
      assert(diagnoses_result.startsWith('Inserted 1 diagnosis(es): '))
      const evaluation = await patient_evaluations.findOne(db, { patient_id })
      assertMatches(evaluation, {
        'root_snomed_concept_name': 'Diagnosis',
        'root_snomed_concept_category': 'observable entity',
        'specific_snomed_concept_name': 'Anaphylaxis',
        'specific_snomed_concept_category': 'disorder',
        'existence': 'Yes',
        'value': {
          'name': 'Possible diagnosis (contextual qualifier)',
        },
        'destination_relations': [
          {
            'root_snomed_concept_name': 'Measurement finding',
            'root_snomed_concept_category': 'finding',
            'specific_snomed_concept_name': 'Systolic blood pressure',
            'specific_snomed_concept_category': 'observable entity',
            'existence': 'Yes',
            'value': { 'type': 'measurement', 'units': 'mmHg', 'value': '85' },
            'relation_name': 'Evidence of',
          },
          {
            'root_snomed_concept_name': 'Clinical finding',
            'root_snomed_concept_category': 'finding',
            'specific_snomed_concept_name': 'Insect bite - wound',
            'specific_snomed_concept_category': 'disorder',
            'existence': 'Yes',
            'value': null,
            'relation_name': 'Evidence of',
          },
        ],
        'type': 'evaluation',
        'employment_id': null,
        'by_system': true,
        'evaluates_record_id': null,
        'as_part_of_procedure': null,
        'attributes': [],
        'displays': {
          'finding': 'Anaphylaxis Diagnosis',
          'value': 'Possible diagnosis',
          'full': 'Anaphylaxis Diagnosis: Possible diagnosis',
        },
        'modifiers': [],
      })
    },
  )

  itParallel(
    'low blood pressure alone is not enough for a possible anaphylaxis diagnosis',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
            parseWithSchema(`(= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 55)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_findings.measurement_ids[0])
      assert(inserted_findings.measurement_ids[1])

      const diagnoses_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[1], existence: 'Yes' },
        ],
      })

      assertEquals(diagnoses_result, 'No new system diagnoses to insert')
    },
  )

  itParallel(
    'can diagnose probable tension pneumothorax',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            '(clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))',
            '(clinical_finding (snomed_concept "Finding of chest resonance to percussion" "finding"))',
            '(clinical_finding (snomed_concept "Decreased breath sounds" "finding"))',
            '(clinical_finding (snomed_concept "Trachea displaced" "disorder"))',
            '(clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))',
          ],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
            parseWithSchema(`(= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 55)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_findings.measurement_ids[0])
      assert(inserted_findings.measurement_ids[1])

      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[1], existence: 'Yes' },
        ],
      })

      const evaluations = await patient_evaluations.findAll(db, { patient_id })
      const tension_pneumothorax = evaluations.find((evaluation) => evaluation.specific_snomed_concept_name === 'Tension pneumothorax')
      assertMatches(tension_pneumothorax, {
        'root_snomed_concept_name': 'Diagnosis',
        'root_snomed_concept_category': 'observable entity',
        'specific_snomed_concept_name': 'Tension pneumothorax',
        'specific_snomed_concept_category': 'disorder',
        'existence': 'Yes',
        'value': {
          'name': 'Probable diagnosis (contextual qualifier)',
        },
        'displays': {
          'finding': 'Tension pneumothorax Diagnosis',
          'value': 'Probable diagnosis',
          'full': 'Tension pneumothorax Diagnosis: Probable diagnosis',
        },
        'modifiers': [],
      })
    },
  )

  itParallel(
    'a definite fever diagnosis from temperature feeds into the probable meningitis rule',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)

      // Insert temperature alone so only the fever rule fires, not the direct stiff-neck+temp meningitis rule
      const inserted_temp = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38.5)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_temp.measurement_ids[0])

      // First call: temperature triggers the "Diagnose fever" rule only
      const fever_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_temp.procedure_id,
        records: [
          { id: inserted_temp.measurement_ids[0], existence: 'Yes' },
        ],
      })
      assert(fever_result.startsWith('Inserted 1 diagnosis(es): '), `Expected fever diagnosis, got: ${fever_result}`)

      // Insert stiff neck + drowsy in a second batch
      const inserted_neuro = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            procedure_id: inserted_temp.procedure_id,
          },
          findings: [
            `(clinical_finding (snomed_concept "Stiff neck" "finding"))`,
            `(clinical_finding (snomed_concept "Drowsy" "finding"))`,
          ],
        },
      )

      assert(inserted_neuro.finding_ids[0])
      assert(inserted_neuro.finding_ids[1])

      // Second call: stiff neck + drowsy trigger the meningitis rule, which resolves
      // fever via active_condition — matching the definite fever diagnosis already in the DB
      const meningitis_result = await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_neuro.procedure_id,
        records: [
          { id: inserted_neuro.finding_ids[0], existence: 'Yes' },
          { id: inserted_neuro.finding_ids[1], existence: 'Yes' },
        ],
      })
      assert(meningitis_result.startsWith('Inserted '), `Expected meningitis diagnosis, got: ${meningitis_result}`)

      const evaluations = await patient_evaluations.findAll(db, { patient_id })
      const [meningitis, ...others] = evaluations.filter((e) => e.specific_snomed_concept_name === 'Meningitis')
      assertArrayEmpty(others)
      assertMatches(meningitis, {
        'specific_snomed_concept_name': 'Meningitis',
        'specific_snomed_concept_category': 'disorder',
        'existence': 'Yes',
        'value': { 'name': 'Probable diagnosis (contextual qualifier)' },
        'displays': {
          'finding': 'Meningitis Diagnosis',
          'value': 'Probable diagnosis',
          'full': 'Meningitis Diagnosis: Probable diagnosis',
        },
      })

      // Evidence of combines findings from both the fever-chain rule and the direct rule.
      // Sort for deterministic ordering.
      const sorted_evidence = [...meningitis.destination_relations]
        .sort((a, b) => a.specific_snomed_concept_name.localeCompare(b.specific_snomed_concept_name))
      assertMatches(sorted_evidence, [
        {
          'root_snomed_concept_name': 'Measurement finding',
          'specific_snomed_concept_name': 'Body temperature',
          'specific_snomed_concept_category': 'observable entity',
          'relation_name': 'Evidence of',
        },
        {
          'root_snomed_concept_name': 'Clinical finding',
          'specific_snomed_concept_name': 'Drowsy',
          'specific_snomed_concept_category': 'finding',
          'value': null,
          'relation_name': 'Evidence of',
        },
        {
          // The prior definite Fever diagnosis feeds in via active_condition
          'root_snomed_concept_name': 'Diagnosis',
          'specific_snomed_concept_name': 'Fever',
          'specific_snomed_concept_category': 'finding',
          'existence': 'Yes',
          'value': { 'name': 'Definite' },
          'relation_name': 'Evidence of',
        },
        {
          'root_snomed_concept_name': 'Clinical finding',
          'specific_snomed_concept_name': 'Stiff neck',
          'specific_snomed_concept_category': 'finding',
          'value': null,
          'relation_name': 'Evidence of',
        },
      ])
    },
  )

  itParallel(
    'no tension pneumothorax diagnosis if missing one of the findings is not present',
    async () => {
      const { employee, patient_id, patient_encounter_id } = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(db)
      const inserted_findings = await patient_findings.insertMany(
        db,
        {
          patient_id,
          patient_encounter_id,
          patient_encounter_employee_id: employee.patient_encounter_employee_id,
          employment_id: employee.employee_id,
          procedure: {
            create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
          },
          findings: [
            '(clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))',
            '(clinical_finding (snomed_concept "Decreased breath sounds" "finding"))',
            '(clinical_finding (snomed_concept "Trachea displaced" "disorder"))',
            '(clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))',
          ],
          measurements: [
            parseWithSchema(`(= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 85)`, measurement_comparator),
            parseWithSchema(`(= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 55)`, measurement_comparator),
          ],
        },
      )

      assert(inserted_findings.measurement_ids[0])
      assert(inserted_findings.measurement_ids[1])

      await system_diagnosis_rules.insertSystemDiagnosesIfNotAlreadyIdentified(db, {
        listener_id: 'test',
        listener_name: 'test',
        patient_id,
        patient_encounter_id,
        patient_age_determination: 'adult',
        procedure_id: inserted_findings.procedure_id,
        records: [
          { id: inserted_findings.measurement_ids[0], existence: 'Yes' },
          { id: inserted_findings.measurement_ids[1], existence: 'Yes' },
        ],
      })

      const evaluations = await patient_evaluations.findAll(db, { patient_id })
      const tension_pneumothorax = evaluations.find((evaluation) => evaluation.specific_snomed_concept_name === 'Tension pneumothorax')
      assert(!tension_pneumothorax)
    },
  )
})
