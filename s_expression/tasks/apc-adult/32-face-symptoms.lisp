;; Page 32 - Face Symptoms
(task
  "Check for urgent face symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Face structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value") (qualifier (snomed_concept "Asymmetry" "qualifier value")  "Forehead structure" (body structure) "Uninvolved" (qualifier value))
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value) "Forehead structure" (body structure)  "Involved" (qualifier value) "Minimal" (qualifier value))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) "New" "qualifier value")) "Asymmetry" "qualifier value"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding") "Sudden" "qualifier value") "New" "qualifier value")"Asymmetry" "qualifier value"))
    (clinical_finding (snomed_concept "Numbness of face" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
   (clinical_finding ( snomed_concept “Facial swelling” (finding) Sudden (qualifier value))
		(clinical_finding ( snomed_concept “Tongue swelling” (finding) Sudden (qualifier value))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding") "Sudden" "qualifier value")"Severe" (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    (clinical_finding (snomed_concept “Vomiting" (disorder))
		(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) “Substance” (substance) (qualifier value) "Possible" (qualifier value) "Allergen" (attribute))
		(clinical_finding (snomed_concept “Facial swelling” (finding) "Red color" (qualifier value) 
		(clinical_finding (snomed_concept “Facial swelling” (finding) "With" (attribute) "Pain" (finding))
		(clinical_finding (snomed_concept “Facial swelling” (finding) "New" (qualifier value))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
  )
)

