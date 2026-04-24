import type { DateRange } from './types.ts'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function parseIsoDate(value: string | null): Date | null {
  if (!value || !ISO_DATE.test(value)) return null
  const d = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function parseDateRange(url: URL, prefix = ''): DateRange {
  return {
    from: parseIsoDate(url.searchParams.get(`${prefix}from`)),
    to:   parseIsoDate(url.searchParams.get(`${prefix}to`)),
  }
}
