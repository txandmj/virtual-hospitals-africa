;; Page 36 - Gum/Teeth Symptoms
(task
  "Check for urgent dental conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Tooth, gum, and/or supporting structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
    (clinical_finding (snomed_concept "Swelling of lower jaw region" "finding"))
    (clinical_finding (snomed_concept "Unable to eat" "finding"))
    (clinical_finding (snomed_concept "Unable to drink" "finding"))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Wakes up during night" "finding")))
    (clinical_finding (snomed_concept "Toothache" "finding") (qualifier (snomed_concept "Spontaneous" "qualifier value")))
    (clinical_finding (snomed_concept "Toothache" "finding"))
  )
)
;; Page 36 - Gum/Teeth: Urgent dental conditions
(system_priority_evaluation
  "Urgent: toothache with fever and swelling or unable to eat"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Toothache" "finding"))
    (or
      (and
        (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
        (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")))
      )
      (clinical_finding (snomed_concept "Unable to eat" "finding"))
      (clinical_finding (snomed_concept "Unable to drink" "finding"))
    )
  )
)
