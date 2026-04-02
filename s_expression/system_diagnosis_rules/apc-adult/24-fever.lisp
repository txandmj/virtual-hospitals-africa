;; Page 24 - Fever: meningitis likely with neck stiffness, or drowsy/confused with purpuric rash
(system_diagnosis_rule
  "Diagnose probable meningitis based on fever"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (or
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
;; Page 24 - Fever: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  "Diagnose probable appendicitis based on fever"
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (active_condition (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)
;; Page 24 - A patient with a fever has a temperature ≥ 38°C now or in past 3 days.
;; TODO account for 3 days element
(system_diagnosis_rule
  "Diagnose fever"
  (diagnosis
    (snomed_concept "Fever" "finding")
    definite
  )
  adult
  (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
)
