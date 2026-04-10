and/or/any2 in small letters at the start of a parenthentical statement
the clauses underneath all need to be finding/allergy/clinical finding expressions wrapped in parentheses

;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
	"Diabetes mellitus risk likely"
	(increased_risk
		(clinical_finding (snomed_concept "At increased risk of diabetes mellitus" (finding))
		(adult 
				(clinical_finding (snomed_concept "Blood glucose within reference range" (finding))
				(measurement (clinical_finding (snomed_concept "Finding of blood glucose level" (finding) "Millimole/liter" (qualifier value) 3 to 6.0))	
				(>=measurement (clinical_finding (snomed_concept "Body mass index" (observable entity) "Kilogram-meter/square meter" (qualifier value) 25))
						AND ANY
						(clinical_finding (snomed_concept "Sedentary lifestyle" (finding))
						(clinical_finding (snomed_concept "Hypertensive disorder, systemic 	arterial" "disorder")
						(clinical_finding (snomed_concept "Family history of diabetes mellitus in first degree relative" (situation) "Natural parent" (person))
						OR
						(clinical_finding (snomed_concept "Family history of diabetes mellitus in first degree relative" (situation) "Natural sibling" (person))
						(clinical_finding (snomed_concept "Polycystic ovary" "disorder")
						(clinical_finding (snomed_concept "Asian race" (racial group) "Indian	origin" (finding))
						(clinical_finding (snomed_concept "Disorder of cardiovascular system" "disorder")
						(clinical_finding (snomed_concept "Diabetes mellitus during pregnancy, childbirth and the puerperium" "disorder")
						(clinical_finding (snomed_concept "High birth weight" "disorder" "Previous" (qualifier value))
						(> measurement (clinical_finding (snomed_concept "Birth weight" (observable entity) "Previous" (qualifier value) "gram" (qualifier value) 4000))
						(clinical_finding (snomed_concept "Impaired fasting glycemia" "disorder" "Previous" (qualifier value))
					(clinical_finding (snomed_concept "Tuberculosis" "disorder" "In" (attribute) "year" (qualifier value) 1))
		)
	)
)
;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
	"Impaired glucose tolerance likely "
	(probable
		(clinical_finding (snomed_concept "Impaired glucose tolerance" "disorder")
			(adult 
					(measurement (clinical_finding (snomed_concept "Finding of blood glucose level" (finding) "Millimole/liter" (qualifier value) 6.1 to 11.1))
					(clinical_finding (snomed_concept "Impaired fasting glycemia" "disorder")
		)
	)
)
;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
	"Diabetes mellitus likely"
	(probable
		(clinical_finding (snomed_concept Diabetes mellitus" "disorder")
		(adult 
				(>=measurement (clinical_finding (snomed_concept "Finding of blood glucose level" (finding) "Millimole/liter" (qualifier value) 11.1))
				(clinical_finding (snomed_concept "Urine ketones not detected" (finding))
				(clinical_finding (snomed_concept "Weight decreased" (finding))
				(clinical_finding (snomed_concept "Excessive thirst" (finding) "Night time" (qualifier value))
				(clinical_finding (snomed_concept "Polyuria" (finding))
		)
	)
;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
	"Diabetes mellitus likely"
	(referral 
		(clinical_finding (snomed_concept Diabetes mellitus" "disorder")
		(clinical_finding (snomed_concept "Patient referral" (procedure))
			(adult 
					(clinical_finding (snomed_concept "Diabetes mellitus type 1" "disorder")
					(<(clinical_finding (snomed_concept "Current chronological age" (observable entity) year (qualifier value) 35))
		)
	)
)
;; Page 17 – Assess and manage glucose
(system_diagnosis_rule
	"Hyperglycemia likely"
	(probable
		(clinical_finding (snomed_concept "Hyperglycemia" "disorder")
			(adult 
					(>=measurement (clinical_finding (snomed_concept "Finding of blood glucose level" (finding) "Millimole/liter" (qualifier value) 11.1))
					(clinical_finding (snomed_concept "Decreased level of consciousness" (finding))
					(clinical_finding (snomed_concept "Chest pain" (finding))
					(clinical_finding (snomed_concept "Seizure" (finding))
					(clinical_finding (snomed_concept "Drowsy" (finding))
					(clinical_finding (snomed_concept "Clouded consciousness" (finding))
					(clinical_finding (snomed_concept "Nausea" (finding))
					(clinical_finding (snomed_concept "Vomiting" "disorder")
					(clinical_finding (snomed_concept "Abdominal pain" (finding))
					(clinical_finding (snomed_concept "Tachypnea" (finding))
					(clinical_finding (snomed_concept "Deep breathing (finding))
					(>=measurement (clinical_finding (snomed_concept "Body temperature" (observable entity) "Degrees Celsius" (qualifier value) 38))
					(clinical_finding (snomed_concept "Dehydration" "disorder")
					(clinical_finding (snomed_concept "Ketonuria" (finding))
		)
	)
)
(and
	
	)
				(<measurement (clinical_finding (snomed_concept "Finding of blood glucose level" "finding" "Millimole/liter" (qualifier value) 3))
				(clinical_finding (snomed_concept "Mentally alert" "finding")
				(clinical_finding (snomed_concept "Current drinker of alcohol" "finding" "Known" (qualifier value))
				(clinical_finding (snomed_concept "Drowsy" "finding")
				(clinical_finding (snomed_concept "Decreased level of consciousness" "finding")
				(clinical_finding (snomed_concept "Seizure" "finding")
		)
	)

;; Page 17 – Assess and manage glucose
(task
  "Diabetes mellitus risk increased"
  adult
  (clinical_finding (snomed_concept "At increased risk of diabetes mellitus" "finding"))
  (check_for
    (clinical_finding (snomed_concept "Sedentary lifestyle" "finding"))
    (clinical_finding (snomed_concept "Hypertensive disorder, systemic arterial" "disorder"))
    (clinical_finding (snomed_concept "Family history of diabetes mellitus in first degree relative" "situation") (qualifier (snomed_concept "Natural parent" "person")))
    (clinical_finding (snomed_concept "Family history of diabetes mellitus in first degree relative" "situation") (qualifier (snomed_concept "Natural sibling" "person")))
    (clinical_finding (snomed_concept "Polycystic ovary" "disorder"))
    (clinical_finding (snomed_concept "Asian race" "racial group") (qualifier (snomed_concept "Indian origin" "finding")))
    (clinical_finding (snomed_concept "Disorder of cardiovascular system" "disorder"))
    (clinical_finding (snomed_concept "Diabetes mellitus during pregnancy, childbirth and the puerperium" "disorder"))
    (clinical_finding (snomed_concept "High birth weight" "disorder") (qualifier (snomed_concept "Previous" "qualifier value")))
    (clinical_finding (snomed_concept "Impaired fasting glycemia" "disorder") (qualifier (snomed_concept "Previous" "qualifier value")))
    (clinical_finding (snomed_concept "Tuberculosis" "disorder") (qualifier (snomed_concept "In" "attribute") (snomed_concept "year" "qualifier value") 1))
  )
)
