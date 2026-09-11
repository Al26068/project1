// 1回分の打刻記録（職場・日付・開始〜終了時刻）
export interface ClockRecord {
  id: string
  workplaceId: string
  date: string // 打刻した日（"YYYY-MM-DD"）
  startTime: string // 始業時間（"HH:MM"）
  endTime: string // 終業時間（"HH:MM"）
}
