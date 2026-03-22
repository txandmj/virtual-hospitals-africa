;; Page 64 - Neck Pain / Arm or Hand Symptoms
(task
  "Check for urgent neck pain and arm or hand conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (clinical_finding (finding_site (snomed_concept "Upper limb structure" "body structure")))
    (clinical_finding (finding_site (snomed_concept "Hand structure" "body structure")))
  )
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of upper arm" "finding"))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
  )
)
