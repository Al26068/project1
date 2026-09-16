import { computeWorkedMinutes, getMonthKey, parseTimeToMinutes } from './hoursSummary'
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

interface PremiumAddOns {
  nightPremiumWage: number
  holidayPremiumWage: number
}

// 深夜割増・休日加給の1レコード分の上乗せ額を計算する。
// 深夜割増が「倍率」方式のときは、休日加給を先に確定させてから、それを含めた時給に倍率をかける
// （休日加給を含めた時給 × 倍率 という順序。固定額方式は休日加給と無関係に単純加算する）
function computePremiumAddOns(record: ClockRecord, workplace: Workplace, paidMinutes: number): PremiumAddOns {
  const isHolidayDay =
    !!workplace.holidayPremium?.enabled && isPremiumHolidayDate(record.date, workplace.holidayPremium)
  const holidayExtraWage = workplace.holidayPremium?.extraWage ?? 0
  const holidayPremiumWage = isHolidayDay ? (paidMinutes / 60) * holidayExtraWage : 0

  let nightPremiumWage = 0
  if (workplace.nightShiftPremium?.enabled) {
    const nightMinutes = computeNightMinutes(record, workplace.nightShiftPremium)
    const mode = workplace.nightShiftPremium.mode ?? 'fixed'

    if (mode === 'multiplier') {
      const baseRate = (workplace.hourlyWage ?? 0) + (isHolidayDay ? holidayExtraWage : 0)
      const multiplier = workplace.nightShiftPremium.multiplier ?? 1
      nightPremiumWage = (nightMinutes / 60) * baseRate * (multiplier - 1)
    } else {
      nightPremiumWage = (nightMinutes / 60) * (workplace.nightShiftPremium.extraWage ?? 0)
    }
  }

  return { nightPremiumWage, holidayPremiumWage }
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

    const addOns = computePremiumAddOns(record, workplace, paidMinutes)
    nightPremiumWage += addOns.nightPremiumWage
    holidayPremiumWage += addOns.holidayPremiumWage
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

// これまでの全打刻記録から、稼いだ給料の合計を計算する（貯金目標の達成率に使う）
// 月給制の職場は、打刻記録がある月ぶんの月給を1回ずつ加算する（打刻のない月は含めない）
export function calculateTotalEarnings(workplaces: Workplace[], allRecords: ClockRecord[]): number {
  const workplaceMap = new Map(workplaces.map((w) => [w.id, w]))
  let total = 0

  const monthlyEarnedMonths = new Map<string, Set<string>>()

  for (const record of allRecords) {
    const workplace = workplaceMap.get(record.workplaceId)
    if (!workplace) continue

    if (workplace.wageType === 'monthly') {
      const months = monthlyEarnedMonths.get(workplace.id) ?? new Set<string>()
      months.add(getMonthKey(record.date))
      monthlyEarnedMonths.set(workplace.id, months)
      continue
    }

    const netMinutes = computeWorkedMinutes(record, workplace)

    if (workplace.wageType === 'daily') {
      total += workplace.dailyWage ?? 0
      continue
    }

    const roundingMinutes = workplace.roundingMinutes && workplace.roundingMinutes > 0 ? workplace.roundingMinutes : 1
    const paidMinutes = Math.floor(netMinutes / roundingMinutes) * roundingMinutes
    total += (paidMinutes / 60) * (workplace.hourlyWage ?? 0)

    const addOns = computePremiumAddOns(record, workplace, paidMinutes)
    total += addOns.nightPremiumWage + addOns.holidayPremiumWage
  }

  for (const [workplaceId, months] of monthlyEarnedMonths) {
    total += (workplaceMap.get(workplaceId)?.monthlyWage ?? 0) * months.size
  }

  return Math.round(total)
}
