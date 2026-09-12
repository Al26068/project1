import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../common/Modal'
import { isNationalHoliday } from '../../lib/japaneseHolidays'
import {
  createSchedulePlanId,
  loadSchedulePlans,
  saveSchedulePlans,
} from '../../lib/schedulePlanStorage'
import { loadWorkplaces } from '../../lib/workplaceStorage'
import type { SchedulePlan } from '../../types/schedulePlan'
import CalendarDayCell from './CalendarDayCell'
import './CalendarView.css'

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function formatDateLabel(dateKey: string): string {
  const [, month, day] = dateKey.split('-').map(Number)
  return `${month}月${day}日`
}

// 月初の曜日ぶん空白を入れ、月末まで並べたセルの配列を作る
function buildMonthCells(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function CalendarView() {
  const [today] = useState(() => new Date())
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [plans, setPlans] = useState<SchedulePlan[]>(() => loadSchedulePlans())
  const [workplaces] = useState(() => loadWorkplaces().filter((w) => w.status === 'active'))
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [formWorkplaceId, setFormWorkplaceId] = useState('')
  const [formStartTime, setFormStartTime] = useState('')
  const [formEndTime, setFormEndTime] = useState('')

  const cells = useMemo(() => buildMonthCells(viewYear, viewMonth), [viewYear, viewMonth])
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const plansByDate = useMemo(() => {
    const map = new Map<string, SchedulePlan[]>()
    for (const plan of plans) {
      const list = map.get(plan.date) ?? []
      list.push(plan)
      map.set(plan.date, list)
    }
    return map
  }, [plans])

  const workplaceMap = useMemo(() => new Map(workplaces.map((w) => [w.id, w])), [workplaces])

  function goToPrevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function resetForm() {
    setEditingPlanId(null)
    setFormWorkplaceId(workplaces[0]?.id ?? '')
    setFormStartTime('')
    setFormEndTime('')
  }

  function openDayModal(dateKey: string) {
    resetForm()
    setSelectedDateKey(dateKey)
  }

  function closeDayModal() {
    setSelectedDateKey(null)
  }

  function startEditingPlan(plan: SchedulePlan) {
    setEditingPlanId(plan.id)
    setFormWorkplaceId(plan.workplaceId)
    setFormStartTime(plan.startTime ?? '')
    setFormEndTime(plan.endTime ?? '')
  }

  // 編集中なら該当の予定を上書き、そうでなければ既存の予定を消さずに新規追加する
  // （同じ日に複数の職場・シフトを登録できるようにするため）
  function handleSubmitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedDateKey || !formWorkplaceId || !formStartTime || !formEndTime) return

    const next = editingPlanId
      ? plans.map((p) =>
          p.id === editingPlanId
            ? { ...p, workplaceId: formWorkplaceId, startTime: formStartTime, endTime: formEndTime }
            : p,
        )
      : [
          ...plans,
          {
            id: createSchedulePlanId(),
            workplaceId: formWorkplaceId,
            date: selectedDateKey,
            startTime: formStartTime,
            endTime: formEndTime,
          },
        ]

    setPlans(next)
    saveSchedulePlans(next)
    resetForm()
  }

  function handleDeletePlan(planId: string) {
    const next = plans.filter((p) => p.id !== planId)
    setPlans(next)
    saveSchedulePlans(next)
    if (editingPlanId === planId) {
      resetForm()
    }
  }

  const selectedDatePlans = selectedDateKey ? (plansByDate.get(selectedDateKey) ?? []) : []

  return (
    <div className="calendar-view">
      <div className="calendar-view__header">
        <button type="button" onClick={goToPrevMonth} aria-label="前の月">
          ‹
        </button>
        <h3>
          {viewYear}年{viewMonth + 1}月
        </h3>
        <button type="button" onClick={goToNextMonth} aria-label="次の月">
          ›
        </button>
      </div>

      <div className="calendar-view__weekdays">
        {WEEKDAY_LABELS.map((label, index) => (
          <span
            key={label}
            className={
              index === 0
                ? 'calendar-view__weekday--sunday'
                : index === 6
                  ? 'calendar-view__weekday--saturday'
                  : undefined
            }
          >
            {label}
          </span>
        ))}
      </div>

      <div className="calendar-view__grid">
        {cells.map((day, index) => {
          const dateKey = day !== null ? toDateKey(viewYear, viewMonth, day) : null
          const dayOfWeek = index % 7 // グリッドの列は日曜始まりなので、列番号がそのまま曜日になる
          const isHoliday = day !== null && isNationalHoliday(new Date(viewYear, viewMonth, day))
          const dateColor: 'red' | 'blue' | undefined =
            day === null
              ? undefined
              : dayOfWeek === 0 || isHoliday
                ? 'red'
                : dayOfWeek === 6
                  ? 'blue'
                  : undefined
          return (
            <CalendarDayCell
              key={index}
              day={day}
              isToday={dateKey === todayKey}
              dateColor={dateColor}
              plans={dateKey ? (plansByDate.get(dateKey) ?? []) : []}
              workplaceMap={workplaceMap}
              onClick={dateKey ? () => openDayModal(dateKey) : undefined}
            />
          )
        })}
      </div>

      <Modal
        open={selectedDateKey !== null}
        onClose={closeDayModal}
        title={selectedDateKey ? `${formatDateLabel(selectedDateKey)}の予定` : ''}
      >
        {workplaces.length === 0 ? (
          <p className="calendar-view__empty">先に「職場管理」から職場を登録してください。</p>
        ) : (
          <div className="calendar-view__schedule-form">
            {selectedDatePlans.length > 0 && (
              <ul className="calendar-view__plan-list">
                {selectedDatePlans.map((plan) => {
                  const workplace = workplaceMap.get(plan.workplaceId)
                  return (
                    <li key={plan.id} className="calendar-view__plan-item">
                      <span
                        className="calendar-view__plan-dot"
                        style={{ background: workplace?.color ?? 'var(--color-border)' }}
                      />
                      <span className="calendar-view__plan-info">
                        {workplace?.name ?? '（削除された職場）'} {plan.startTime}〜{plan.endTime}
                      </span>
                      <button
                        type="button"
                        className="calendar-view__plan-edit"
                        onClick={() => startEditingPlan(plan)}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        className="calendar-view__plan-remove"
                        aria-label="この予定を削除"
                        onClick={() => handleDeletePlan(plan.id)}
                      >
                        ×
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <form className="calendar-view__add-form" onSubmit={handleSubmitPlan}>
              <label className="calendar-view__field">
                <span>職場</span>
                <select
                  required
                  value={formWorkplaceId}
                  onChange={(e) => setFormWorkplaceId(e.target.value)}
                >
                  {workplaces.map((workplace) => (
                    <option key={workplace.id} value={workplace.id}>
                      {workplace.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="calendar-view__field">
                <span>始業時間</span>
                <input
                  type="time"
                  required
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </label>

              <label className="calendar-view__field">
                <span>終業時間</span>
                <input
                  type="time"
                  required
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </label>

              <div className="calendar-view__actions">
                {editingPlanId && (
                  <button
                    type="button"
                    className="calendar-view__btn calendar-view__btn--ghost"
                    onClick={resetForm}
                  >
                    編集をやめる
                  </button>
                )}
                <button type="submit" className="calendar-view__btn calendar-view__btn--primary">
                  {editingPlanId ? '更新する' : 'この予定を追加する'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CalendarView
