;; Page 28 - Collapse/Falls: Urgent for other danger signs
(system_priority_evaluation
  Urgent
  (clinical_finding (snomed_concept "Collapse" "finding"))
  (adult 
		(clinical_finding ( snomed_concept “Collapse” (finding) “After” (attribute) “Administration of vaccine to produce active immunity” (procedure))
)
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
		AND
		(clinical_finding ( snomed_concept “Visual disturbance” (disorder))
		)
		(clinical_finding ( snomed_concept “Decreased level of consciousness” (finding))
		)
		(clinical_finding ( snomed_concept “Seizure” (finding))
		)
		(clinical_finding (snomed_concept "Chest pain" "finding"))
		)
    (clinical_finding (snomed_concept "Difficulty breathing" "finding"))
		)
    (clinical_finding (snomed_concept "Palpitations" "finding"))
		)
		(< measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Millimole/liter” (qualifier value) 3))
		OR
		(< measurement (clinical_finding ( snomed_concept “Finding of blood glucose level” (finding) “Diabetes mellitus” (disorder) “Known” (qualifier value) Millimole/liter (qualifier value) 4))
		)
		(< measurement (clinical_finding ( snomed_concept “Systolic blood pressure” (observable entity) 90))
		)
		(< measurement (clinical_finding ( snomed_concept “Heart rate” (observable entity) 50))
		OR
    (clinical_finding (snomed_concept "Pulse slow" "finding"))
		OR
    (clinical_finding (snomed_concept "Pulse irregular" "finding"))
		)
		(clinical_finding ( snomed_concept “Collapse” (finding) “Sudden” (qualifier value))
		AND ANY
			(clinical_finding ( snomed_concept “Generalized pruritus” (finding))
			(clinical_finding ( snomed_concept “Generalized rash” (disorder))
			(clinical_finding ( snomed_concept “Facial swelling” (finding))
			(clinical_finding ( snomed_concept “Tongue swelling” (finding))
			(clinical_finding ( snomed_concept “Wheezing” (finding))
			(clinical_finding ( snomed_concept “Difficulty breathing” (finding))
			(clinical_finding ( snomed_concept “Abdominal pain” (finding))
			(clinical_finding ( snomed_concept “Vomiting” (disorder))
			(clinical_finding ( snomed_concept “Exposure to” (contextual qualifier) (qualifier value) “Substance” (attribute))
		)
    (clinical_finding (snomed_concept "Hematemesis" "disorder"))
		OR
    (clinical_finding (snomed_concept "Hematochezia" "finding"))
		)
    (clinical_finding (snomed_concept "Abdominal pain" "finding"))
“Severe” (severity modifier) (qualifier value))
		OR
    (clinical_finding (snomed_concept "Backache" "finding") "Severe (severity modifier)" "qualifier value"))
		)
    (clinical_finding (snomed_concept "Abnormal vaginal bleeding" "finding")
    (clinical_finding (snomed_concept "Injury of head" "disorder") “Recent” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Family history with explicit context” (situation) “Collapse” (finding))
		OR
		(clinical_finding ( snomed_concept “Family history with explicit context” (situation) “Sudden death” (event))
		)
		(clinical_finding ( snomed_concept “Electrocardiogram abnormal” (finding))
		)
		(clinical_finding ( snomed_concept “Heart disease” (disorder) “Known” (qualifier value)
		)
		(clinical_finding ( snomed_concept “Collapse” (finding) “During exercise” (qualifier value))
		)
		(clinical_finding ( snomed_concept “Pregnancy” (finding) “Abdominal pain” (finding))
		AND
		(clinical_finding ( snomed_concept  “Bleeding from vagina” (finding)
		OR
		(clinical_finding ( snomed_concept “Missed period” (finding) “Abdominal pain” (finding))
		AND
		(clinical_finding ( snomed_concept “Bleeding from vagina” (finding))
		)
	)
)


