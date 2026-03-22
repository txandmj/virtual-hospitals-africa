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
