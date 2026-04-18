;; Page 66 - Foot Symptoms
(task
  "Check for urgent foot symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Foot structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness of lower limb" "finding"))
    (clinical_finding (snomed_concept "Weakness of muscle of lower limb" "finding"))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder"))
    (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Ulcer" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Muscle weakness" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    (clinical_finding (snomed_concept "Foot pain" "finding"))
    (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
    (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
  )
)
;; Page 66 - Foot symptoms: acute limb ischaemia likely with sudden severe foot pain at rest and neurovascular signs
(system_diagnosis_rule
  "Diagnose probable acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding") (qualifier (snomed_concept "Sudden" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (or
      (clinical_finding (snomed_concept "Numbness" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
      (clinical_finding (snomed_concept "Muscle weakness" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
      (clinical_finding (snomed_concept "Absent pulse" "finding") (finding_site (snomed_concept "Lower limb structure" "body structure")))
    )
  )
)
;; Page 66 - Foot symptoms: critical limb ischaemia likely with claudication and foot pain at rest, ulcer or gangrene
(system_diagnosis_rule
  "Diagnose probable critical lower limb ischemia"
  (diagnosis
    (snomed_concept "Critical lower limb ischemia" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (or
      (clinical_finding (snomed_concept "Foot pain" "finding"))
      (clinical_finding (snomed_concept "Ulcer of foot" "disorder"))
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
    )
  )
)
;; Page 66 - Foot Symptoms: Urgent for ischaemia and fracture signs
(system_priority_evaluation
  "Urgent: foot pain with ischaemic or traumatic signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Foot pain" "finding"))
    (or
      (and
        (clinical_finding (snomed_concept "Absent pulse" "finding"))
        (or
          (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
          (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
        )
      )
      (clinical_finding (snomed_concept "Gangrene of foot" "disorder"))
      (clinical_finding (snomed_concept "Traumatic injury" "disorder"))
    )
  )
)
