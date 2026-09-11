import type { ClockRecord } from '../types/clockRecord'

const STORAGE_KEY = 'clockRecords'

export function loadClockRecords(): ClockRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ClockRecord[]) : []
  } catch {
    return []
  }
}

export function saveClockRecords(records: ClockRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function createClockRecordId(): string {
  return crypto.randomUUID()
}
