;; Page 164 - Postnatal Care
(task
  "Check for urgent postnatal conditions"
  adult
  (clinical_finding (snomed_concept "Postnatal care status" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
  )
)
;; Page 164 - Postnatal: postpartum haemorrhage likely with heavy vaginal bleeding within 6 weeks of delivery
(system_diagnosis_rule
  "Diagnose probable postpartum hemorrhage"
  (diagnosis
    (snomed_concept "Postpartum hemorrhage" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Bleeding from vagina" "finding"))
)
