;; Page 65 - Leg Symptoms: Urgent for DVT signs
(system_priority_evaluation
  "Urgent: calf pain with swelling suggestive of DVT"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Urgent for acute and critical limb ischaemia
(system_priority_evaluation
  "Urgent: leg pain with absent pulse or gangrene"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Absent pulse" "finding"))
        (or
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
    )
  )
)
