;; Page 31 - Eye/Vision: Urgent for standalone urgent eye conditions
(system_priority_evaluation
  "Urgent: serious eye condition requiring immediate assessment"
  adult
  Urgent
  (or
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) "New" (qualifier value) "Sudden" (qualifier value) "Asymmetry" (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness of face” (finding))
		AND
		(clinical_finding ( snomed_concept “Numbness of limbs”(finding))
		)
		(clinical_finding (snomed_concept “Not pregnant” (finding))
		AND 
		(>=measurement (snomed_concept “Systolic blood pressure” (observable entity) "Millimeter of mercury" (qualifier value)180))
		AND
		(>=measurement ( (snomed_concept “Diastolic blood pressure “(observable entity) "Millimeter of mercury" (qualifier value)110))
		)
    (clinical_finding (snomed_concept “Pregnancy” (finding))
		AND 
		(>=measurement ( (snomed_concept “Systolic blood pressure (observable entity) "Millimeter of mercury" (qualifier value)140))
		AND
		(>=measurement ( (snomed_concept “Diastolic blood pressure (observable entity) "Millimeter of mercury" (qualifier value)90))
		OR
    (clinical_finding (snomed_concept “Postpartum period, 7 days" (finding))
		AND 
		(>=measurement ( (snomed_concept “Systolic blood pressure" (observable entity) "Millimeter of mercury" (qualifier value)140))
		AND
		(>=measurement ( (snomed_concept “Diastolic blood pressure" (observable entity) "Millimeter of mercury" (qualifier value)90))
		)
		(clinical_finding (snomed_concept “Jaundice” (finding))
		)
		(clinical_finding (snomed_concept “Swelling of eyelid” (finding) "Both eyes (body structure) "Entire" (qualifier value))
		AND
		(clinical_finding (snomed_concept “Red eye” (finding))
		AND 
		(clinical_finding (snomed_concept “Pain in eye” (finding))
		)
		(clinical_finding (snomed_concept “Red eye” (finding) "Unilateral" (qualifier value))
		AND 
		(clinical_finding (snomed_concept “Pain in eye” (finding))
		)
    (clinical_finding (snomed_concept "Sudden visual loss" "disorder"))
		(clinical_finding (snomed_concept “Abnormal vision” (finding) "Sudden" (qualifier value))
		AND
		(clinical_finding (snomed_concept “Blurring of visual image” (finding) "Sudden" (qualifier value))
		)
		(clinical_finding (snomed_concept “Herpes zoster involving tip of nose” (disorder))
		OR
		(clinical_finding (snomed_concept “Herpes zoster ophthalmicus” (disorder))
		)
    (clinical_finding (snomed_concept "Penetrating wound of eye" "disorder"))
    (clinical_finding (snomed_concept "Laceration of eyelid" "disorder"))
		(clinical_finding (snomed_concept “Metal foreign body in eye region” (disorder))
		OR
		(clinical_finding (snomed_concept “Penetration of eyeball with magnetic foreign body” (disorder))
		)
    (clinical_finding (snomed_concept "Chemical burn of head” (disorder))
    (clinical_finding (snomed_concept "Corneal ulcer" "disorder"))
    (clinical_finding (snomed_concept "Corneal haze” (disorder))
    (clinical_finding (snomed_concept "Ptosis of eyelid" "disorder") (qualifier (snomed_concept "Sudden" "qualifier value"))
  )
)


