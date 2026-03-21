;; Page 139 - PVD: acute limb ischaemia likely with sudden severe leg pain and neurovascular signs
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Absent pulse" "finding"))
    )
  )
)
;; Page 139 - PVD: critical limb ischaemia likely with leg pain at rest, ulcer or gangrene
(system_diagnosis_rule
  "Diagnose probable critical lower limb ischemia"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (or
    (and
      (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
      (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    )
    (clinical_finding (snomed_concept "Skin ulcer" "disorder"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
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
