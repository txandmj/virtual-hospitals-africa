;; Page 65 - Leg Symptoms
(task
  "Check for urgent leg symptom conditions"
  adult
  (clinical_finding (finding_site (snomed_concept "Lower limb structure" "body structure")))
  (check_for
    (clinical_finding (snomed_concept "Pain in calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Swollen calf" "finding") (qualifier (snomed_concept "Unilateral" "qualifier value")))
    (clinical_finding (snomed_concept "Peripheral pulse absent" "finding"))
    (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
    (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding"))
    (clinical_finding (snomed_concept "Ischemic foot with rest pain" "disorder"))
    (clinical_finding (snomed_concept "Gangrene" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Ulcer" "morphologic abnormality"))
    (clinical_finding (snomed_concept "Intermittent claudication" "finding") (finding_site (snomed_concept "Buttock structure" "body structure")))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")) (qualifier (snomed_concept "Severe (severity modifier)" "qualifier value")))
    (clinical_finding (snomed_concept "Pale complexion" "finding"))
    (clinical_finding (snomed_concept "Unable to weight-bear" "finding"))
    (clinical_finding (snomed_concept "Injury of lower limb" "disorder"))
    (clinical_finding (snomed_concept "Smoker" "finding"))
    (clinical_finding (snomed_concept "Impaired mobility" "finding"))
    (clinical_finding (snomed_concept "Pregnancy" "finding"))
    (clinical_finding (snomed_concept "Estrogen hormone therapy" "procedure"))
    (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (clinical_finding (snomed_concept "Gangrenous disorder" "disorder"))
  )
)
;; Page 65 - Leg Symptoms: Deep venous thrombosis likely with swollen painful calf
(system_diagnosis_rule
  "Diagnose possible deep venous thrombosis"
  (diagnosis
    (snomed_concept "Deep venous thrombosis" "disorder")
    possible
  )
  adult
  (or
    (clinical_finding (snomed_concept "Pain in calf" "finding"))
    (clinical_finding (snomed_concept "Swollen calf" "finding"))
  )
)
;; Page 65 - Leg Symptoms: Acute lower limb ischemia likely with pain, absent pulse and neurological signs
(system_diagnosis_rule
  "Diagnose possible acute lower limb ischemia"
  (diagnosis
    (snomed_concept "Acute lower limb ischemia" "disorder")
    possible
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in lower limb" "finding"))
    (clinical_finding (snomed_concept "Absent pulse" "finding"))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Muscle weakness of limb" "finding"))
    )
  )
)
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
