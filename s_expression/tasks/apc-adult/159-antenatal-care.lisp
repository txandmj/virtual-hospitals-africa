;; Page 159 - Antenatal Care
(task
  "Check for urgent antenatal conditions"
  adult
  (clinical_finding (snomed_concept "Pregnancy" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
    (clinical_finding (snomed_concept "Amniotic fluid leaking" "disorder"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
  )
)
