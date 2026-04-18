;; Page 19 - Seizures/Fits
(task
  "Check for urgent seizure conditions"
  adult
  (clinical_finding (snomed_concept "Seizure" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Current" "qualifier value")))
    (clinical_finding (snomed_concept "Unconscious" "finding"))
    (clinical_finding (snomed_concept "Hypoglycemia" "disorder"))
    (clinical_finding (snomed_concept "Alcohol use disorder" "disorder"))
    (clinical_finding (snomed_concept "Status epilepticus" "finding"))
    (clinical_finding (snomed_concept "Cardiac arrhythmia" "disorder"))
  )
)
