;; Page 46 - Diarrhoea: dehydration likely with diarrhoea and systemic signs
(system_diagnosis_rule
  "Diagnose probable dehydration"
  (diagnosis
    (snomed_concept "Dehydration" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding"))
    (or
      (clinical_finding (snomed_concept "Xerostomia" "finding"))
      (clinical_finding (snomed_concept "Decreased skin turgor" "finding"))
      (clinical_finding (snomed_concept "Sunken eyes" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)
;; Page 46 - Diarrhoea: cholera likely with watery diarrhoea and cholera exposure
(system_diagnosis_rule
  "Diagnose probable cholera"
  (diagnosis
    (snomed_concept "Cholera" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Diarrhea" "finding") (qualifier (snomed_concept "Watery" "qualifier value")))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Vibrio cholerae" "organism"))
  )
)
