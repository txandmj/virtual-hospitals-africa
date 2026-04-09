;; Page 17 – Assess and manage glucose
(task
  "Symptoms associated with low or high blood glucose"
  adult
  (and
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 6)
  )
  (check_for
    (clinical_finding (snomed_concept "Current drinker of alcohol" "finding") (qualifier (snomed_concept "Known" "qualifier value")))
    (clinical_finding (snomed_concept "Weight decreased" "finding"))
    (clinical_finding (snomed_concept "Excessive thirst" "finding") (qualifier (snomed_concept "Night time" "qualifier value")))
    (clinical_finding (snomed_concept "Polyuria" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Seizure" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
    (clinical_finding (snomed_concept "Vomiting" "disorder"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Tachypnea" "finding"))
    (clinical_finding (snomed_concept "Deep breathing" "finding"))
    (clinical_finding (snomed_concept "Dehydration" "disorder"))
    (clinical_finding (snomed_concept "Ketonuria" "finding"))
  )
)
