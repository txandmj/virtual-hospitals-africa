;; Page 132 - Hypertension: hypertensive emergency likely with very high BP and end-organ damage signs
(task
  "Check for hypertensive emergency conditions"
  adult
  (or
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
  )
  (check_for
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
  )
)
