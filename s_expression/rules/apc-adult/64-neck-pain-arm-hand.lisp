;; Page 64 - Arm or Hand Symptoms
(task
  "Check for urgent arm or hand symptom conditions"
  adult
  (or
    (clinical_finding (finding_site (snomed_concept "Upper limb structure" "body structure")))
    (clinical_finding (finding_site (snomed_concept "Hand structure" "body structure")))
  )
  (check_for
    (clinical_finding (snomed_concept "Pain in left arm" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Pain in right arm" "finding"))
    (clinical_finding (snomed_concept "Hand pain" "finding"))
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Injury of musculoskeletal system" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (clinical_finding (snomed_concept "Severe pain" "finding"))
    (clinical_finding (snomed_concept "Swelling of upper arm" "finding"))
    (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
    (clinical_finding (snomed_concept "Joint swelling" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Deformity" "finding") (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Muscle weakness of upper limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "New" "qualifier value")))
    (clinical_finding (snomed_concept "Difficulty talking" "finding"))
    (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    (clinical_finding (snomed_concept "Pain in upper limb" "finding"))
  )
)
;; Page 64 - Neck Pain
(task
  "Check for urgent neck pain conditions"
  adult
  (clinical_finding (snomed_concept "Neck pain" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
    (clinical_finding (snomed_concept "Headache" "finding"))
    (clinical_finding (snomed_concept "Drowsy" "finding"))
    (clinical_finding (snomed_concept "Acute confusion" "finding"))
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Clumsiness" "finding"))
    (clinical_finding (snomed_concept "Joint stiffness" "finding"))
    (clinical_finding (snomed_concept "Abnormal gait" "finding"))
    (clinical_finding (snomed_concept "Decreased coordination" "finding"))
    (clinical_finding (snomed_concept "Injury of neck" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
  )
)
;; Page 64 - Arm/hand: fracture likely with recent injury and pain, swelling or deformity
(system_diagnosis_rule
  "Diagnose probable fracture of bone"
  (diagnosis
    (snomed_concept "Fracture of bone" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Traumatic injury" "disorder") (qualifier (snomed_concept "Recent" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Swelling of upper arm" "finding"))
      (clinical_finding (snomed_concept "Deformity of upper limb" "finding"))
      (clinical_finding (snomed_concept "Severe pain" "finding"))
    )
  )
)
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
