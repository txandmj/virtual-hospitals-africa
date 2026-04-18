;; Page 139 - Peripheral Vascular Disease
(task
  "Check for urgent peripheral vascular disease conditions"
  adult
  (or
    (clinical_finding (snomed_concept "Peripheral vascular disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Abdominal aortic aneurysm" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  )
  (check_for
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (clinical_finding (snomed_concept "Low blood pressure" "disorder"))
  )
)
;; Page 139 - PVD: ruptured abdominal aortic aneurysm likely with pulsatile mass and hypotension
(system_diagnosis_rule
  "Diagnose probable ruptured abdominal aortic aneurysm"
  (diagnosis
    (snomed_concept "Ruptured abdominal aortic aneurysm" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pulsatile mass of abdomen" "finding"))
    (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
  )
)
