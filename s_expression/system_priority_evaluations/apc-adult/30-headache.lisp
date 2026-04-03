;; Page 30 - Headache: Emergency signs
(system_priority_evaluation
  "Emergency: headache with emergency signs"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
      (clinical_finding (snomed_concept "Seizure" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    )
  )
)
;; Page 30 - Headache: Urgent for other danger signs
(system_priority_evaluation
  "Urgent: headache with meningism, hypertensive or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
      (clinical_finding (snomed_concept "Pain in eye" "finding"))
      (clinical_finding (snomed_concept "Nausea and vomiting" "disorder"))
      (clinical_finding (snomed_concept "Injury of head" "disorder"))
      (clinical_finding (snomed_concept "Anisocoria" "disorder"))
      (clinical_finding (snomed_concept "Morning headache" "finding"))
      (clinical_finding (snomed_concept "Frequent headache" "finding"))
      (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
      (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
    )
  )
)
