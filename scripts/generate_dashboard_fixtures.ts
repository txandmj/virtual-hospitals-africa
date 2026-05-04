// Generates deterministic JSON fixtures for the standalone dashboard preview.
// Run with: deno run -A scripts/generate_dashboard_fixtures.ts
// Output: fixtures/dashboard/*.json

const ANCHOR_ISO = '2026-04-27T00:00:00Z'
const DAYS_BACK = 90
const SEED = 0xC0FFEE
const TARGET_PATIENT_COUNT = 600

const OUTPUT_DIR = new URL('../fixtures/dashboard/', import.meta.url)

type Department =
  | 'emergency'
  | 'internal_medicine'
  | 'obgyn'
  | 'pediatrics'
  | 'surgery'
  | 'cardiology'

type Role = 'doctor' | 'nurse' | 'admin'

type Payer = 'insurance' | 'government' | 'self_pay' | 'ngo'

type Province = 'EC' | 'FS' | 'GP' | 'KZN' | 'LP' | 'MP' | 'NC' | 'NW' | 'WC'

type Organization = {
  id: string
  name: string
  category: 'urban' | 'regional' | 'clinic'
  country: string
  city: string
  province: Province | null
  departments: Department[]
}

type Employee = {
  id: string
  name: string
  role: Role
  specialty: Department | null
  organization_id: string
  at_work: boolean
}

type Patient = {
  id: string
  name: string
  birth_year: number
  sex: 'f' | 'm'
}

type Encounter = {
  id: string
  patient_id: string
  organization_id: string
  department: Department
  primary_doctor_id: string | null
  created_at: string
  closed_at: string | null
  is_readmission: boolean
}

type BedCapacity = {
  organization_id: string
  department: Department
  total_beds: number
  occupied_beds: number
}

type BillingLine = {
  encounter_id: string
  organization_id: string
  department: Department
  payer: Payer
  total_charge_usd: number
}

const DEPARTMENT_LABELS: Record<Department, string> = {
  emergency: 'Emergency',
  internal_medicine: 'Internal Medicine',
  obgyn: 'OB/GYN',
  pediatrics: 'Pediatrics',
  surgery: 'Surgery',
  cardiology: 'Cardiology',
}

// Mean length of stay (days) per department; encounters sampled with lognormal noise.
const DEPARTMENT_ALOS_DAYS: Record<Department, number> = {
  emergency: 0.3,
  pediatrics: 2.0,
  obgyn: 2.5,
  internal_medicine: 3.0,
  surgery: 4.0,
  cardiology: 5.0,
}

// Relative volume share within an organization's encounter stream.
const DEPARTMENT_MIX: Record<Department, number> = {
  emergency: 0.35,
  internal_medicine: 0.20,
  obgyn: 0.15,
  pediatrics: 0.15,
  surgery: 0.12,
  cardiology: 0.03,
}

// Per-department base USD charge for a 1-day stay. Surgery & cardiology dominate revenue.
const DEPARTMENT_BASE_CHARGE_USD: Record<Department, number> = {
  emergency: 60,
  internal_medicine: 120,
  obgyn: 180,
  pediatrics: 90,
  surgery: 850,
  cardiology: 600,
}

const PAYER_MIX: Array<{ payer: Payer; weight: number }> = [
  { payer: 'insurance', weight: 0.40 },
  { payer: 'government', weight: 0.25 },
  { payer: 'self_pay', weight: 0.30 },
  { payer: 'ngo', weight: 0.05 },
]

const ORGANIZATIONS: Organization[] = [
  {
    id: 'org_harare',
    name: 'Harare Central Hospital',
    category: 'urban',
    country: 'Zimbabwe',
    city: 'Harare',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics', 'surgery', 'cardiology'],
  },
  {
    id: 'org_bulawayo',
    name: 'Bulawayo Regional Medical Center',
    category: 'regional',
    country: 'Zimbabwe',
    city: 'Bulawayo',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics'],
  },
  {
    id: 'org_durban',
    name: 'Durban Regional Medical Center',
    category: 'regional',
    country: 'South Africa',
    city: 'Durban',
    province: 'KZN',
    departments: ['emergency', 'internal_medicine', 'obgyn', 'pediatrics'],
  },
  {
    id: 'org_mutoko',
    name: 'Mutoko Rural Clinic',
    category: 'clinic',
    country: 'Zimbabwe',
    city: 'Mutoko',
    province: null,
    departments: ['emergency', 'internal_medicine', 'obgyn'],
  },
]

// Volume share per org. Drives daily encounter rates.
const ORG_VOLUME_SHARE: Record<string, number> = {
  org_harare: 0.50,
  org_bulawayo: 0.20,
  org_durban: 0.20,
  org_mutoko: 0.10,
}

// Bed capacity per org × department. Sized to land instantaneous occupancy near 60–75%.
const BED_CAPACITY: Array<{ organization_id: string; department: Department; total_beds: number }> = [
  { organization_id: 'org_harare', department: 'emergency', total_beds: 6 },
  { organization_id: 'org_harare', department: 'internal_medicine', total_beds: 14 },
  { organization_id: 'org_harare', department: 'obgyn', total_beds: 10 },
  { organization_id: 'org_harare', department: 'pediatrics', total_beds: 8 },
  { organization_id: 'org_harare', department: 'surgery', total_beds: 12 },
  { organization_id: 'org_harare', department: 'cardiology', total_beds: 6 },
  { organization_id: 'org_bulawayo', department: 'emergency', total_beds: 3 },
  { organization_id: 'org_bulawayo', department: 'internal_medicine', total_beds: 7 },
  { organization_id: 'org_bulawayo', department: 'obgyn', total_beds: 5 },
  { organization_id: 'org_bulawayo', department: 'pediatrics', total_beds: 4 },
  { organization_id: 'org_durban', department: 'emergency', total_beds: 3 },
  { organization_id: 'org_durban', department: 'internal_medicine', total_beds: 7 },
  { organization_id: 'org_durban', department: 'obgyn', total_beds: 5 },
  { organization_id: 'org_durban', department: 'pediatrics', total_beds: 4 },
  { organization_id: 'org_mutoko', department: 'emergency', total_beds: 2 },
  { organization_id: 'org_mutoko', department: 'internal_medicine', total_beds: 4 },
  { organization_id: 'org_mutoko', department: 'obgyn', total_beds: 3 },
]

// Total daily encounters across all orgs (Mon–Fri baseline). Sized so steady-state occupancy lands ~65%.
const BASELINE_DAILY_ENCOUNTERS = 48

// Mulberry32 — deterministic PRNG.
function makeRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = makeRng(SEED)

function pick<T>(items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick(): empty array')
  const index = Math.floor(rng() * items.length)
  // Mulberry32 is in [0,1) so index is in [0, length-1].
  const value = items.at(index)
  if (value === undefined) throw new Error('pick(): index out of bounds')
  return value
}

function pickWeighted<T>(items: ReadonlyArray<{ value: T; weight: number }>): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  let r = rng() * total
  for (const item of items) {
    r -= item.weight
    if (r <= 0) return item.value
  }
  // Fallback in case of float drift.
  const last = items.at(items.length - 1)
  if (!last) throw new Error('pickWeighted(): empty')
  return last.value
}

function poissonLike(mean: number): number {
  // Approximate non-negative integer count near `mean` using uniform jitter — good enough for fixtures.
  if (mean <= 0) return 0
  const noise = (rng() - 0.5) * Math.max(2, Math.sqrt(mean) * 2.5)
  return Math.max(0, Math.round(mean + noise))
}

function lognormalDays(mean_days: number): number {
  // Sigma chosen so that the long tail looks plausible without producing 30-day stays for ER.
  const sigma = 0.55
  const mu = Math.log(mean_days) - (sigma * sigma) / 2
  // Box–Muller for the normal sample.
  const u1 = Math.max(rng(), 1e-9)
  const u2 = rng()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return Math.exp(mu + sigma * z)
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, '0')
}

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay()
  return dow === 0 || dow === 6
}

// Hour-of-day distribution per department. Each entry weights a sampled admit hour.
function sampleAdmitHour(department: Department): number {
  if (department === 'emergency') {
    // Bimodal: mid-morning and late evening peak.
    if (rng() < 0.5) return 8 + Math.floor(rng() * 5)
    return 19 + Math.floor(rng() * 5)
  }
  if (department === 'surgery') {
    // Morning OR slots.
    return 7 + Math.floor(rng() * 4)
  }
  if (department === 'obgyn') {
    return Math.floor(rng() * 24)
  }
  // Default daytime.
  return 8 + Math.floor(rng() * 10)
}

function dayMultiplier(department: Department, weekend: boolean): number {
  if (!weekend) return 1
  if (department === 'emergency' || department === 'obgyn') return 1
  if (department === 'surgery') return 0
  return 0.7
}

function buildOrganizations(): Organization[] {
  return ORGANIZATIONS
}

function buildEmployees(): Employee[] {
  // Shona/Ndebele/Zulu first names (mixed gender), shared across orgs deterministically.
  const first_names = [
    'Tendai',
    'Chipo',
    'Tafadzwa',
    'Rumbidzai',
    'Farai',
    'Nyasha',
    'Tatenda',
    'Kudzai',
    'Anesu',
    'Sipho',
    'Thandiwe',
    'Sibusiso',
    'Nokuthula',
    'Mandla',
    'Lindiwe',
    'Bongani',
    'Zanele',
    'Nkosi',
    'Thabo',
    'Naledi',
    'Lerato',
    'Mpho',
    'Kagiso',
    'Refilwe',
    'Tshepo',
    'Boitumelo',
    'Sello',
    'Karabo',
    'Palesa',
    'Themba',
  ]
  const surnames = [
    'Moyo',
    'Ndlovu',
    'Sibanda',
    'Dube',
    'Khumalo',
    'Nyathi',
    'Chigumba',
    'Mthembu',
    'Zulu',
    'Mabaso',
    'Mokoena',
    'Mokwena',
    'Tshuma',
    'Phiri',
    'Banda',
  ]
  let counter = 0
  const employees: Employee[] = []
  function add(role: Role, specialty: Department | null, organization_id: string, at_work: boolean) {
    counter += 1
    const first = first_names.at(counter % first_names.length)
    const last = surnames.at((counter * 7) % surnames.length)
    if (!first || !last) throw new Error('name pool exhausted')
    const prefix = role === 'doctor' ? 'Dr. ' : ''
    employees.push({
      id: `emp_${pad(counter, 3)}`,
      name: `${prefix}${first} ${last}`,
      role,
      specialty,
      organization_id,
      at_work,
    })
  }

  // Harare urban hospital — full department coverage with a couple of doctors per busy dept.
  add('doctor', 'emergency', 'org_harare', true)
  add('doctor', 'emergency', 'org_harare', false)
  add('doctor', 'obgyn', 'org_harare', true)
  add('doctor', 'internal_medicine', 'org_harare', true)
  add('doctor', 'pediatrics', 'org_harare', false)
  add('doctor', 'surgery', 'org_harare', true)
  add('doctor', 'cardiology', 'org_harare', true)
  add('nurse', null, 'org_harare', true)
  add('nurse', null, 'org_harare', true)
  add('nurse', null, 'org_harare', false)
  add('nurse', null, 'org_harare', true)
  add('admin', null, 'org_harare', true)

  // Bulawayo regional.
  add('doctor', 'emergency', 'org_bulawayo', true)
  add('doctor', 'obgyn', 'org_bulawayo', false)
  add('doctor', 'internal_medicine', 'org_bulawayo', true)
  add('doctor', 'pediatrics', 'org_bulawayo', true)
  add('nurse', null, 'org_bulawayo', true)
  add('nurse', null, 'org_bulawayo', false)
  add('nurse', null, 'org_bulawayo', true)
  add('admin', null, 'org_bulawayo', true)

  // Durban regional.
  add('doctor', 'emergency', 'org_durban', false)
  add('doctor', 'obgyn', 'org_durban', true)
  add('doctor', 'internal_medicine', 'org_durban', true)
  add('doctor', 'pediatrics', 'org_durban', true)
  add('nurse', null, 'org_durban', true)
  add('nurse', null, 'org_durban', true)
  add('nurse', null, 'org_durban', false)
  add('admin', null, 'org_durban', true)

  // Mutoko rural clinic.
  add('doctor', 'emergency', 'org_mutoko', true)
  add('doctor', 'internal_medicine', 'org_mutoko', false)
  add('nurse', null, 'org_mutoko', true)
  add('admin', null, 'org_mutoko', false)

  return employees
}

function buildPatients(): Patient[] {
  const first_names = [
    'Anesu',
    'Tariro',
    'Rutendo',
    'Munashe',
    'Tafadzwa',
    'Chipo',
    'Tendai',
    'Nyasha',
    'Farai',
    'Kudzai',
    'Tinashe',
    'Memory',
    'Blessing',
    'Patience',
    'Precious',
    'Hope',
    'Faith',
    'Grace',
    'Sipho',
    'Thandi',
    'Bongi',
    'Nokuthula',
    'Mandla',
    'Sibusiso',
    'Nkosi',
    'Zanele',
    'Lerato',
    'Mpho',
    'Refilwe',
    'Lindiwe',
  ]
  const surnames = [
    'Moyo',
    'Ndlovu',
    'Sibanda',
    'Dube',
    'Khumalo',
    'Nyathi',
    'Chigumba',
    'Mthembu',
    'Zulu',
    'Mabaso',
    'Mokoena',
    'Mokwena',
    'Tshuma',
    'Phiri',
    'Banda',
    'Mhlanga',
    'Ncube',
    'Mkhize',
    'Nkomo',
    'Mthethwa',
  ]
  const patients: Patient[] = []
  for (let i = 1; i <= TARGET_PATIENT_COUNT; i += 1) {
    const first = first_names.at(i % first_names.length)
    const last = surnames.at((i * 11) % surnames.length)
    if (!first || !last) throw new Error('patient name pool exhausted')
    const sex: 'f' | 'm' = rng() < 0.52 ? 'f' : 'm'
    const birth_year = 1935 + Math.floor(rng() * 90)
    patients.push({ id: `pat_${pad(i, 4)}`, name: `${first} ${last}`, birth_year, sex })
  }
  return patients
}

function buildEncounters(orgs: Organization[], employees: Employee[], patients: Patient[]): Encounter[] {
  const anchor = new Date(ANCHOR_ISO)
  const encounters: Encounter[] = []
  let counter = 0

  function newId(): string {
    counter += 1
    return `enc_${pad(counter, 5)}`
  }

  function doctorsFor(organization_id: string, department: Department): Employee[] {
    return employees.filter((e) => e.organization_id === organization_id && e.role === 'doctor' && e.specialty === department)
  }

  // Generate baseline encounters day by day.
  for (let offset = DAYS_BACK - 1; offset >= 0; offset -= 1) {
    const day = new Date(anchor)
    day.setUTCDate(day.getUTCDate() - offset)
    const weekend = isWeekend(day)

    for (const org of orgs) {
      const org_share = ORG_VOLUME_SHARE[org.id] ?? 0
      for (const dept of org.departments) {
        const dept_share = DEPARTMENT_MIX[dept]
        const expected = BASELINE_DAILY_ENCOUNTERS * org_share * dept_share * dayMultiplier(dept, weekend)
        const count = poissonLike(expected)
        for (let i = 0; i < count; i += 1) {
          const patient = pick(patients)
          const doctors_in_dept = doctorsFor(org.id, dept)
          const fallback_doctors = employees.filter((e) => e.organization_id === org.id && e.role === 'doctor')
          const doctor_pool = doctors_in_dept.length > 0 ? doctors_in_dept : fallback_doctors
          const doctor = doctor_pool.length > 0 ? pick(doctor_pool) : null

          const admit_hour = sampleAdmitHour(dept)
          const admit_minute = Math.floor(rng() * 60)
          const created_at = new Date(day)
          created_at.setUTCHours(admit_hour, admit_minute, 0, 0)

          const los_days = lognormalDays(DEPARTMENT_ALOS_DAYS[dept])
          const close_time = new Date(created_at.getTime() + los_days * 86_400_000)
          const horizon = new Date(anchor.getTime() + 86_400_000) // include 'today' as still-open if needed
          const closed_at = close_time < horizon ? close_time.toISOString() : null

          encounters.push({
            id: newId(),
            patient_id: patient.id,
            organization_id: org.id,
            department: dept,
            primary_doctor_id: doctor ? doctor.id : null,
            created_at: created_at.toISOString(),
            closed_at,
            is_readmission: false,
          })
        }
      }
    }
  }

  // Inject readmissions: ~8% of patients with a closed encounter get a follow-up within 30 days.
  const eligible_patients = new Map<string, Encounter>()
  for (const enc of encounters) {
    if (!enc.closed_at) continue
    const existing = eligible_patients.get(enc.patient_id)
    if (!existing) eligible_patients.set(enc.patient_id, enc)
  }

  const eligible_list = Array.from(eligible_patients.values())
  const target_readmissions = Math.round(eligible_list.length * 0.08)
  for (let i = 0; i < target_readmissions; i += 1) {
    const source = pick(eligible_list)
    if (!source.closed_at) continue
    const closed = new Date(source.closed_at)
    const gap_days = 1 + rng() * 29
    const readmit_at = new Date(closed.getTime() + gap_days * 86_400_000)
    if (readmit_at > new Date(anchor.getTime() + 86_400_000)) continue
    const dept = source.department
    const los_days = lognormalDays(DEPARTMENT_ALOS_DAYS[dept])
    const close_time = new Date(readmit_at.getTime() + los_days * 86_400_000)
    const horizon = new Date(anchor.getTime() + 86_400_000)
    encounters.push({
      id: newId(),
      patient_id: source.patient_id,
      organization_id: source.organization_id,
      department: dept,
      primary_doctor_id: source.primary_doctor_id,
      created_at: readmit_at.toISOString(),
      closed_at: close_time < horizon ? close_time.toISOString() : null,
      is_readmission: true,
    })
  }

  encounters.sort((a, b) => a.created_at.localeCompare(b.created_at))
  return encounters
}

function buildBeds(encounters: Encounter[]): BedCapacity[] {
  const open_counts = new Map<string, number>()
  for (const enc of encounters) {
    if (enc.closed_at) continue
    const key = `${enc.organization_id}::${enc.department}`
    open_counts.set(key, (open_counts.get(key) ?? 0) + 1)
  }
  return BED_CAPACITY.map((cap) => {
    const key = `${cap.organization_id}::${cap.department}`
    const occupied = Math.min(open_counts.get(key) ?? 0, cap.total_beds)
    return { organization_id: cap.organization_id, department: cap.department, total_beds: cap.total_beds, occupied_beds: occupied }
  })
}

function buildBilling(encounters: Encounter[]): BillingLine[] {
  return encounters.map((enc) => {
    const created = new Date(enc.created_at)
    const end_iso = enc.closed_at ?? ANCHOR_ISO
    const closed = new Date(end_iso)
    const stay_days = Math.max(0.25, (closed.getTime() - created.getTime()) / 86_400_000)
    const base = DEPARTMENT_BASE_CHARGE_USD[enc.department]
    const noise_pct = 0.85 + rng() * 0.30 // ±15% noise
    const charge = Math.round(base * stay_days * noise_pct * 100) / 100
    const payer = pickWeighted(PAYER_MIX.map((p) => ({ value: p.payer, weight: p.weight })))
    return {
      encounter_id: enc.id,
      organization_id: enc.organization_id,
      department: enc.department,
      payer,
      total_charge_usd: charge,
    }
  })
}

async function writeJson(filename: string, data: unknown): Promise<void> {
  await Deno.mkdir(OUTPUT_DIR, { recursive: true })
  const path = new URL(filename, OUTPUT_DIR)
  await Deno.writeTextFile(path, JSON.stringify(data, null, 2) + '\n')
  console.log(`wrote ${filename}`)
}

async function main(): Promise<void> {
  const orgs = buildOrganizations()
  const employees = buildEmployees()
  const patients = buildPatients()
  const encounters = buildEncounters(orgs, employees, patients)
  const beds = buildBeds(encounters)
  const billing = buildBilling(encounters)

  await writeJson('organizations.json', orgs)
  await writeJson('employees.json', employees)
  await writeJson('patients.json', patients)
  await writeJson('encounters.json', encounters)
  await writeJson('beds.json', beds)
  await writeJson('billing.json', billing)

  console.log(`Generated ${encounters.length} encounters across ${orgs.length} organizations.`)
  console.log(`Open encounters now: ${encounters.filter((e) => !e.closed_at).length}.`)
  console.log(`Readmissions: ${encounters.filter((e) => e.is_readmission).length}.`)
}

// Export the metadata used by the dashboard preview so widgets share label maps.
export { DEPARTMENT_ALOS_DAYS, DEPARTMENT_BASE_CHARGE_USD, DEPARTMENT_LABELS, DEPARTMENT_MIX, PAYER_MIX }
export type { BedCapacity, BillingLine, Department, Employee, Encounter, Organization, Patient, Payer, Province, Role }

if (import.meta.main) {
  await main()
}
