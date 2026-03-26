;; Page 45 - Nausea/Vomiting: peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  "Diagnose probable peritonitis based on nausea"
  (diagnosis
    (snomed_concept "Peritonitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Rebound tenderness" "finding"))
      (clinical_finding (snomed_concept "Abdominal guarding" "finding"))
      (clinical_finding (snomed_concept "Abdominal rigidity" "finding"))
    )
  )
)
;; Page 45 - Nausea/Vomiting: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  "Diagnose probable appendicitis based on nausea"
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)