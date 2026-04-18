;; Page 29 - Dizziness
(task
  "Check for urgent dizziness conditions"
  adult
  (clinical_finding (snomed_concept "Dizziness" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Unable to stand" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Vomiting" "disorder"))
    (clinical_finding (snomed_concept "Disorder of eye movements" "disorder"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
    (clinical_finding (snomed_concept "Abnormal ocular motility" "finding"))
    (clinical_finding (snomed_concept "Pulse slow" "finding"))
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
  )
)
;; Page 29 - Dizziness: Emergency signs
(system_priority_evaluation
  "Emergency: dizziness with stroke signs"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    )
  )
)
;; Page 29 - Dizziness: Urgent signs
(system_priority_evaluation
  "Urgent: dizziness with cardiac or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Unable to stand" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Abnormal ocular motility" "finding"))
      (clinical_finding (snomed_concept "Pulse slow" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
    )
  )
)
