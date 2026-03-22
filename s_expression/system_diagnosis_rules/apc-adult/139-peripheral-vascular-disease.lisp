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
