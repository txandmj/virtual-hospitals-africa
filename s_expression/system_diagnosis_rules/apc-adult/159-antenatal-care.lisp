;; Page 159 - Antenatal: preterm labour likely with painful uterine contractions (before 37 weeks gestation)
(system_diagnosis_rule
  "Diagnose probable premature labor"
  (diagnosis
    (snomed_concept "Premature labor" "finding")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Painful uterine contractions" "finding"))
)
;; Page 159 - Antenatal: prelabour rupture of membranes likely with amniotic fluid leaking and no contractions
(system_diagnosis_rule
  "Diagnose probable premature rupture of membranes"
  (diagnosis
    (snomed_concept "Premature rupture of membranes" "disorder")
    probable
  )
  adult
  (clinical_finding (snomed_concept "Amniotic fluid leaking" "disorder"))
)
;; Page 159 - Antenatal: severe pre-eclampsia likely with high BP and headache, visual disturbance or abdominal pain
(system_diagnosis_rule
  "Diagnose probable severe pre-eclampsia"
  (diagnosis
    (snomed_concept "Severe pre-eclampsia" "disorder")
    probable
  )
  adult
  (and
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 140)
    (or
      (clinical_finding (snomed_concept "Headache" "finding"))
      (clinical_finding (snomed_concept "Blurring of visual image" "finding"))
      (clinical_finding (snomed_concept "Abdominal pain" "finding"))
    )
  )
)
