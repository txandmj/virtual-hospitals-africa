;; Page 66 - Foot symptoms: acute limb ischaemia likely with sudden severe foot pain at rest and neurovascular signs
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Absent pulse" "finding"))
    )
  )
)
;; Page 66 - Foot symptoms: critical limb ischaemia likely with claudication and foot pain at rest, ulcer or gangrene
(system_diagnosis_rule
  "Diagnose probable critical lower limb ischemia"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (or
      (clinical_finding (snomed_concept "Foot pain" "finding"))
      (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    )
  )
)
