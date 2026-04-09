;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
  "Hypoglycaemia definite"
  (diagnosis
    (snomed_concept "Hypoglycemia" "disorder")
    definite
  )
  adult 
  (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
)
