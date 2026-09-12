import { useState } from 'react'
import type { FormEvent } from 'react'
import { parseTimeToMinutes } from '../../lib/hoursSummary'
import { loadSchedulePlans } from '../../lib/schedulePlanStorage'
import { loadWorkplaces } from '../../lib/workplaceStorage'
import type { ClockRecord } from '../../types/clockRecord'
import type { SchedulePlan } from '../../types/schedulePlan'
import type { Workplace } from '../../types/workplace'
import './ClockInForm.css'

type ClockInInput = Omit<ClockRecord, 'id'>

function todayDateKey(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${mm}-${dd}`
}

// 今日の予定のうち、始業時刻が「今」から前後1時間以内のものを探す（一番近いものを優先）
function findMatchingSchedulePlan(
  plans: SchedulePlan[],
  workplaces: Workplace[],
): SchedulePlan | undefined {
  const today = todayDateKey()
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const activeWorkplaceIds = new Set(workplaces.map((w) => w.id))

  let best: SchedulePlan | undefined
  let bestDiff = Infinity

  for (const plan of plans) {
    if (plan.date !== today || !activeWorkplaceIds.has(plan.workplaceId)) continue
    if (!plan.startTime || !plan.endTime) continue // 時刻を持たない古い形式の予定データは対象外にする
    const diff = Math.abs(nowMinutes - parseTimeToMinutes(plan.startTime))
    if (diff <= 60 && diff < bestDiff) {
      best = plan
      bestDiff = diff
    }
  }

  return best
}

// 日付を diffDays 日ぶんずらした日付キーを返す
function shiftDateKey(dateKey: string, diffDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d + diffDays)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

// これより長い勤務時間は、日をまたいだ夜勤というより入力ミスの可能性が高いとみなす
const MAX_SHIFT_MINUTES = 23 * 60

// 始業〜終業の勤務時間を分で計算する（終業が始業以前なら日をまたぐとみなす）
function computeShiftMinutes(start: string, end: string): number | null {
  if (!start || !end) return null
  const startMinutes = parseTimeToMinutes(start)
  let endMinutes = parseTimeToMinutes(end)
  if (endMinutes <= startMinutes) endMinutes += 24 * 60
  return endMinutes - startMinutes
}

interface ClockInFormProps {
  onSubmit: (value: ClockInInput) => void
  onCancel?: () => void
}

function ClockInForm({ onSubmit, onCancel }: ClockInFormProps) {
  const [workplaces] = useState(() => loadWorkplaces().filter((w) => w.status === 'active'))
  const [matchedPlan] = useState(() => findMatchingSchedulePlan(loadSchedulePlans(), workplaces))
  const [workplaceId, setWorkplaceId] = useState(matchedPlan?.workplaceId ?? workplaces[0]?.id ?? '')
  const [date, setDate] = useState(() => todayDateKey())
  const [startTime, setStartTime] = useState(matchedPlan?.startTime ?? '')
  const [endTime, setEndTime] = useState(matchedPlan?.endTime ?? '')

  // 終業時間が始業時間以前（＝日をまたぐ夜勤）になったら、まだ手動で日付を変えていない場合に限り
  // 自動で1日前にずらす（退勤後に「今日」入力すると、実際は前日の夜勤だったというケースに対応）。
  // ただし計算した勤務時間が異常に長い場合は入力ミスの可能性が高いので、日付はずらさずエラー表示に任せる。
  function applyDateShiftIfNeeded(nextStart: string, nextEnd: string) {
    const minutes = computeShiftMinutes(nextStart, nextEnd)
    if (minutes === null || minutes > MAX_SHIFT_MINUTES) return
    if (parseTimeToMinutes(nextEnd) <= parseTimeToMinutes(nextStart)) {
      setDate((prev) => (prev === todayDateKey() ? shiftDateKey(prev, -1) : prev))
    }
  }

  function handleStartTimeChange(value: string) {
    setStartTime(value)
    applyDateShiftIfNeeded(value, endTime)
  }

  function handleEndTimeChange(value: string) {
    setEndTime(value)
    applyDateShiftIfNeeded(startTime, value)
  }

  const shiftMinutes = computeShiftMinutes(startTime, endTime)
  const shiftError =
    shiftMinutes !== null && shiftMinutes > MAX_SHIFT_MINUTES
      ? `勤務時間が${Math.floor(shiftMinutes / 60)}時間${shiftMinutes % 60}分になっています。1回の勤務としては長すぎるため、時刻を見直してください。`
      : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (shiftError) return
    onSubmit({ workplaceId, date, startTime, endTime })
  }

  if (workplaces.length === 0) {
    return (
      <p className="clock-in-form__empty">
        先に「職場管理」から職場を登録してください。
      </p>
    )
  }

  return (
    <form className="clock-in-form" onSubmit={handleSubmit}>
      {matchedPlan && (
        <p className="clock-in-form__hint">今日の予定から自動入力しました</p>
      )}

      <label className="clock-in-form__field">
        <span>職場</span>
        <select value={workplaceId} onChange={(e) => setWorkplaceId(e.target.value)}>
          {workplaces.map((workplace) => (
            <option key={workplace.id} value={workplace.id}>
              {workplace.name}
            </option>
          ))}
        </select>
      </label>

      <label className="clock-in-form__field">
        <span>日付</span>
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      </label>

      <label className="clock-in-form__field">
        <span>始業時間</span>
        <input
          type="time"
          required
          value={startTime}
          onChange={(e) => handleStartTimeChange(e.target.value)}
        />
      </label>

      <label className="clock-in-form__field">
        <span>終業時間</span>
        <input
          type="time"
          required
          value={endTime}
          onChange={(e) => handleEndTimeChange(e.target.value)}
        />
      </label>

      {shiftError && <p className="clock-in-form__error">{shiftError}</p>}

      <div className="clock-in-form__actions">
        {onCancel && (
          <button
            type="button"
            className="clock-in-form__btn clock-in-form__btn--ghost"
            onClick={onCancel}
          >
            キャンセル
          </button>
        )}
        <button
          type="submit"
          className="clock-in-form__btn clock-in-form__btn--primary"
          disabled={!!shiftError}
        >
          お疲れさまでした☕
        </button>
      </div>
    </form>
  )
}

export default ClockInForm
