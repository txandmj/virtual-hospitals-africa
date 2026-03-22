;; Page 64 - Neck Pain: Urgent for meningitis and neurological signs
(system_priority_evaluation
  "Urgent: neck pain with meningism, neurological or traumatic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Neck pain" "finding"))
    (or
      (clinical_finding (snomed_concept "Stiff neck" "finding"))
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
;; Page 64 - Arm Symptoms: Urgent for fracture signs
(system_priority_evaluation
  "Urgent: arm pain with traumatic injury"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
  )
)
