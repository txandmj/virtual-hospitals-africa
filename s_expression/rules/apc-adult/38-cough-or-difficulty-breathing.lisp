;; Page 38 - Cough or Difficulty Breathing
(task
  "Check for urgent cough/breathing conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Cough" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding")))
  (check_for
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Feeling agitated" "finding"))
    (clinical_finding (snomed_concept "Hemoptysis" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Wheezing" "finding"))
    (clinical_finding (snomed_concept "Tight chest" "finding"))
    (clinical_finding (snomed_concept "Dyspnea at rest" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Orthopnea" "finding"))
    (clinical_finding (snomed_concept "Swelling of lower limb" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of chest resonance to percussion" "finding"))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Dyspnea" "finding"))
  )
)

;; Page 38 - Cough/Breathing: Pulmonary embolism likely with calf swelling and breathlessness
(system_diagnosis_rule
  "Diagnose possible pulmonary embolism"
  (diagnosis
    (snomed_concept "Pulmonary embolism" "disorder")
    possible
  )
  adult
  (and
    (or (clinical_finding (snomed_concept "Cough" "finding"))
        (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    )
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 38 - Cough/Breathing: Tension pneumothorax likely with breathlessness, chest pain and hypotension
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Finding of chest resonance to percussion" "finding"))
    (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
    (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (or (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
        (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)
;; Page 38 - Cough/Breathing: Urgent for probable tension pneumothorax
(system_priority_evaluation
  "Urgent: probable tension pneumothorax"
  adult
  Urgent
  (active_condition
    (snomed_concept "Tension pneumothorax" "disorder")
  )
)

;; Page 38 - Cough/Breathing: Urgent for other signs
(system_priority_evaluation
  "Urgent: cough or breathlessness with danger signs"
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Cough" "finding"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Dyspnea" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Feeling agitated" "finding"))
      (active_condition (snomed_concept "Tension pneumothorax" "disorder"))
      (clinical_finding (snomed_concept "Hemoptysis" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
      (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 120)
      (clinical_finding (snomed_concept "Wheezing" "finding"))
    )
  )
)
