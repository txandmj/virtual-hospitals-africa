;; Page 50 - Genital Symptoms (Man)
(task
  "Check for urgent genital symptoms in a man"
  adult
  (or
    (clinical_finding (finding_site (snomed_concept "Scrotal structure" "body structure")))
    (clinical_finding (snomed_concept "Male genitalia finding" "finding"))
  )
  (check_for
    (clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
    (clinical_finding (snomed_concept "Pain in penis" "finding"))
    (clinical_finding (snomed_concept "Penile swelling" "disorder"))
  )
)
