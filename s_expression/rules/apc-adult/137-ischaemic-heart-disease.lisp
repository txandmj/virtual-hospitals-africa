;; Page 137 - Ischaemic Heart Disease
(task
  "Check for urgent ischaemic heart disease conditions"
  adult
  (clinical_finding (snomed_concept "Ischemic heart disease" "disorder") (qualifier (snomed_concept "Known present" "qualifier value")))
  (check_for
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Chest pain on exertion" "finding"))
  )
)
;; Page 137 - IHD: acute coronary syndrome likely with chest pain at rest or increasing in frequency
(system_diagnosis_rule
  "Diagnose probable acute coronary syndrome"
  (diagnosis
    (snomed_concept "Acute coronary syndrome" "disorder")
    probable
  )
  adult
  (or
    (clinical_finding (snomed_concept "Chest pain" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
    (clinical_finding (snomed_concept "Chest discomfort" "finding") (qualifier (snomed_concept "At rest" "qualifier value")))
  )
)
;; Page 137 - IHD: stable angina likely with chest pain on exertion
(system_diagnosis_rule
  "Diagnose probable stable angina"
  (diagnosis
    (snomed_concept "Stable angina" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Chest pain on exertion" "finding"))
)
