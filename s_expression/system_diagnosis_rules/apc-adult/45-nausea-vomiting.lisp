;; Page 45 - Nausea/Vomiting: peritonitis likely with guarding, rigidity or rebound tenderness
(system_diagnosis_rule
  "Diagnose probable peritonitis"
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
  "Diagnose probable appendicitis"
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
;; Page 45 - Nausea/Vomiting: pancreatitis likely with upper abdominal pain spreading to back
(system_diagnosis_rule
  "Diagnose probable acute pancreatitis"
  (diagnosis
    (snomed_concept "Acute pancreatitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
  )
)
;; Page 45 - Nausea/Vomiting: meningitis likely with neck stiffness, altered consciousness or purpuric rash
(system_diagnosis_rule
  "Diagnose probable meningitis"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (or
      (clinical_finding (snomed_concept "Nausea" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
