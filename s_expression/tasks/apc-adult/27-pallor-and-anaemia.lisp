;; Page 27 - Pallor and Anaemia
(task
  "Check for urgent anaemia with haemodynamic or bleeding signs"
  adult
  (clinical_finding (snomed_concept "Pale conjunctiva" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Palpitations" "finding"))
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (clinical_finding (snomed_concept "Collapse" "finding"))
    (clinical_finding (snomed_concept "Chest pain" "finding"))
    (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (clinical_finding (snomed_concept "Melena" "disorder"))
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
    (clinical_finding (snomed_concept "Easy bruising" "finding"))
    (clinical_finding (snomed_concept "Finding of tendency to bleed" "finding"))
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
  )
)
