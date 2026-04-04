;; Page 30 - Headache
(task
  "Check for urgent headache conditions"
  adult
  (clinical_finding (snomed_concept "Headache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of face" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (clinical_finding (snomed_concept "Speech problem" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))

    (clinical_finding (snomed_concept "Visual symptoms" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in eye" "finding") (qualifier (snomed_concept "New" "qualifier value")))

    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Dizziness" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    
    (clinical_finding (snomed_concept "Frequent headache" "finding") (qualifier (snomed_concept "Worsening" "qualifier value")))
    (clinical_finding (snomed_concept "Headache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Morning headache" "finding"))

    ;; Meningitis likely
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))

    (clinical_finding (snomed_concept "Persistent vomiting" "disorder"))
    (clinical_finding (snomed_concept "Nausea" "finding") (qualifier (snomed_concept "Symptom is continuous" "finding")))

    (clinical_finding 
      (snomed_concept "Headache" "finding")
      (qualifier (snomed_concept "Symptom is continuous" "finding"))
    )

    (clinical_finding (snomed_concept "Chronic headache disorder" "disorder"))

    (clinical_finding (snomed_concept "Seizure" "finding") (qualifier (snomed_concept "Recent" "qualifier value")))

    (<= (timestamp (clinical_finding (snomed_concept "Highly active antiretroviral therapy" "procedure")))
        (time_ago 3 months))

    (clinical_finding (snomed_concept "Injury of head" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))

    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
  )
)
