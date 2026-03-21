;; Page 40 - COVID-19: tension pneumothorax likely with sudden breathlessness, unilateral signs and hypotension
(system_diagnosis_rule
  "Diagnose probable tension pneumothorax"
  (diagnosis
    (snomed_concept "Tension pneumothorax" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Disease caused by severe acute respiratory syndrome coronavirus 2" "disorder"))
    (clinical_finding (snomed_concept "Dyspnea" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Finding of chest resonance to percussion" "finding"))
      (clinical_finding (snomed_concept "Decreased breath sounds" "finding"))
      (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
      (clinical_finding (snomed_concept "Trachea displaced" "disorder"))
    )
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)
