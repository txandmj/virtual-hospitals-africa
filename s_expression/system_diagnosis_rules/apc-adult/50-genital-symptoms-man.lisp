;; Page 50 - Genital symptoms (man): testicular torsion likely with sudden severe scrotal pain and swelling
(system_diagnosis_rule
  "Diagnose probable torsion of testis"
  (diagnosis
    (snomed_concept "Torsion of testis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Acute pain of scrotum" "finding"))
    (clinical_finding (snomed_concept "Swelling of scrotum" "finding"))
  )
)
;; Page 50 - Genital symptoms (man): paraphimosis likely with penile pain and swelling
(system_diagnosis_rule
  "Diagnose probable paraphimosis"
  (diagnosis
    (snomed_concept "Paraphimosis" "disorder")
    probable
  )
  adult
  (and
    (clinical_finding (snomed_concept "Pain in penis" "finding"))
    (clinical_finding (snomed_concept "Penile swelling" "disorder"))
  )
)
