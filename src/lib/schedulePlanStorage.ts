import type { SchedulePlan } from '../types/schedulePlan'

const STORAGE_KEY = 'schedulePlans'

export function loadSchedulePlans(): SchedulePlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SchedulePlan[]) : []
  } catch {
    return []
  }
}

export function saveSchedulePlans(plans: SchedulePlan[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
}

export function createSchedulePlanId(): string {
  return crypto.randomUUID()
}
