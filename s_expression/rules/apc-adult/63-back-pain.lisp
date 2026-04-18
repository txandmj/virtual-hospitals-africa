;; Page 63 - Back Pain
(task
  "Check for urgent back pain conditions"
  adult
  (clinical_finding (snomed_concept "Backache" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Incomplete emptying of urinary bladder" "finding"))
    (clinical_finding (snomed_concept "Fecal impaction" "disorder"))
    (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
    (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
    (clinical_finding (snomed_concept "Unable to void urine" "finding"))
    (clinical_finding (snomed_concept "Numbness of saddle area" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Difficulty walking" "finding"))
    (clinical_finding (snomed_concept "Upper abdominal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pain radiating to lumbar region of back" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Left flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right flank pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
    (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
    (clinical_finding (snomed_concept "Postmenopausal state" "finding"))
    (clinical_finding (snomed_concept "Left inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Right inguinal pain" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
  )
)
;; Page 63 - Back pain: abdominal aortic aneurysm likely with pulsatile abdominal mass
(system_diagnosis_rule
  "Diagnose probable abdominal aortic aneurysm"
  (diagnosis
    (snomed_concept "Abdominal aortic aneurysm" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
  )
)
;; Page 63 - Back pain: complicated pyelonephritis likely with leucocytes/nitrites, fever and systemic signs
(system_diagnosis_rule
  "Diagnose probable acute pyelonephritis"
  (diagnosis
    (snomed_concept "Acute pyelonephritis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding (snomed_concept "Leukocytes in urine" "finding"))
      (clinical_finding (snomed_concept "Nitrite detected in urine" "finding"))
    )
    (active_condition (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (>= (measurement (snomed_concept "Pulse, function" "observable entity") bpm) 100)
    )
  )
)
;; Page 63 - Back Pain: Urgent for cauda equina and other danger signs
(system_priority_evaluation
  "Urgent: back pain with cauda equina or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (or
      (clinical_finding (snomed_concept "Urinary incontinence" "finding"))
      (clinical_finding (snomed_concept "Incontinence of feces" "finding"))
      (clinical_finding (snomed_concept "Unable to void urine" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
