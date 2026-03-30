;; Page 29 - Dizziness
(system_priority_evaluation
  "Urgent: dizziness with cardiac or neurological signs"
  adult
  Urgent
  (and
    (clinical_finding (snomed_concept "Dizziness" "finding"))
    (or
      (clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Numbness of face” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Muscle weakness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Numbness of upper limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Weakness of muscle of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Numbness of lower limb” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Asymmetry” (qualifier value))
			AND
			(clinical_finding ( snomed_concept “Difficulty talking” (finding))
			OR
  		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
			)
			(< measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
			AND
			(< measurement (clinical_finding ( snomed_concept “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 60))
			)
			(< measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
			OR
			(< measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Diabetes mellitus” (disorder) “Known” (qualifier value) “Millimole/liter” (qualifier value) 4))
			)
			(clinical_finding (snomed_concept "Chest pain" "finding"))
			)
      (clinical_finding (snomed_concept "Orthopnea" "finding"))
			AND
      (clinical_finding (snomed_concept "Leg swelling symptom" "finding"))
			)
      (clinical_finding (snomed_concept "Injury of head" "disorder") “Recent” (qualifier value))
			)
      (clinical_finding (snomed_concept "Unable to stand" "finding") “Unaided” (qualifier value))
			)
			(clinical_finding ( snomed_concept “Dizziness” (finding) “New” (qualifier value) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
			ANY
        	(clinical_finding ( snomed_concept “With” (attribute) “Nausea” (finding))
				  (clinical_finding ( snomed_concept “With” (attribute) “Vomiting” (disorder))
     		  (clinical_finding (snomed_concept “With” (attribute) "Abnormal ocular motility" "finding"))
					(clinical_finding ( snomed_concept “With” (attribute) “Abnormal gait” (finding))
			)
			(< measurement (clinical_finding ( snomed_concept “Heart rate” (observable entity) “Beats/minute” (qualifier value) 50))
			OR
      (clinical_finding (snomed_concept "Pulse irregular" "finding"))
			)
      (< (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 90)
			AND
      (< (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 60)
    )
  )
)

