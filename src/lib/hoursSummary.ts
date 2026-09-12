import type { ClockRecord } from '../types/clockRecord'
import type { Workplace } from '../types/workplace'

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// 実際に働いた分数を計算する（日をまたぐ勤務・休憩自動控除に対応）
export function computeWorkedMinutes(record: ClockRecord, workplace: Workplace | undefined): number {
  const start = parseTimeToMinutes(record.startTime)
  let end = parseTimeToMinutes(record.endTime)
  if (end <= start) {
    end += 24 * 60 // 終業時間が始業時間より前なら、日をまたぐ勤務として扱う
  }
  let minutes = end - start

  if (workplace?.breakDeduction.enabled) {
    if (minutes > 8 * 60) {
      minutes -= 60
    } else if (minutes > 6 * 60) {
      minutes -= 45
    }
  }

  return Math.max(minutes, 0)
}

export function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7) // "YYYY-MM"
}

export interface WorkplaceHours {
  workplaceId: string
  name: string
  color: string
  hours: number
}

export interface MonthSummary {
  monthKey: string
  label: string
  totalHours: number
  byWorkplace: WorkplaceHours[]
}

function formatMonthLabel(monthKey: string): string {
  const [, month] = monthKey.split('-')
  return `${Number(month)}月`
}

// 直近 monthCount ヶ月分（今月を含む）の月キーを古い順に作る
function buildRecentMonthKeys(monthCount: number): string[] {
  const now = new Date()
  const keys: string[] = []
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

export function summarizeHours(
  records: ClockRecord[],
  workplaces: Workplace[],
  monthCount = 6,
): MonthSummary[] {
  const workplaceMap = new Map(workplaces.map((w) => [w.id, w]))
  const monthKeys = buildRecentMonthKeys(monthCount)

  return monthKeys.map((monthKey) => {
    const recordsInMonth = records.filter((r) => getMonthKey(r.date) === monthKey)
    const minutesByWorkplace = new Map<string, number>()

    for (const record of recordsInMonth) {
      const workplace = workplaceMap.get(record.workplaceId)
      const minutes = computeWorkedMinutes(record, workplace)
      minutesByWorkplace.set(
        record.workplaceId,
        (minutesByWorkplace.get(record.workplaceId) ?? 0) + minutes,
      )
    }

    const byWorkplace: WorkplaceHours[] = [...minutesByWorkplace.entries()]
      .map(([workplaceId, minutes]) => {
        const workplace = workplaceMap.get(workplaceId)
        return {
          workplaceId,
          name: workplace?.name ?? '（削除された職場）',
          color: workplace?.color ?? 'var(--color-border)',
          hours: Math.round((minutes / 60) * 10) / 10,
        }
      })
      .sort((a, b) => b.hours - a.hours)

    const totalHours = Math.round(byWorkplace.reduce((sum, w) => sum + w.hours, 0) * 10) / 10

    return { monthKey, label: formatMonthLabel(monthKey), totalHours, byWorkplace }
  })
}
