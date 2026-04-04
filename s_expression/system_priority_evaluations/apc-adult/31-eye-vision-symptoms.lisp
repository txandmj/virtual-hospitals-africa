;; Page 31 - Eye/Vision: Emergency signs
(system_priority_evaluation
  "Emergency: stroke or neurological signs with visual symptoms"
  adult
  Emergency
  (and
    (clinical_finding (snomed_concept "Eye / vision finding" "finding"))
    (or
      (clinical_finding (snomed_concept "Numbness of limbs" "finding"))
      (clinical_finding (snomed_concept "Difficulty talking" "finding"))
      (clinical_finding (snomed_concept "Weakness of face muscles" "finding") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    )
  )
)
;; Page 31 - Eye/Vision: Urgent for standalone urgent eye conditions
(system_priority_evaluation
  "Urgent: serious eye condition requiring immediate assessment"
  adult
  Urgent
  (or
    (clinical_finding (snomed_concept "Orbital cellulitis" "disorder"))
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
    (clinical_finding (snomed_concept "Chemical burn" "disorder") (finding_site (snomed_concept "Structure of eye proper" "body structure")))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze" "disorder"))
    (clinical_finding (snomed_concept "Corneal opacity" "disorder"))
    (clinical_finding (snomed_concept "Herpes zoster keratoconjunctivitis" "disorder"))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden onset" "qualifier value")))
    (clinical_finding (snomed_concept "Metal foreign body in eye region" "disorder"))
    (clinical_finding (snomed_concept "Penetration of eyeball with magnetic foreign body" "disorder"))
    (clinical_finding (snomed_concept "Jaundice" "finding"))
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
  )
)
