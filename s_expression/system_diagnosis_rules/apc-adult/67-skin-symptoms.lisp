;; Page 67 - Skin Symptoms: Adverse drug reaction likely with drug-induced eruption and systemic signs
(system_diagnosis_rule
  "Diagnose possible adverse drug reaction"
  (diagnosis
    (snomed_concept "Adverse reaction caused by drug" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
    )
  )
)
