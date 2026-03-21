;; Page 30 - Headache: meningitis likely with headache and fever ≥ 38°C
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
  )
)
