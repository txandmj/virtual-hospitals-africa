;; Page 24 - Fever
(task
  "Check for urgent fever conditions"
  adult
  (active_condition (snomed_concept "Fever" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Decreased level of consciousness" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Petechiae of skin" "disorder"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
    (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
    (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Nausea" "finding"))
  )
)
;; Page 24 - Fever: meningitis likely with neck stiffness, or drowsy/confused with purpuric rash
(system_diagnosis_rule
  "Diagnose probable meningitis based on fever"
  (diagnosis
    (snomed_concept "Meningitis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (or
      (active_condition (snomed_concept "Fever" "finding"))
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (clinical_finding (snomed_concept "Nausea" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Acute confusion" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    )
  )
)
;; Page 24 - Fever: appendicitis likely with right lower abdominal tenderness
(system_diagnosis_rule
  "Diagnose probable appendicitis based on fever"
  (diagnosis
    (snomed_concept "Acute appendicitis" "disorder")
    probable
  )
  adult
  (and
    (active_condition (snomed_concept "Fever" "finding"))
    (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
  )
)
;; Page 24 - A patient with a fever has a temperature ≥ 38°C now or in past 3 days.
;; TODO account for 3 days element
(system_diagnosis_rule
  "Diagnose fever"
  (diagnosis
    (snomed_concept "Fever" "finding")
    definite
  )
  adult
  (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
)
;; Page 24 - Fever: Urgent for probable meningitis
(system_priority_evaluation
  "Urgent: probable meningitis"
  adult
  Urgent
  (active_condition
    (snomed_concept "Meningitis" "disorder")
  )
)

;; Page 24 - Fever: Urgent for other danger signs
(system_priority_evaluation
  "Urgent: fever with danger signs"
  adult
  Urgent
  (and
    (active_condition (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Drowsy" "finding"))
      (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
      (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
      (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
      (clinical_finding (snomed_concept "Tenderness of right lower quadrant of abdomen" "finding"))
      (clinical_finding (snomed_concept "Acute abdominal pain" "finding"))
      (clinical_finding (snomed_concept "Backache" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
      (clinical_finding (snomed_concept "Jaundice" "finding"))
      (clinical_finding (snomed_concept "Easy bruising" "finding"))
      (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (> (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 30)
    )
  )
)
