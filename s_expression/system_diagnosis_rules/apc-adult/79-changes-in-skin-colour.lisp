;; Page 79 - Changes in Skin Colour
(system_diagnosis_rule
  "Diagnose probable Jaundice"
  (diagnosis
    (snomed_concept "Jaundice" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Yellow skin" "finding"))
)
