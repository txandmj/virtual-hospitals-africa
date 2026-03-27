;; Page 30 - Headache: Urgent for other danger signs
(system_priority_evaluation
(clinical_finding (snomed_concept "Headache" "finding"))
  adult
  Urgent
  (and
		(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
		)
		(>= measurement (clinical_finding ( snomed_concept “Pregnancy’ (finding) “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 140))
		AND
		(>= measurement (clinical_finding ( snomed_concept “Pregnancy” (finding) “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
		OR
		(>= measurement (clinical_finding ( snomed_concept “Postpartum period, 7 days” (finding) “Systolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 140))
		AND 
		(>= measurement (clinical_finding ( snomed_concept “Postpartum period, 7 days” (finding) “Diastolic blood pressure” (observable entity) “Millimeter of mercury” (qualifier value) 90))
		)
		(clinical_finding ( snomed_concept “Weakness of face muscles” (finding) “Sudden” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness of face” (finding) “Sudden” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Muscle weakness of upper arm” (finding) “Sudden” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness of upper limb” (finding) “Sudden” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Weakness of muscle of lower leg” (finding) “Sudden” (qualifier value))
		AND
		(clinical_finding ( snomed_concept “Numbness of lower limb’ (finding) “Sudden” (qualifier value))
		OR
		(clinical_finding ( snomed_concept “Speech problem” (finding) “Sudden” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “Sudden” (qualifier value) “Severe” (severity modifier) (qualifier value))
		OR
		(clinical_finding ( snomed_concept “Dizziness” (finding) “Sudden” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “Worse” (qualifier value) “Frequent” (qualifier value) “More’ (qualifier value))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “Wakes up during night” (finding))
		OR
		(clinical_finding ( snomed_concept “Headache” (finding) “Worse” (qualifier value) “Morning” (qualifier value))
		)
    (clinical_finding (snomed_concept "Stiff neck" "finding"))
		AND 
    (clinical_finding (snomed_concept "Drowsy" "finding"))
		AND
    (clinical_finding (snomed_concept "Clouded consciousness" "finding"))
		AND
    (clinical_finding (snomed_concept "Purpuric rash" "disorder"))
    (clinical_finding (snomed_concept "Visual symptoms” (finding) “New” (qualifier value))
		OR
    (clinical_finding (snomed_concept "Pain in eye" "finding")“New” (qualifier value))
    (clinical_finding ( snomed_concept “Nausea” (finding) “Chronic persistent” (qualifier value))
		OR
		(clinical_finding ( snomed_concept “Vomiting” (disorder) “Chronic persistent” (qualifier value))
		)
    (clinical_finding (snomed_concept "Injury of head" "disorder") “Recent” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “Associated with” (attribute) “Date treatment started” (observable entity) “Highly active antiretroviral therapy” (procedure))
		)
		(clinical_finding ( snomed_concept “Headache” (finding) “Following (attribute) “First” (qualifier value) “Seizure” (finding))
		)
    (clinical_finding (snomed_concept "Anisocoria" "disorder"))
		)
    (>= (measurement (snomed_concept "Systolic blood pressure" "observable entity") mmHg) 180)
		AND 
		(clinical_finding ( snomed_concept “Pregnancy” (finding) “None’ (qualifier value) “
		AND
    (>= (measurement (snomed_concept "Diastolic blood pressure" "observable entity") mmHg) 110)
    )
)

 
