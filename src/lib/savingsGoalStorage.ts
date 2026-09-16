import type { SavingsGoal } from '../types/savingsGoal'

const STORAGE_KEY = 'savingsGoals'

export function loadSavingsGoals(): SavingsGoal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavingsGoal[]) : []
  } catch {
    return []
  }
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function createSavingsGoalId(): string {
  return crypto.randomUUID()
}
