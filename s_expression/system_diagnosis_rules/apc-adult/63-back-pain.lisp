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
    (clinical_finding (snomed_concept "Fever" "finding"))
    (or
      (clinical_finding (snomed_concept "Finding of vomiting" "finding"))
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
      (>= (measurement (snomed_concept "Heart rate" "observable entity") bpm) 100)
    )
  )
)
;; Page 63 - Back pain: kidney stone likely with blood in urine and sudden severe flank pain
(system_diagnosis_rule
  "Diagnose possible kidney stone"
  (diagnosis
    (snomed_concept "Kidney stone" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Backache" "finding"))
    (clinical_finding (snomed_concept "Blood in urine" "finding"))
    (clinical_finding (snomed_concept "Flank pain" "finding"))
  )
)
