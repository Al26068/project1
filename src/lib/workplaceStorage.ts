import type { Workplace } from '../types/workplace'

const STORAGE_KEY = 'workplaces'

export function loadWorkplaces(): Workplace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Workplace[]) : []
  } catch {
    return []
  }
}

export function saveWorkplaces(workplaces: Workplace[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workplaces))
}

export function createWorkplaceId(): string {
  return crypto.randomUUID()
}
