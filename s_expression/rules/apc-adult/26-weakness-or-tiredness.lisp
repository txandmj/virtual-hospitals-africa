;; Page 26 - Weakness or Tiredness
(task
  "Check for urgent weakness/tiredness conditions"
  adult
  (clinical_finding (snomed_concept "Fatigue" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
    (clinical_finding (snomed_concept "Thirst due to water deprivation" "finding"))
    (clinical_finding (snomed_concept "Xerostomia due to dehydration" "disorder"))
    (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Anemia" "disorder"))
  )
)
;; Page 26 - Heart failure likely with orthopnea and leg swelling
(system_diagnosis_rule
  "Diagnose probable heart failure"
  (diagnosis
    (snomed_concept "Heart failure" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
  )
)
;; Page 26 - Weakness or Tiredness
(system_priority_evaluation
  "Urgent: fatigue with cardiac, respiratory or systemic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Fatigue" "finding"))
    (or
      (clinical_finding (snomed_concept "Chest pain" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
      (clinical_finding (snomed_concept "Signs of dehydration" "finding"))
      (clinical_finding (snomed_concept "Anemia" "disorder"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 11.1)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
