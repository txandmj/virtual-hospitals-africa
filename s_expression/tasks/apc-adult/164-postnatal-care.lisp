;; Page 164 - Postnatal Care
(task
  "Check for urgent postnatal conditions"
  adult
  (clinical_finding (snomed_concept "Postnatal care status" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  )
)
