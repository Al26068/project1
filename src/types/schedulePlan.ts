// カレンダーに登録する「勤務予定」1件分
export interface SchedulePlan {
  id: string
  workplaceId: string
  date: string // 予定日（"YYYY-MM-DD"）
  startTime: string // 始業予定時刻（"HH:MM"）
  endTime: string // 終業予定時刻（"HH:MM"）
}
