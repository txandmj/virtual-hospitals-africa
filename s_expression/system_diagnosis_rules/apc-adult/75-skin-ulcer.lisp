;; Page 75 - Skin ulcer: acute limb ischaemia likely with sudden severe leg pain at rest and neurovascular signs
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Absent pulse" "finding"))
    )
  )
)
