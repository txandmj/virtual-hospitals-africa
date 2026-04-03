;; Page 30 - Headache: Meningitis likely with stiff neck and fever
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    )
  )
)
;; Page 30 - Headache: Hypertensive urgency likely with severe headache and high BP
(system_diagnosis_rule
  "Diagnose probable hypertensive urgency"
  (diagnosis
    (snomed_concept "Hypertension" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
  )
)
;; Page 30 - Headache: Chronic headache disorder
(system_diagnosis_rule
  "Diagnose probable chronic headache disorder"
  (diagnosis
    (snomed_concept "Chronic headache disorder" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Frequent headache" "finding"))
    (clinical_finding (snomed_concept "Chronic headache disorder" "disorder"))
  )
)
