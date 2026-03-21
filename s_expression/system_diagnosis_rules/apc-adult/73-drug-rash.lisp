;; Page 73 - Drug rash: serious drug reaction likely with drug eruption and markers of severity
(system_diagnosis_rule
  "Diagnose probable serious drug reaction"
  (diagnosis
    (snomed_concept "Stevens-Johnson syndrome" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Eruption caused by drug" "disorder"))
    (or
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Tongue structure" "body structure")))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Blister of skin" "disorder"))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
    )
  )
)
