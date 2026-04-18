(task 
  "Check blood glucose if decreased consciousness"
  adult
  (or 
    (clinical_finding (snomed_concept "Impairment of mental alertness" "finding"))
    (clinical_finding (snomed_concept "Responds to pain" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
  )
  (measure (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L))
)
