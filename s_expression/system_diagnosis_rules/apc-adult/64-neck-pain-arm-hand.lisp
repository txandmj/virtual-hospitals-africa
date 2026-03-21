;; Page 64 - Neck pain: meningitis likely with neck stiffness and fever, headache, or altered consciousness
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (or
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
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
