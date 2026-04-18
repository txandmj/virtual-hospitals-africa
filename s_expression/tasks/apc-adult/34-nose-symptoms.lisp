;; Page 34 - Nose Symptoms
(task
  "Check for urgent nose conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Nose finding" "finding"))
    (clinical_finding (finding_site (snomed_concept "Nasal structure" "body structure"))))
  (check_for
    (clinical_finding (snomed_concept "Injury of head" "disorder"))
    (clinical_finding (snomed_concept "Cerebrospinal fluid rhinorrhea" "disorder"))
    (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Clear" "qualifier value")))
  )
)
