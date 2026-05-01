// SNOMED CT concepts for South Africa NMC (Notifiable Medical Conditions).
// SNOMED ids resolved via the vha-snomed MCP server. Categories follow the SA NMC list:
//   1 — acute, outbreak-prone (Cholera, Measles, Mpox, Malaria, etc.)
//   2 — endemic / chronic surveillance (Hepatitis, TB, Bilharzia, etc.)
// The dashboard maps over this list to render case-count widgets.

export type NotifiableCategory = 1 | 2

export type NotifiableCondition = {
  key: string
  label: string
  snomed_id: string
  snomed_name: string
  nmc_category: NotifiableCategory
}

export const NOTIFIABLE_CONDITIONS: readonly NotifiableCondition[] = [
  // Category 1 — acute / outbreak-prone
  { key: 'cholera', label: 'Cholera', snomed_id: '63650001', snomed_name: 'Cholera', nmc_category: 1 },
  {
    key: 'covid_19',
    label: 'COVID-19',
    snomed_id: '840539006',
    snomed_name: 'Disease caused by severe acute respiratory syndrome coronavirus 2',
    nmc_category: 1,
  },
  { key: 'diphtheria', label: 'Diphtheria', snomed_id: '397430003', snomed_name: 'Diphtheria caused by Corynebacterium diphtheriae', nmc_category: 1 },
  { key: 'malaria', label: 'Malaria', snomed_id: '61462000', snomed_name: 'Malaria', nmc_category: 1 },
  { key: 'measles', label: 'Measles', snomed_id: '14189004', snomed_name: 'Measles', nmc_category: 1 },
  { key: 'mpox', label: 'Mpox', snomed_id: '359814004', snomed_name: 'Monkeypox', nmc_category: 1 },
  { key: 'pertussis', label: 'Pertussis', snomed_id: '27836007', snomed_name: 'Pertussis', nmc_category: 1 },
  { key: 'rubella', label: 'Rubella', snomed_id: '36653000', snomed_name: 'Rubella', nmc_category: 1 },

  // Category 2 — endemic / chronic surveillance
  {
    key: 'agricultural_or_stock_remedy_poisoning',
    label: 'Agricultural or stock remedy poisoning',
    snomed_id: '37131007',
    snomed_name: 'Pesticide poisoning',
    nmc_category: 2,
  },
  { key: 'bilharzia', label: 'Bilharzia (schistosomiasis)', snomed_id: '10087007', snomed_name: 'Infection caused by Schistosoma', nmc_category: 2 },
  { key: 'brucellosis', label: 'Brucellosis', snomed_id: '75702008', snomed_name: 'Brucellosis', nmc_category: 2 },
  {
    key: 'congenital_rubella_syndrome',
    label: 'Congenital rubella syndrome',
    snomed_id: '1857005',
    snomed_name: 'Congenital rubella syndrome',
    nmc_category: 2,
  },
  { key: 'congenital_syphilis', label: 'Congenital syphilis', snomed_id: '35742006', snomed_name: 'Congenital syphilis', nmc_category: 2 },
  {
    key: 'haemophilus_influenzae_type_b',
    label: 'Haemophilus influenzae type B',
    snomed_id: '709410003',
    snomed_name: 'Haemophilus influenzae type b infection',
    nmc_category: 2,
  },
  { key: 'hepatitis_a', label: 'Hepatitis A', snomed_id: '40468003', snomed_name: 'Viral hepatitis, type A', nmc_category: 2 },
  { key: 'hepatitis_b', label: 'Hepatitis B', snomed_id: '66071002', snomed_name: 'Viral hepatitis type B', nmc_category: 2 },
  { key: 'hepatitis_c', label: 'Hepatitis C', snomed_id: '50711007', snomed_name: 'Viral hepatitis type C', nmc_category: 2 },
  { key: 'hepatitis_e', label: 'Hepatitis E', snomed_id: '7111000119109', snomed_name: 'Viral hepatitis type E', nmc_category: 2 },
  { key: 'lead_poisoning', label: 'Lead poisoning', snomed_id: '1145155005', snomed_name: 'Lead and/or lead compound poisoning', nmc_category: 2 },
  { key: 'legionellosis', label: 'Legionellosis', snomed_id: '26726000', snomed_name: 'Legionella infection', nmc_category: 2 },
  { key: 'leprosy', label: 'Leprosy', snomed_id: '81004002', snomed_name: 'Leprosy', nmc_category: 2 },
  {
    key: 'maternal_death',
    label: 'Maternal death (pregnancy, childbirth and puerperium)',
    snomed_id: '59283008',
    snomed_name: 'Maternal death',
    nmc_category: 2,
  },
  {
    key: 'mercury_poisoning',
    label: 'Mercury poisoning',
    snomed_id: '767299002',
    snomed_name: 'Toxic effect of mercury and/or mercury compound',
    nmc_category: 2,
  },
  { key: 'sth_ascariasis', label: 'Soil-transmitted helminth: Ascaris lumbricoides', snomed_id: '2435008', snomed_name: 'Ascariasis', nmc_category: 2 },
  { key: 'sth_trichuriasis', label: 'Soil-transmitted helminth: Trichuris trichiura', snomed_id: '3752003', snomed_name: 'Trichuriasis', nmc_category: 2 },
  {
    key: 'sth_ancylostoma',
    label: 'Soil-transmitted helminth: Ancylostoma duodenale',
    snomed_id: '7386008',
    snomed_name: 'Ancylostomiasis caused by Ancylostoma duodenale',
    nmc_category: 2,
  },
  {
    key: 'sth_necator',
    label: 'Soil-transmitted helminth: Necator americanus',
    snomed_id: '29665005',
    snomed_name: 'Necatoriasis caused by Necator americanus',
    nmc_category: 2,
  },
  { key: 'tetanus', label: 'Tetanus', snomed_id: '76902006', snomed_name: 'Tetanus', nmc_category: 2 },
  { key: 'tb_pulmonary', label: 'Tuberculosis: pulmonary', snomed_id: '154283005', snomed_name: 'Pulmonary tuberculosis', nmc_category: 2 },
  { key: 'tb_extrapulmonary', label: 'Tuberculosis: extra-pulmonary', snomed_id: '423997002', snomed_name: 'Tuberculosis, extrapulmonary', nmc_category: 2 },
  {
    key: 'tb_mdr',
    label: 'Tuberculosis: multidrug-resistant (MDR-TB)',
    snomed_id: '423092005',
    snomed_name: 'Multidrug resistant tuberculosis',
    nmc_category: 2,
  },
  {
    key: 'tb_xdr',
    label: 'Tuberculosis: extensively drug-resistant (XDR-TB)',
    snomed_id: '710106005',
    snomed_name: 'Extensively drug resistant tuberculosis',
    nmc_category: 2,
  },
] as const

// FNV-1a hash so synthesized counts are stable per (seed, key).
export function hashCount(seed: number, key: string, ceiling: number): number {
  let hash = 0x811c9dc5 ^ seed
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ceiling <= 0 ? 0 : (hash >>> 0) % ceiling
}

// Prevalence weight per condition. Conditions with broad surveillance (TB, Malaria, Hep B)
// skew higher; rare ones (Diphtheria, Cholera) sit near the floor. Used to scale ceilings
// in expectedCount and downstream synthesis (trends, by-province).
export const PREVALENCE_WEIGHT: Record<string, number> = {
  // Cat 1
  cholera: 0.5,
  covid_19: 5,
  diphtheria: 1,
  malaria: 25,
  measles: 4,
  mpox: 1,
  pertussis: 3,
  rubella: 1,
  // Cat 2
  agricultural_or_stock_remedy_poisoning: 0.8,
  bilharzia: 12,
  brucellosis: 0.6,
  congenital_rubella_syndrome: 0.4,
  congenital_syphilis: 6,
  haemophilus_influenzae_type_b: 0.7,
  hepatitis_a: 8,
  hepatitis_b: 14,
  hepatitis_c: 4,
  hepatitis_e: 0.6,
  lead_poisoning: 0.6,
  legionellosis: 0.5,
  leprosy: 0.4,
  maternal_death: 1,
  mercury_poisoning: 0.4,
  sth_ascariasis: 2,
  sth_trichuriasis: 1.5,
  sth_ancylostoma: 1,
  sth_necator: 0.8,
  tetanus: 0.5,
  tb_pulmonary: 60,
  tb_extrapulmonary: 18,
  tb_mdr: 4,
  tb_xdr: 1,
}

// FNV-1a-derived value in [0, 1) — used by trends/by-province widgets to pick a noise factor
// for the suspected/confirmed split. The salt argument lets a single (seed, key) pair produce
// independent values per call site.
export function syntheticHash01(seed: number, key: string, salt: number): number {
  let hash = 0x811c9dc5 ^ (seed + salt)
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ((hash >>> 0) % 1000) / 1000
}

// Expected case count for the bar-chart widget. Scales with encounter pool size.
export function expectedCount(seed: number, condition: NotifiableCondition): number {
  const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
  const ceiling = Math.max(2, Math.round(seed * weight / 100))
  return hashCount(seed + condition.snomed_id.length, condition.key, ceiling + 1)
}
