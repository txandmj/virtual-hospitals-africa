;; Page 35 - Mouth/Throat: Airway obstruction
(system_priority_evaluation
  "Emergency: upper respiratory tract obstruction"
  adult
  Emergency
  (clinical_finding (snomed_concept "Upper respiratory tract obstruction" "disorder"))
)
;; Page 35 - Mouth/Throat: Unable to open mouth or swallow
(system_priority_evaluation
  "Urgent: unable to open mouth or swallow"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Unable to open mouth" "finding"))
    (clinical_finding (snomed_concept "Unable to swallow" "finding"))
  )
)
