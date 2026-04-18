;; Page 17 – Assess and manage glucose
(task
  "Symptoms associated with low or high blood glucose"
  adult
  (and
    ;; not quite right, also needs to prompt for BMI
    (>= (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
    (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 6)
  )
  (check_for
    (clinical_finding (snomed_concept "Sedentary lifestyle" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder"))
    (clinical_finding (snomed_concept "Family history of diabetes mellitus" "situation"))
    (clinical_finding (snomed_concept "Polycystic ovary syndrome" "disorder"))
    (clinical_finding (snomed_concept "Indian origin" "finding"))
    (clinical_finding (snomed_concept "Disorder of cardiovascular system" "disorder"))
    (clinical_finding (snomed_concept "Gestational diabetes mellitus" "disorder"))
    (clinical_finding (snomed_concept "Past pregnancy history of delivery of macrosomal infant" "situation")) ;; Previous big baby > 4000g
    (clinical_finding (snomed_concept "Impaired fasting glycemia" "disorder"))
    (clinical_finding (snomed_concept "History of tuberculosis" "situation")) ;; TB in past year
  )
)
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
