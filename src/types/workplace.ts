// 給与形態（時給・日給・月給）
export type WageType = 'hourly' | 'daily' | 'monthly'

// 深夜割増の設定（時給制のときだけ使う）
export interface NightShiftPremium {
  enabled: boolean
  startTime: string // 深夜帯の開始時刻（例: "22:00"）
  endTime: string // 深夜帯の終了時刻（例: "05:00"）
  extraWage: number // 深夜帯に追加される時給（円）。例: 200 → 通常の時給+200円
}

// 休憩時間の自動控除（労働基準法の基準をデフォルトにする）
export interface BreakDeduction {
  enabled: boolean
}

// 休日加給の対象日の種類
export type HolidayTargetDay =
  | 'friday'
  | 'saturday'
  | 'sunday'
  | 'nationalHoliday' // 日本の祝日（振替休日・国民の休日を含む）
  | 'dayBeforeHoliday' // 祝前日（祝日の前日）

// 休日加給の設定（時給制のときだけ使う）
export interface HolidayPremium {
  enabled: boolean
  targetDays: HolidayTargetDay[] // 加給の対象にする曜日・祝日区分
  customDates: string[] // 店舗が個別に指定する加給日（"YYYY-MM-DD"）
  extraWage: number // 対象日に追加される時給（円）。例: 200 → 通常の時給+200円
}

// 職場の状態（退職済みは「履歴」タブに表示する）
export type WorkplaceStatus = 'active' | 'retired'

export interface Workplace {
  id: string
  name: string // 職場名
  color: string // カレンダーの星などに使う色
  status: WorkplaceStatus

  wageType: WageType

  // wageType に応じて使う金額（円）
  hourlyWage?: number // 時給
  dailyWage?: number // 日給
  monthlyWage?: number // 月給

  roundingMinutes?: number // 時給のときの丸め単位（分）。例: 15分単位

  nightShiftPremium?: NightShiftPremium // 時給制のときだけ設定可能
  holidayPremium?: HolidayPremium // 時給制のときだけ設定可能

  breakDeduction: BreakDeduction

  monthlyHoursTarget?: number // 月の目標労働時間（任意・あくまで目安）

  closingDay: number // 締め日（1〜31、末日は31扱い）
  paymentDay: number // 給料日（1〜31、末日は31扱い）
  paymentMonthOffset: 'sameMonth' | 'nextMonth' // 給料日が当月か翌月か
}
