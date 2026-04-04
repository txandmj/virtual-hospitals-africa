;; Page 30 – Headache
(system_diagnosis_rule
  "Diagnose Sinusitis likely"
  (diagnosis
    (snomed_concept "Sinusitis" "disorder")
    probable 
  )
  adult
  (and
    (clinical_finding (snomed_concept "Headache" "finding"))
    (or (clinical_finding (snomed_concept "Common cold" "disorder") (qualifier "Recent" "qualifier value"))
        (and (active_condition (snomed_concept "Fever" "finding"))
             (active_condition (snomed_concept "Generalized aches and pains" "finding"))
        )
    )
    (or (clinical_finding (snomed_concept "Headache" "finding") (attribute (snomed_concept "Worse" "qualifier value") (snomed_concept "Forward bending" "observable entity")))
        (clinical_finding (snomed_concept "Nasal discharge" "finding") (qualifier (snomed_concept "Thick" "qualifier value")))
        (clinical_finding (snomed_concept "Posterior rhinorrhea" "disorder") (qualifier (snomed_concept "Thick" "qualifier value")))
        (clinical_finding 
          (snomed_concept "Pain" "finding") 
          (finding_site (snomed_concept "Cheek structure" "body structure")) 
          (attribute (snomed_concept "Aggravated by" "attribute") (snomed_concept "Pressure - physical agent" "physical force"))
        )
        (clinical_finding 
          (snomed_concept "Pain" "finding") 
          (finding_site (snomed_concept "Forehead structure" "body structure")) 
          (attribute (snomed_concept "Aggravated by" "attribute") (snomed_concept "Pressure - physical agent" "physical force"))
        )
    )
  )
)
