;; Page 28 - Collapse/Falls: Emergency signs
(system_priority_evaluation
  "Emergency: collapse with emergency signs"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (or
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Hematemesis" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    )
  )
)
;; Page 28 - Collapse/Falls: Urgent for other danger signs
(system_priority_evaluation
  "Urgent: collapse with cardiac, haemorrhagic or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Palpitations" "finding"))
      (clinical_finding (snomed_concept "Pulse slow" "finding"))
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
      (clinical_finding (snomed_concept "Hematochezia" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 100)
      (< (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 50)
    )
  )
)
