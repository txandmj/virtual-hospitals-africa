;; Page 59 - Urinary Symptoms
(task
  "Check for urgent urinary symptom conditions"
  adult
  (clinical_finding (snomed_concept "Urinary system finding" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Abdominal discomfort" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding") (finding_site (snomed_concept "Lower abdomen structure" "body structure")))
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Oliguria" "finding"))
    (clinical_finding (snomed_concept "Swelling" "finding") (finding_site (snomed_concept "Face structure" "body structure")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Swelling of bilateral feet" "finding") (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Proteinuria" "finding"))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Diabetes mellitus" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Kidney stone likely with blood in urine and flank pain
(system_diagnosis_rule
  "Diagnose possible kidney stone"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept"Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept"Unilateral" "qualifier value")))
  )
)
;; Page 59 - Urinary Symptoms: Acute pyelonephritis likely with flank pain, fever and systemic signs
(system_diagnosis_rule
  "Diagnose possible acute pyelonephritis"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (active_condition (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
    )
  )
)
;; Page 59 - Urinary Symptoms: Urgent for retention with distension
(system_priority_evaluation
  "Urgent: urinary retention with abdominal distension"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Distension of abdomen" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for kidney stone signs
(system_priority_evaluation
  "Urgent: haematuria with flank pain"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
;; Page 59 - Urinary Symptoms: Urgent for complicated pyelonephritis signs
(system_priority_evaluation
  "Urgent: flank pain with fever and systemic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Flank pain" "finding"))
    (>= (measurement (snomed_concept "Body temperature" "observable entity") °C) 38)
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)
