(task
  "Check Sp0₂ if respiratory rate < 9 bpm"
  adult
  (< (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 9)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Check Sp0₂ if respiratory rate >= 15 bpm"
  adult
  (>= (measurement (snomed_concept "Respiratory rate" "observable entity") bpm) 15)
  (measure (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %))
)
(task
  "Give oxygen if saturation below 92%"
  adult
  (< (measurement (snomed_concept "Hemoglobin saturation with oxygen" "observable entity") %) 92)
  (manage (snomed_concept "Oxygen therapy" "procedure"))
)
(system_priority_evaluation
  "Emergency: hypoglycaemia"
  all_ages
  Emergency
  (< (measurement (snomed_concept "Blood glucose status" "observable entity") mmol/L) 3)
)
(system_priority_evaluation
  "Emergency: shock signs in children"
  (ages "older child" "younger child")
  Emergency
  (and
    (clinical_finding (snomed_concept "Cold hands" "finding"))
    (any2 (clinical_finding (snomed_concept "Weak arterial pulse" "finding"))
          (clinical_finding (snomed_concept "Pulse fast" "finding"))
          (clinical_finding (snomed_concept "Lethargy" "finding"))
    )
  )
)
;; Cross-cutting: Stroke/TIA signs (asymmetric weakness/numbness + speech or visual disturbance)
(system_priority_evaluation
  "Urgent: stroke or TIA signs"
  adult
  Urgent
  (and
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Generalized muscle weakness" "finding"))
    )
    (or
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Visual disturbance" "disorder"))
    )
  )
)
