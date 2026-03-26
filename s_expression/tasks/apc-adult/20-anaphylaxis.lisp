;; Page 20 - Anaphylaxis
(task
  "Check for Anaphylaxis"
  adult
  (diagnosis (snomed_concept "Anaphylaxis" "disorder") possible)
  (check_for
    (clinical_finding (snomed_concept "Itching" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Eruption" "morphologic abnormality") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Insect bite - wound" "disorder"))
    (clinical_finding (snomed_concept "Insect sting" "disorder"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")) (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Peanut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Tree nut" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Eggs (edible)" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Milk" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Fish" "substance"))
    (finding (snomed_concept "Exposure to (contextual qualifier)" "qualifier value") (snomed_concept "Drug or medicament" "substance"))
    (allergy (snomed_concept "Fish" "substance"))
    (allergy (snomed_concept "Milk" "substance"))
    (allergy (snomed_concept "Eggs (edible)" "substance"))
    (allergy (snomed_concept "Tree nut" "substance"))
    (allergy (snomed_concept "Peanut" "substance"))
    (allergy (snomed_concept "Drug or medicament" "substance"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
  )
)
(task
  "Raise legs for anaphylaxis patient"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Elevation of lower limb" "procedure")
  )
)
(task
  "Administer oxygen for anaphylaxis patient"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Oxygen therapy" "procedure")
  )
)
(task
  "Administer epinephrine for anaphylaxis patient"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing epinephrine" "medicinal product")
    (permission (role nurse) (specialty "Primary care"))
  )
)
(task
  "Administer sodium chloride 0.9% for anaphylaxis patient"
  adult
  (active_condition (snomed_concept "Anaphylaxis" "disorder"))
  (manage
    (snomed_concept "Product containing precisely sodium chloride 9 milligram/1 milliliter conventional release solution for infusion and/or injection" "clinical drug")
    (permission (role nurse) (specialty "Primary care"))
  )
)
