// Synthesizes 3 years (156 weeks) of deterministic case counts per notifiable condition.
// Weeks use ISO-8601 (Monday start). The trends widget hands the full payload to a Fresh
// island that owns search + chip-toggle UI; chart row count is filtered client-side.

import type { CountryWidgetDef } from '../../../../util/dashboard/country.ts'
import { hashCount, NOTIFIABLE_CONDITIONS, type NotifiableCategory, PREVALENCE_WEIGHT } from '../../../../util/dashboard/notifiable_conditions.ts'
import WidgetCard from '../../WidgetCard.tsx'
import NotifiableConditionsTrendsIsland from '../../../../islands/dashboard/NotifiableConditionsTrendsIsland.tsx'

const WEEKS = 156

export type TrendsRow = {
  condition_key: string
  condition_label: string
  nmc_category: NotifiableCategory
  confirmed: readonly number[]
  suspected: readonly number[]
}

export type TrendsData = {
  weeks: readonly string[]
  rows: readonly TrendsRow[]
  default_keys: readonly string[]
}

function isoWeekLabels(end: Date, count: number): string[] {
  // Walk back `count` Mondays from the ISO week containing `end`.
  const out: string[] = []
  const cursor = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()))
  // Move cursor to the Monday of its ISO week.
  const dow = cursor.getUTCDay()
  const monday_offset = (dow + 6) % 7
  cursor.setUTCDate(cursor.getUTCDate() - monday_offset)
  for (let i = 0; i < count; i++) {
    const { year, week } = isoWeekParts(cursor)
    out.unshift(`${year}-W${String(week).padStart(2, '0')}`)
    cursor.setUTCDate(cursor.getUTCDate() - 7)
  }
  return out
}

function isoWeekParts(d: Date): { year: number; week: number } {
  // ISO-8601 week date calculation (Thursday in same week determines year).
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const year_start = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((target.getTime() - year_start.getTime()) / 86400000) + 1) / 7)
  return { year: target.getUTCFullYear(), week }
}

function syntheticHash01(seed: number, key: string, salt: number): number {
  let hash = 0x811c9dc5 ^ (seed + salt)
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return ((hash >>> 0) % 1000) / 1000
}

export const notifiable_conditions_trends_widget: CountryWidgetDef<TrendsData> = {
  id: 'notifiable_conditions_trends',
  title: 'Weekly trends',
  span: 12,
  fetch: (filters) => {
    const end = filters.date_range.to ?? new Date()
    const weeks = isoWeekLabels(end, WEEKS)
    const rows: TrendsRow[] = NOTIFIABLE_CONDITIONS.map((condition) => {
      const weight = PREVALENCE_WEIGHT[condition.key] ?? 0.6
      const confirmed: number[] = []
      const suspected: number[] = []
      for (let i = 0; i < weeks.length; i++) {
        const ceiling = Math.max(2, Math.round(weight * 0.6))
        const c = hashCount(i, condition.key, ceiling + 1)
        const noise = 0.25 + syntheticHash01(i, condition.key, 7919)
        confirmed.push(c)
        suspected.push(Math.round(c * noise))
      }
      return {
        condition_key: condition.key,
        condition_label: condition.label,
        nmc_category: condition.nmc_category,
        confirmed,
        suspected,
      }
    })
    const default_keys = NOTIFIABLE_CONDITIONS
      .filter((c) => c.nmc_category === 1)
      .map((c) => c.key)
    return { weeks, rows, default_keys }
  },
  render: (data) => (
    <WidgetCard
      title='Weekly trends'
      subtitle={`${data.rows.length} notifiable conditions over ${data.weeks.length} weeks — search to add or remove`}
    >
      <NotifiableConditionsTrendsIsland data={data} />
    </WidgetCard>
  ),
}
