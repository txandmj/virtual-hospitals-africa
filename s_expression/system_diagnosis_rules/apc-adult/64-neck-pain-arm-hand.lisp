;; Page 64 - Arm/hand: fracture likely with recent injury and pain, swelling or deformity
(system_diagnosis_rule
  "Diagnose probable fracture of bone"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Swelling of upper arm" "finding"))
      (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
      (clinical_finding (snomed_concept "Severe pain" "finding"))
    )
  )
)
