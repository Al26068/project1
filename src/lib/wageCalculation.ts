import { computeWorkedMinutes, parseTimeToMinutes } from './hoursSummary'
import { isDayBeforeHoliday, isNationalHoliday } from './japaneseHolidays'
import type { ClockRecord } from '../types/clockRecord'
import type { HolidayPremium, NightShiftPremium, Workplace } from '../types/workplace'

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function todayDateKey(): string {
  return formatDateKey(new Date())
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// 指定した年月における締め日の実際の日付（31日指定などで月末を超える場合はその月の最終日にする）
function resolveClosingDate(year: number, month: number, closingDay: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const day = Math.min(closingDay, lastDay)
  return new Date(year, month, day)
}

export interface PayPeriod {
  startKey: string
  endKey: string
}

// 基準日が含まれる「今の給与期間」を、職場の締め日から求める
export function getCurrentPayPeriod(workplace: Workplace, referenceDateKey: string): PayPeriod {
  const referenceDate = parseDateKey(referenceDateKey)
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()
  const thisClose = resolveClosingDate(year, month, workplace.closingDay)
  const thisCloseKey = formatDateKey(thisClose)

  if (referenceDateKey <= thisCloseKey) {
    const prevClose = resolveClosingDate(year, month - 1, workplace.closingDay)
    const start = new Date(prevClose)
    start.setDate(start.getDate() + 1)
    return { startKey: formatDateKey(start), endKey: thisCloseKey }
  }

  const nextClose = resolveClosingDate(year, month + 1, workplace.closingDay)
  const start = new Date(thisClose)
  start.setDate(start.getDate() + 1)
  return { startKey: formatDateKey(start), endKey: formatDateKey(nextClose) }
}

// 勤務時間帯のうち、深夜割増の時間帯（日をまたぐ設定にも対応）に重なっている分数
function computeNightMinutes(record: ClockRecord, night: NightShiftPremium): number {
  const shiftStart = parseTimeToMinutes(record.startTime)
  let shiftEnd = parseTimeToMinutes(record.endTime)
  if (shiftEnd <= shiftStart) shiftEnd += 24 * 60

  const nightStart = parseTimeToMinutes(night.startTime)
  let nightEnd = parseTimeToMinutes(night.endTime)
  if (nightEnd <= nightStart) nightEnd += 24 * 60

  let total = 0
  for (const offset of [-1, 0, 1]) {
    const ns = nightStart + 24 * 60 * offset
    const ne = nightEnd + 24 * 60 * offset
    total += Math.max(0, Math.min(shiftEnd, ne) - Math.max(shiftStart, ns))
  }
  return total
}

// その日が休日加給の対象日かどうか（曜日・祝日・店舗指定日で判定）
function isPremiumHolidayDate(dateKey: string, holidayPremium: HolidayPremium): boolean {
  if (holidayPremium.customDates.includes(dateKey)) return true

  const date = parseDateKey(dateKey)
  const dayOfWeek = date.getDay()

  return holidayPremium.targetDays.some((target) => {
    switch (target) {
      case 'friday':
        return dayOfWeek === 5
      case 'saturday':
        return dayOfWeek === 6
      case 'sunday':
        return dayOfWeek === 0
      case 'nationalHoliday':
        return isNationalHoliday(date)
      case 'dayBeforeHoliday':
        return isDayBeforeHoliday(date)
      default:
        return false
    }
  })
}

export interface WageBreakdown {
  period: PayPeriod
  totalMinutes: number
  baseWage: number
  nightPremiumWage: number
  holidayPremiumWage: number
  totalWage: number
}

// 職場1件・給与期間1回分の給与を、実際の打刻記録から正確に計算する
export function calculatePeriodWage(
  workplace: Workplace,
  allRecords: ClockRecord[],
  referenceDateKey: string,
): WageBreakdown {
  const period = getCurrentPayPeriod(workplace, referenceDateKey)
  const records = allRecords.filter(
    (r) =>
      r.workplaceId === workplace.id && r.date >= period.startKey && r.date <= period.endKey,
  )

  if (workplace.wageType === 'monthly') {
    const totalMinutes = records.reduce((sum, r) => sum + computeWorkedMinutes(r, workplace), 0)
    const wage = workplace.monthlyWage ?? 0
    return { period, totalMinutes, baseWage: wage, nightPremiumWage: 0, holidayPremiumWage: 0, totalWage: wage }
  }

  let totalMinutes = 0
  let baseWage = 0
  let nightPremiumWage = 0
  let holidayPremiumWage = 0

  for (const record of records) {
    const netMinutes = computeWorkedMinutes(record, workplace)
    totalMinutes += netMinutes

    if (workplace.wageType === 'daily') {
      baseWage += workplace.dailyWage ?? 0
      continue
    }

    // 時給制：丸め単位で切り捨ててから支払い対象の時間を決める
    const roundingMinutes = workplace.roundingMinutes && workplace.roundingMinutes > 0 ? workplace.roundingMinutes : 1
    const paidMinutes = Math.floor(netMinutes / roundingMinutes) * roundingMinutes
    baseWage += (paidMinutes / 60) * (workplace.hourlyWage ?? 0)

    if (workplace.nightShiftPremium?.enabled) {
      const nightMinutes = computeNightMinutes(record, workplace.nightShiftPremium)
      nightPremiumWage += (nightMinutes / 60) * workplace.nightShiftPremium.extraWage
    }

    if (
      workplace.holidayPremium?.enabled &&
      isPremiumHolidayDate(record.date, workplace.holidayPremium)
    ) {
      holidayPremiumWage += (paidMinutes / 60) * workplace.holidayPremium.extraWage
    }
  }

  const totalWage = Math.round(baseWage + nightPremiumWage + holidayPremiumWage)

  return {
    period,
    totalMinutes,
    baseWage: Math.round(baseWage),
    nightPremiumWage: Math.round(nightPremiumWage),
    holidayPremiumWage: Math.round(holidayPremiumWage),
    totalWage,
  }
}
